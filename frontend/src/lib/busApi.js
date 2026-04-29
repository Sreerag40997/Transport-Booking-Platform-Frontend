import { api } from './axios';

export const busApi = {
  // ── Public Endpoints ────────────────────────────────────────────────────────

  searchBuses: async (params) => {
    const { data } = await api.get('/buses/search', { params });
    return data?.data || data?.buses || [];
  },

  getBusStops: async (search) => {
    const { data } = await api.get('/buses/bus-stops', { params: { search } });
    return data?.data || [];
  },

  getOperators: async () => {
    const { data } = await api.get('/buses/operators');
    return data?.data || [];
  },

  getBusDetails: async (instanceId) => {
    const { data } = await api.get(`/buses/${instanceId}`);
    return data?.data || data;
  },

  getFares: async (instanceId) => {
    const { data } = await api.get(`/buses/${instanceId}/fares`);
    return data?.data || data?.fares || [];
  },

  getSeats: async (instanceId) => {
    const { data } = await api.get(`/buses/${instanceId}/seats`);
    return data?.data || data;
  },

  getAmenities: async (instanceId) => {
    const { data } = await api.get(`/buses/${instanceId}/amenities`);
    return data?.data || data;
  },

  getBoardingPoints: async (instanceId) => {
    const { data } = await api.get(`/buses/${instanceId}/boarding-points`);
    return data?.data || data;
  },

  getDroppingPoints: async (instanceId) => {
    const { data } = await api.get(`/buses/${instanceId}/dropping-points`);
    return data?.data || data;
  },

  getRoute: async (instanceId) => {
    const { data } = await api.get(`/buses/${instanceId}/route`);
    return data?.data || data;
  },

  // ── Private Endpoints (Bookings) ────────────────────────────────────────────

  createBooking: async (bookingData) => {
    const { data } = await api.post('/buses/bookings', bookingData);
    return data?.data || data;
  },

  getBookingById: async (bookingId) => {
    const { data } = await api.get(`/buses/bookings/${bookingId}`);
    return data?.data || data;
  },

  getBookingByPnr: async (pnr) => {
    const { data } = await api.get(`/buses/bookings/pnr/${pnr}`);
    return data?.data || data;
  },

  confirmBooking: async (bookingId) => {
    // This initiates the payment flow and returns the Stripe client secret
    const { data } = await api.post(`/buses/bookings/${bookingId}/confirm`);
    return data?.data || data;
  },

  cancelBooking: async (bookingId, reason) => {
    const { data } = await api.post(`/buses/bookings/${bookingId}/cancel`, { reason });
    return data?.data || data;
  },

  getBookingHistory: async () => {
    const { data } = await api.get('/buses/bookings/user/history');
    return data?.data || data;
  },

  getTicket: async (bookingId) => {
    const { data } = await api.get(`/buses/bookings/${bookingId}/ticket`);
    return data?.data || data;
  },
};
