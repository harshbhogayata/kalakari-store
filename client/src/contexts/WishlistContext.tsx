import * as React from 'react';
import { ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../utils/api';
import { WishlistItem } from '../types';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const { createContext, useContext, useState } = React;

interface WishlistContextType {
  wishlist: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Fetch wishlist
  const { isLoading } = useQuery(
    ['wishlist'],
    async () => {
      const endpoint = '/api/wishlist';
      const response = await api.get(endpoint);
      return response.data.data;
    },
    {
      enabled: !!user && user.role === 'customer',
      onSuccess: (data) => {
        setWishlist(data.items || []);
      }
    }
  );

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation(
    async (productId: string) => {
      const endpoint = '/api/wishlist';
      const response = await api.post(endpoint, { productId });
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Added to wishlist!');
        queryClient.invalidateQueries(['wishlist']);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to add to wishlist');
      }
    }
  );

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation(
    async (productId: string) => {
      const endpoint = '/api/wishlist';
      const response = await api.delete(`${endpoint}/${productId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Removed from wishlist!');
        queryClient.invalidateQueries(['wishlist']);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to remove from wishlist');
      }
    }
  );

  // Clear wishlist mutation
  const clearWishlistMutation = useMutation(
    async () => {
      const endpoint = '/api/wishlist';
      const response = await api.delete(endpoint);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Wishlist cleared!');
        queryClient.invalidateQueries(['wishlist']);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to clear wishlist');
      }
    }
  );

  const addToWishlist = async (productId: string) => {
    if (!user || user.role !== 'customer') {
      toast.error('Please login to add items to wishlist');
      return;
    }
    await addToWishlistMutation.mutateAsync(productId);
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user || user.role !== 'customer') {
      toast.error('Please login to manage wishlist');
      return;
    }
    await removeFromWishlistMutation.mutateAsync(productId);
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some(item => 
      typeof item.productId === 'string' 
        ? item.productId === productId 
        : item.productId._id === productId
    );
  };

  const clearWishlist = async () => {
    if (!user || user.role !== 'customer') {
      toast.error('Please login to manage wishlist');
      return;
    }
    await clearWishlistMutation.mutateAsync();
  };

  const wishlistCount = wishlist.length;

  const value: WishlistContextType = {
    wishlist,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistProvider;
