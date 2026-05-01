'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookingStore } from '@/lib/store';
import { busApi } from '@/lib/busApi';

export default function BusTrackerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const busSelectedInstance = useBookingStore(state => state.busSelectedInstance);
  const busActiveBooking = useBookingStore(state => state.busActiveBooking);

  const [pnrInput, setPnrInput] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('search'); // 'search', 'tracking', or 'loading'
  const [isInsideBus, setIsInsideBus] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const pnrFromStore = busActiveBooking?.pnr || '';

  const handleLocationToggle = (e) => {
    const checked = e.target.checked;
    if (checked) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude.toFixed(4),
              lng: position.coords.longitude.toFixed(4)
            });
            setIsInsideBus(true);
          },
          (err) => {
            setError("Location access denied. Please enable it to share location.");
            setIsInsideBus(false);
          }
        );
      } else {
        setError("Geolocation is not supported by your browser.");
        setIsInsideBus(false);
      }
    } else {
      setIsInsideBus(false);
      setUserLocation(null);
    }
  };

  useEffect(() => {
    const urlPnr = searchParams.get('pnr');
    if (urlPnr) {
      setView('loading');
      setPnrInput(urlPnr.toUpperCase());
      handleTrack(null, urlPnr.toUpperCase());
    }
  }, [searchParams]);

  const handleTrack = async (e, overridePnr) => {
    if (e) e.preventDefault();
    const trackPnr = (overridePnr || pnrInput.trim() || pnrFromStore).toUpperCase();
    if (!trackPnr) { setError('Please enter a PNR reference.'); return; }

    try {
      setLoading(true);
      setError('');
      const res = await busApi.getBookingByPnr(trackPnr);
      const data = res?.data || res;
      setBooking(data);
      setView('tracking');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to find booking. Please check the PNR.');
      setView('search');
    } finally {
      setLoading(false);
    }
  };

  const instance = booking?.bus_instance;
  const displayStops = [
    { name: 'London Victoria', city: 'London', time: instance?.departure_at ? new Date(instance.departure_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:15 AM', status: 'passed', label: 'DEPARTED ON TIME' },
    { name: 'Heathrow Terminals 2 & 3', city: 'Heathrow', time: '09:10 AM', status: 'current', label: 'Bus is approaching...' },
    { name: 'High Wycombe Coachway', city: 'High Wycombe', time: '10:45 AM', status: 'upcoming', label: 'Scheduled' },
    { name: 'Banbury Station', city: 'Banbury', time: '11:15 AM', status: 'upcoming', label: 'Scheduled' },
    { name: 'Gloucester Green', city: 'Oxford', time: instance?.arrival_at ? new Date(instance.arrival_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '11:30 AM', status: 'destination', label: 'Final Destination' },
  ];

  return (
    <main className="min-h-screen bg-[#fbf9fb] font-['Plus_Jakarta_Sans'] pb-32 pt-24">
      <AnimatePresence mode="wait">
        {view === 'loading' ? (
          <motion.div
            key="loading-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center pt-32"
          >
            <div className="relative">
              <div className="w-24 h-24 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary animate-pulse">directions_bus</span>
              </div>
            </div>
            <p className="mt-8 text-[10px] font-black text-secondary uppercase tracking-[0.4em] animate-pulse">Synchronizing Live Data...</p>
          </motion.div>
        ) : view === 'search' ? (
          <motion.div
            key="search-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-[1280px] mx-auto px-4 pb-40"
          >
            <header className="mb-16">
              <span className="text-secondary text-[10px] font-black uppercase tracking-[0.4em] block mb-6">Real-Time Tracker</span>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-primary leading-tight">
                Locate Your <span className="italic font-light">Journey.</span>
              </h1>
            </header>

            <form onSubmit={handleTrack} className="bg-white border border-outline-variant/10 shadow-2xl p-10 md:p-16 rounded-[2rem] flex flex-col md:flex-row gap-8 items-end relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent"></div>
              <div className="flex-1 w-full relative z-10">
                <label className="block text-[10px] text-outline uppercase tracking-widest font-black mb-4 opacity-50">Booking Reference / PNR</label>
                <input
                  type="text"
                  value={pnrInput}
                  onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
                  placeholder={pnrFromStore || 'e.g. BUS123456'}
                  className="w-full bg-transparent border-b-2 border-outline-variant/20 focus:border-secondary transition-all px-0 py-4 text-3xl md:text-5xl font-black text-primary placeholder:text-outline-variant/20 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-16 py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:brightness-110 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 relative z-10 w-full md:w-auto"
              >
                {loading ? 'Synchronizing...' : 'Track Bus'}
              </button>
            </form>

            {error && (
              <div className="mt-8 p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-bold text-sm flex items-center gap-3">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="tracking-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-[1280px] mx-auto px-4"
          >
            {/* Bus Detail Header Card */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => router.push(`/buses/confirmation?booking_id=${booking.id}`)}
                      className="mr-4 text-primary hover:text-secondary flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      <span className="material-symbols-outlined text-base">arrow_back</span>
                      Booking Details
                    </button>
                    <span className="px-3 py-1 bg-primary-container text-white rounded-full font-semibold text-[12px] uppercase tracking-wider">
                      BUS {instance?.bus?.bus_number || '402B'}
                    </span>
                    <span className="text-secondary font-black text-sm tracking-widest">LIVE</span>
                    <button 
                      onClick={() => setView('search')}
                      className="ml-4 text-outline hover:text-primary text-[10px] font-black uppercase tracking-widest border-b border-transparent hover:border-primary transition-all"
                    >
                      Change Trip
                    </button>
                  </div>
                  <h2 className="text-2xl font-bold text-primary tracking-tight">
                    {instance?.bus?.origin_stop?.city || 'London'} → {instance?.bus?.destination_stop?.city || 'Oxford'}
                  </h2>
                  <p className="text-on-surface-variant text-sm font-medium">{instance?.bus?.bus_type || 'Intercity Premium Express • AC Seater'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-secondary font-black uppercase tracking-[0.2em]">Current Status</p>
                  <p className="text-2xl font-bold text-emerald-600 tracking-tight">On Time</p>
                  <p className="text-on-surface-variant text-[10px] font-medium opacity-50 uppercase tracking-widest">Updated 1 min ago</p>
                </div>
              </div>
            </section>

            {/* Main Tracking Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left: Journey Map (Conceptual Visualization) */}
              <div className="lg:col-span-4 hidden lg:block">
                <div className="sticky top-24 rounded-2xl overflow-hidden shadow-lg h-[600px] bg-surface-container-high relative">
                  <img 
                    className="w-full h-full object-cover grayscale opacity-40 transition-all duration-700 hover:grayscale-0 hover:opacity-60" 
                    alt="Route Map" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4Eg2_G3lWUVtCMeEacz2TLZaK7d3euoW2_uoknr86yHkJiiGtU6Q7asrBKvbxMZzsz0xLDHtEFyg0xpqgXKRJfsv5c72H6iWfXF7h_pqTufWImd3sBzQUTSPmxwZy4UP9ua8-a75p60G_x88qQhqxI2blJaYgIm7rv8s5Q4lpUdg6ts7mcAqy7zYvkq7B6rDAKgL6l9EKQLzCoOJwuyiXB4V4_oOBx3LR38_ozJc5TrbG3hdIpN3hdO6BKIjRxn3aMNQqYoTpI8I" 
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white/10 backdrop-blur-md">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-6 ring-8 ring-white/10">
                      <span className="material-symbols-outlined text-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
                    </div>
                    <h3 className="text-2xl font-bold text-primary tracking-tight">Real-time Route</h3>
                    <p className="text-on-surface-variant text-sm mt-3 font-medium leading-relaxed">Visualizing your journey through the city&apos;s premium transit corridors.</p>
                  </div>
                </div>
              </div>

              {/* Right: Vertical Timeline */}
              <div className="lg:col-span-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-xl font-bold text-primary tracking-tight">Itinerary Timeline</h3>
                    <div className="flex items-center gap-2 text-secondary bg-secondary-container/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      Scheduled
                    </div>
                  </div>
                  <div className="p-8 relative max-h-[600px] overflow-y-auto custom-scrollbar">
                    {/* The central vertical line */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-12 bottom-12 w-1 bg-slate-100 rounded-full hidden md:block"></div>
                    <div className="absolute left-12 top-12 bottom-12 w-1 bg-slate-100 rounded-full md:hidden"></div>
                    
                    {/* Progress blue line (Mocked at 30%) */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-12 h-[calc(25%+1rem)] w-1 bg-secondary rounded-t-full hidden md:block"></div>
                    <div className="absolute left-12 top-12 h-[calc(25%+1rem)] w-1 bg-secondary rounded-t-full md:hidden"></div>
                    
                    <div className="space-y-16">
                      {displayStops.map((stop, index) => (
                        <div key={index} className={`relative flex items-center md:justify-between group ${stop.status === 'upcoming' || stop.status === 'destination' ? 'opacity-40' : ''}`}>
                          <div className="hidden md:block w-5/12 text-right">
                            <p className="text-xl font-bold text-primary">{stop.time}</p>
                            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{stop.status === 'passed' ? 'Departure' : 'Arrival'}</p>
                          </div>
                          
                          {stop.status === 'current' ? (
                            <div className="z-20 bg-primary p-2.5 rounded-2xl border-4 border-secondary shadow-xl md:mx-auto ml-7 md:ml-auto scale-110">
                              <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>directions_bus</span>
                            </div>
                          ) : (
                            <div className={`z-10 bg-white p-1 rounded-full border-4 ${stop.status === 'passed' ? 'border-secondary' : 'border-slate-100'} md:mx-auto ml-8 md:ml-auto`}>
                              <div className={`w-3 h-3 ${stop.status === 'passed' ? 'bg-secondary' : 'bg-slate-200'} rounded-full`}></div>
                            </div>
                          )}

                          <div className="w-full md:w-5/12 pl-8 md:pl-0">
                            <div className="md:hidden mb-1 flex items-center gap-2">
                              <span className="font-bold text-primary">{stop.time}</span>
                              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{stop.status === 'passed' ? 'DEP' : 'ARR'}</span>
                            </div>
                            <h4 className={`text-lg font-bold tracking-tight ${stop.status === 'current' ? 'text-secondary' : 'text-primary'}`}>{stop.name}</h4>
                            <p className="text-on-surface-variant text-sm font-medium mt-1">{stop.city} • {stop.status === 'passed' ? 'Verified departure' : stop.status === 'current' ? 'Live GPS Location' : 'Upcoming Station'}</p>
                            
                            {stop.status === 'passed' && (
                              <span className="inline-block mt-3 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded border border-emerald-100">DEPARTED ON TIME</span>
                            )}
                            
                            {stop.status === 'current' && (
                              <div className="mt-3 flex items-center gap-2">
                                <span className="animate-ping w-2 h-2 bg-secondary rounded-full"></span>
                                <span className="text-secondary font-black text-[10px] uppercase tracking-[0.2em]">{stop.label}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inside the Bus Toggle Section */}
            <section className="mt-8">
              <div className="bg-white border-2 border-secondary/20 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-8 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary ring-4 ring-secondary/5">
                      <span className="material-symbols-outlined text-3xl">person_pin_circle</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary tracking-tight">Are you inside this bus?</h3>
                      <p className="text-on-surface-variant text-sm font-medium">Help others by sharing live location data</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isInsideBus}
                      onChange={handleLocationToggle}
                      className="sr-only peer" 
                    />
                    <div className="w-16 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-secondary"></div>
                  </label>
                </div>
                {isInsideBus && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="bg-secondary/5 p-8 border-t border-secondary/10 flex flex-col md:flex-row items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                      </div>
                      <span className="text-secondary font-black text-sm uppercase tracking-widest">Sharing live location...</span>
                      <span className="text-on-surface-variant text-[10px] font-mono ml-4 px-3 py-1.5 bg-white rounded-lg border border-slate-100 shadow-sm">
                        {userLocation ? `${userLocation.lat}° N, ${userLocation.lng}° E` : 'Locating...'}
                      </span>
                    </div>
                    <button 
                      onClick={() => { setIsInsideBus(false); setUserLocation(null); }}
                      className="text-secondary font-black text-[10px] uppercase tracking-widest hover:brightness-90 transition-all border-b-2 border-secondary"
                    >
                      Stop Sharing
                    </button>
                  </motion.div>
                )}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
