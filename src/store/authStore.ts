import { create } from 'zustand';
import type { AppUser } from '@/types';

interface AuthState {
  user:        AppUser | null;
  loading:     boolean;
  setUser:     (user: AppUser | null) => void;
  setLoading:  (loading: boolean) => void;
  clearUser:   () => void;
}

// Removed persist middleware - no more auto session restore
export const useAuthStore = create<AuthState>()((set) => ({
  user:       null,
  loading:    false, // Changed to false since we're not loading anything initially
  setUser:    (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  clearUser:  () => set({ user: null }),
}));
