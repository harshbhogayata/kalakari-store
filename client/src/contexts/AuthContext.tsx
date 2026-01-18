import * as React from 'react';
import { ReactNode } from 'react';
import { User, Artisan, AuthContextType, RegisterData } from '../types';
import api from '../utils/api';
import logger from '../utils/logger';
import toast from 'react-hot-toast';

const { createContext, useContext, useState, useEffect } = React;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Try to get user data from server using HTTP-only cookie
      const response = await api.get('/api/auth/me');
      if (response.data.success) {
        const user = response.data.data.user;
        setUser(user);

        // Check if user is an artisan
        if (user.role === 'artisan') {
          try {
            const artisanResponse = await api.get('/api/artisans/profile');
            if (artisanResponse.data.success) {
              setArtisan(artisanResponse.data.data.artisan);
            }
          } catch (error) {
            // No artisan profile found - user is customer
          }
        }
      }
    } catch (error: any) {
      // Auth check failed - user is not logged in
      logger.log('User not authenticated:', error.response?.status);
      localStorage.removeItem('user');
      setUser(null);
      setArtisan(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Get CSRF token before login
      const csrfResponse = await api.get('/api/csrf-token');
      if (csrfResponse.data.success) {
        localStorage.setItem('csrfToken', csrfResponse.data.csrfToken);
      }

      const response = await api.post('/api/auth/login', { email, password });

      if (response.data.success) {
        const { user: userData } = response.data.data;
        // Don't store token in localStorage - server sets HTTP-only cookie
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        // Check if user is an artisan
        if (userData.role === 'artisan') {
          try {
            const artisanResponse = await api.get('/api/artisans/profile');
            if (artisanResponse.data.success) {
              setArtisan(artisanResponse.data.data.artisan);
            }
          } catch (error) {
            // No artisan profile found - user is customer
          }
        }

        toast.success('Login successful!');
        return userData; // Return user data for immediate use
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      // Get CSRF token before registration
      const csrfResponse = await api.get('/api/csrf-token');
      if (csrfResponse.data.success) {
        localStorage.setItem('csrfToken', csrfResponse.data.csrfToken);
      }

      const response = await api.post('/api/auth/register', userData);

      if (response.data.success) {
        const { user: newUser } = response.data.data;
        // Token is now stored in HTTP-only cookie by server (matches login behavior)
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        toast.success('Registration successful!');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      // Logout error handled silently - credentials cleared regardless
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setArtisan(null);
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await api.put('/api/auth/profile', data);

      if (response.data.success) {
        setUser(response.data.data.user);
        toast.success('Profile updated successfully');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    artisan,
    login,
    register,
    logout,
    updateProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
