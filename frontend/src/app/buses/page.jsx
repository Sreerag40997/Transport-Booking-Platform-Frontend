'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store';
import CityInput from '@/components/buses/CityInput';

export default function BusSearchPage() {
  const router = useRouter();
  const setBusSearchQuery = useBookingStore((s) => s.setBusSearchQuery);
  const busSearchQuery = useBookingStore((s) => s.busSearchQuery);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

  const [origin, setOrigin] = useState(busSearchQuery?.origin || '');
  const [destination, setDestination] = useState(busSearchQuery?.destination || '');
  const [date, setDate] = useState(busSearchQuery?.date || todayStr);
  const [validationError, setValidationError] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!origin || !destination) {
      setValidationError('Please select both boarding and dropping points');
      return;
    }
    const q = { origin, destination, date, adults: 1, children: 0, infants: 0, cabinClass: 'AC', tripType: 'one_way' };
    setBusSearchQuery(q);
    const params = new URLSearchParams({
      origin,
      destination,
      date,
      adults: '1',
      class: 'AC'
    });
    router.push(`/buses/results?${params.toString()}`);
  };

  const handleToday = () => setDate(todayStr);
  const handleTomorrow = () => setDate(tomorrowStr);

  const isTodayActive = date === todayStr;
  const isTomorrowActive = date === tomorrowStr;

  return (
    <main>
      <section className="relative h-[100svh] min-h-[640px] max-h-[1000px] flex items-end">
        <div className="absolute inset-0">
          <img className="w-full h-full object-cover" alt="Premium bus travel" src="/images/Bus.avif" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-primary/20" />
        </div>

        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 md:px-12 pb-10 md:pb-16">
          <div className="mb-10 md:mb-14">
            <p className="font-label text-[10px] text-secondary font-bold uppercase tracking-[0.4em] mb-4">Tripneo · Premium Bus Travel</p>
            <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.05]">
              Where will you<br /><span className="italic font-light">travel next?</span>
            </h1>
          </div>

          <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-2xl shadow-black/20 p-3 md:p-4">
            {validationError && (
              <div className="mb-3 px-4 py-2.5 bg-error/5 border border-error/10 rounded-lg">
                <p className="text-error text-xs font-medium">{validationError}</p>
              </div>
            )}

            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-0">
              {/* Origin with autocomplete */}
              <div className="flex-1 px-4 py-3 rounded-lg hover:bg-surface-container-low transition-colors lg:border-r lg:border-outline-variant/20 lg:rounded-none">
                <CityInput
                  label="Boarding Point"
                  placeholder="Enter city or stop"
                  value={origin}
                  onChange={setOrigin}
                />
              </div>

              {/* Swap */}
              <button type="button"
                onClick={() => { const t = origin; setOrigin(destination); setDestination(t); }}
                className="hidden lg:flex items-center justify-center w-9 h-9 -mx-[18px] z-10 bg-white border border-outline-variant/30 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all"
              >
                <span className="material-symbols-outlined text-base">swap_horiz</span>
              </button>

              {/* Destination with autocomplete */}
              <div className="flex-1 px-4 py-3 rounded-lg hover:bg-surface-container-low transition-colors lg:border-r lg:border-outline-variant/20 lg:rounded-none">
                <CityInput
                  label="Dropping Point"
                  placeholder="Enter city or stop"
                  value={destination}
                  onChange={setDestination}
                />
              </div>

              {/* Date */}
              <div className="flex-1 px-4 py-3 rounded-lg hover:bg-surface-container-low transition-colors lg:rounded-none">
                <label className="block text-[10px] text-outline uppercase tracking-wider font-bold mb-1.5">Departure</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isTodayActive}
                    onClick={handleToday}
                    className={`shrink-0 px-3 py-0.5 rounded-full text-[10px] font-label font-black uppercase tracking-wider transition-all ${isTodayActive
                        ? 'bg-primary text-white cursor-default'
                        : 'border border-outline-variant/40 text-outline hover:border-primary hover:text-primary'
                      }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    disabled={isTomorrowActive}
                    onClick={handleTomorrow}
                    className={`shrink-0 px-3 py-0.5 rounded-full text-[10px] font-label font-black uppercase tracking-wider transition-all ${isTomorrowActive
                        ? 'bg-primary text-white cursor-default'
                        : 'border border-outline-variant/40 text-outline hover:border-primary hover:text-primary'
                      }`}
                  >
                    Tomorrow
                  </button>
                  <input
                    type="date"
                    value={date}
                    min={todayStr}
                    onChange={(e) => setDate(e.target.value)}
                    className="flex-1 min-w-0 bg-transparent border-none p-0 text-primary font-body text-sm focus:ring-0 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <button type="submit"
                className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-primary px-8 py-4 lg:py-3 rounded-lg font-label text-xs font-bold uppercase tracking-wider transition-all lg:ml-2 shrink-0"
              >
                <span className="material-symbols-outlined text-lg">search</span>
                <span className="lg:hidden xl:inline">Search</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-20 md:py-28 px-6 md:px-12 max-w-[1280px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-14">
          <div>
            <span className="text-secondary font-label text-[10px] font-bold uppercase tracking-[0.3em] block mb-3">Popular Routes</span>
            <h2 className="font-headline text-3xl md:text-4xl text-primary">Explore India by Road</h2>
          </div>
          <button className="text-primary font-label text-xs font-semibold flex items-center gap-1.5 group border-b border-primary/20 pb-0.5 hover:border-primary transition-colors">
            View All
            <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">east</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { city: 'Mumbai', country: 'Maharashtra', price: '₹850', img: '/images/kyoto.png' },
            { city: 'Bangalore', country: 'Karnataka', price: '₹1,200', img: '/images/amalfi.png' },
            { city: 'Delhi', country: 'Delhi NCR', price: '₹950', img: '/images/london.png' },
            { city: 'Chennai', country: 'Tamil Nadu', price: '₹1,100', img: '/images/newyork.png' },
          ].map((dest) => (
            <div key={dest.city} className="group cursor-pointer"
              onClick={() => { setOrigin(''); setDestination(dest.city); }}>
              <div className="aspect-[3/4] overflow-hidden rounded-xl mb-4 relative">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={dest.city} src={dest.img} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-headline text-2xl text-white mb-0.5">{dest.city}</h3>
                  <p className="text-white/70 text-xs">{dest.country}</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-sm text-on-surface-variant">Starting from</span>
                <span className="font-headline text-lg text-primary">{dest.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Tripneo */}
      <section className="bg-primary text-white py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="font-label text-secondary font-bold text-[10px] uppercase tracking-[0.4em] mb-3 block">Why Tripneo</span>
            <h2 className="font-headline text-3xl md:text-4xl">Seamless bus booking</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { icon: 'airline_seat_recline_extra', title: 'Comfortable Seats', desc: 'Choose from AC, Non-AC and Sleeper buses with premium seat selection across all routes.' },
              { icon: 'schedule', title: 'On-Time Journeys', desc: 'Real-time tracking and live updates for every bus to ensure you never miss your journey.' },
              { icon: 'shield', title: 'Secure Booking', desc: 'End-to-end encrypted transactions with real-time seat locking and instant confirmation.' },
            ].map((f) => (
              <div key={f.title} className="text-center md:text-left">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5 mx-auto md:mx-0">
                  <span className="material-symbols-outlined text-secondary text-2xl">{f.icon}</span>
                </div>
                <h3 className="font-headline text-xl mb-3">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 md:py-24 px-6 md:px-12">
        <div className="max-w-2xl mx-auto text-center">
          <span className="material-symbols-outlined text-secondary text-4xl mb-5 block">mail</span>
          <h2 className="font-headline text-3xl text-primary mb-4">Stay inspired</h2>
          <p className="text-on-surface-variant mb-8 leading-relaxed">
            Join our mailing list for exclusive route deals and early access to curated travel collections.
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input className="flex-1 bg-surface-container-low border border-outline-variant/30 px-5 py-3 rounded-lg text-sm focus:ring-1 focus:ring-secondary focus:outline-none" placeholder="Email address" type="email" />
            <button className="bg-primary text-white px-6 py-3 rounded-lg font-label text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors shrink-0">Subscribe</button>
          </div>
          <p className="mt-4 text-[10px] text-outline">No spam. Only inspiration.</p>
        </div>
      </section>
    </main>
  );
}
