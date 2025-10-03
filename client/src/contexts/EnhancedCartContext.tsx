import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem, CartContextType } from '../types';
import { cartStateManager, stateUtils } from '../utils/stateManager';
import toast from 'react-hot-toast';

const EnhancedCartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(EnhancedCartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within an EnhancedCartProvider');
  }
  return context;
};

interface EnhancedCartProviderProps {
  children: ReactNode;
}

export const EnhancedCartProvider: React.FC<EnhancedCartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Subscribe to cart changes
  useEffect(() => {
    const unsubscribe = cartStateManager.subscribe((newItems) => {
      setItems(newItems);
    });
    return unsubscribe;
  }, []);

  const loadCart = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      const cartItems = cartStateManager.get();
      setItems(cartItems);
    } catch (error) {
      console.error('Failed to load cart:', error);
      setError('Failed to load cart');
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveCart = useCallback((cartItems: CartItem[]) => {
    const success = cartStateManager.set(cartItems);
    if (!success) {
      setError('Failed to save cart');
      toast.error('Failed to save cart items');
    }
    return success;
  }, []);

  const addItem = useCallback((item: CartItem) => {
    try {
      setError(null);
      
      // Validate item
      if (!item.productId || item.quantity <= 0) {
        throw new Error('Invalid item data');
      }

      const newItems = items.reduce<CartItem[]>((acc, existingItem) => {
        if (
          existingItem.productId === item.productId && 
          JSON.stringify(existingItem.variant) === JSON.stringify(item.variant)
        ) {
          // Update existing item
          acc.push({ ...existingItem, quantity: existingItem.quantity + item.quantity });
        } else {
          acc.push(existingItem);
        }
        return acc;
      }, []);

      // If item doesn't exist, add it
      if (!items.some(i => 
        i.productId === item.productId && 
        JSON.stringify(i.variant) === JSON.stringify(item.variant)
      )) {
        newItems.push(item);
      }

      setItems(newItems);
      saveCart(newItems);
      toast.success('Item added to cart');
      
      return true;
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      setError('Failed to add item to cart');
      toast.error('Failed to add item to cart');
      return false;
    }
  }, [items, saveCart]);

  const removeItem = useCallback((productId: string, variant?: { [key: string]: string }) => {
    try {
      setError(null);
      
      const newItems = items.filter(item => {
        if (item.productId !== productId) return true;
        if (variant) {
          return JSON.stringify(item.variant) !== JSON.stringify(variant);
        }
        return false;
      });

      setItems(newItems);
      saveCart(newItems);
      toast.success('Item removed from cart');
      
      return true;
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      setError('Failed to remove item from cart');
      toast.error('Failed to remove item from cart');
      return false;
    }
  }, [items, saveCart]);

  const updateQuantity = useCallback((productId: string, quantity: number, variant?: { [key: string]: string }) => {
    try {
      setError(null);
      
      if (quantity <= 0) {
        return removeItem(productId, variant);
      }

      const newItems = items.map(item => {
        if (item.productId !== productId) return item;
        if (variant) {
          return JSON.stringify(item.variant) === JSON.stringify(variant)
            ? { ...item, quantity }
            : item;
        }
        return { ...item, quantity };
      });

      setItems(newItems);
      saveCart(newItems);
      
      return true;
    } catch (error) {
      console.error('Failed to update item quantity:', error);
      setError('Failed to update item quantity');
      toast.error('Failed to update item quantity');
      return false;
    }
  }, [items, saveCart, removeItem]);

  const clearCart = useCallback(() => {
    try {
      setError(null);
      setItems([]);
      cartStateManager.clear();
      toast.success('Cart cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      setError('Failed to clear cart');
      toast.error('Failed to clear cart');
      return false;
    }
  }, []);

  const getItemCount = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [items]);

  const getItem = useCallback((productId: string, variant?: { [key: string]: string }) => {
    return items.find(item => {
      if (item.productId !== productId) return false;
      if (variant) {
        return JSON.stringify(item.variant) === JSON.stringify(variant);
      }
      return !item.variant || Object.keys(item.variant).length === 0;
    });
  }, [items]);

  // Retry failed operations
  const retry = useCallback(() => {
    if (error) {
      loadCart();
    }
  }, [error, loadCart]);

  const value: CartContextType & {
    loading: boolean;
    error: string | null;
    retry: () => void;
    getItemCount: () => number;
    getTotalPrice: () => number;
    getItem: (productId: string, variant?: { [key: string]: string }) => CartItem | undefined;
  } = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    loading,
    error,
    retry,
    getItemCount,
    getItem
  };

  return (
    <EnhancedCartContext.Provider value={value}>
      {children}
    </EnhancedCartContext.Provider>
  );
};

export default EnhancedCartProvider;
