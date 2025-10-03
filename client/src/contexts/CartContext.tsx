import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, CartContextType } from '../types';

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
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (error) {
      // Cart loading error handled silently - will use empty cart
    }
  };

  const saveCart = (cartItems: CartItem[]) => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      // Cart saving error handled silently - cart will persist in memory
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
      return newItems;
    });
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
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
