'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useBookingStore, useAuthStore } from '@/lib/store';
import { busApi } from '@/lib/busApi';
import { useBusSocket } from '@/hooks/useBusSocket';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/components/CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function BusReviewPage() {
  const router = useRouter();
  const busActiveBooking = useBookingStore(state => state.busActiveBooking);
  const activeBooking = useBookingStore(state => state.activeBooking);
  const busSelectedInstance = useBookingStore(state => state.busSelectedInstance);
  const user = useAuthStore(state => state.user);
  const clearBusBookingFlow = useBookingStore(state => state.clearBusBookingFlow);

  // Use whichever booking is available
  const booking = busActiveBooking || activeBooking;

  const [sessionExpired, setSessionExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!booking?.expires_at) return;

    const updateTimer = () => {
      const expiresAt = new Date(booking.expires_at).getTime();
      const remaining = Math.floor((expiresAt - Date.now()) / 1000);
      if (remaining <= 0) {
        setTimeLeft(0);
        setSessionExpired(true);
      } else {
        setTimeLeft(remaining);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [booking?.expires_at]);

  useBusSocket(user?.id, (msg) => {
    if ((msg.type === 'SESSION_EXPIRED' || msg.event === 'SESSION_EXPIRED') &&
      (msg.payload?.booking_id === booking?.id || msg.booking_id === booking?.id)) {
      setSessionExpired(true);
    }

    if (msg.event === 'BOOKING_CONFIRMED' && msg.payload?.booking_id === booking?.id) {
      setIsVerifying(false);
      setIsConfirmed(true);
      setTimeout(() => {
        router.push(`/buses/confirmation?booking_id=${booking.id}`);
      }, 2000);
    }
  });

  useEffect(() => {
    if (!isVerifying || isConfirmed || !booking?.id) return;

    const poll = setInterval(async () => {
      try {
        const res = await busApi.getBookingById(booking.id);
        const status = res?.data?.status || res?.status;
        if (status === 'CONFIRMED') {
          clearInterval(poll);
          setIsVerifying(false);
          setIsConfirmed(true);
          setTimeout(() => {
            router.push(`/buses/confirmation?booking_id=${booking.id}`);
          }, 2000);
        }
      } catch (err) {
        console.error('[Poll Bus] Error:', err);
      }
    }, 3000);

    return () => clearInterval(poll);
  }, [isVerifying, isConfirmed, booking?.id, router]);

  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    const checkHydration = () => {
      const state = useBookingStore.getState();
      if (state.busActiveBooking || state.activeBooking) {
        setHasHydrated(true);
      }
    };
    checkHydration();
    const timer = setTimeout(() => setHasHydrated(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted && hasHydrated && !booking) {
      router.replace('/buses');
    }
  }, [mounted, hasHydrated, booking, router]);

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    if (sessionExpired || !booking?.id) return;

    // The booking response already contains the Stripe client secret in payment_url
    if (booking.payment_url && booking.payment_url.startsWith('pi_')) {
      setClientSecret(booking.payment_url);
      return;
    }

    // Fallback: call confirmBooking endpoint if payment_url wasn't provided
    setLoading(true);
    setError(null);
    try {
      const data = await busApi.confirmBooking(booking.id);

      if (data?.stripe_client_secret) {
        setClientSecret(data.stripe_client_secret);
      } else if (data?.payment_url && data.payment_url.startsWith('pi_')) {
        setClientSecret(data.payment_url);
      } else if (data?.status === 'CONFIRMED' || data?.message === 'booking confirmed successfully') {
        router.push(`/buses/confirmation?booking_id=${booking.id}`);
      } else {
        throw new Error('Missing client secret from gateway');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Payment orchestration failed.');
    } finally {
      setLoading(false);
    }
  };

  const onStripePaymentSuccess = async () => {
    setIsVerifying(true);
    try {
      await busApi.confirmBooking(booking.id);
      setIsVerifying(false);
      setIsConfirmed(true);
      setTimeout(() => {
        router.push(`/buses/confirmation?booking_id=${booking.id}`);
      }, 2000);
    } catch (err) {
      console.error('Confirm booking failed:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to confirm booking after payment.');
      setIsVerifying(false);
    }
  };

  if (!booking || !busSelectedInstance) return null;

  const formatTimer = (seconds) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const timerIsUrgent = timeLeft !== null && timeLeft < 120;

  const appearance = {
    theme: 'night',
    variables: {
      colorPrimary: '#fcc54c',
      colorBackground: '#1a1c1e',
      colorText: '#e2e2e6',
      colorDanger: '#ffb4ab',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    }
  };
  const elementsOptions = { clientSecret, appearance };

  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-12 pt-24 md:pt-40 pb-32">
      <header className="mb-20">
        <span className="text-secondary font-label text-[10px] font-black uppercase tracking-[0.4em] block mb-6">Step 05 — Review Your Trip</span>
        <h1 className="text-5xl md:text-7xl font-headline font-normal leading-tight tracking-tight text-primary">
          Review & <span className="italic font-light">Pay.</span>
        </h1>
      </header>

      {/* Session Expired Overlay */}
      {sessionExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="bg-surface-container-lowest p-12 max-w-lg w-full shadow-2xl border-t-4 border-error text-center">
            <span className="material-symbols-outlined text-7xl text-error mb-6">timer_off</span>
            <h2 className="text-4xl font-headline text-primary mb-4">Session Expired</h2>
            <p className="text-on-surface-variant font-light text-lg mb-10 leading-relaxed">
              Your 10-minute seat hold has been released. A fresh search is required to continue.
            </p>
            <button
              onClick={() => { clearBusBookingFlow(); router.push('/buses'); }}
              className="w-full bg-primary text-white py-5 font-label text-xs font-bold uppercase tracking-[0.3em] hover:bg-secondary transition-all"
            >
              Restart Search
            </button>
          </div>
        </div>
      )}

      {/* Verifying Overlay */}
      {(isVerifying || isConfirmed) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary backdrop-blur-xl px-4 text-center">
          <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 border-4 border-secondary/20 rounded-full"></div>
              {!isConfirmed ? (
                <div className="absolute inset-0 border-4 border-t-secondary rounded-full animate-spin"></div>
              ) : (
                <div className="absolute inset-0 bg-secondary flex items-center justify-center rounded-full scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-primary text-5xl font-bold">check</span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-4xl font-headline text-white mb-3">
                {isConfirmed ? 'Transaction Secured' : 'Verifying Payment'}
              </h2>
              <p className="text-on-surface-variant font-light text-sm tracking-widest uppercase italic">
                {isConfirmed ? 'Generating Bus Tickets...' : 'Connecting to secure payment gateway...'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start ${(sessionExpired || isVerifying || isConfirmed) ? 'opacity-20 pointer-events-none grayscale' : ''}`}>

        <div className="lg:col-span-8 space-y-16">
          {/* Timer */}
          <div className={`flex items-center gap-6 p-6 border ${timerIsUrgent ? 'border-error/20 bg-error/5' : 'border-secondary/20 bg-secondary/5'}`}>
            <span className={`material-symbols-outlined text-3xl ${timerIsUrgent ? 'text-error animate-pulse' : 'text-secondary'}`}>timer</span>
            <div className="flex-1">
              <p className="font-label text-[9px] uppercase tracking-widest text-outline font-black mb-1">Seat Hold Expires In</p>
              <p className={`font-headline text-3xl tracking-tighter tabular-nums min-w-[5rem] ${timerIsUrgent ? 'text-error' : 'text-primary'}`}>{formatTimer(timeLeft)}</p>
            </div>
            <p className="text-[10px] text-on-surface-variant font-light max-w-[180px] leading-relaxed">Complete payment before time runs out to secure your seats.</p>
          </div>

          {/* Bus Details */}
          <section>
            <div className="flex items-end justify-between mb-10 border-b border-outline-variant/10 pb-6">
              <h2 className="text-3xl font-headline text-primary">Bus Details</h2>
            </div>
            <div className="bg-surface-container-lowest p-10 editorial-shadow border border-outline-variant/5 relative overflow-hidden">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="text-center md:text-left flex-1">
                  <p className="text-outline font-label text-[9px] uppercase tracking-[0.4em] mb-3 font-black">Boarding Point</p>
                  <h3 className="text-3xl font-headline text-primary mb-1 tracking-tighter">
                    {typeof booking.boarding_point === 'string' ? booking.boarding_point : (booking.boarding_point?.stop_name || busSelectedInstance.origin)}
                  </h3>
                  <p className="text-on-surface-variant font-light text-sm">
                    {busSelectedInstance.departure_time ? new Date(busSelectedInstance.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>

                <div className="flex flex-col items-center flex-1">
                  <div className="w-full flex items-center gap-6 opacity-20">
                    <div className="h-px flex-1 bg-primary"></div>
                    <span className="material-symbols-outlined text-primary">directions_bus</span>
                    <div className="h-px flex-1 bg-primary"></div>
                  </div>
                  <p className="text-[9px] font-label uppercase tracking-[0.3em] text-outline mt-4">{busSelectedInstance.bus_number} · Direct</p>
                </div>

                <div className="text-center md:text-right flex-1">
                  <p className="text-outline font-label text-[9px] uppercase tracking-[0.4em] mb-3 font-black">Dropping Point</p>
                  <h3 className="text-3xl font-headline text-primary mb-1 tracking-tighter">
                    {typeof booking.dropping_point === 'string' ? booking.dropping_point : (booking.dropping_point?.stop_name || busSelectedInstance.destination)}
                  </h3>
                  <p className="text-on-surface-variant font-light text-sm">
                    {busSelectedInstance.arrival_time ? new Date(busSelectedInstance.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Traveler Details */}
          <section>
            <div className="flex items-end justify-between mb-10 border-b border-outline-variant/10 pb-6">
              <h2 className="text-3xl font-headline text-primary">Traveler Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {booking?.passengers?.map((p, idx) => (
                <div key={idx} className="bg-surface-container-low p-8 border border-outline-variant/5 editorial-shadow">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-14 h-14 bg-surface-container-high flex items-center justify-center text-primary font-headline text-2xl uppercase">
                      {p.first_name?.[0]}{p.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-headline text-xl text-primary leading-tight">{p.first_name} {p.last_name}</p>
                      <p className="text-[9px] uppercase tracking-widest text-secondary mt-1 font-black">{p.passenger_type}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-outline-variant/10">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-outline mb-1.5 font-black">Seat</p>
                      <p className="text-lg font-headline text-primary">{p.seat_number || '--'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-widest text-outline mb-1.5 font-black">Status</p>
                      <span className="text-[9px] font-label uppercase tracking-widest font-black bg-secondary/10 text-secondary px-2.5 py-1">Seat Secured</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Payment Sidebar */}
        <aside className="lg:col-span-4 lg:sticky lg:top-32">
          <div className="bg-surface-container-low border border-outline-variant/5 editorial-shadow overflow-hidden">
            <div className={`p-10 space-y-6 border-b border-outline-variant/10 transition-opacity ${clientSecret ? 'opacity-30' : 'opacity-100'}`}>
              <h3 className="font-headline text-2xl text-primary mb-2">Fare Summary</h3>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-light">Total Base & Fees</span>
                <span className="font-headline text-lg text-primary">₹{booking.total_amount?.toLocaleString() || '—'}</span>
              </div>
              <div className="pt-6 border-t border-outline-variant/20 flex justify-between items-end">
                <span className="text-[10px] font-label font-black uppercase tracking-[0.3em] text-secondary">Payable Now</span>
                <span className="text-4xl font-headline text-primary tracking-tighter">₹{booking.total_amount?.toLocaleString() || '—'}</span>
              </div>
            </div>

            <div className="p-10">
              {!clientSecret ? (
                <div className="space-y-8">
                  {error && (
                    <div className="p-4 bg-error/5 border border-error/10 text-error text-[10px] font-bold text-center uppercase tracking-widest">
                      {error}
                    </div>
                  )}
                  <button
                    onClick={handleInitiatePayment}
                    disabled={loading}
                    className="w-full bg-primary text-white py-6 font-label text-xs font-black uppercase tracking-[0.4em] hover:bg-secondary hover:text-primary transition-all disabled:opacity-30"
                  >
                    {loading ? 'Connecting to secure payment gateway...' : 'Proceed to Payment'}
                  </button>
                </div>
              ) : (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                  <h3 className="font-headline text-xl text-primary mb-6">Complete Authorization</h3>
                  <Elements stripe={stripePromise} options={elementsOptions}>
                    <CheckoutForm bookingId={booking.id} onPaymentSuccess={onStripePaymentSuccess} returnUrl={`${window.location.origin}/buses/confirmation?booking_id=${booking.id}`} />
                  </Elements>
                  <button
                    onClick={() => setClientSecret('')}
                    className="w-full mt-4 text-[9px] font-label uppercase tracking-widest text-outline hover:text-primary transition-colors"
                  >
                    ← Use different protocol
                  </button>
                </div>
              )}

              <div className="mt-8 flex items-start gap-4 p-5 bg-surface-container-high/30 border border-outline-variant/10">
                <span className="material-symbols-outlined text-secondary text-base">security</span>
                <p className="text-[9px] leading-relaxed text-on-surface-variant uppercase tracking-widest">
                  End-to-end encrypted via TripNEO gateway. Seats secured for {formatTimer(timeLeft)}.
                </p>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </main>
  );
}
