import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Artisan, AuthContextType, RegisterData } from '../types';
import api from '../utils/api';
import toast from 'react-hot-toast';

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
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) {
        const user = JSON.parse(userData);
        setUser(user);
        
        // Check if user is an artisan
        if (user.role === 'artisan') {
          try {
            const endpoint = process.env.NODE_ENV === 'development' ? '/api/dev/auth/me' : '/auth/me';
            const response = await api.get(endpoint);
            if (response.data.success) {
              setArtisan(response.data.data.artisanProfile);
            }
          } catch (error) {
            // No artisan profile found - user is customer
          }
        }
      }
    } catch (error) {
      // Auth check failed - clear invalid credentials
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Use mock endpoint in development mode
      const endpoint = process.env.NODE_ENV === 'development' ? '/api/dev/auth/login' : '/auth/login';
      const response = await api.post(endpoint, { email, password });
      
      if (response.data.success) {
        const { user: userData, token } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        // Check if user is an artisan
        if (userData.role === 'artisan') {
          try {
            const artisanResponse = await api.get('/artisans/profile');
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
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        const { user: newUser, token } = response.data.data;
        localStorage.setItem('token', token);
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
      await api.post('/auth/logout');
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
      const response = await api.put('/auth/profile', data);
      
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
