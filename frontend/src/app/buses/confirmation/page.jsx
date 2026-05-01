'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { useBookingStore, useAuthStore } from '@/lib/store';
import { busApi } from '@/lib/busApi';

export default function BusConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');

  const busActiveBooking = useBookingStore(state => state.busActiveBooking);
  const activeBooking = useBookingStore(state => state.activeBooking);
  const user = useAuthStore(state => state.user);
  const clearBusBookingFlow = useBookingStore(state => state.clearBusBookingFlow);

  const [bookingData, setBookingData] = useState(busActiveBooking || activeBooking);
  const [busDetails, setBusDetails] = useState(null);
  const [boardingPoints, setBoardingPoints] = useState([]);
  const [droppingPoints, setDroppingPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [eTicket, setETicket] = useState(null);

  useEffect(() => {
    const fetchAllDetails = async () => {
      // Robust ID extraction
      const id = bookingId || bookingData?.id;

      if (!id) {
        // If we have no ID at all, we can't fetch. 
        // But let's check if the store has enough info to at least show something.
        if (bookingData) {
          setLoading(false);
        } else {
          // Wait a bit for store hydration if needed
          setTimeout(() => {
            if (!bookingId && !useBookingStore.getState().busActiveBooking) {
              setLoading(false);
            }
          }, 1000);
        }
        return;
      }

      try {
        setLoading(true);
        // 1. Get Booking Details
        const rawBooking = await busApi.getBookingById(id);
        // Backend sometimes wraps in .data or .booking
        const booking = rawBooking?.booking || rawBooking?.data || rawBooking;
        setBookingData(booking);

        const instanceId = booking?.bus_instance_id || booking?.bus_instance?.id;

        if (instanceId) {
          // 2. Get Bus, Boarding and Dropping Details in parallel
          const [details, bPoints, dPoints] = await Promise.all([
            busApi.getBusDetails(instanceId).catch(() => null),
            busApi.getBoardingPoints(instanceId).catch(() => []),
            busApi.getDroppingPoints(instanceId).catch(() => [])
          ]);

          if (details) {
            setBusDetails(details?.data || details);
          }

          setBoardingPoints(Array.isArray(bPoints) ? bPoints : bPoints?.data || []);
          setDroppingPoints(Array.isArray(dPoints) ? dPoints : dPoints?.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch booking details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDetails();
  }, [bookingId, bookingData?.id]);

  const selectedBoarding = useMemo(() => {
    if (!bookingData) return null;
    const bId = bookingData.boarding_point_id || bookingData.boarding_point?.id;
    if (!bId && bookingData.boarding_point) return bookingData.boarding_point;
    if (!boardingPoints.length) return bookingData.boarding_point;
    return boardingPoints.find(p => String(p.id) === String(bId)) || bookingData.boarding_point;
  }, [bookingData, boardingPoints]);

  const selectedDropping = useMemo(() => {
    if (!bookingData) return null;
    const dId = bookingData.dropping_point_id || bookingData.dropping_point?.id;
    if (!dId && bookingData.dropping_point) return bookingData.dropping_point;
    if (!droppingPoints.length) return bookingData.dropping_point;
    return droppingPoints.find(p => String(p.id) === String(dId)) || bookingData.dropping_point;
  }, [bookingData, droppingPoints]);

  const handleGetTicket = async () => {
    if (!bookingData?.id) return;
    setTicketLoading(true);
    try {
      const ticket = await busApi.getTicket(bookingData.id);
      setETicket(ticket);
    } catch (err) {
      console.error('Failed to fetch ticket:', err);
    } finally {
      setTicketLoading(false);
    }
  };

  useEffect(() => {
    // Prevent back navigation to the review page
    const preventBack = () => {
      window.history.pushState(null, '', window.location.href);
      router.replace('/');
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', preventBack);

    return () => window.removeEventListener('popstate', preventBack);
  }, [router]);

  const handleNewSearch = () => {
    clearBusBookingFlow();
    router.push('/buses');
  };

  if (loading) {
    return (
      <main className="pt-40 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-outline">Synchronizing Ticket Details...</p>
      </main>
    );
  }

  if (!bookingData) {
    return (
      <main className="pt-32 px-6 md:px-12 max-w-[900px] mx-auto text-center">
        <h1 className="text-4xl font-headline text-primary mb-6">Reservation Not Found</h1>
        <p className="text-on-surface-variant mb-12 font-light">We were unable to locate an active booking session.</p>
        <button onClick={() => router.push('/buses')} className="bg-primary text-white px-10 py-4 font-label text-xs uppercase tracking-widest">
          Start New Search
        </button>
      </main>
    );
  }

  const primaryPassenger = bookingData.passengers?.[0] || { first_name: user?.name?.split(' ')[0] || 'Traveler' };

  // Robustly extract names, cities and times
  const getPointName = (point, fallback) => {
    if (typeof point === 'string') return point;
    return point?.stop_name || point?.name || point?.station_name || fallback;
  };

  const getPointCity = (point) => {
    if (typeof point === 'string') return '';
    return point?.city || point?.location || '';
  };

  const getTimeValue = (obj) => {
    if (!obj) return null;
    return obj.pickup_time || obj.departure_time || obj.departure_at || obj.pickup_at || obj.start_time || obj.time;
  };

  const bName = getPointName(selectedBoarding || bookingData?.boarding_point, 'Boarding Station');
  const bCity = getPointCity(selectedBoarding || bookingData?.boarding_point);
  const dName = getPointName(selectedDropping || bookingData?.dropping_point, 'Dropping Station');
  const dCity = getPointCity(selectedDropping || bookingData?.dropping_point);

  const rawTime = getTimeValue(selectedBoarding) ||
    getTimeValue(bookingData?.boarding_point) ||
    getTimeValue(busDetails) ||
    getTimeValue(bookingData?.bus_instance);

  const departureTimeStr = rawTime
    ? new Date(rawTime).toLocaleString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    : 'N/A';

  const busNumber = busDetails?.bus_number || bookingData.bus_instance?.bus_number || busDetails?.bus?.bus_number || 'N/A';

  const arrivalDate = bookingData.arrival_time ? new Date(bookingData.arrival_time) : null;
  const departureDate = rawTime ? new Date(rawTime) : null;

  const formatTime = (date) => date ? date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--';
  const formatDate = (date) => date ? date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : 'N/A';

  const baseFare = (bookingData.total_amount || 0) * 0.93;
  const gst = (bookingData.total_amount || 0) * 0.05;
  const convenienceFee = (bookingData.total_amount || 0) * 0.02;

  return (
    <div className="bg-[#f9f9f9] min-h-screen pb-32 md:pb-20 pt-24 font-['Plus_Jakarta_Sans']">
      <main className="max-w-[1280px] mx-auto p-4 md:p-8">
        <div className="flex justify-start mb-8">
          <button
            onClick={() => { clearBusBookingFlow(); router.push('/trips'); }}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-outline hover:text-primary transition-colors group"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to My Trips
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-8 border-b border-dashed border-gray-100 relative">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-primary tracking-tight">{bookingData.operator_name || busDetails?.bus?.operator?.name || 'Bus Operator'}</h2>
                    <p className="text-sm text-on-surface-variant mt-1 font-medium">{bookingData.bus_type || busDetails?.bus?.bus_type?.name || 'A/C Sleeper (2+1)'}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-surface-container-high text-on-surface-variant px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase">
                      {bookingData.pnr || bookingData.id?.toString().slice(0, 8).toUpperCase() || 'TNEO'}
                    </span>
                    <p className="mt-2 text-[9px] font-black tracking-widest text-on-surface-variant uppercase opacity-50">BOOKING ID</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 py-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2">Departure</p>
                    <h3 className="text-4xl font-black text-primary tracking-tighter">{formatTime(departureDate)}</h3>
                    <p className="text-lg font-bold text-on-surface mt-1">{bCity || bookingData.origin || 'Origin'}</p>
                    <p className="text-xs text-on-surface-variant mt-1 font-medium">{bName}</p>
                    <p className="text-[10px] font-black text-outline-variant mt-2 uppercase tracking-widest">{formatDate(departureDate)}</p>
                  </div>

                  <div className="flex flex-col items-center justify-center flex-shrink-0 w-full md:w-auto">
                    <div className="hidden md:flex items-center gap-3 mb-3">
                      <div className="w-2 h-2 rounded-full border-2 border-secondary/30"></div>
                      <div className="w-24 h-[2px] bg-gradient-to-r from-secondary/10 via-secondary/30 to-secondary/10 border-dashed border-t-2"></div>
                      <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>directions_bus</span>
                      <div className="w-24 h-[2px] bg-gradient-to-r from-secondary/10 via-secondary/30 to-secondary/10 border-dashed border-t-2"></div>
                      <div className="w-2 h-2 rounded-full bg-secondary"></div>
                    </div>
                    <span className="text-[10px] font-black text-on-secondary-container bg-secondary-container/50 px-4 py-1.5 rounded-full uppercase tracking-widest">
                      {busDetails?.duration || '08h 45m'}
                    </span>
                  </div>

                  <div className="flex-1 text-left md:text-right">
                    <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2">Arrival</p>
                    <h3 className="text-4xl font-black text-primary tracking-tighter">{formatTime(arrivalDate)}</h3>
                    <p className="text-lg font-bold text-on-surface mt-1">{dCity || bookingData.destination || 'Destination'}</p>
                    <p className="text-xs text-on-surface-variant mt-1 font-medium">{dName}</p>
                    <p className="text-[10px] font-black text-outline-variant mt-2 uppercase tracking-widest">{formatDate(arrivalDate)}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-surface-container-lowest grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-6">Passenger Details</h4>
                  <div className="space-y-6">
                    {bookingData.passengers?.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-5 group">
                        <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                          <span className="material-symbols-outlined text-2xl">person</span>
                        </div>
                        <div>
                          <p className="text-base font-bold text-on-surface tracking-tight">{p.first_name} {p.last_name}</p>
                          <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest mt-0.5">{p.gender || 'M'}, {p.age || '28'} Years · Seat {p.seat_number}</p>
                        </div>
                      </div>
                    ))}
                    {(!bookingData.passengers || bookingData.passengers.length === 0) && (
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">person</span>
                        </div>
                        <div>
                          <p className="text-base font-bold text-on-surface">{primaryPassenger.first_name}</p>
                          <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Traveler</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-gray-100 pt-8 md:pt-0 md:pl-12">
                  <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <img
                      alt="Ticket QR Code"
                      className="w-32 h-32 opacity-80"
                      src={eTicket?.qr_code_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDuIh1JblEohrb51N3KLJUwjy4KmGUcblsG4K5FhJn10NpfkAe9Egux-7V339h8SQAevh6GFaawmgzrroMbcAC2BO5TsU94uJhYbmnv3Ob1ZnI3MDfi4zMCeHivb-Ba7UkzIsPeqshRLi34d9Sa1KzJNAavvNg9KjHafNP-DBqGIjmM8cNESBbH6y4hLoFuTrEnrGliUnkW9VqWl1AkO9zk92kYdj7AeN0ITX1tFTjMo7SAlr78vJOqYddpj0eT2iQDAJKpl6AFZZo"}
                    />
                  </div>
                  <p className="mt-4 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] opacity-40">Scan at Boarding</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <h4 className="text-xl font-bold text-primary tracking-tight mb-6">Fare Breakdown</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant font-medium">Base Fare</span>
                  <span className="text-on-surface font-bold">₹{baseFare.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant font-medium">GST (5%)</span>
                  <span className="text-on-surface font-bold">₹{gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-6 mt-6 border-t border-dashed border-gray-100 flex justify-between items-center">
                  <span className="text-base font-bold text-on-surface uppercase tracking-wider">Total Amount Paid</span>
                  <span className="text-3xl font-black text-secondary tracking-tighter">₹{(bookingData.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm group">
              <div className="h-48 w-full bg-surface-container relative overflow-hidden">
                <img
                  alt="Map Location"
                  className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD65vV1IJvhHMDMRd5pbahMSPRC4JX175Ur3MF0DmiGjG8_di1SrG0Jkt41rFj0eb70bLEaDzqKWcrP2EAMY6QecwyFtVKwwkgCYpMbiutScjtaD_01cdCLZX1blXYAAlfGyCZwoOcuX2U9g48E98hMwOiNSe-v5xrYmEcKr21qhAVtUxP6kXTchbu325epaf4if8I74XRmR8rBoHlsYdKR1opJeh1p32Qwb0rZdOY8NnCBh9Ay0J8JOB7J-1r_WGFBmJmzYhD4crk"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
              </div>
              <div className="p-8 -mt-10 relative z-10">
                <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4">Live Tracking Status</h4>
                <div className="flex items-center gap-3 text-emerald-600 mb-5">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <p className="text-sm font-bold tracking-tight">System Operational</p>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed font-medium mb-8">
                  Live tracking for bus <span className="text-primary font-bold">{busNumber}</span> is available 30 minutes before departure.
                </p>
                <button
                  onClick={() => router.push(`/buses/tracker?pnr=${bookingData.pnr}`)}
                  className="w-full bg-[#04152b] text-white font-bold py-5 rounded-xl flex items-center justify-center gap-3 hover:brightness-110 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
                >
                  <span className="material-symbols-outlined text-xl">my_location</span>
                  Track Bus
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-6">Actions</h4>
              <div className="space-y-4">
                <button
                  onClick={handleGetTicket}
                  disabled={ticketLoading}
                  className="w-full border border-gray-100 bg-white text-primary font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  {ticketLoading ? (
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  ) : (
                    <span className="material-symbols-outlined text-xl">download</span>
                  )}
                  {ticketLoading ? 'Fetching...' : 'Download Ticket'}
                </button>
                <button className="w-full border border-red-100 text-red-500 font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-red-50 transition-all mt-6 opacity-60 hover:opacity-100">
                  <span className="material-symbols-outlined text-xl">cancel</span>
                  Cancel Ticket
                </button>
              </div>
            </div>

            <div className="bg-surface-container-low border border-gray-100 rounded-2xl p-8">
              <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-5">Cancellation Policy</h4>
              <ul className="space-y-4">
                {[
                  { time: 'Before 24 hours', fee: '10% Fee' },
                  { time: '12-24 hours', fee: '25% Fee' },
                  { time: 'Within 12 hours', fee: 'No Refund' }
                ].map((item, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-xs text-on-surface-variant font-medium">{item.time}</span>
                    <span className="text-xs font-bold text-secondary">{item.fee}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
