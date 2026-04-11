'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useBookingStore, useAuthStore } from '@/lib/store';
import { flightApi } from '@/lib/flightApi';
import { useFlightSocket } from '@/hooks/useFlightSocket';

export default function ReviewPage() {
  const router = useRouter();
  const activeBooking = useBookingStore(state => state.activeBooking);
  const selectedFlight = useBookingStore(state => state.selectedFlight);
  const user = useAuthStore(state => state.user);
  const clearBookingFlow = useBookingStore(state => state.clearBookingFlow);

  const [sessionExpired, setSessionExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null); // seconds remaining
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!activeBooking?.expires_at) return;

    const updateTimer = () => {
      const expiresAt = new Date(activeBooking.expires_at).getTime();
      const now = Date.now();
      const remaining = Math.floor((expiresAt - now) / 1000);

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
  }, [activeBooking?.expires_at]);

  useFlightSocket(user?.id, (msg) => {
    const isExpired = (msg.type === 'SESSION_EXPIRED' || msg.event === 'SESSION_EXPIRED');
    const isTargetBooking = (msg.payload?.booking_id === activeBooking?.id || msg.booking_id === activeBooking?.id);
    if (isExpired && isTargetBooking) {
      setSessionExpired(true);
    }
  });

  useEffect(() => {
    if (mounted && !activeBooking) {
      router.replace('/flights');
    }
  }, [mounted, activeBooking, router]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (sessionExpired || !activeBooking?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      await flightApi.confirmBooking(activeBooking.id);
      router.push('/flights/confirmation');
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Payment orchestration failed.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!activeBooking || !selectedFlight) return null;

  const formatTimer = (seconds) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const timerIsUrgent = timeLeft !== null && timeLeft < 120;

  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-12 pt-24 md:pt-40 pb-32">
      <header className="mb-20">
        <span className="text-secondary font-label text-[10px] font-black uppercase tracking-[0.4em] block mb-6">Step 05 — Final Orchestration</span>
        <h1 className="text-5xl md:text-7xl font-headline font-normal leading-tight tracking-tight text-primary">
          Review & <span className="italic font-light">Commit.</span>
        </h1>
      </header>

      {sessionExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="bg-surface-container-lowest p-12 max-w-lg w-full shadow-2xl border-t-4 border-error text-center">
            <span className="material-symbols-outlined text-7xl text-error mb-6">timer_off</span>
            <h2 className="text-4xl font-headline text-primary mb-4">Session Expired</h2>
            <p className="text-on-surface-variant font-light text-lg mb-10 leading-relaxed">
              Your 10-minute seat hold has been released. A fresh search is required to continue.
            </p>
            <button 
              onClick={() => { clearBookingFlow(); router.push('/flights'); }} 
              className="w-full bg-primary text-white py-5 font-label text-xs font-bold uppercase tracking-[0.3em] hover:bg-secondary transition-all"
            >
              Restart Search
            </button>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start ${sessionExpired ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
        
        <div className="lg:col-span-8 space-y-16">

          <div className={`flex items-center gap-6 p-6 border ${timerIsUrgent ? 'border-error/20 bg-error/5' : 'border-secondary/20 bg-secondary/5'}`}>
            <span className={`material-symbols-outlined text-3xl ${timerIsUrgent ? 'text-error animate-pulse' : 'text-secondary'}`}>timer</span>
            <div className="flex-1">
              <p className="font-label text-[9px] uppercase tracking-widest text-outline font-black mb-1">Seat Hold Expires In</p>
              <p className={`font-headline text-3xl tracking-tighter ${timerIsUrgent ? 'text-error' : 'text-primary'}`}>{formatTimer(timeLeft)}</p>
            </div>
            <p className="text-[10px] text-on-surface-variant font-light max-w-[180px] leading-relaxed">Complete payment before time runs out to secure your seats.</p>
          </div>
          
          <section>
            <div className="flex items-end justify-between mb-10 border-b border-outline-variant/10 pb-6">
              <h2 className="text-3xl font-headline text-primary">Journey Architecture</h2>
              <button onClick={() => router.push('/flights')} className="text-secondary font-label text-[10px] uppercase tracking-[0.3em] font-bold border-b border-secondary/30 pb-1">Reset</button>
            </div>
            <div className="bg-surface-container-lowest p-10 editorial-shadow border border-outline-variant/5 relative overflow-hidden group hover:border-secondary/20 transition-all duration-500">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="text-center md:text-left flex-1">
                  <p className="text-outline font-label text-[9px] uppercase tracking-[0.4em] mb-3 font-black">Departure Gateway</p>
                  <h3 className="text-5xl font-headline text-primary mb-1 tracking-tighter">{selectedFlight.origin}</h3>
                  <p className="text-on-surface-variant font-light text-sm">
                    {selectedFlight.departure_time ? new Date(selectedFlight.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''} · {selectedFlight.airline_name}
                  </p>
                </div>
                
                <div className="flex flex-col items-center flex-1">
                  <div className="w-full flex items-center gap-6 opacity-20">
                    <div className="h-px flex-1 bg-primary"></div>
                    <span className="material-symbols-outlined text-primary group-hover:translate-x-4 transition-transform duration-1000">flight_takeoff</span>
                    <div className="h-px flex-1 bg-primary"></div>
                  </div>
                  <p className="text-[9px] font-label uppercase tracking-[0.3em] text-outline mt-4">{selectedFlight.flight_number} · Non-stop</p>
                </div>

                <div className="text-center md:text-right flex-1">
                  <p className="text-outline font-label text-[9px] uppercase tracking-[0.4em] mb-3 font-black">Arrival Terminal</p>
                  <h3 className="text-5xl font-headline text-primary mb-1 tracking-tighter">{selectedFlight.destination}</h3>
                  <p className="text-on-surface-variant font-light text-sm">
                    {selectedFlight.arrival_time ? new Date(selectedFlight.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-end justify-between mb-10 border-b border-outline-variant/10 pb-6">
              <h2 className="text-3xl font-headline text-primary">Traveler Registry</h2>
              <span className="font-label text-[9px] uppercase tracking-widest text-outline font-black">{activeBooking?.passengers?.length} Registered</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeBooking?.passengers?.map((p, idx) => (
                <div key={idx} className="bg-surface-container-low p-8 border border-outline-variant/5 editorial-shadow group hover:bg-surface-bright transition-colors">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-14 h-14 bg-surface-container-high flex items-center justify-center text-primary font-headline text-2xl group-hover:bg-secondary group-hover:text-white transition-colors uppercase">
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
                      <p className="text-lg font-headline text-primary">
                        {p.passenger_type === 'infant' ? <span className="text-secondary italic text-sm">In-Lap</span> : (p.seat_number || '--')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-widest text-outline mb-1.5 font-black">Status</p>
                      <span className="text-[9px] font-label uppercase tracking-widest font-black bg-secondary/10 text-secondary px-2.5 py-1">Pending</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        <aside className="lg:col-span-4 lg:sticky lg:top-32">
          <div className="bg-surface-container-low border border-outline-variant/5 editorial-shadow">
            <div className="p-10 space-y-6 border-b border-outline-variant/10">
              <h3 className="font-headline text-2xl text-primary mb-2">Investment</h3>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-light">Base Fare</span>
                <span className="font-headline text-lg text-primary">₹{activeBooking.base_fare?.toLocaleString() || '—'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-light">Taxes (18%)</span>
                <span className="font-headline text-lg text-primary">₹{activeBooking.taxes?.toLocaleString() || '—'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-light">Service Fee</span>
                <span className="font-headline text-lg text-primary">₹{activeBooking.service_fee?.toLocaleString() || '—'}</span>
              </div>
              {activeBooking.ancillaries_total > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant font-light">Add-ons</span>
                  <span className="font-headline text-lg text-primary">₹{activeBooking.ancillaries_total?.toLocaleString()}</span>
                </div>
              )}
              <div className="pt-6 border-t border-outline-variant/20 flex justify-between items-end">
                <span className="text-[10px] font-label font-black uppercase tracking-[0.3em] text-secondary">Total</span>
                <span className="text-4xl font-headline text-primary tracking-tighter">₹{activeBooking.total_amount?.toLocaleString() || '—'}</span>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="p-10 space-y-8">
              <div className="space-y-3">
                <p className="text-[9px] uppercase tracking-[0.3em] font-black text-outline">Payment Protocol</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-14 flex items-center justify-center bg-primary text-white font-label text-[9px] font-black uppercase tracking-widest">
                    Visa / Amex
                  </div>
                  <div className="h-14 flex items-center justify-center border border-outline-variant/20 font-label text-[9px] font-black uppercase tracking-widest opacity-40">
                    UPI / Wallet
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-error/5 border border-error/10 text-error text-[10px] font-bold text-center uppercase tracking-widest">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading || sessionExpired}
                className="w-full bg-primary text-white py-6 font-label text-xs font-black uppercase tracking-[0.4em] hover:bg-secondary hover:text-primary transition-all disabled:opacity-30 relative overflow-hidden"
              >
                <span className={`transition-all duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}>Execute Commitment</span>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
              </button>

              <div className="flex items-start gap-4 p-5 bg-surface-container-high/30 border border-outline-variant/10">
                <span className="material-symbols-outlined text-secondary text-base">security</span>
                <p className="text-[9px] leading-relaxed text-on-surface-variant uppercase tracking-widest">
                  End-to-end encrypted via TripNEO gateway. Seats secured for {formatTimer(timeLeft)}.
                </p>
              </div>
            </form>
          </div>
        </aside>

      </div>
    </main>
  );
}
