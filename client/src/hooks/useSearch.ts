import { useState, useEffect, useCallback } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

interface SearchResult {
  _id: string;
  name: string;
  category: string;
  price: number;
  images: Array<{ url: string; alt: string }>;
  artisanId?: string;
}

interface SearchSuggestion {
  _id: string;
  name: string;
  type: 'product' | 'artisan' | 'category';
}

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  // Search products
  const { data: searchResults = [], isLoading, error } = useQuery(
    ['search-products', query],
    async () => {
      if (!query || query.length < 2) return [];
      
      try {
        const params = new URLSearchParams({
          search: query,
          limit: '20'
        });
        
        const response = await api.get(`/api/products?${params}`);
        return response.data.data?.products || [];
      } catch (error) {
        console.error('Search failed:', error);
        return [];
      }
    },
    {
      enabled: query.length >= 2,
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Get search suggestions from API
  const { data: searchSuggestions = [] } = useQuery(
    ['search-suggestions', query],
    async () => {
      if (!query || query.length < 2) return [];
      
      try {
        const params = new URLSearchParams({
          q: query,
          limit: '8'
        });
        
        const response = await api.get(`/api/search/suggestions?${params}`);
        return response.data.data?.suggestions || [];
      } catch (error) {
        console.error('Failed to fetch search suggestions:', error);
        return [];
      }
    },
    {
      enabled: query.length >= 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Get trending searches from API
  const { data: trendingSearches = [] } = useQuery(
    'trending-searches',
    async () => {
      try {
        const response = await api.get('/api/search/trending');
        return response.data.data?.trending || [];
      } catch (error) {
        console.error('Failed to fetch trending searches:', error);
        return [];
      }
    },
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
      cacheTime: 60 * 60 * 1000, // 1 hour
    }
  );

  const handleSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim()) {
      setQuery(searchQuery);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  }, [navigate]);

  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    
    if (suggestion.type === 'product') {
      navigate(`/products/${suggestion._id}`);
    } else if (suggestion.type === 'artisan') {
      navigate(`/artisans/${suggestion._id}`);
    } else {
      navigate(`/products?category=${encodeURIComponent(suggestion.name)}`);
    }
  }, [navigate]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setShowSuggestions(false);
    navigate('/search');
  }, [navigate]);

  useEffect(() => {
    if (searchSuggestions.length > 0) {
      setSuggestions(searchSuggestions);
    }
  }, [searchSuggestions]);

  return {
    query,
    setQuery,
    searchResults: searchResults as SearchResult[],
    suggestions,
    trendingSearches,
    isLoading,
    error,
    isSearching,
    showSuggestions,
    setShowSuggestions,
    handleSearch,
    handleSuggestionClick,
    clearSearch
  };
};

export default useSearch;