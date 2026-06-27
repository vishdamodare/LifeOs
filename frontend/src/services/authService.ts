import apiClient from '../api/client';
import authRepository from '../repositories/authRepository';
import { User } from '../types';

export const authService = {
  sendOtp: async (phone: string): Promise<boolean> => {
    // Return true on success
    return apiClient.post(`/auth/send-otp`, { phone }, true);
  },
  
  verifyOtp: async (phone: string, otp: string): Promise<User | null> => {
    // Using 123456 as a default mock verification code for developer testing
    if (otp !== '123456') {
      throw new Error('Invalid OTP. Use the code 123456.');
    }
    
    const user = authRepository.findUserByPhone(phone);
    if (user) {
      const updatedUser = {
        ...user,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      authRepository.saveUser(updatedUser);
      return apiClient.post(`/auth/verify-otp`, { phone, otp }, updatedUser);
    }
    
    // User does not exist, return null so UI handles the signup flow
    return apiClient.post<User | null, any>(`/auth/verify-otp`, { phone, otp }, null);
  },
  
  signup: async (data: { name: string; phone: string; upiId: string; profilePicture?: string }): Promise<User> => {
    const existing = authRepository.findUserByPhone(data.phone);
    if (existing) {
      throw new Error('A user with this phone number already exists.');
    }
    
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      name: data.name,
      phone: data.phone,
      upi_id: data.upiId,
      profile_picture: data.profilePicture,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: new Date().toISOString()
    };
    
    authRepository.saveUser(newUser);
    return apiClient.post(`/auth/signup`, data, newUser);
  }
};

export default authService;
