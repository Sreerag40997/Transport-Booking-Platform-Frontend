import { api } from './axios';

export const authApi = {
  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },

  verifyOtp: async (payload) => {
    const { data } = await api.post('/auth/verify-otp', payload);
    return data;
  },

  login: async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    return data;
  },

  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },
};
