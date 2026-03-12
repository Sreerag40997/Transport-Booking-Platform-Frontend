import axios from 'axios';
import { useAuthStore } from './store';

// Base URL for your Go API Gateway
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    // Get the current token from Zustand store
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Handle Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken, updateToken, logout } = useAuthStore.getState();

        if (!refreshToken) {
          logout();
          return Promise.reject(error);
        }

        // Call your Go Auth Service refresh endpoint
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newToken = response.data.token;

        // Update the Zustand store with the new access token
        updateToken(newToken);

        // Update the header of the failed request and retry it
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // If refresh token is also expired/invalid, log the user out completely
        useAuthStore.getState().logout();
        // Optional: Redirect to login page here using window.location.href = '/login'
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);