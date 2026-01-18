import { useState, useEffect } from 'react';
import { Product } from '../types';

export const useRecommendations = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Add product to recently viewed
  const addToRecentlyViewed = (product: Product) => {
    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(p => p._id !== product._id);
      // Add to beginning
      return [product, ...filtered].slice(0, 10); // Keep only last 10
    });
  };

  // Get recently viewed products
  const getRecentlyViewed = () => {
    return recentlyViewed;
  };

  // Clear recently viewed
  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
  };

  // Persist to localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecentlyViewed(parsed);
      } catch (error) {
        console.error('Failed to parse recently viewed products:', error);
        localStorage.removeItem('recentlyViewed');
      }
    }
  }, []);

  // Save to localStorage whenever recentlyViewed changes
  useEffect(() => {
    if (recentlyViewed.length > 0) {
      localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    }
  }, [recentlyViewed]);

  return {
    recentlyViewed,
    addToRecentlyViewed,
    getRecentlyViewed,
    clearRecentlyViewed
  };
};

export default useRecommendations;