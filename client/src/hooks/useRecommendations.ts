import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';

interface UseRecommendationsResult {
  recentlyViewed: Product[];
  addToRecentlyViewed: (product: Product) => void;
  clearRecentlyViewed: () => void;
  getPersonalizedRecommendations: (category: string, state?: string) => Product[];
  getTrendingRecommendations: (state?: string) => Product[];
  getRelatedRecommendations: (product: Product) => Product[];
}

const useRecommendations = (): UseRecommendationsResult => {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Load recently viewed products from localStorage
  useEffect(() => {
    const loadRecentlyViewed = () => {
      try {
        const stored = localStorage.getItem('recentlyViewed');
        if (stored) {
          const viewed = JSON.parse(stored);
          setRecentlyViewed(viewed);
        }
    } catch (error) {
      // Recently viewed loading error handled silently - will use empty array
    }
    };

    loadRecentlyViewed();
  }, []);

  // Add product to recently viewed
  const addToRecentlyViewed = useCallback((product: Product) => {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      let viewed: Product[] = stored ? JSON.parse(stored) : [];
      
      // Remove if already exists
      viewed = viewed.filter(p => p._id !== product._id);
      
      // Add to beginning
      viewed.unshift(product);
      
      // Keep only last 20 items
      viewed = viewed.slice(0, 20);
      
      localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
      setRecentlyViewed(viewed);
    } catch (error) {
      // Recently viewed saving error handled silently - product won't be saved
    }
  }, []);

  // Clear recently viewed
  const clearRecentlyViewed = useCallback(() => {
    localStorage.removeItem('recentlyViewed');
    setRecentlyViewed([]);
  }, []);

  // Get personalized recommendations based on user's viewing history
  const getPersonalizedRecommendations = (category: string, state?: string): Product[] => {
    const recommendations: Product[] = [];
    
    // Analyze recently viewed to find patterns
    const categoryCounts: { [key: string]: number } = {};
    const stateCounts: { [key: string]: number } = {};
    
    recentlyViewed.forEach(product => {
      categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
      // Extract state from product name or tags
      const productState = product.tags?.find(tag => 
        ['Rajasthan', 'Gujarat', 'West Bengal', 'Tamil Nadu', 'Kerala', 'Karnataka', 'Maharashtra', 'Uttar Pradesh', 'Bihar', 'Odisha'].includes(tag)
      );
      if (productState) {
        stateCounts[productState] = (stateCounts[productState] || 0) + 1;
      }
    });

    // Generate recommendations based on user preferences
    const preferredCategories = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat);

    const preferredStates = Object.entries(stateCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([state]) => state);

    // Generate mock recommendations
    for (let i = 0; i < 6; i++) {
      const recCategory = preferredCategories[i % preferredCategories.length] || category;
      const recState = preferredStates[i % preferredStates.length] || state || 'Traditional';
      
      recommendations.push({
        _id: `personalized_${i + 1}`,
        name: `${recState} ${recCategory} Recommendation`,
        description: `Personalized ${recCategory.toLowerCase()} recommendation based on your preferences`,
        price: 800 + Math.floor(Math.random() * 4000),
        category: recCategory,
        images: [{ 
          url: `https://images.unsplash.com/photo-${1578662996442 + i}?w=300`, 
          alt: 'Personalized Recommendation' 
        }],
        inventory: { 
          total: 10 + Math.floor(Math.random() * 15), 
          available: 5 + Math.floor(Math.random() * 10), 
          reserved: Math.floor(Math.random() * 3) 
        },
        rating: { 
          average: 3.5 + Math.random() * 1.5, 
          count: Math.floor(Math.random() * 100) 
        },
        isActive: true,
        isApproved: true,
        isFeatured: Math.random() > 0.7,
        materials: ['Clay', 'Natural Dyes'],
        colors: [['Terracotta', 'Brown', 'Blue', 'Green'][Math.floor(Math.random() * 4)]],
        tags: [recCategory, recState, 'Handmade', 'Personalized'],
        stats: { 
          views: Math.floor(Math.random() * 400), 
          likes: Math.floor(Math.random() * 100), 
          shares: Math.floor(Math.random() * 50), 
          orders: Math.floor(Math.random() * 80) 
        },
        artisanId: 'artisan_1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return recommendations;
  };

  // Get trending recommendations
  const getTrendingRecommendations = (state?: string): Product[] => {
    const trending: Product[] = [];
    const categories = ['Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalwork', 'Paintings', 'Bamboo', 'Leather', 'Stone', 'Glass'];
    
    for (let i = 0; i < 8; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const productState = state || 'Popular';
      
      trending.push({
        _id: `trending_${i + 1}`,
        name: `${productState} ${category} Trending`,
        description: `Trending ${category.toLowerCase()} - popular choice this week`,
        price: 600 + Math.floor(Math.random() * 5000),
        category: category,
        images: [{ 
          url: `https://images.unsplash.com/photo-${1578662996442 + i}?w=300`, 
          alt: 'Trending Product' 
        }],
        inventory: { 
          total: 15 + Math.floor(Math.random() * 20), 
          available: 8 + Math.floor(Math.random() * 15), 
          reserved: Math.floor(Math.random() * 5) 
        },
        rating: { 
          average: 3.5 + Math.random() * 1.5, 
          count: Math.floor(Math.random() * 150) 
        },
        isActive: true,
        isApproved: true,
        isFeatured: true,
        materials: ['Clay', 'Natural Dyes'],
        colors: [['Terracotta', 'Brown', 'Blue', 'Green', 'Red', 'Gold'][Math.floor(Math.random() * 6)]],
        tags: [category, productState, 'Handmade', 'Trending'],
        stats: { 
          views: 200 + Math.floor(Math.random() * 800), 
          likes: 50 + Math.floor(Math.random() * 200), 
          shares: 10 + Math.floor(Math.random() * 100), 
          orders: 30 + Math.floor(Math.random() * 150) 
        },
        artisanId: 'artisan_1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return trending.sort((a, b) => {
      const scoreA = (a.stats?.views || 0) + (a.stats?.orders || 0) + (a.stats?.likes || 0);
      const scoreB = (b.stats?.views || 0) + (b.stats?.orders || 0) + (b.stats?.likes || 0);
      return scoreB - scoreA;
    });
  };

  // Get related recommendations based on a specific product
  const getRelatedRecommendations = (product: Product): Product[] => {
    const related: Product[] = [];
    const categories = ['Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalwork', 'Paintings', 'Bamboo', 'Leather', 'Stone', 'Glass'];
    
    // Get related categories (same + 2 others)
    const relatedCategories = [product.category, ...categories.filter(c => c !== product.category).sort(() => 0.5 - Math.random()).slice(0, 2)];
    
    relatedCategories.forEach((category, index) => {
      related.push({
        _id: `related_${index + 1}`,
        name: `${product.name.split(' ')[0]} ${category} Related`,
        description: `Related ${category.toLowerCase()} piece similar to what you're viewing`,
        price: product.price + Math.floor(Math.random() * 2000) - 1000,
        category: category,
        images: [{ 
          url: `https://images.unsplash.com/photo-${1578662996442 + index}?w=300`, 
          alt: 'Related Product' 
        }],
        inventory: { 
          total: 10 + Math.floor(Math.random() * 15), 
          available: 5 + Math.floor(Math.random() * 10), 
          reserved: Math.floor(Math.random() * 3) 
        },
        rating: { 
          average: 3.0 + Math.random() * 2.0, 
          count: Math.floor(Math.random() * 100) 
        },
        isActive: true,
        isApproved: true,
        isFeatured: Math.random() > 0.7,
        materials: product.materials || ['Clay', 'Natural Dyes'],
        colors: product.colors || ['Terracotta', 'Brown'],
        tags: [category, 'Related', 'Handmade'],
        stats: { 
          views: Math.floor(Math.random() * 500), 
          likes: Math.floor(Math.random() * 100), 
          shares: Math.floor(Math.random() * 50), 
          orders: Math.floor(Math.random() * 80) 
        },
        artisanId: 'artisan_1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    return related;
  };

  return {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed,
    getPersonalizedRecommendations,
    getTrendingRecommendations,
    getRelatedRecommendations
  };
};

export default useRecommendations;
