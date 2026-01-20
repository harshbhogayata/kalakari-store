import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TrendingUp, Clock, Star, Filter } from 'lucide-react';
import AdvancedSearch from '../components/Search/AdvancedSearch';
import SearchResults from '../components/Search/SearchResults';
import { Product, SearchFilters } from '../types';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showQuickFilters, setShowQuickFilters] = useState(false);

  // Initialize filters from URL params
  const [, setFilters] = useState<SearchFilters>({
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
    sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: 12
  });

  // Simplified search state
  const [products] = useState<any[]>([]);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [total] = useState(0);
  const [page] = useState(1);
  const [totalPages] = useState(1);

  // Quick filter options
  const quickFilters = [
    { label: 'Under ₹1000', filters: { maxPrice: 1000 } },
    { label: '₹1000 - ₹5000', filters: { minPrice: 1000, maxPrice: 5000 } },
    { label: 'Above ₹5000', filters: { minPrice: 5000 } },
    { label: '4+ Stars', filters: { minRating: 4 } },
    { label: 'In Stock', filters: { inStock: true } },
    { label: 'Pottery', filters: { category: 'Pottery' } },
    { label: 'Textiles', filters: { category: 'Textiles' } },
    { label: 'Jewelry', filters: { category: 'Jewelry' } }
  ];

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page on new search
    }));
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
      sortOrder: 'desc',
      page: 1,
      limit: 12
    };
    setFilters(clearedFilters);
  };

  const handleQuickFilter = (quickFilter: any) => {
    setFilters(prev => ({
      ...prev,
      ...quickFilter.filters,
      page: 1
    }));
  };

  const handleProductClick = (product: Product) => {
    navigate(`/products/${product._id}`);
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // const analytics = getSearchAnalytics();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Search Error</h2>
            <p className="text-gray-600 mb-6">
              We encountered an error while searching. Please try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Products</h1>
          <p className="text-gray-600">
            Find the perfect handmade products from our talented artisans
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Quick Filters</h3>
                <button
                  onClick={() => setShowQuickFilters(!showQuickFilters)}
                  className="text-primary-600 hover:text-primary-700"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              {showQuickFilters && (
                <div className="space-y-2">
                  {quickFilters.map((filter, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickFilter(filter)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search History */}
            {false && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Recent Searches
                  </h3>
                  <button
                    onClick={() => { }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-500 text-sm">No recent searches</p>
                </div>
              </div>
            )}

            {/* Trending Searches */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                <TrendingUp className="w-5 h-5 mr-2" />
                Trending
              </h3>

              <div className="space-y-2">
                <p className="text-gray-500 text-sm">No trending searches</p>
              </div>
            </div>

            {/* Popular Categories */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                <Star className="w-5 h-5 mr-2" />
                Popular Categories
              </h3>

              <div className="space-y-2">
                <p className="text-gray-500 text-sm">No popular categories</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Advanced Search */}
            <AdvancedSearch
              onSearch={handleSearch}
              onClear={handleClear}
              isLoading={isLoading}
              totalResults={total}
            />

            {/* Search Results */}
            <SearchResults
              products={products}
              isLoading={isLoading}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onProductClick={handleProductClick}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    const isCurrentPage = pageNum === page;
                    const showPage = pageNum === 1 || pageNum === totalPages ||
                      (pageNum >= page - 2 && pageNum <= page + 2);

                    if (!showPage) {
                      if (pageNum === page - 3 || pageNum === page + 3) {
                        return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                      }
                      return null;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 border rounded-md text-sm font-medium ${isCurrentPage
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
