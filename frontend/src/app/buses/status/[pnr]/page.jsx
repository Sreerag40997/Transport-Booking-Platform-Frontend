'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { busApi } from '@/lib/busApi';

export default function BusStatusPage() {
  const router = useRouter();
  const params = useParams();
  const pnr = params?.pnr;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!pnr) return;

    const fetchBooking = async () => {
      try {
        setLoading(true);
        const res = await busApi.getBookingByPnr(pnr);
        setBooking(res?.data || res);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to fetch booking status.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [pnr]);

  const instance = booking?.bus_instance;

  return (
    <main className="pt-24 md:pt-40 pb-32 px-6 md:px-12 max-w-[1440px] mx-auto">
      <header className="mb-16">
        <span className="text-secondary font-label text-xs font-bold uppercase tracking-[0.4em] block mb-6">Booking Status</span>
        <h1 className="font-headline text-5xl md:text-7xl tracking-tight text-primary leading-tight">
          Your Bus <span className="italic font-light">Journey.</span>
        </h1>
      </header>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-[11px] font-label text-outline uppercase tracking-[0.3em]">Fetching booking details...</p>
        </div>
      ) : error ? (
        <div className="bg-surface-container-low p-12 text-center border border-outline-variant/10">
          <span className="material-symbols-outlined text-4xl text-outline/40 mb-3 block">error_outline</span>
          <p className="text-primary font-medium mb-2">{error}</p>
          <button onClick={() => router.push('/buses')} className="mt-6 bg-primary text-white px-8 py-3 font-label text-xs uppercase tracking-widest hover:bg-secondary hover:text-primary transition-colors">
            Search Again
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {/* PNR & Status */}
          <div className="bg-surface-container-lowest p-10 md:p-16 border border-outline-variant/10 editorial-shadow">
            <div className="flex items-start justify-between flex-wrap gap-8">
              <div>
                <p className="font-label text-[9px] uppercase tracking-[0.3em] text-outline mb-2 font-black">PNR Reference</p>
                <p className="font-headline text-5xl text-primary tracking-wider">{pnr}</p>
              </div>
              <div className="text-right">
                <p className="font-label text-[9px] uppercase tracking-[0.3em] text-outline mb-2 font-black">Booking Status</p>
                <span className={`font-black text-[9px] uppercase tracking-[0.3em] px-4 py-2 inline-block ${
                  booking?.status === 'CONFIRMED' ? 'bg-secondary/10 text-secondary' :
                  booking?.status === 'CANCELLED' ? 'bg-error/10 text-error' :
                  'bg-outline/10 text-outline'
                }`}>
                  {booking?.status || 'CONFIRMED'}
                </span>
              </div>
            </div>

            {instance && (
              <div className="mt-12 pt-12 border-t border-outline-variant/10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                  <div className="text-center md:text-left">
                    <p className="text-[9px] font-label uppercase tracking-[0.4em] text-outline mb-2 font-black">Boarding Point</p>
                    <p className="font-headline text-4xl text-primary tracking-tight">
                      {booking?.boarding_point?.stop_name || instance?.bus?.origin_stop?.city || '—'}
                    </p>
                    <p className="text-on-surface-variant font-light text-sm mt-1">
                      {instance.departure_at ? new Date(instance.departure_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : ''}
                    </p>
                  </div>

                  <div className="flex flex-col items-center opacity-30">
                    <div className="h-px w-20 bg-primary"></div>
                    <span className="material-symbols-outlined text-primary my-2">directions_bus</span>
                    <div className="h-px w-20 bg-primary"></div>
                  </div>

                  <div className="text-center md:text-right">
                    <p className="text-[9px] font-label uppercase tracking-[0.4em] text-outline mb-2 font-black">Dropping Point</p>
                    <p className="font-headline text-4xl text-primary tracking-tight">
                      {booking?.dropping_point?.stop_name || instance?.bus?.destination_stop?.city || '—'}
                    </p>
                    <p className="text-on-surface-variant font-light text-sm mt-1">
                      {instance.arrival_at ? new Date(instance.arrival_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : 'TBD'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trip Info Grid */}
          {instance && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Bus Number', value: instance.bus?.bus_number || '—' },
                { label: 'Operator', value: instance.bus?.operator?.name || '—' },
                { label: 'Bus Type', value: instance.bus?.bus_type || '—' },
                { label: 'Total Paid', value: `₹${booking?.total_amount?.toLocaleString() || '—'}` },
              ].map((item) => (
                <div key={item.label} className="bg-surface-container-lowest border border-outline-variant/10 p-6 editorial-shadow">
                  <p className="font-label text-[9px] uppercase tracking-[0.3em] text-outline block mb-2 font-black">{item.label}</p>
                  <p className="font-headline text-xl text-primary">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Passengers */}
          {booking?.passengers?.length > 0 && (
            <div className="bg-surface-container-lowest border border-outline-variant/10 p-10 editorial-shadow">
              <h2 className="font-headline text-2xl text-primary mb-8">Travelers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {booking.passengers.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-5 bg-surface-container-low border border-outline-variant/5">
                    <div className="w-10 h-10 bg-secondary/10 text-secondary flex items-center justify-center font-headline text-base uppercase">
                      {p.first_name?.[0]}{p.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-headline text-base text-primary">{p.first_name} {p.last_name}</p>
                      <p className="text-[9px] uppercase tracking-widest text-outline font-black">Seat {p.seat_number || '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => router.push('/buses')} className="text-outline font-label text-xs font-bold uppercase tracking-widest border-b border-outline/30 pb-0.5 hover:text-primary transition-colors">
            ← Search New Route
          </button>
        </div>
      )}
    </main>
  );
}
