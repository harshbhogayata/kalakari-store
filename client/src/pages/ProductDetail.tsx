import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Star, Share2, ShoppingCart, Truck, Shield, RotateCcw, ChevronRight, Home, ZoomIn, X } from 'lucide-react';
import axios from 'axios';
// import api from '../utils/api'; // TODO: Use for API calls when needed
// import config from '../config/env';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ReviewsSection from '../components/Reviews/ReviewsSection';
import WishlistButton from '../components/WishlistButton';
import ProductRecommendations from '../components/Recommendations/ProductRecommendations';
import RelatedProducts from '../components/Recommendations/RelatedProducts';
import RecentlyViewed from '../components/Recommendations/RecentlyViewed';
import LazyImage from '../components/LazyImage';
import useRecommendations from '../hooks/useRecommendations';
import toast from 'react-hot-toast';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { addToRecentlyViewed } = useRecommendations();
  const [selectedVariant, setSelectedVariant] = useState<{ [key: string]: string }>({});
  const [quantity, setQuantity] = useState(1);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [selectedAvailability, setSelectedAvailability] = useState<number>(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews' | 'shipping'>('description');
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const { data: productData, isLoading, error } = useQuery(
    ['product', id],
    async () => {
      // Use mock endpoint in development mode
      const endpoint = process.env.NODE_ENV === 'development' ? '/api/dev/products' : '/products';
      const response = await axios.get(`${endpoint}/${id}`);
      return response.data.data.product || response.data.data;
    },
    { 
      enabled: !!id,
      retry: 2,
      retryDelay: 1000
    }
  );

  const product: Product = productData;

  // Add to recently viewed when product loads
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
      setSelectedPrice(product.price);
      setSelectedAvailability(product.inventory.available);
    }
  }, [product, addToRecentlyViewed]);

  // Update price and availability when variants change
  useEffect(() => {
    if (product && product.variants) {
      // Find matching variant
      const matchingVariant = product.variants.find(variant => 
        variant.options.every(option => selectedVariant[variant.name] === option)
      );
      
      if (matchingVariant) {
        setSelectedPrice(matchingVariant.price || product.price);
        setSelectedAvailability(matchingVariant.inventory?.available || product.inventory.available);
      } else {
        setSelectedPrice(product.price);
        setSelectedAvailability(product.inventory.available);
      }
    }
  }, [selectedVariant, product]);

  // Reviews will be handled by ReviewsSection component

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (product.inventory.available < quantity) {
      toast.error('Insufficient stock');
      return;
    }

    addItem({
      productId: product._id,
      quantity,
      price: product.price,
      cartVariant: selectedVariant
    });

    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error('Please login to purchase');
      navigate('/login');
      return;
    }

    handleAddToCart();
    navigate('/checkout');
  };

  // Review handling is now done by ReviewsSection component

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Image skeleton */}
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
                  ))}
                </div>
              </div>
              
              {/* Content skeleton */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-4/6"></div>
                  </div>
                </div>
                
                <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3"></div>
                
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-1/4"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 w-8 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-8 w-12 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="h-12 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-12 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Product</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We encountered an error while loading the product. Please try again or contact support if the problem persists.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/products')}
                className="btn-outline"
              >
                Browse Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-4xl">❌</span>
            </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Sorry, we couldn't find the product you're looking for. It may have been removed or the link might be incorrect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
                Browse Products
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn-outline"
              >
                Go Home
          </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 overflow-x-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-1 hover:text-primary-600 transition-colors whitespace-nowrap"
          >
            <Home className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Home</span>
          </button>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <button
            onClick={() => navigate('/products')}
            className="hover:text-primary-600 transition-colors whitespace-nowrap"
          >
            Products
          </button>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <button
            onClick={() => navigate(`/products?category=${product.category}`)}
            className="hover:text-primary-600 transition-colors whitespace-nowrap"
          >
            {product.category}
          </button>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="text-gray-900 font-medium truncate max-w-32 sm:max-w-xs">
            {product.name}
          </span>
        </nav>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 p-4 sm:p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group cursor-pointer" onClick={() => setIsImageZoomed(true)}>
                {product.images && product.images.length > 0 && product.images[selectedImageIndex] ? (
                  <>
                  <LazyImage
                    src={product.images[selectedImageIndex].url}
                    alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-2xl">📷</span>
                      </div>
                      <p className="text-sm">No images available</p>
                    </div>
                  </div>
                )}
              </div>
              
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden transition-all duration-200 ${
                        selectedImageIndex === index ? 'ring-2 ring-primary-600 ring-offset-2' : 'hover:ring-2 hover:ring-gray-300'
                      }`}
                    >
                      <LazyImage
                        src={image.url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                    <span className="text-xs sm:text-sm text-gray-600">
                      {product.rating?.average ? product.rating.average.toFixed(1) : '0.0'} 
                      ({product.rating?.count || 0} reviews)
                    </span>
                  </div>
                  <span className="hidden sm:inline text-sm text-gray-500">•</span>
                  <span className="text-xs sm:text-sm text-gray-600">{product.stats?.views || 0} views</span>
                </div>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Price */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span className="text-2xl sm:text-3xl font-bold text-primary-600">₹{selectedPrice.toLocaleString()}</span>
                {product.originalPrice && selectedPrice < product.originalPrice && (
                  <span className="text-lg sm:text-xl text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                )}
                {selectedPrice !== product.price && (
                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs sm:text-sm font-medium">
                    {selectedPrice > product.price ? '+' : ''}₹{(selectedPrice - product.price).toLocaleString()}
                  </span>
                )}
                {product.discount && selectedPrice === product.price && (
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs sm:text-sm font-medium">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-4">
                  {product.variants.map((variant, index) => (
                    <div key={index}>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">{variant.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {variant.options.map((option) => {
                          const isSelected = selectedVariant[variant.name] === option;
                          const optionPrice = variant.price || product.price;
                          const priceDiff = optionPrice - product.price;
                          
                          return (
                          <button
                            key={option}
                            onClick={() => setSelectedVariant({ ...selectedVariant, [variant.name]: option })}
                              className={`px-3 py-2 border rounded-lg text-sm transition-all duration-200 ${
                                isSelected
                                ? 'border-primary-600 bg-primary-50 text-primary-600'
                                  : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex flex-col items-center">
                                <span>{option}</span>
                                {priceDiff !== 0 && (
                                  <span className={`text-xs ${isSelected ? 'text-primary-500' : 'text-gray-500'}`}>
                                    {priceDiff > 0 ? '+' : ''}₹{priceDiff.toLocaleString()}
                                  </span>
                                )}
                              </div>
                          </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Quantity</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedAvailability, quantity + 1))}
                    className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500">
                    {selectedAvailability} available
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 btn-primary flex items-center justify-center py-3 sm:py-2"
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="text-sm sm:text-base">Add to Cart</span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                  >
                    <span className="text-sm sm:text-base">Buy Now</span>
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <WishlistButton 
                    productId={product._id} 
                    showText={true}
                    className="flex-1 btn-outline flex items-center justify-center py-3 sm:py-2"
                  />
                  <button 
                    onClick={() => {
                      const shareData = {
                        title: `${product.name} - Kalakari`,
                        text: `Check out this beautiful ${product.category.toLowerCase()} from Kalakari: ${product.description.substring(0, 100)}...`,
                        url: window.location.href,
                      };

                      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                        navigator.share(shareData).catch((error) => {
                            // Share error handled silently
                          fallbackShare();
                        });
                      } else {
                        fallbackShare();
                      }

                      function fallbackShare() {
                        const shareText = `Check out "${product.name}" from Kalakari!\n\n${product.description.substring(0, 150)}...\n\n${window.location.href}`;
                        
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                          navigator.clipboard.writeText(shareText).then(() => {
                            toast.success('Product details copied to clipboard!');
                          }).catch(() => {
                            showShareModal();
                          });
                        } else {
                          showShareModal();
                        }
                      }

                      function showShareModal() {
                        // Create a simple modal for sharing options
                        const modal = document.createElement('div');
                        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                        modal.innerHTML = `
                          <div class="bg-white rounded-lg p-6 max-w-md mx-4">
                            <h3 class="text-lg font-semibold mb-4">Share Product</h3>
                            <p class="text-gray-600 mb-4">Copy the link below to share:</p>
                            <div class="flex items-center space-x-2 mb-4">
                              <input type="text" value="${window.location.href}" readonly class="flex-1 px-3 py-2 border border-gray-300 rounded text-sm" />
                              <button onclick="navigator.clipboard.writeText('${window.location.href}'); this.textContent='Copied!'; setTimeout(() => this.textContent='Copy', 2000)" class="px-4 py-2 bg-primary-600 text-white rounded text-sm hover:bg-primary-700">Copy</button>
                            </div>
                            <div class="flex justify-end space-x-2">
                              <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 text-gray-600 hover:text-gray-800">Close</button>
                            </div>
                          </div>
                        `;
                        document.body.appendChild(modal);
                        
                        // Close modal when clicking outside
                        modal.addEventListener('click', (e) => {
                          if (e.target === modal) {
                            modal.remove();
                          }
                        });
                      }
                    }}
                    className="flex-1 btn-outline flex items-center justify-center py-3 sm:py-2"
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="text-sm sm:text-base">Share</span>
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-5 h-5 text-primary-600" />
                    <span className="text-sm text-gray-600">Free Shipping</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-primary-600" />
                    <span className="text-sm text-gray-600">Secure Payment</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RotateCcw className="w-5 h-5 text-primary-600" />
                    <span className="text-sm text-gray-600">Easy Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="border-t">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-8 pt-6">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'description'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('specifications')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'specifications'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'reviews'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Reviews
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'shipping'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Shipping
                </button>
              </nav>
            </div>

            <div className="p-8">
              {activeTab === 'description' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="text-gray-900">{product.category}</span>
                      </div>
                      {product.materials && product.materials.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Materials:</span>
                          <span className="text-gray-900">{product.materials.join(', ')}</span>
                        </div>
                      )}
                      {product.colors && product.colors.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Colors:</span>
                          <span className="text-gray-900">{product.colors.join(', ')}</span>
                        </div>
                      )}
                      {product.dimensions && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dimensions:</span>
                          <span className="text-gray-900">
                            {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{product.description}</p>
                  </div>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="space-y-8">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Product ID</div>
                        <div className="font-mono text-sm text-gray-900 break-all">{product._id}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Category</div>
                        <div className="text-gray-900 font-medium">{product.category}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Stock Available</div>
                        <div className="text-gray-900 font-medium">{product.inventory.available} units</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Total Stock</div>
                        <div className="text-gray-900 font-medium">{product.inventory.total} units</div>
                      </div>
                    </div>
                  </div>

                  {/* Materials & Colors */}
                  {((product.materials && product.materials.length > 0) || (product.colors && product.colors.length > 0)) && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Materials & Colors</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {product.materials && product.materials.length > 0 && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-2">Materials</div>
                            <div className="flex flex-wrap gap-2">
                              {product.materials.map((material, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                  {material}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {product.colors && product.colors.length > 0 && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-2">Available Colors</div>
                            <div className="flex flex-wrap gap-2">
                              {product.colors.map((color, index) => (
                                <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                  {color}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dimensions */}
                  {product.dimensions && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Dimensions</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <div className="text-sm text-gray-600 mb-1">Length</div>
                          <div className="text-lg font-semibold text-gray-900">{product.dimensions.length} {product.dimensions.unit}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <div className="text-sm text-gray-600 mb-1">Width</div>
                          <div className="text-lg font-semibold text-gray-900">{product.dimensions.width} {product.dimensions.unit}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <div className="text-sm text-gray-600 mb-1">Height</div>
                          <div className="text-lg font-semibold text-gray-900">{product.dimensions.height} {product.dimensions.unit}</div>
                        </div>
                        {product.dimensions.weight && (
                          <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <div className="text-sm text-gray-600 mb-1">Weight</div>
                            <div className="text-lg font-semibold text-gray-900">{product.dimensions.weight.toFixed(2)} kg</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Care Instructions */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Care Instructions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                          <span className="mr-2">👋</span>
                          Handling
                        </h4>
                        <p className="text-blue-800 text-sm">Handle with care. This handcrafted item is delicate and should be stored in a safe place.</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2 flex items-center">
                          <span className="mr-2">🧽</span>
                          Cleaning
                        </h4>
                        <p className="text-green-800 text-sm">Clean gently with a soft, dry cloth. Avoid harsh chemicals or abrasive materials.</p>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
                          <span className="mr-2">📦</span>
                          Storage
                        </h4>
                        <p className="text-yellow-800 text-sm">Store in a cool, dry place away from direct sunlight to preserve colors and materials.</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2 flex items-center">
                          <span className="mr-2">🛡️</span>
                          Warranty
                        </h4>
                        <p className="text-purple-800 text-sm">This product comes with a 1-year warranty against manufacturing defects.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <ReviewsSection productId={id || ''} />
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Truck className="w-5 h-5 text-primary-600 mt-1" />
                        <div>
                          <h4 className="font-medium text-gray-900">Free Shipping</h4>
                          <p className="text-gray-600">Free shipping on orders above ₹1000</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-primary-600 mt-1" />
                        <div>
                          <h4 className="font-medium text-gray-900">Secure Packaging</h4>
                          <p className="text-gray-600">All items are carefully packaged to ensure safe delivery</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <RotateCcw className="w-5 h-5 text-primary-600 mt-1" />
                        <div>
                          <h4 className="font-medium text-gray-900">Easy Returns</h4>
                          <p className="text-gray-600">30-day return policy for all products</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {product.shipping && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Shipping Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estimated Delivery:</span>
                          <span className="text-gray-900">{product.shipping.estimatedDays} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Weight:</span>
                          <span className="text-gray-900">{product.shipping.weight} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fragile:</span>
                          <span className="text-gray-900">{product.shipping.fragile ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Recommendations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductRecommendations
          productId={product._id}
          category={product.category}
          state={product.name.split(' ')[0]} // Extract state from product name
          limit={4}
        />
      </div>

      {/* Related Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RelatedProducts
          productId={product._id}
          category={product.category}
          state={product.name.split(' ')[0]}
          materials={product.materials}
          limit={6}
        />
      </div>

      {/* Recently Viewed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RecentlyViewed
          currentProductId={product._id}
          limit={4}
        />
      </div>

      {/* Image Zoom Modal */}
      {isImageZoomed && product.images && product.images.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setIsImageZoomed(false)}
              className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <div className="relative">
              <img
                src={product.images[selectedImageIndex].url}
                alt={product.name}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              
              {/* Image navigation arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => prev > 0 ? prev - 1 : product.images.length - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
                  >
                    <ChevronRight className="w-6 h-6 text-white rotate-180" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => prev < product.images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </>
              )}
            </div>
            
            {/* Image thumbnails */}
            {product.images.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImageIndex === index ? 'border-white' : 'border-transparent hover:border-white border-opacity-50'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} / {product.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
