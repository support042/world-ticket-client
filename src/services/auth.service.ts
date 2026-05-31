import { apiClient } from '@/lib/api';
import type { SignupData, User } from '@/types';

// The shadow variable controls whether we use the real API or mock responses.
// Eventually this will be `const USE_SHADOW = import.meta.env.VITE_USE_MOCKS === 'true';`
const USE_SHADOW = false;

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  admin?: any;
  error?: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    if (USE_SHADOW) {
      // SHADOW MOCK (Simulating Backend Latency)
      await new Promise(resolve => setTimeout(resolve, 800));
      if (email && password.length >= 6) {
        return {
          success: true,
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...",
          user: {
            id: 'user_' + Date.now(),
            email,
            firstName: email.split('@')[0],
            lastName: 'User',
            phone: '1234567890',
            countryCode: '+1',
            avatar: null,
            createdAt: new Date().toISOString()
          }
        };
      }
      return { success: false, error: 'Invalid credentials' };
    }

    // REAL BACKEND CALL
    const response = await apiClient.post<any>('/auth/login', { email, password });
    const { success, data, message } = response.data;
    return {
      success,
      token: data?.token,
      user: data?.user,
      error: message
    };
  },

  register: async (userData: any): Promise<AuthResponse> => {
    if (USE_SHADOW) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        success: true,
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...",
        user: {
          id: 'user_' + Date.now(),
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone ?? '',
          countryCode: userData.countryCode ?? '+1',
          avatar: null,
          createdAt: new Date().toISOString()
        }
      };
    }

    // Map frontend camelCase to backend snake_case
    const payload = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      country_code: userData.countryCode
    };

    const response = await apiClient.post<any>('/auth/register', payload);
    const { success, data, message } = response.data;
    return {
      success,
      token: data?.token,
      user: data?.user,
      error: message
    };
  },
  
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<any>('/auth/me');
    return response.data.data || response.data;
  },

  adminLogin: async (email: string, password: string): Promise<AuthResponse> => {
    if (USE_SHADOW) {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (email === 'admin@worldcup.com' && password === 'admin123') {
        return {
          success: true,
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...",
          admin: {
            id: 'admin_1',
            email,
            name: 'Admin User',
            role: 'admin',
            createdAt: new Date().toISOString()
          }
        };
      }
      return { success: false, error: 'Invalid admin credentials' };
    }

    const response = await apiClient.post<any>('/auth/admin/login', { email, password });
    const { success, data, message } = response.data;
    return {
      success,
      token: data?.token,
      admin: data?.admin || data?.user, // Handle both 'admin' or 'user' key from backend
      error: message
    };
  },
};
