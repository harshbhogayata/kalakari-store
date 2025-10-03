// Performance optimization utilities
import React from 'react';

// Simple memoize implementation
function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Image optimization utilities
export const optimizeImageUrl = (url: string, width?: number, height?: number, quality: number = 80): string => {
  if (!url) return '';
  
  // For Unsplash images, add optimization parameters
  if (url.includes('unsplash.com')) {
    const urlObj = new URL(url);
    urlObj.searchParams.set('w', width?.toString() || '800');
    urlObj.searchParams.set('h', height?.toString() || '600');
    urlObj.searchParams.set('fit', 'crop');
    urlObj.searchParams.set('q', quality.toString());
    return urlObj.toString();
  }
  
  return url;
};

// Lazy loading utility
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return function executedFunction(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoization for expensive calculations
export const memoizedCalculations = {
  // Memoized price calculation
  calculateTotal: memoize((items: Array<{price: number, quantity: number}>) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, (items: Array<{price: number, quantity: number}>) => JSON.stringify(items.map(item => ({ price: item.price, quantity: item.quantity })))),
  
  // Memoized shipping calculation
  calculateShipping: memoize((subtotal: number) => {
    return subtotal >= 1000 ? 0 : 50;
  }),
  
  // Memoized tax calculation
  calculateTax: memoize((subtotal: number) => {
    return Math.round(subtotal * 0.18); // 18% GST
  }),
  
  // Memoized discount calculation
  calculateDiscount: memoize((subtotal: number, discountPercent: number) => {
    return Math.round(subtotal * (discountPercent / 100));
  })
};

// Virtual scrolling utility
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const calculateVirtualScrollRange = (
  scrollTop: number,
  options: VirtualScrollOptions
): { start: number; end: number; totalHeight: number } => {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const end = start + visibleCount + overscan * 2;
  
  return {
    start,
    end,
    totalHeight: itemHeight * (end - start)
  };
};

// Bundle size optimization utilities
export const codeSplitting = {
  // Lazy load components
  lazyLoad: (importFunc: () => Promise<any>) => {
    return React.lazy(importFunc);
  },
  
  // Preload critical components
  preload: (importFunc: () => Promise<any>) => {
    return importFunc();
  }
};

// Memory management utilities
export const memoryManagement = {
  // Clean up event listeners
  cleanupEventListeners: (element: HTMLElement, events: string[], handlers: EventListener[]) => {
    events.forEach((event, index) => {
      element.removeEventListener(event, handlers[index]);
    });
  },
  
  // Clear unused data from localStorage
  cleanupLocalStorage: () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('temp_') && key.includes((Date.now() - 24 * 60 * 60 * 1000).toString())) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
};

// Performance monitoring
export const performanceMonitor = {
  // Measure function execution time
  measureTime: <T>(func: () => T, label: string): T => {
    const start = performance.now();
    const result = func();
    const end = performance.now();
    console.log(`${label} took ${end - start} milliseconds`);
    return result;
  },
  
  // Measure async function execution time
  measureAsyncTime: async <T>(func: () => Promise<T>, label: string): Promise<T> => {
    const start = performance.now();
    const result = await func();
    const end = performance.now();
    console.log(`${label} took ${end - start} milliseconds`);
    return result;
  },
  
  // Get memory usage
  getMemoryUsage: () => {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  },
  
  // Monitor long tasks
  monitorLongTasks: (callback: (task: any) => void) => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback);
      });
      observer.observe({ entryTypes: ['longtask'] });
      return observer;
    }
    return null;
  }
};

// React-specific optimizations
export const reactOptimizations = {
  // Memoize expensive components
  memoizeComponent: <P extends object>(Component: React.ComponentType<P>) => {
    return React.memo(Component);
  },
  
  // Create stable callbacks
  createStableCallback: <T extends (...args: any[]) => any>(
    callback: T,
    deps: React.DependencyList
  ): T => {
    return React.useCallback(callback, deps) as T;
  },
  
  // Create stable values
  createStableValue: <T>(value: T, deps: React.DependencyList): T => {
    return React.useMemo(() => value, deps);
  }
};

// Network optimization
export const networkOptimization = {
  // Retry failed requests with exponential backoff
  retryWithBackoff: async <T>(
    request: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await request();
      } catch (error) {
        lastError = error as Error;
        
        if (i === maxRetries - 1) {
          throw lastError;
        }
        
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  },
  
  // Batch requests
  batchRequests: <T>(requests: (() => Promise<T>)[], batchSize: number = 5): Promise<T[]> => {
    const results: T[] = [];
    
    return new Promise(async (resolve, reject) => {
      try {
        for (let i = 0; i < requests.length; i += batchSize) {
          const batch = requests.slice(i, i + batchSize);
          const batchResults = await Promise.all(batch.map(request => request()));
          results.push(...batchResults);
        }
        resolve(results);
      } catch (error) {
        reject(error);
      }
    });
  }
};

export default {
  optimizeImageUrl,
  createIntersectionObserver,
  debounce,
  throttle,
  memoizedCalculations,
  calculateVirtualScrollRange,
  codeSplitting,
  memoryManagement,
  performanceMonitor,
  reactOptimizations,
  networkOptimization
};
