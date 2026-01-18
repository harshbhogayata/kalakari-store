import React, { useState, useEffect } from 'react';
import { Search, Filter, X, SlidersHorizontal, Star } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  isLoading?: boolean;
  totalResults?: number;
}

interface SearchFilters {
  query?: string;
  category?: string;
  artisanId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  materials?: string[];
  colors?: string[];
  sortBy?: 'price' | 'rating' | 'createdAt' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onClear,
  isLoading = false,
  totalResults = 0
}) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    artisanId: searchParams.get('artisan') || '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    minRating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
    inStock: searchParams.get('inStock') === 'true',
    materials: searchParams.get('materials')?.split(',') || [],
    colors: searchParams.get('colors')?.split(',') || [],
    sortBy: (searchParams.get('sortBy') as any) || 'popularity',
    sortOrder: (searchParams.get('sortOrder') as any) || 'desc'
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Static filter data for now
  const categories = [
    'Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalwork',
    'Paintings', 'Sculptures', 'Glass', 'Leather', 'Bamboo'
  ];
  const materials = [
    'Clay', 'Wood', 'Metal', 'Fabric', 'Stone', 'Glass',
    'Cotton', 'Silk', 'Gold', 'Silver', 'Brass', 'Bamboo'
  ];
  const colors = [
    'Red', 'Blue', 'Green', 'Yellow', 'Black', 'White',
    'Brown', 'Orange', 'Purple', 'Pink', 'Gold', 'Silver'
  ];

  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'price', label: 'Price' },
    { value: 'rating', label: 'Rating' },
    { value: 'createdAt', label: 'Newest' }
  ];

  useEffect(() => {
    // Update URL when filters change
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

    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      category: '',
      artisanId: '',
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      inStock: false,
      materials: [],
      colors: [],
      sortBy: 'popularity',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    onClear();
  };

  const handleInputChange = (field: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelect = (field: 'materials' | 'colors', value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: prev[field]?.includes(value)
        ? prev[field]?.filter(item => item !== value)
        : [...(prev[field] || []), value]
    }));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFilters(prev => ({ ...prev, query: suggestion }));
    setShowSuggestions(false);
  };

  // Mock search suggestions
  const getSuggestions = (query: string) => {
    if (query.length < 2) return [];
    
    const allSuggestions = [
      'Terracotta vase', 'Blue pottery', 'Banarasi saree', 'Wooden sculpture',
      'Brass lamp', 'Ceramic bowl', 'Handwoven rug', 'Silver jewelry',
      'Leather bag', 'Bamboo basket', 'Stone carving', 'Glass artwork'
    ];
    
    return allSuggestions
      .filter(item => item.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  };

  const handleQueryChange = (value: string) => {
    setFilters(prev => ({ ...prev, query: value }));
    
    if (value.length >= 2) {
      setSuggestions(getSuggestions(value));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for products, artisans, or categories..."
            value={filters.query || ''}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => {
              if (filters.query && filters.query.length >= 2) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {filters.query && (
            <button
              onClick={() => handleInputChange('query', '')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
              >
                <Search className="inline w-4 h-4 mr-2 text-gray-400" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>Advanced Filters</span>
          <Filter className="w-4 h-4" />
        </button>
        
        <div className="flex items-center space-x-4">
          {totalResults > 0 && (
            <span className="text-sm text-gray-600">
              {totalResults} results found
            </span>
          )}
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="btn-primary px-6 py-2"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="border-t pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category: string) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range (₹)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
placeholder={t('products.min')}
                  value={filters.minPrice || ''}
                  onChange={(e) => handleInputChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <input
                  type="number"
placeholder={t('products.max')}
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleInputChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <select
                  value={filters.minRating || ''}
                  onChange={(e) => handleInputChange('minRating', e.target.value ? Number(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Stars</option>
                </select>
              </div>
            </div>

            {/* Materials Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materials
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                {materials.map((material: string) => (
                  <label key={material} className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      checked={filters.materials?.includes(material) || false}
                      onChange={() => handleMultiSelect('materials', material)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{material}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Colors Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Colors
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                {colors.map((color: string) => (
                  <label key={color} className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      checked={filters.colors?.includes(color) || false}
                      onChange={() => handleMultiSelect('colors', color)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{color}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="space-y-2">
                <select
                  value={filters.sortBy || 'popularity'}
                  onChange={(e) => handleInputChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) => handleInputChange('sortOrder', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="desc">High to Low</option>
                  <option value="asc">Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stock Filter */}
          <div className="mt-4 pt-4 border-t">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.inStock || false}
                onChange={(e) => handleInputChange('inStock', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">In Stock Only</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Clear All
            </button>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="btn-primary px-6 py-2"
            >
              {isLoading ? 'Searching...' : 'Apply Filters'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
