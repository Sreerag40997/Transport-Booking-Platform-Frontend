import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: ({ user, token = null }) => set({
        user,
        token,
        isAuthenticated: true,
      }),

      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
      }),

      isAuthModalOpen: false,
      setAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),
    }),
    {
      name: 'tripneo-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useBookingStore = create(
  persist(
    (set) => ({
      // ─── Flight State ─────────────────────────────────────────────
      searchQuery: null,
      selectedFlight: null,
      selectedFare: null,
      selectedSeats: [],
      passengers: [],
      activeBooking: null,

      setSearchQuery: (query) => set({
        searchQuery: {
          ...query,
          adults: query.adults || 1,
          children: query.children || 0,
          infants: query.infants || 0,
          cabinClass: query.cabinClass || 'ECONOMY',
          tripType: query.tripType || 'one_way',
          passengers: (query.adults || 1) + (query.children || 0) + (query.infants || 0)
        }
      }),
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),
      setSelectedFare: (fare) => set({ selectedFare: fare }),
      setSelectedSeats: (seats) => set({ selectedSeats: seats }),
      setPassengers: (passengers) => set({ passengers: passengers }),
      setActiveBooking: (booking) => set({ activeBooking: booking }),

      clearBookingFlow: () => set({
        selectedFlight: null,
        selectedFare: null,
        selectedSeats: [],
        passengers: [],
        activeBooking: null,
      }),

      // ─── Bus State ────────────────────────────────────────────────
      busSearchQuery: null,
      busSelectedInstance: null,
      busSelectedFare: null,
      busSelectedSeats: [],
      busBoardingPoint: null,
      busDroppingPoint: null,
      busPassengers: [],
      busActiveBooking: null,

      setBusSearchQuery: (query) => set({
        busSearchQuery: {
          ...query,
          adults: query.adults || 1,
          children: query.children || 0,
          infants: query.infants || 0,
          cabinClass: query.cabinClass || 'ECONOMY',
          tripType: query.tripType || 'one_way',
          passengers: (query.adults || 1) + (query.children || 0) + (query.infants || 0)
        }
      }),
      setBusSelectedInstance: (instance) => set({ busSelectedInstance: instance }),
      setBusSelectedFare: (fare) => set({ busSelectedFare: fare }),
      setBusSelectedSeats: (seats) => set({ busSelectedSeats: seats }),
      setBusBoardingPoint: (point) => set({ busBoardingPoint: point }),
      setBusDroppingPoint: (point) => set({ busDroppingPoint: point }),
      setBusPassengers: (passengers) => set({ busPassengers: passengers }),
      setBusActiveBooking: (booking) => set({ busActiveBooking: booking }),

      clearBusBookingFlow: () => set({
        busSelectedInstance: null,
        busSelectedFare: null,
        busSelectedSeats: [],
        busBoardingPoint: null,
        busDroppingPoint: null,
        busPassengers: [],
        busActiveBooking: null,
      }),
    }),
    {
      name: 'tripneo-booking-flow',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
