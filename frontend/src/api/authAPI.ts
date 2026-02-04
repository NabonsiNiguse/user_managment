import api from './axiosConfig';
// TypeScript 'verbatimModuleSyntax' ስህተት እንዳያሳይ 'import type' ተጠቅመናል
import type { LoginData, RegisterData, AuthResponse, User } from '../types';

export const authAPI = {
  // 1. Login - ተጠቃሚን ለማስገባት
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // 2. Register - አዲስ ተጠቃሚ ለመመዝገብ
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // 3. Get Profile - የገባውን ተጠቃሚ መረጃ ለማምጣት
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    // ባክ-ኤንድህ የሚመልሰው { user: {id...} } ከሆነ .data.user እንጠቀማለን
    return response.data.user || response.data;
  },

  // 4. Update Profile - የግል መረጃን ለማሻሻል
  updateProfile: async (data: { name: string }): Promise<User> => {
    const response = await api.put('/auth/profile', data);
    return response.data.user || response.data;
  },

  // 5. Admin: Get All Users - ሁሉንም ተጠቃሚዎች ለማምጣት (ለአድሚን ብቻ)
  getAllUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get('/auth/admin/users', { params });
    return response.data;
  },

  // 6. Logout - ከሲስተሙ ለመውጣት
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error on server:', error);
    } finally {
      // ሰርቨሩ ላይ ስህተት ቢኖር እንኳ ተጠቃሚው ከብሮውዘሩ እንዲወጣ Token እናጠፋለን
      localStorage.removeItem('token');
    }
  }
};