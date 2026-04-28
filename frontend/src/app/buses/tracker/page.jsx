'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store';
import { busApi } from '@/lib/busApi';

export default function BusTrackerPage() {
  const router = useRouter();
  const busSelectedInstance = useBookingStore(state => state.busSelectedInstance);
  const busActiveBooking = useBookingStore(state => state.busActiveBooking);

  const [pnrInput, setPnrInput] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pnr = busActiveBooking?.pnr || '';

  const handleTrack = async (e) => {
    e.preventDefault();
    const trackPnr = (pnrInput.trim() || pnr).toUpperCase();
    if (!trackPnr) { setError('Please enter a PNR reference.'); return; }

    try {
      setLoading(true);
      setError('');
      const res = await busApi.getBookingByPnr(trackPnr);
      setBooking(res?.data || res);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to find booking. Please check the PNR.');
    } finally {
      setLoading(false);
    }
  };

  const instance = booking?.bus_instance;

  return (
    <main className="pt-24 md:pt-40 pb-32 px-6 md:px-12 max-w-[1440px] mx-auto">
      <header className="mb-16">
        <span className="text-secondary font-label text-xs font-bold uppercase tracking-[0.4em] block mb-6">Live Tracker</span>
        <h1 className="font-headline text-5xl md:text-7xl tracking-tight text-primary leading-tight">
          Track Your <span className="italic font-light">Bus.</span>
        </h1>
      </header>

      {/* PNR Search */}
      <form onSubmit={handleTrack} className="bg-surface-container-lowest border border-outline-variant/10 editorial-shadow p-10 mb-16 flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1">
          <label className="block text-[10px] text-outline uppercase tracking-wider font-bold mb-2">Enter PNR / Booking Reference</label>
          <input
            type="text"
            value={pnrInput}
            onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
            placeholder={pnr || 'e.g. BUS123456'}
            className="w-full bg-transparent border-b border-outline-variant/30 focus:border-secondary transition-all px-0 py-3 font-headline text-2xl text-primary placeholder:text-outline-variant/40 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-12 py-4 font-label text-xs font-black uppercase tracking-[0.4em] hover:bg-secondary hover:text-primary transition-all disabled:opacity-50"
        >
          {loading ? 'Tracking...' : 'Track Bus'}
        </button>
      </form>

      {/* Current Booking from Store */}
      {busActiveBooking?.pnr && !booking && (
        <div className="bg-primary text-white p-10 mb-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <span className="material-symbols-outlined text-[20rem] absolute -right-20 -bottom-20">directions_bus</span>
          </div>
          <div className="relative z-10">
            <p className="font-label text-[9px] uppercase tracking-widest text-secondary mb-4 font-black">Your Current Booking</p>
            <h2 className="text-4xl font-headline text-white tracking-wider">{busActiveBooking.pnr}</h2>
            <p className="text-white/50 font-label text-[10px] uppercase tracking-widest mt-3">
              {busSelectedInstance?.bus?.origin_stop?.city || busSelectedInstance?.origin || '—'} → {busSelectedInstance?.bus?.destination_stop?.city || busSelectedInstance?.destination || '—'}
            </p>
            <button
              type="button"
              onClick={() => { setPnrInput(busActiveBooking.pnr); }}
              className="mt-6 px-8 py-3 border border-secondary/30 text-secondary text-[9px] font-black uppercase tracking-[0.3em] hover:bg-secondary hover:text-primary transition-all"
            >
              Track This Booking
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-6 bg-error/5 border border-error/10 text-error text-sm font-medium text-center mb-10">
          {error}
        </div>
      )}

      {booking && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-surface-container-lowest p-10 md:p-16 border border-outline-variant/10 editorial-shadow">
            <div className="flex items-start justify-between flex-wrap gap-8 mb-12">
              <div>
                <p className="font-label text-[9px] uppercase tracking-[0.3em] text-outline mb-2 font-black">PNR Reference</p>
                <p className="font-headline text-5xl text-primary tracking-wider">{booking.pnr || pnrInput}</p>
              </div>
              <div className="text-right">
                <p className="font-label text-[9px] uppercase tracking-[0.3em] text-outline mb-2 font-black">Status</p>
                <span className={`font-black text-[9px] uppercase tracking-[0.3em] px-4 py-2 inline-block ${
                  booking.status === 'CONFIRMED' ? 'bg-secondary/10 text-secondary' :
                  booking.status === 'CANCELLED' ? 'bg-error/10 text-error' :
                  'bg-outline/10 text-outline'
                }`}>
                  {booking.status || 'ACTIVE'}
                </span>
              </div>
            </div>

            {instance && (
              <div className="flex flex-col md:flex-row justify-between items-center gap-12 pt-12 border-t border-outline-variant/10">
                <div className="text-center md:text-left">
                  <p className="text-[9px] font-label uppercase tracking-[0.4em] text-outline mb-2 font-black">Boarding</p>
                  <p className="font-headline text-4xl text-primary tracking-tight">
                    {booking.boarding_point?.stop_name || instance.bus?.origin_stop?.city || '—'}
                  </p>
                  <p className="text-on-surface-variant font-light text-sm mt-1">
                    {instance.departure_at ? new Date(instance.departure_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                  </p>
                </div>

                <div className="flex flex-col items-center opacity-30 flex-1 max-w-[120px]">
                  <div className="h-px w-full bg-primary mb-2"></div>
                  <span className="material-symbols-outlined text-primary">directions_bus</span>
                  <div className="h-px w-full bg-primary mt-2"></div>
                </div>

                <div className="text-center md:text-right">
                  <p className="text-[9px] font-label uppercase tracking-[0.4em] text-outline mb-2 font-black">Dropping</p>
                  <p className="font-headline text-4xl text-primary tracking-tight">
                    {booking.dropping_point?.stop_name || instance.bus?.destination_stop?.city || '—'}
                  </p>
                  <p className="text-on-surface-variant font-light text-sm mt-1">
                    {instance.arrival_at ? new Date(instance.arrival_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'TBD'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bus Info */}
          {instance && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Bus No.', value: instance.bus?.bus_number || '—' },
                { label: 'Operator', value: instance.bus?.operator?.name || '—' },
                { label: 'Bus Type', value: instance.bus?.bus_type || '—' },
                { label: 'Total Fare', value: `₹${booking.total_amount?.toLocaleString() || '—'}` },
              ].map((item) => (
                <div key={item.label} className="bg-surface-container-lowest border border-outline-variant/10 p-6 editorial-shadow text-center">
                  <p className="font-label text-[9px] uppercase tracking-[0.3em] text-outline block mb-2 font-black">{item.label}</p>
                  <p className="font-headline text-lg text-primary">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => router.push(`/buses/confirmation`)}
            className="bg-primary text-secondary px-10 py-4 font-label text-[10px] font-black uppercase tracking-[0.3em] hover:bg-secondary hover:text-primary transition-all"
          >
            View Full Booking Details
          </button>
        </div>
      )}

      <div className="mt-12">
        <button onClick={() => router.push('/dashboard')} className="text-outline font-label text-xs font-bold uppercase tracking-widest border-b border-outline/30 pb-0.5 hover:text-primary transition-colors">
          ← Back to Dashboard
        </button>
      </div>
    </main>
  );
}
