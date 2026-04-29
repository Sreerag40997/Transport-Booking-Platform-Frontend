"use client";
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plane, Calendar, Clock, User, ChevronLeft, Download, MapPin, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { flightApi } from '@/lib/flightApi';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
};

const formatStatusLabel = (status) => {
  if (!status) return 'Unknown';
  return status
    .toLowerCase()
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
};

export default function TicketPage({ params }) {
  const router = useRouter();
  // Unwrap params using React.use for Next.js 14 params promise handling
  const unwrappedParams = use(params);
  const bookingId = unwrappedParams.id;

  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (isAuthenticated) {
        const fetchTicket = async () => {
            try {
                setIsLoading(true);
                // The e-ticket route returns deep info
                const res = await flightApi.getETicket(bookingId);
                setBooking(res?.data || res);
            } catch (err) {
                console.error("Error fetching ticket:", err);
                setError("Failed to load your ticket details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTicket();
    }
  }, [isAuthenticated, authLoading, router, bookingId]);

  const handleCancel = async () => {
    const reason = window.prompt("Please enter a reason for cancellation (optional):");
    if (reason === null) return;

    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setIsCancelling(true);
      const res = await flightApi.cancelBooking(bookingId, reason);
      
      // Refresh local booking state
      setBooking(prev => ({
        ...prev,
        status: 'CANCELLED',
        refund_status: res.refund_status || 'PENDING',
        refund_amount: res.refund_amount || 0
      }));
      
      alert("Booking cancelled successfully.");
    } catch (err) {
      console.error("Cancellation failed:", err);
      alert(err.response?.data?.error || "Failed to cancel booking.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-emerald-600">
           <Plane className="w-10 h-10 animate-bounce" />
           <p className="font-bold text-slate-500 animate-pulse">Generating Boarding Pass...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
        <div className="min-h-screen bg-slate-50 pt-24 px-4 flex flex-col items-center">
            <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 font-bold max-w-md w-full text-center shadow-lg">
                <p>{error || "Ticket not found."}</p>
                <Link href="/trips" className="mt-4 text-sm underline text-red-500 hover:text-red-700 block">Return to My Trips</Link>
            </div>
        </div>
    );
  }

  const flight = booking.flight || {};
  const flightDate = new Date(flight.departure_time || Date.now());
  const pnr = booking.pnr || 'TRIPNEO';
  const seatClass = booking.seat_class || 'ECONOMY';
  const bookingStatus = booking.status || 'UNKNOWN';
  const normalizedBookingStatus = bookingStatus.toUpperCase();
  const canTrack = normalizedBookingStatus === 'CONFIRMED' && Boolean(booking.pnr);
  const refundStatus = booking.refund_status || null;
  const hasRefundAmount = typeof booking.refund_amount === 'number';
  const hasTotalAmount = typeof booking.total_amount === 'number';

  return (
    <div className="min-h-screen bg-slate-100 pt-24 pb-20 px-4 md:px-8 flex justify-center items-start">
      
      <div className="w-full max-w-3xl flex flex-col gap-6">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
            <Link href="/trips" className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold transition-colors">
                <ChevronLeft size={20} /> Back to Trips
            </Link>
            <div className="flex items-center gap-3">
                {(normalizedBookingStatus === "CONFIRMED" || normalizedBookingStatus === "PENDING") && (
                    <button 
                        disabled={isCancelling}
                        onClick={handleCancel}
                        className="bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold py-2 px-4 rounded-full text-sm flex items-center gap-2 transition-colors border border-rose-200 shadow-sm disabled:opacity-50"
                    >
                        {isCancelling ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                        Cancel Booking
                    </button>
                )}
                {normalizedBookingStatus === "CONFIRMED" && (
                    <button className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold py-2 px-4 rounded-full text-sm flex items-center gap-2 transition-colors border border-emerald-200 shadow-sm">
                        <Download size={16} /> Download PDF
                    </button>
                )}
            </div>
        </div>

        <div className={`rounded-2xl border p-5 ${normalizedBookingStatus === 'CANCELLED' ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Booking Status</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  normalizedBookingStatus === 'CANCELLED'
                    ? 'bg-rose-100 text-rose-700'
                    : normalizedBookingStatus === 'CONFIRMED'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                }`}>
                  {formatStatusLabel(bookingStatus)}
                </span>
                {hasTotalAmount && (
                  <span className="text-sm font-semibold text-slate-700">
                    Fare Paid: {formatCurrency(booking.total_amount, booking.currency || 'INR')}
                  </span>
                )}
              </div>
            </div>
            {canTrack && (
              <Link
                href={`/flights/status/${pnr}`}
                className="bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold py-2 px-4 rounded-full text-sm text-center transition-colors"
              >
                Track This Flight
              </Link>
            )}
          </div>
          {normalizedBookingStatus === 'CANCELLED' && (
            <div className="mt-4 pt-4 border-t border-rose-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Refund Status</p>
                <p className="text-sm font-semibold text-rose-700">{formatStatusLabel(refundStatus || 'PENDING')}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Refund Amount</p>
                <p className="text-sm font-semibold text-rose-700">
                  {hasRefundAmount ? formatCurrency(booking.refund_amount, booking.currency || 'INR') : 'Will be updated soon'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Boarding Pass Container List */}
        <div className="flex flex-col gap-8">
            {(booking.passengers || []).map((passenger, index) => (
                <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col md:flex-row bg-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden relative"
                >
                    {/* Left Main Ticket Section */}
                    <div className="flex-1 p-8 md:p-10 border-r-0 md:border-r border-b md:border-b-0 border-dashed border-slate-300 relative">
                        {/* Visual perforations */}
                        <div className="hidden md:block absolute -right-3 top-[-10px] w-6 h-6 rounded-full bg-slate-100"></div>
                        <div className="hidden md:block absolute -right-3 bottom-[-10px] w-6 h-6 rounded-full bg-slate-100"></div>
                        
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <div className="flex items-center gap-2 text-emerald-600 font-black text-2xl tracking-tighter mb-1">
                                    <Plane size={24} className="rotate-45" /> TRIP<span className="text-slate-800">neO</span>
                                </div>
                                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Boarding Pass</span>
                            </div>

                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Flight Number</p>
                                <p className="text-2xl font-black text-slate-800 font-mono tracking-tight">{flight.flight_number || 'TRX-900'}</p>
                            </div>
                        </div>

                        {/* Big Route visualization */}
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-5xl font-black text-emerald-500 tracking-tighter">{flight.origin || 'ORIG'}</h2>
                                <p className="text-sm font-bold text-slate-400 mt-2 truncate w-32 md:w-auto relative left-1/2 md:left-0 -translate-x-1/2 md:-translate-x-0">Departing</p>
                            </div>

                            <div className="flex-1 px-4 flex flex-col items-center justify-center relative">
                                <span className="text-xs font-bold text-slate-400 mb-2">Direct</span>
                                <div className="w-full h-0.5 bg-slate-200 relative mb-4">
                                    <motion.div 
                                      initial={{ left: 0 }}
                                      animate={{ left: '50%' }}
                                      className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 text-emerald-600"
                                    >
                                        <Plane size={16} />
                                    </motion.div>
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-right">
                                <h2 className="text-5xl font-black text-emerald-500 tracking-tighter">{flight.destination || 'DEST'}</h2>
                                <p className="text-sm font-bold text-slate-400 mt-2 truncate w-32 md:w-auto relative left-1/2 md:left-0 -translate-x-1/2 md:-translate-x-0 md:ml-auto">Arriving</p>
                            </div>
                        </div>

                        {/* Grid Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><User size={12}/> Passenger</p>
                                <p className="font-bold text-slate-800 text-sm truncate">{passenger.passenger_name || 'Traveler'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar size={12}/> Date</p>
                                <p className="font-bold text-slate-800 text-sm">{flightDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Clock size={12}/> Boarding Time</p>
                                <p className="font-bold text-emerald-600 text-lg">{flightDate.toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin size={12}/> Gate</p>
                                <p className="font-bold text-slate-800 text-lg">G14</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Stub Section */}
                    <div className="w-full md:w-64 bg-slate-800 text-white p-8 md:p-10 flex flex-col relative justify-center">
                        {/* Visual perforations for mobile */}
                        <div className="md:hidden absolute left-[-10px] top-[-10px] w-6 h-6 rounded-full bg-slate-100"></div>
                        <div className="md:hidden absolute right-[-10px] top-[-10px] w-6 h-6 rounded-full bg-slate-100"></div>

                        <div className="mb-8 hidden md:block">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">PNR</p>
                            <p className="text-3xl font-black font-mono tracking-widest text-emerald-400">{pnr}</p>
                        </div>

                        <div className="space-y-6">
                            
                            <div className="flex justify-center bg-white p-2 rounded-lg mb-2">
                                <img 
                                    src={booking.qr_code_url || `http://localhost:8080/api/qr/generate?data=${pnr}-${passenger.seat_number}`} 
                                    alt="QR Code Ticket Validation" 
                                    className="w-24 h-24 object-contain"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            </div>

                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Seat</p>
                                <p className="text-4xl font-black">{passenger.seat_number || 'TBA'}</p>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Class</p>
                                <p className="font-bold">{seatClass}</p>
                            </div>

                            <div className="pt-6 border-t border-slate-700/50">
                                {/* Fake barcode block */}
                                <div className="w-full h-16 opacity-50 bg-[repeating-linear-gradient(to_right,#fff_0px,#fff_2px,transparent_2px,transparent_4px,#fff_4px,#fff_8px,transparent_8px,transparent_10px,#fff_10px,#fff_16px,transparent_16px,transparent_20px)]"></div>
                                <p className="text-center text-[10px] mt-2 font-mono text-slate-500 uppercase tracking-[0.2em]">{booking.id?.split('-')[0]}-{pnr}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>

        {/* Live Status and tracking link */}
        {canTrack && (
            <motion.div 
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
               className="bg-emerald-500 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-emerald-500/20"
            >
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-lg">Track Live Route</h4>
                        <p className="text-emerald-100 text-sm">Follow your flight on the interactive interactive radar.</p>
                    </div>
                </div>
                <Link 
                    href={`/flights/status/${pnr}`} 
                    className="bg-white text-emerald-600 font-bold py-3 px-6 rounded-full whitespace-nowrap hover:bg-emerald-50 transition-colors shadow-sm w-full sm:w-auto text-center"
                >
                    Open Live Tracker
                </Link>
            </motion.div>
        )}

      </div>
    </div>
  );
}
