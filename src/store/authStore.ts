import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import authService from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginError: string | null;
  tempPhone: string | null; // For holding phone between Login and OTP screens
  
  sendOtp: (phone: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  signup: (name: string, upiId: string, profilePicture?: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      loginError: null,
      tempPhone: null,
      
      sendOtp: async (phone) => {
        set({ isLoading: true, loginError: null, tempPhone: phone });
        try {
          const success = await authService.sendOtp(phone);
          set({ isLoading: false });
          return success;
        } catch (error: any) {
          set({ isLoading: false, loginError: error.message || 'Failed to send OTP' });
          return false;
        }
      },
      
      verifyOtp: async (otp) => {
        const phone = get().tempPhone;
        if (!phone) {
          set({ loginError: 'Phone number not found. Please login again.' });
          return false;
        }
        
        set({ isLoading: true, loginError: null });
        try {
          const user = await authService.verifyOtp(phone, otp);
          if (user) {
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              tempPhone: null
            });
            return true;
          } else {
            // User does not exist, redirect to signup
            set({ isLoading: false });
            return false; // False indicates signup is required
          }
        } catch (error: any) {
          set({ isLoading: false, loginError: error.message || 'OTP Verification failed' });
          return false;
        }
      },
      
      signup: async (name, upiId, profilePicture) => {
        const phone = get().tempPhone;
        if (!phone) {
          set({ loginError: 'Phone number not found. Please sign up again.' });
          return false;
        }
        
        set({ isLoading: true, loginError: null });
        try {
          const user = await authService.signup({
            name,
            phone,
            upiId,
            profilePicture
          });
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            tempPhone: null
          });
          return true;
        } catch (error: any) {
          set({ isLoading: false, loginError: error.message || 'Registration failed' });
          return false;
        }
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false, tempPhone: null, loginError: null });
      },
      
      updateUser: (updatedUser) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              ...updatedUser,
              updated_at: new Date().toISOString()
            }
          });
        }
      }
    }),
    {
      name: 'lifeos-auth-storage', // Key for localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
