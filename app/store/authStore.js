import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(persist(
  (set) => ({
    user: null,
    setUser: (user) => set({ user }),
    logout: () => set({ user: null }),
  }),
  {
    name: 'auth-storage', // name of item in storage
    partialize: (state) => ({ user: state.user }),
  }
));
