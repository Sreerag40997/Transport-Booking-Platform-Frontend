'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store';

export default function FlightSearchPage() {
  const router = useRouter();
  const setSearchQuery = useBookingStore(state => state.setSearchQuery);
  const clearBookingFlow = useBookingStore(state => state.clearBookingFlow);
  
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    clearBookingFlow();
    setSearchQuery({ origin, destination, departureDate, passengers: 1, class: 'ECONOMY', tripType: 'oneway' });
    router.push(`/flights/results`);
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-screen min-h-[850px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover"
            alt="cinematic wide shot of a modern wide-body commercial aircraft flying above a sea of clouds"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_oJSiPcFk68j-ye-uv6xZ1_d2VPrCabPHrY4shbk_b180yYrI1NeMZpLKXE49pTqaNNqcmkR1xdC3FqtZfHR4GPf2H-_5nEdyUkimzVjfzMMESM9j2hU_yimIr-CrDmhnPlGsa37-UPavAcbssBg-kH_MtGR1oB-Q4CQ9zw8xBS-7YAoY82zDx072dRC9wEyxXLK7Wxce9lSj54PRTHi7EQgNlkXSBXDDjW0m7evjquAdvtgUBv0Zu1mhrC5fJl_8r62QcCP21AI" 
          />
          <div className="absolute inset-0 hero-gradient"></div>
        </div>
        <div className="relative z-10 w-full max-w-[1440px] flex px-8 md:px-12 pt-20 mx-auto">
          <div className="max-w-3xl">
            <span className="inline-block font-label text-[11px] uppercase tracking-[0.4em] text-white/70 mb-6">
              The New Standard in Mobility
            </span>
            <h1 className="font-headline text-5xl md:text-[4.5rem] leading-[1.05] text-white tracking-tight mb-8 text-balanced">
              Unified Travel,<br />Everywhere.
            </h1>
            <p className="text-white/80 text-xl font-light max-w-xl mb-12 leading-relaxed text-balanced">
              One platform. Thousands of connections. Book flights, high-speed rail, and luxury ground transport in a single, seamless itinerary.
            </p>
            <div className="flex gap-12 text-white/50 font-label text-[10px] uppercase tracking-[0.2em]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg">flight</span> Flights
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg">train</span> Trains
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg">directions_car</span> Private Hire
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Interface */}
      <section className="relative -mt-32 z-20 px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="glass-panel editorial-shadow p-6 md:p-10 rounded-sm">
          <div className="flex gap-10 mb-10 border-b border-outline-variant/10 pb-5">
            <button className="font-label text-[11px] uppercase tracking-[0.2em] text-secondary font-bold relative after:absolute after:-bottom-5 after:left-0 after:w-full after:h-[2px] after:bg-secondary">
              Round-Trip
            </button>
            <button className="font-label text-[11px] uppercase tracking-[0.2em] text-outline hover:text-primary transition-colors">
              One-Way
            </button>
            <button className="font-label text-[11px] uppercase tracking-[0.2em] text-outline hover:text-primary transition-colors">
              Multi-City
            </button>
          </div>
          
          <form onSubmit={handleSearch} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-3 space-y-3">
              <label className="font-label text-[10px] uppercase tracking-widest text-outline">Origin</label>
              <div className="flex items-center bg-surface-container-lowest px-5 py-4 border border-outline-variant/20 focus-within:border-secondary transition-all group">
                <span className="material-symbols-outlined text-outline group-focus-within:text-secondary text-xl mr-4">
                  location_on
                </span>
                <input
                  className="bg-transparent border-none focus:ring-0 w-full font-headline text-lg p-0 placeholder:text-outline/30 outline-none"
                  placeholder="Where from?" 
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="lg:col-span-3 space-y-3">
              <label className="font-label text-[10px] uppercase tracking-widest text-outline">Destination</label>
              <div className="flex items-center bg-surface-container-lowest px-5 py-4 border border-outline-variant/20 focus-within:border-secondary transition-all group">
                <span className="material-symbols-outlined text-outline group-focus-within:text-secondary text-xl mr-4">
                  explore
                </span>
                <input
                  className="bg-transparent border-none focus:ring-0 w-full font-headline text-lg p-0 placeholder:text-outline/30 outline-none"
                  placeholder="Where to?" 
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="lg:col-span-3 space-y-3">
              <label className="font-label text-[10px] uppercase tracking-widest text-outline">Travel Period</label>
              <div className="flex items-center bg-surface-container-lowest px-5 py-4 border border-outline-variant/20 focus-within:border-secondary transition-all group">
                <span className="material-symbols-outlined text-outline group-focus-within:text-secondary text-xl mr-4">
                  calendar_today
                </span>
                <input
                  className="bg-transparent border-none focus:ring-0 w-full font-body text-sm p-0 placeholder:text-outline/30 outline-none"
                  placeholder="Add dates" 
                  type="text"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <button type="submit" className="w-full bg-primary text-white h-[60px] font-label text-[11px] uppercase tracking-[0.25em] font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-3">
                Find Journey
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Global Gateways section would go here */}
      <section className="py-32 px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-20 gap-8">
          <div className="max-w-2xl">
            <span className="font-label text-secondary text-[11px] uppercase tracking-[0.4em] font-bold mb-4 block">
              Curated Connections
            </span>
            <h2 className="font-headline text-4xl text-primary mb-6">Global Gateways</h2>
            <p className="text-outline font-body leading-relaxed">
              Our premier network connects the world's most vibrant metropolises with unmatched frequency and service standards.
            </p>
          </div>
          <a className="group text-primary font-label text-[11px] uppercase tracking-[0.2em] font-bold flex items-center gap-3 hover:text-secondary transition-colors" href="#">
            Explore Full Network <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">east</span>
          </a>
        </div>
        
        {/* Placeholder for the cards that are in the HTML */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Card 1 */}
          <div className="group cursor-pointer">
            <div className="overflow-hidden mb-6 aspect-[4/5] bg-surface-container text-center grid items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-outline/30">image</span>
            </div>
          </div>
          {/* Card 2 */}
          <div className="group cursor-pointer">
            <div className="overflow-hidden mb-6 aspect-[4/5] bg-surface-container text-center grid items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-outline/30">image</span>
            </div>
          </div>
          {/* Card 3 */}
          <div className="group cursor-pointer">
            <div className="overflow-hidden mb-6 aspect-[4/5] bg-surface-container text-center grid items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-outline/30">image</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
