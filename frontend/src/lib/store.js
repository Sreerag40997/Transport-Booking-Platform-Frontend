import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      // Actions
      setAuth: (user, token, refreshToken) => set({
        user,
        token,
        refreshToken,
        isAuthenticated: !!token,
      }),

      updateToken: (newToken) => set({
        token: newToken,
        isAuthenticated: !!newToken,
      }),

      logout: () => set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'tripneo-auth', // name of the item in localStorage
      storage: createJSONStorage(() => localStorage), 
    }
  )
);