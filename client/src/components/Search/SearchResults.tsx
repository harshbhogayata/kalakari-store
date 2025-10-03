import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Eye, Filter, Grid, List } from 'lucide-react';
import { Product } from '../../types';
import WishlistButton from '../WishlistButton';

interface SearchResultsProps {
  products: Product[];
  isLoading: boolean;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onProductClick: (product: Product) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  products,
  isLoading,
  viewMode,
  onViewModeChange,
  onProductClick
}) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="flex space-x-4">
              <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600 mb-6">
          Try adjusting your search criteria or browse our categories
        </p>
        <Link
          to="/products"
          className="btn-primary"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="relative">
        <Link to={`/products/${product._id}`}>
          <img
            src={product.images[0]?.url || 'https://via.placeholder.com/300x200'}
            alt={product.images[0]?.alt || product.name}
            className="w-full h-48 object-cover"
          />
        </Link>
        
        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex flex-col space-y-2">
          <WishlistButton
            productId={product._id}
            className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
          />
          <button
            onClick={() => onProductClick(product)}
            className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Stock Badge */}
        {product.inventory.available === 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
            Out of Stock
          </div>
        )}
        {product.inventory.available > 0 && product.inventory.available < 5 && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
            Only {product.inventory.available} left
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2">
          <Link
            to={`/products/${product._id}`}
            className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
          >
            {product.name}
          </Link>
        </div>

        <div className="mb-2">
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(product.rating?.average || 0) ? 'fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            ({product.rating?.count || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                <span className="text-sm font-medium text-green-600">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            className="flex-1 btn-outline flex items-center justify-center py-2"
            disabled={product.inventory.available === 0}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </button>
        </div>

        {/* Product Stats */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{product.category}</span>
            <span>{product.stats?.views || 0} views</span>
          </div>
        </div>
      </div>
    </div>
  );

  const ListItem: React.FC<{ product: Product }> = ({ product }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex space-x-4">
        <div className="relative">
          <Link to={`/products/${product._id}`}>
            <img
              src={product.images[0]?.url || 'https://via.placeholder.com/150x150'}
              alt={product.images[0]?.alt || product.name}
              className="w-24 h-24 object-cover rounded-lg"
            />
          </Link>
          
          {/* Stock Badge */}
          {product.inventory.available === 0 && (
            <div className="absolute top-1 left-1 bg-red-500 text-white px-1 py-0.5 rounded text-xs">
              Out of Stock
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link
                to={`/products/${product._id}`}
                className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
              >
                {product.name}
              </Link>
              
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {product.description}
              </p>

              {/* Rating */}
              <div className="flex items-center space-x-1 mt-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(product.rating?.average || 0) ? 'fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({product.rating?.count || 0})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                    <span className="text-sm font-medium text-green-600">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end space-y-2">
              <div className="flex space-x-2">
                <WishlistButton
                  productId={product._id}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                />
                <button
                  onClick={() => onProductClick(product)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              <button
                className="btn-primary px-4 py-2 text-sm"
                disabled={product.inventory.available === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </button>
            </div>
          </div>

          {/* Product Stats */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{product.category}</span>
              <span>{product.stats?.views || 0} views</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">View:</span>
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          Showing {products.length} products
        </div>
      </div>

      {/* Results */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {products.map(product => (
            <ListItem key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
