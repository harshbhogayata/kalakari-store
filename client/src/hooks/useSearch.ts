import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import api from '../utils/api';
import { SearchFilters } from '../types';

interface UseSearchOptions {
  filters: SearchFilters;
  enabled?: boolean;
}

// interface SearchResult {
//   products: Product[];
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// }

export const useSearch = ({ filters, enabled = true }: UseSearchOptions) => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
    } catch (error) {
      // Search history loading error handled silently - will use empty array
    }
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  // Clear search history
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  // Remove item from search history
  const removeFromHistory = (query: string) => {
    const updated = searchHistory.filter(item => item !== query);
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  // Build query parameters
  const buildQueryParams = (filters: SearchFilters) => {
    const params = new URLSearchParams();
    
    if (filters.query) params.set('q', filters.query);
    if (filters.category) params.set('category', filters.category);
    if (filters.artisanId) params.set('artisan', filters.artisanId);
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.minRating) params.set('rating', filters.minRating.toString());
    if (filters.inStock) params.set('inStock', 'true');
    if (filters.materials?.length) params.set('materials', filters.materials.join(','));
    if (filters.colors?.length) params.set('colors', filters.colors.join(','));
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.limit) params.set('limit', filters.limit.toString());

    return params.toString();
  };

  // Search query
  const {
    data: searchData,
    isLoading,
    error,
    refetch
  } = useQuery(
    ['search', filters],
    async () => {
      const queryString = buildQueryParams(filters);
      const endpoint = process.env.NODE_ENV === 'development' ? '/api/dev/products' : '/products';
      const response = await api.get(`${endpoint}?${queryString}`);
      
      // Save search query to history
      if (filters.query) {
        saveSearchHistory(filters.query);
      }
      
      return response.data;
    },
    {
      enabled: enabled && (!!filters.query || !!filters.category || !!filters.artisanId),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Mock search suggestions
  const getSearchSuggestions = (query: string) => {
    if (query.length < 2) return [];
    
    const suggestions = [
      'Terracotta vase', 'Blue pottery', 'Banarasi saree', 'Wooden sculpture',
      'Brass lamp', 'Ceramic bowl', 'Handwoven rug', 'Silver jewelry',
      'Leather bag', 'Bamboo basket', 'Stone carving', 'Glass artwork',
      'Copper utensils', 'Marble statue', 'Silk scarf', 'Wooden furniture'
    ];
    
    return suggestions
      .filter(item => item.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8);
  };

  // Get trending searches
  const getTrendingSearches = () => {
    return [
      'Terracotta pottery',
      'Banarasi sarees',
      'Wooden sculptures',
      'Brass lamps',
      'Ceramic bowls',
      'Handwoven rugs'
    ];
  };

  // Get popular categories
  const getPopularCategories = () => {
    return [
      { name: 'Pottery', count: 45 },
      { name: 'Textiles', count: 32 },
      { name: 'Jewelry', count: 28 },
      { name: 'Woodwork', count: 23 },
      { name: 'Metalwork', count: 19 },
      { name: 'Paintings', count: 15 }
    ];
  };

  // Get search analytics
  const getSearchAnalytics = () => {
    return {
      totalSearches: searchHistory.length,
      mostSearched: searchHistory[0] || 'No searches yet',
      recentSearches: searchHistory.slice(0, 5),
      trendingSearches: getTrendingSearches(),
      popularCategories: getPopularCategories()
    };
  };

  return {
    // Search results
    products: searchData?.data?.products || searchData?.data || [],
    total: searchData?.data?.total || searchData?.pagination?.total || 0,
    page: searchData?.data?.page || searchData?.pagination?.current || 1,
    limit: searchData?.data?.limit || searchData?.pagination?.limit || 12,
    totalPages: searchData?.data?.totalPages || searchData?.pagination?.pages || 1,
    
    // Loading states
    isLoading,
    error,
    
    // Actions
    refetch,
    
    // Search history
    searchHistory,
    clearSearchHistory,
    removeFromHistory,
    
    // Suggestions and analytics
    getSearchSuggestions,
    getTrendingSearches,
    getPopularCategories,
    getSearchAnalytics
  };
};

export default useSearch;
