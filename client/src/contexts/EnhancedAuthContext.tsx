import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Artisan, AuthContextType, RegisterData } from '../types';
import { authStateManager, stateUtils } from '../utils/stateManager';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  token: string | null;
  artisan: Artisan | null;
}

const EnhancedAuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(EnhancedAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};

interface EnhancedAuthProviderProps {
  children: ReactNode;
}

export const EnhancedAuthProvider: React.FC<EnhancedAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load auth state on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const authState = authStateManager.get();
      
      if (authState.token && authState.user) {
        // Verify token is still valid
        try {
          const endpoint = process.env.NODE_ENV === 'development' ? '/api/dev/auth/me' : '/auth/me';
          const response = await api.get(endpoint);
          
          if (response.data.success) {
            const userData = response.data.data.user || response.data.data;
            setUser(userData);
            
            // Load artisan profile if user is artisan
            if (userData.role === 'artisan') {
              await loadArtisanProfile();
            }
            
            // Update stored auth state
            authStateManager.set({
              user: userData,
              token: authState.token
            });
          } else {
            throw new Error('Invalid token');
          }
        } catch (error) {
          console.warn('Token validation failed:', error);
          // Clear invalid auth state
          authStateManager.clear();
          setUser(null);
          setArtisan(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setError('Authentication check failed');
      // Clear any corrupted auth state
      authStateManager.clear();
      setUser(null);
      setArtisan(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadArtisanProfile = useCallback(async () => {
    try {
      const endpoint = process.env.NODE_ENV === 'development' ? '/api/dev/artisans/profile' : '/artisans/profile';
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        setArtisan(response.data.data.artisan || response.data.data);
      }
    } catch (error) {
      console.warn('Failed to load artisan profile:', error);
      // Don't set error here as artisan profile is optional
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = process.env.NODE_ENV === 'development' ? '/api/dev/auth/login' : '/auth/login';
      const response = await api.post(endpoint, { email, password });
      
      if (response.data.success) {
        const { user: userData, token } = response.data.data;
        
        // Save auth state
        const success = authStateManager.set({
          user: userData,
          token
        });
        
        if (!success) {
          throw new Error('Failed to save authentication data');
        }
        
        setUser(userData);
        
        // Load artisan profile if user is artisan
        if (userData.role === 'artisan') {
          await loadArtisanProfile();
        }
        
        toast.success('Login successful!');
        return userData;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadArtisanProfile]);

  const register = useCallback(async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = process.env.NODE_ENV === 'development' ? '/api/dev/auth/register' : '/auth/register';
      const response = await api.post(endpoint, userData);
      
      if (response.data.success) {
        const { user: newUser, token } = response.data.data;
        
        // Save auth state
        const success = authStateManager.set({
          user: newUser,
          token
        });
        
        if (!success) {
          throw new Error('Failed to save authentication data');
        }
        
        setUser(newUser);
        toast.success('Registration successful!');
        return newUser;
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to logout on server
      try {
        const endpoint = process.env.NODE_ENV === 'development' ? '/api/dev/auth/logout' : '/auth/logout';
        await api.post(endpoint);
      } catch (error) {
        // Server logout failed, but we'll still clear local state
        console.warn('Server logout failed:', error);
      }
      
      // Clear local auth state
      authStateManager.clear();
      setUser(null);
      setArtisan(null);
      
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout failed:', error);
      setError('Logout failed');
      toast.error('Logout failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      setError(null);
      
      const endpoint = process.env.NODE_ENV === 'development' ? '/api/dev/auth/profile' : '/auth/profile';
      const response = await api.put(endpoint, data);
      
      if (response.data.success) {
        const updatedUser = response.data.data.user || response.data.data;
        setUser(updatedUser);
        
        // Update stored auth state
        const authState = authStateManager.get();
        authStateManager.set({
          ...authState,
          user: updatedUser
        });
        
        toast.success('Profile updated successfully');
        return updatedUser;
      } else {
        throw new Error(response.data.message || 'Profile update failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Profile update failed';
      setError(message);
      toast.error(message);
      throw error;
    }
  }, []);

  // Retry failed operations
  const retry = useCallback(() => {
    if (error) {
      checkAuth();
    }
  }, [error, checkAuth]);

  const value: AuthContextType & {
    loading: boolean;
    error: string | null;
    retry: () => void;
  } = {
    user,
    artisan,
    login,
    register,
    logout,
    updateProfile,
    loading,
    error,
    retry
  };

  return (
    <EnhancedAuthContext.Provider value={value}>
      {children}
    </EnhancedAuthContext.Provider>
  );
};

export default EnhancedAuthProvider;
