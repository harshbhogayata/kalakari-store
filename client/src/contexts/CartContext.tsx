import * as React from 'react';
import { ReactNode } from 'react';
import { CartItem, CartContextType } from '../types';
import api from '../utils/api';

const { createContext, useContext, useState, useEffect } = React;

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
  isLoggedIn?: boolean;
  userId?: string;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children, isLoggedIn = false, userId }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isSynced, setIsSynced] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Load cart on mount or when login status changes
  useEffect(() => {
    loadCart();
  }, [isLoggedIn, userId]);

  // Auto-sync cart every 30 seconds if logged in
  useEffect(() => {
    if (!isLoggedIn) return;

    const syncInterval = setInterval(() => {
      syncCartToServer();
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(syncInterval);
  }, [isLoggedIn, items]);

  const loadCart = async () => {
    try {
      if (isLoggedIn && userId) {
        // Load from server for logged-in users
        try {
          const response = await api.get('/api/cart');
          if (response.data.success && response.data.data.items) {
            setItems(response.data.data.items);
            setSyncError(null);
            setIsSynced(true);
          }
        } catch (error: any) {
          // If server fetch fails, fall back to local storage
          console.warn('Failed to load cart from server, using local storage:', error.message);
          loadFromLocalStorage();
          setSyncError('Using local cart - server sync unavailable');
        }
      } else {
        // Load from local storage for guests
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Cart loading error:', error);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.warn('Cart loading error from localStorage', error);
    }
  };

  const saveCart = (cartItems: CartItem[]) => {
    try {
      // Always save to local storage as backup
      localStorage.setItem('cart', JSON.stringify(cartItems));

      // If logged in, also sync to server
      if (isLoggedIn) {
        syncCartToServer(cartItems);
      }
    } catch (error) {
      console.warn('Cart saving error:', error);
    }
  };

  const syncCartToServer = async (cartItems: CartItem[] = items) => {
    if (!isLoggedIn || !userId) return;

    try {
      // First clear the server cart
      await api.delete('/api/cart').catch(() => {
        // Ignore if cart is already empty
      });

      // Then add all items from local cart
      for (const item of cartItems) {
        await api.post('/api/cart', {
          productId: item.productId,
          quantity: item.quantity,
          variant: item.variant
        });
      }

      setSyncError(null);
      setIsSynced(true);
    } catch (error: any) {
      console.warn('Cart sync to server failed:', error.message);
      setSyncError('Failed to sync cart with server');
    }
  };

  const addItem = (item: CartItem) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => 
        i.productId === item.productId && 
        JSON.stringify(i.variant) === JSON.stringify(item.variant)
      );

      let newItems;
      if (existingItem) {
        newItems = prevItems.map(i =>
          i.productId === item.productId && 
          JSON.stringify(i.variant) === JSON.stringify(item.variant)
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        newItems = [...prevItems, item];
      }

      saveCart(newItems);

      // If logged in, also sync to server immediately
      if (isLoggedIn) {
        api.post('/api/cart', {
          productId: item.productId,
          quantity: existingItem ? item.quantity : item.quantity,
          variant: item.variant
        }).catch(error => {
          console.warn('Failed to add item to server cart:', error.message);
        });
      }

      return newItems;
    });
  };

  const removeItem = (productId: string, variant?: { [key: string]: string }) => {
    setItems(prevItems => {
      const newItems = prevItems.filter(item => {
        if (item.productId !== productId) return true;
        if (variant) {
          return JSON.stringify(item.variant) !== JSON.stringify(variant);
        }
        return false;
      });
      saveCart(newItems);

      // If logged in, also remove from server
      if (isLoggedIn) {
        api.delete(`/api/cart/${productId}`, {
          data: { variant }
        }).catch(error => {
          console.warn('Failed to remove item from server cart:', error.message);
        });
      }

      return newItems;
    });
  };

  const updateQuantity = (productId: string, quantity: number, variant?: { [key: string]: string }) => {
    if (quantity <= 0) {
      removeItem(productId, variant);
      return;
    }

    setItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (item.productId !== productId) return item;
        if (variant) {
          return JSON.stringify(item.variant) === JSON.stringify(variant)
            ? { ...item, quantity }
            : item;
        }
        return { ...item, quantity };
      });
      saveCart(newItems);

      // If logged in, also update on server
      if (isLoggedIn) {
        api.put(`/api/cart/${productId}`, {
          quantity,
          variant
        }).catch(error => {
          console.warn('Failed to update server cart:', error.message);
        });
      }

      return newItems;
    });
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');

    // If logged in, also clear on server
    if (isLoggedIn) {
      api.delete('/api/cart').catch(error => {
        console.warn('Failed to clear server cart:', error.message);
      });
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
