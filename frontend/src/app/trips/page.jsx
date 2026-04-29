"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin,
  Plane,
  Calendar,
  Clock,
  Loader2,
  SearchX,
  ArrowRight,
  CheckCircle2,
  Ticket,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { flightApi } from "@/lib/flightApi";
import { useAuthStore } from "@/lib/store";
import Link from "next/link";

export default function MyTripsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
      return;
    }

    if (isAuthenticated) {
      const fetchTrips = async () => {
        try {
          setIsLoading(true);
          const res = await flightApi.getBookingHistory();
          setBookings(res?.data || res || []);
        } catch (err) {
          console.error("Error fetching trips:", err);
          setError("Failed to load your booking history.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchTrips();
    }
  }, [isAuthenticated, authLoading, router]);

  const initiateCancel = (e, bookingId) => {
    e.stopPropagation();
    setBookingToCancel(bookingId);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!bookingToCancel) return;
    setShowCancelModal(false);
    
    try {
      setCancellingId(bookingToCancel);
      const res = await flightApi.cancelBooking(bookingToCancel, "User requested cancellation");
      
      // Update local state to reflect cancellation immediately
      setBookings(prev => prev.map(b => 
        b.id === bookingToCancel 
          ? { 
              ...b, 
              status: 'CANCELLED', 
              refund_status: res.refund_status || 'PENDING',
              refund_amount: res.refund_amount || 0
            } 
          : b
      ));
      
      alert("Booking cancelled successfully.");
    } catch (err) {
      console.error("Cancellation failed:", err);
      alert(err.response?.data?.error || "Failed to cancel booking. Please try again.");
    } finally {
      setCancellingId(null);
      setBookingToCancel(null);
    }
  };

  if (authLoading || (isLoading && isAuthenticated)) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-emerald-600">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="font-bold text-slate-500 animate-pulse">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  const sortedBookings = [...bookings].sort(
    (a, b) =>
      new Date(b.created_at || b.CreatedAt) -
      new Date(a.created_at || a.CreatedAt),
  );

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
        return (
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle2 size={12} /> Confirmed
          </span>
        );
      case "PENDING":
        return (
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
            Pending Payment
          </span>
        );
      case "CANCELLED":
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">
            My Trips
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Manage your upcoming flights and view past adventures.
          </p>
        </header>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100 font-medium text-center">
            {error}
          </div>
        )}

        {sortedBookings.length === 0 && !error ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <SearchX size={40} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">
              No trips found
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              It looks like you havent booked any flights with us yet. Ready for
              your next adventure?
            </p>
            <Link
              href="/"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 flex items-center gap-2"
            >
              Start Exploring <ArrowRight size={18} />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedBookings.map((booking, idx) => {
              const bookingStatus = booking.status?.toUpperCase();
              const canTrack = bookingStatus === "CONFIRMED" && Boolean(booking.pnr);
              const hasRefundAmount = typeof booking.refund_amount === "number";
              const flightDate = new Date(
                booking.departure_time || booking.booked_at,
              );
              const formattedDate = flightDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              const formattedTime = flightDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -5, scale: 1.01 }}
                  onClick={() => router.push(`/trips/${booking.id}`)}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all group cursor-pointer h-full flex flex-col"
                >
                    <div className="h-32 bg-slate-100 relative overflow-hidden flex-shrink-0">
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]"></div>
                      <div className="absolute inset-0 flex items-center justify-center flex-col z-10 px-6">
                        <div className="flex w-full items-center justify-between text-slate-700 font-black text-2xl">
                          <span>{booking.origin || "ORIG"}</span>
                          <div className="flex-1 px-4 flex items-center justify-center relative">
                            <div className="w-full h-px bg-slate-400 border-dashed border-t border-slate-400 absolute"></div>
                            <Plane
                              size={24}
                              className="text-emerald-500 relative z-10 bg-slate-100 px-1"
                            />
                          </div>
                          <span>{booking.destination || "DEST"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col bg-gradient-to-b from-white to-slate-50/50">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Booking Ref
                          </p>
                          <p className="font-mono text-lg font-bold text-slate-700">
                            {booking.pnr || "PENDING"}
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3 text-slate-600">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <Calendar size={16} className="text-slate-500" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              Departure Date
                            </p>
                            <p className="font-bold">{formattedDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <Clock size={16} className="text-slate-500" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              Departure Time
                            </p>
                            <p className="font-bold">{formattedTime}</p>
                          </div>
                        </div>
                      </div>

                      {bookingStatus === "CANCELLED" && (
                        <div className="mt-4 bg-rose-50 border border-rose-100 rounded-xl p-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-rose-700">
                            Refund {booking.refund_status || "PENDING"}
                          </p>
                          {hasRefundAmount && (
                            <p className="text-sm font-semibold text-rose-600 mt-1">
                              {formatCurrency(booking.refund_amount)}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="w-full pt-6 mt-4 border-t border-slate-100 border-dashed flex flex-wrap gap-2 justify-between items-center group-hover:border-emerald-200 transition-colors">
                        <span className="font-bold text-sm text-slate-500 flex items-center gap-2">
                          <Ticket size={16} /> {booking.passengers?.length || 1}{" "}
                          Passenger(s)
                        </span>
                        <div className="flex items-center gap-2">
                          {canTrack && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/flights/status/${booking.pnr}`);
                              }}
                              className="px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                            >
                              <MapPin size={12} /> Track Flight
                            </button>
                          )}
                          {(bookingStatus === "CONFIRMED" || bookingStatus === "PENDING") && (
                            <button
                              type="button"
                              disabled={cancellingId === booking.id}
                              onClick={(e) => initiateCancel(e, booking.id)}
                              className="px-3 py-1.5 rounded-full text-xs font-bold border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              {cancellingId === booking.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <XCircle size={12} />
                              )}
                              Cancel
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/trips/${booking.id}`);
                            }}
                            className="text-emerald-500 font-bold group-hover:translate-x-1 transition-transform text-sm"
                          >
                            View Ticket &rarr;
                          </button>
                        </div>
                      </div>
                    </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    
      {/* Custom Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
          >
            <div className="flex items-center gap-4 text-rose-600 mb-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Cancel Booking?</h3>
            </div>
            <p className="text-slate-600 mb-8">
              Are you sure you want to cancel this booking? This action cannot be undone, and cancellation fees may apply based on the airline's policy.
            </p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setBookingToCancel(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
              >
                Yes, Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
