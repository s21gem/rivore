import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CustomerUser {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  dob?: Date;
  gender?: string;
  role: string;
}

interface CustomerAuthState {
  user: CustomerUser | null;
  token: string | null;
  setAuth: (user: CustomerUser, token: string) => void;
  updateUser: (data: Partial<CustomerUser>) => void;
  logout: () => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      updateUser: (data) => set((state) => ({ 
        user: state.user ? { ...state.user, ...data } : null 
      })),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'rivore-customer-auth',
    }
  )
);
