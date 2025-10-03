// Enhanced state management utilities
import { toast } from 'react-hot-toast';

export interface StateManagerConfig {
  storageKey: string;
  defaultValue: any;
  validate?: (data: any) => boolean;
  onError?: (error: Error) => void;
}

export class StateManager {
  private config: StateManagerConfig;
  private listeners: Set<(data: any) => void> = new Set();

  constructor(config: StateManagerConfig) {
    this.config = config;
  }

  // Get data from localStorage with validation
  get(): any {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (!stored) return this.config.defaultValue;

      const parsed = JSON.parse(stored);
      
      // Validate data if validator provided
      if (this.config.validate && !this.config.validate(parsed)) {
        console.warn(`Invalid data for ${this.config.storageKey}, using default`);
        return this.config.defaultValue;
      }

      return parsed;
    } catch (error) {
      console.error(`Error loading ${this.config.storageKey}:`, error);
      if (this.config.onError) {
        this.config.onError(error as Error);
      }
      return this.config.defaultValue;
    }
  }

  // Set data to localStorage with validation
  set(data: any): boolean {
    try {
      // Validate data if validator provided
      if (this.config.validate && !this.config.validate(data)) {
        throw new Error(`Invalid data for ${this.config.storageKey}`);
      }

      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
      this.notifyListeners(data);
      return true;
    } catch (error) {
      console.error(`Error saving ${this.config.storageKey}:`, error);
      if (this.config.onError) {
        this.config.onError(error as Error);
      }
      return false;
    }
  }

  // Update data with a function
  update(updater: (current: any) => any): boolean {
    const current = this.get();
    const updated = updater(current);
    return this.set(updated);
  }

  // Clear data
  clear(): void {
    localStorage.removeItem(this.config.storageKey);
    this.notifyListeners(this.config.defaultValue);
  }

  // Subscribe to changes
  subscribe(listener: (data: any) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners
  private notifyListeners(data: any): void {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }
}

// Pre-configured state managers
export const cartStateManager = new StateManager({
  storageKey: 'kalakari_cart',
  defaultValue: [],
  validate: (data) => Array.isArray(data) && data.every(item => 
    item && 
    typeof item.productId === 'string' && 
    typeof item.quantity === 'number' && 
    item.quantity > 0
  ),
  onError: (error) => {
    console.error('Cart state error:', error);
    toast.error('Cart data corrupted, please refresh the page');
  }
});

export const authStateManager = new StateManager({
  storageKey: 'kalakari_auth',
  defaultValue: { user: null, token: null },
  validate: (data) => 
    data && 
    typeof data === 'object' && 
    (data.user === null || typeof data.user === 'object') &&
    (data.token === null || typeof data.token === 'string'),
  onError: (error) => {
    console.error('Auth state error:', error);
    toast.error('Authentication data corrupted, please login again');
  }
});

export const wishlistStateManager = new StateManager({
  storageKey: 'kalakari_wishlist',
  defaultValue: [],
  validate: (data) => Array.isArray(data) && data.every(item => typeof item === 'string'),
  onError: (error) => {
    console.error('Wishlist state error:', error);
    toast.error('Wishlist data corrupted, please refresh the page');
  }
});

// Utility functions for common operations
export const stateUtils = {
  // Debounced save function
  debouncedSave: (() => {
    const timeouts = new Map<string, NodeJS.Timeout>();
    
    return (manager: StateManager, data: any, delay: number = 300) => {
      const key = (manager as any).config.storageKey;
      
      if (timeouts.has(key)) {
        clearTimeout(timeouts.get(key)!);
      }
      
      const timeout = setTimeout(() => {
        manager.set(data);
        timeouts.delete(key);
      }, delay);
      
      timeouts.set(key, timeout);
    };
  })(),

  // Batch operations
  batch: (operations: (() => boolean)[]): boolean => {
    try {
      return operations.every(op => op());
    } catch (error) {
      console.error('Batch operation failed:', error);
      return false;
    }
  },

  // Migrate old data format
  migrate: (oldKey: string, newKey: string, transformer?: (data: any) => any) => {
    try {
      const oldData = localStorage.getItem(oldKey);
      if (oldData) {
        const parsed = JSON.parse(oldData);
        const transformed = transformer ? transformer(parsed) : parsed;
        localStorage.setItem(newKey, JSON.stringify(transformed));
        localStorage.removeItem(oldKey);
        return true;
      }
    } catch (error) {
      console.error(`Migration failed from ${oldKey} to ${newKey}:`, error);
    }
    return false;
  }
};

// Initialize migrations on app start
export const initializeMigrations = () => {
  // Migrate old cart format
  stateUtils.migrate('cart', 'kalakari_cart');
  
  // Migrate old auth format
  stateUtils.migrate('token', 'kalakari_auth', (token) => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token
  }));
  
  // Clean up old keys
  ['user', 'cart', 'token'].forEach(key => {
    localStorage.removeItem(key);
  });
};
