import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { Search, Grid, List, X, SlidersHorizontal, Star, Package, MapPin, Palette, Wrench } from 'lucide-react';
import axios from 'axios';
// import api from '../utils/api'; // TODO: Use for API calls when needed
import config from '../config/env';
import { Product } from '../types';
import LazyImage from '../components/LazyImage';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import ProductBadge from '../components/ProductBadge';
import PriceRangeSlider from '../components/PriceRangeSlider';

const Products: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    state: searchParams.get('state') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    materials: searchParams.get('materials')?.split(',') || [],
    colors: searchParams.get('colors')?.split(',') || [],
    inStock: searchParams.get('inStock') === 'true',
    sort: searchParams.get('sort') || 'createdAt',
    order: searchParams.get('order') || 'desc',
  });

  const { data: productsData, isLoading, error, refetch } = useQuery(
    ['products', filters],
    async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== false) {
          if (Array.isArray(value)) {
            if (value.length > 0) params.set(key, value.join(','));
          } else {
            params.set(key, value.toString());
          }
        }
      });
      
      // Use mock endpoint in development mode
      const endpoint = process.env.NODE_ENV === 'development' ? '/api/dev/products' : '/products';
      const fullUrl = `${endpoint}?${params.toString()}`;
          // API call logging removed for production
      const response = await axios.get(fullUrl);
      return response.data.data;
    }
  );

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== false) {
        if (Array.isArray(v)) {
          if (v.length > 0) params.set(k, v.join(','));
        } else {
          params.set(k, v.toString());
        }
      }
    });
    setSearchParams(params);
  };

  const handleArrayFilterChange = (key: 'materials' | 'colors', value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    handleFilterChange(key, newArray);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== false) {
        if (Array.isArray(v)) {
          if (v.length > 0) params.set(k, v.join(','));
        } else {
          params.set(k, v.toString());
        }
      }
    });
    setSearchParams(params);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      category: '',
      state: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      materials: [],
      colors: [],
      inStock: false,
      sort: 'createdAt',
      order: 'desc',
    };
    setFilters(clearedFilters);
    setSearchParams(new URLSearchParams());
  };

  const categories = [
    'Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalwork',
    'Paintings', 'Bamboo', 'Leather', 'Stone', 'Glass'
  ];

  const states = [
    'Rajasthan', 'Gujarat', 'West Bengal', 'Tamil Nadu', 'Kerala',
    'Karnataka', 'Maharashtra', 'Uttar Pradesh', 'Bihar', 'Odisha',
    'Andhra Pradesh', 'Telangana', 'Madhya Pradesh', 'Punjab', 'Haryana',
    'Himachal Pradesh', 'Jammu and Kashmir', 'Uttarakhand', 'Assam', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Tripura', 'Sikkim',
    'Goa', 'Chhattisgarh', 'Jharkhand', 'Arunachal Pradesh'
  ];

  const materials = [
    'Clay', 'Natural Dyes', 'Water', 'Glaze', 'Cotton', 'Silk', 'Wool', 'Thread',
    'Silver', 'Gold', 'Pearls', 'Gemstones', 'Metal', 'Wood', 'Natural Finish',
    'Wood Stain', 'Varnish', 'Brass', 'Copper', 'Bronze', 'Canvas', 'Oil Paints',
    'Watercolors', 'Brushes', 'Paper', 'Bamboo', 'Natural Fiber', 'Rattan', 'Cane',
    'Leather', 'Dye', 'Hardware', 'Marble', 'Granite', 'Polish', 'Glass', 'Color', 'Lead'
  ];

  const colors = [
    'Terracotta', 'Brown', 'Cream', 'Red', 'Blue', 'Green', 'Gold', 'Maroon',
    'Silver', 'White', 'Golden', 'Natural', 'Dark Brown', 'Copper', 'Multi-color',
    'Vibrant', 'Traditional', 'Modern', 'Light Brown', 'Black', 'Tan', 'Gray', 'Clear'
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('products.title')}</h1>
          <p className="text-gray-600">
            {t('products.subtitle')}
          </p>
        </div>

        {/* Advanced Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* Search and Quick Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('products.searchPlaceholder')}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-outline flex items-center gap-2 ${showFilters ? 'bg-primary-50 border-primary-300' : ''}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {t('products.advancedFilters')}
                {Object.values(filters).some(v => 
                  Array.isArray(v) ? v.length > 0 : v !== undefined && v !== '' && v !== false
                ) && (
                  <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                    {t('products.active')}
                  </span>
                )}
              </button>
              
              <button
                onClick={clearFilters}
                className="btn-outline flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
                {t('products.clear')}
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="border-t pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Package className="w-4 h-4 inline mr-1" />
                    {t('products.category')}
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">{t('products.allCategories')}</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* State Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {t('products.state')}
                  </label>
                  <select
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">{t('products.allStates')}</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('products.priceRange')} (₹)
                  </label>
                  <PriceRangeSlider
                    minPrice={0}
                    maxPrice={10000}
                    currentMin={parseInt(filters.minPrice) || 0}
                    currentMax={parseInt(filters.maxPrice) || 10000}
                    onRangeChange={(min, max) => {
                      handleFilterChange('minPrice', min.toString());
                      handleFilterChange('maxPrice', max.toString());
                    }}
                  />
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Star className="w-4 h-4 inline mr-1" />
                    {t('products.minRating')}
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">{t('products.anyRating')}</option>
                    <option value="4">{t('products.stars4')}</option>
                    <option value="3">{t('products.stars3')}</option>
                    <option value="2">{t('products.stars2')}</option>
                    <option value="1">{t('products.stars1')}</option>
                  </select>
                </div>
              </div>

              {/* Materials Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Wrench className="w-4 h-4 inline mr-1" />
                  {t('products.materials')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {materials.map(material => (
                    <button
                      key={material}
                      onClick={() => handleArrayFilterChange('materials', material)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        filters.materials.includes(material)
                          ? 'bg-primary-100 text-primary-800 border-primary-300'
                          : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {material}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Palette className="w-4 h-4 inline mr-1" />
                  {t('products.colors')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => handleArrayFilterChange('colors', color)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        filters.colors.includes(color)
                          ? 'bg-primary-100 text-primary-800 border-primary-300'
                          : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Filter */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="inStock" className="ml-2 block text-sm text-gray-900">
                  {t('products.inStockOnly')}
                </label>
              </div>
            </div>
          )}

          {/* Sort and View Options */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t">
            <div className="flex items-center gap-4">
              <select
                value={`${filters.sort}-${filters.order}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  handleFilterChange('sort', sort);
                  handleFilterChange('order', order);
                }}
                className="input-field"
              >
                <option value="createdAt-desc">{t('products.newestFirst')}</option>
                <option value="createdAt-asc">{t('products.oldestFirst')}</option>
                <option value="price-asc">{t('products.priceLowToHigh')}</option>
                <option value="price-desc">{t('products.priceHighToLow')}</option>
                <option value="name-asc">{t('products.nameAToZ')}</option>
                <option value="name-desc">{t('products.nameZToA')}</option>
                <option value="rating-desc">{t('products.highestRated')}</option>
                <option value="rating-asc">{t('products.lowestRated')}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {productsData?.pagination?.total || 0} {t('products.productsFound')}
              </span>
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonLoader key={index} type="product-card" />
            ))}
          </div>
        ) : productsData?.products?.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {productsData.products.map((product: Product) => (
              <div
                key={product._id}
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {viewMode === 'list' ? (
                  <>
                    <div className="w-48 h-48 flex-shrink-0 relative">
                      <LazyImage
                        src={product.images?.[0]?.url || config.images.fallback}
                        alt={product.name}
                        className="w-full h-full rounded-l-lg"
                      />
                      {/* Product Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.isFeatured && <ProductBadge type="featured" />}
                        {product.discount && product.discount > 0 && <ProductBadge type="sale" />}
                        {product.stats?.orders && product.stats.orders > 50 && <ProductBadge type="bestseller" />}
                      </div>
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                        <span className="text-lg font-bold text-primary-600">₹{product.price}</span>
                      </div>
                      {/* Stock Status */}
                      <div className="mb-2">
                        {product.inventory?.available === 0 ? (
                          <span className="text-red-500 text-sm font-medium">Out of Stock</span>
                        ) : product.inventory?.available && product.inventory.available <= 5 ? (
                          <span className="text-orange-500 text-sm font-medium">Only {product.inventory.available} left!</span>
                        ) : (
                          <span className="text-green-600 text-sm">In Stock</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                      <p className="text-gray-700 mb-4 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Stock: {product.inventory?.available || 0}</span>
                          {product.rating && (
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                              <span>{product.rating.average?.toFixed(1) || 0}</span>
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => handleProductClick(product._id)}
                          className="btn-primary text-sm px-4 py-2"
                          aria-label={`View details for ${product.name}`}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="aspect-w-1 aspect-h-1 relative">
                      <LazyImage
                        src={product.images?.[0]?.url || config.images.fallback}
                        alt={product.name}
                        className="w-full h-48 rounded-t-lg"
                      />
                      {/* Product Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.isFeatured && <ProductBadge type="featured" />}
                        {product.discount && product.discount > 0 && <ProductBadge type="sale" />}
                        {product.stats?.orders && product.stats.orders > 50 && <ProductBadge type="bestseller" />}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                      <p className="text-gray-700 mb-3 line-clamp-2 text-sm">{product.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-primary-600">₹{product.price}</span>
                        {product.rating && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm">{product.rating.average?.toFixed(1) || 0}</span>
                          </div>
                        )}
                      </div>
                      {/* Stock Status */}
                      <div className="mb-3">
                        {product.inventory?.available === 0 ? (
                          <span className="text-red-500 text-sm font-medium">Out of Stock</span>
                        ) : product.inventory?.available && product.inventory.available <= 5 ? (
                          <span className="text-orange-500 text-sm font-medium">Only {product.inventory.available} left!</span>
                        ) : (
                          <span className="text-green-600 text-sm">In Stock</span>
                        )}
                      </div>
                      <button 
                        onClick={() => handleProductClick(product._id)}
                        className="btn-primary w-full text-sm py-2"
                        aria-label={`View details for ${product.name}`}
                      >
                        View Details
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorMessage
            title="Failed to load products"
            message="We couldn't load the products. Please check your connection and try again."
            onRetry={() => refetch()}
            className="py-12"
          />
        ) : (
          <EmptyState
            type="search"
            title={t('products.noProductsFound')}
            description="Try adjusting your search terms or filters to find what you're looking for."
            action={{
              label: t('products.clearFilters'),
              onClick: clearFilters
            }}
            className="py-12"
          />
        )}

        {/* Pagination */}
        {productsData?.pagination && productsData.pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(productsData.pagination.current - 1)}
                disabled={productsData.pagination.current === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                {t('products.previous')}
              </button>
              {/* Smart pagination - show only relevant page numbers */}
              {(() => {
                const current = productsData.pagination.current;
                const totalPages = productsData.pagination.pages;
                const pages = [];
                
                // Always show first page
                if (current > 3) {
                  pages.push(1);
                  if (current > 4) pages.push('...');
                }
                
                // Show pages around current page
                const start = Math.max(1, current - 2);
                const end = Math.min(totalPages, current + 2);
                
                for (let i = start; i <= end; i++) {
                  pages.push(i);
                }
                
                // Always show last page
                if (current < totalPages - 2) {
                  if (current < totalPages - 3) pages.push('...');
                  pages.push(totalPages);
                }
                
                return pages.map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        productsData.pagination.current === page
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ));
              })()}
              <button
                onClick={() => handlePageChange(productsData.pagination.current + 1)}
                disabled={productsData.pagination.current === productsData.pagination.pages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                {t('products.next')}
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
