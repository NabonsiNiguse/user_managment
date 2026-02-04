import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

// User interface - ባክኤንድህ ከሚልከው ዳታ ጋር እንዲገጥም
interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // ፕሮፋይሉን ከሰርቨር በማምጣት ቶከኑ መስራቱን ማረጋገጥ
          const response = await api.get('/auth/profile');
          setUser(response.data.data);
          localStorage.setItem('user', JSON.stringify(response.data.data));
        } catch (error) {
          // ቶከኑ ካለፈበት ወይም ችግር ካለ አጽዳው
          handleAuthClear();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleAuthClear = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, user: userData } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      toast.success('በተሳካ ሁኔታ ገብተዋል!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'መግባት አልተቻለም';
      toast.error(message);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // ሬጅስተር ሲያደርግ በቀጥታ ሎጊን እንዲሆን ካልፈለግክ ይህን ማስተካከል ትችላለህ
      await api.post('/auth/register', { name, email, password });
      toast.success('ምዝገባው ተሳክቷል! አሁን መግባት ይችላሉ።');
    } catch (error: any) {
      const message = error.response?.data?.message || 'ምዝገባው አልተሳካም';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // ባክኤንድ ላይ ኩኪውን እና ዳታቤዝ ውስጥ ያለውን ቶከን ያጠፋል
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      handleAuthClear();
      toast.success('በሰላም ወጥተዋል!');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};