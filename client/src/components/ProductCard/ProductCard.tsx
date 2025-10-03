import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../../types';
import WishlistButton from '../WishlistButton';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import LazyImage from '../LazyImage';

export interface ProductCardProps {
  product: Product;
  variant?: 'featured' | 'trending' | 'related' | 'compact';
  showRating?: boolean;
  showStats?: boolean;
  showWishlist?: boolean;
  showQuickView?: boolean;
  className?: string;
  onAddToCart?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'compact',
  showRating = true,
  showStats = false,
  showWishlist = true,
  showQuickView = true,
  className = '',
  onAddToCart
}) => {
  const { addItem } = useCart();
  const { user } = useAuth();

  const handleAddToCart = (product: Product) => {
    if (onAddToCart) {
      onAddToCart(product);
      return;
    }

    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    addItem({
      productId: product._id,
      quantity: 1,
      price: product.price,
      variant: product.variants && product.variants.length > 0 ? { [product.variants[0].name]: product.variants[0].options[0] } : undefined,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleNotifyMe = () => {
    toast.success('We\'ll notify you when this item is back in stock!');
  };

  const isAvailable = (product.inventory?.available ?? 0) > 0;

  // Badge configuration based on variant
  const getBadgeConfig = () => {
    if (variant === 'trending' && product.tags?.includes('Trending')) {
      return { text: 'Trending', className: 'bg-red-500 text-white' };
    }
    if (product.tags?.includes('Sold Out') || !isAvailable) {
      return { text: 'Sold Out', className: 'bg-gray-700 text-white' };
    }
    if (product.tags?.includes('Bestseller')) {
      return { text: 'Bestseller', className: 'bg-green-500 text-white' };
    }
    if (product.discount) {
      return { text: `-${product.discount}%`, className: 'bg-red-500 text-white' };
    }
    return null;
  };

  const badgeConfig = getBadgeConfig();

  // Card styling based on variant
  const getCardClasses = () => {
    const baseClasses = 'bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg group';
    
    switch (variant) {
      case 'featured':
        return `${baseClasses} hover:-translate-y-1 focus-within:ring-2 focus-within:ring-brand-gold focus-within:ring-offset-4 focus-within:ring-offset-brand-base shadow-lg`;
      case 'trending':
        return `${baseClasses} hover:shadow-md shadow-sm`;
      case 'related':
        return `${baseClasses} hover:shadow-md shadow-sm`;
      case 'compact':
        return `${baseClasses} hover:shadow-md shadow-sm`;
      default:
        return baseClasses;
    }
  };

  // Image height based on variant
  const getImageHeight = () => {
    switch (variant) {
      case 'featured':
        return 'h-80';
      case 'trending':
      case 'related':
      case 'compact':
        return 'h-48';
      default:
        return 'h-48';
    }
  };

  // Button styling based on variant
  const getButtonClasses = () => {
    const baseClasses = 'flex-1 text-center py-2 px-3 rounded font-medium transition-colors duration-200';
    
    switch (variant) {
      case 'featured':
        return `${baseClasses} bg-brand-stone text-brand-ink hover:bg-brand-clay hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2`;
      default:
        return `${baseClasses} bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`;
    }
  };

  return (
    <div className={`${getCardClasses()} ${className}`}>
      {/* Product Image */}
      <div className="overflow-hidden relative">
        <Link to={`/products/${product._id}`}>
          <LazyImage
            src={product.images[0]?.url || 'https://placehold.co/600x800/EAE5DE/3A2E24?text=Image'}
            alt={product.name}
            className={`w-full ${getImageHeight()} object-cover transition-transform duration-500 group-hover:scale-105`}
          />
        </Link>
        
        {/* Badge */}
        {badgeConfig && (
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-medium ${badgeConfig.className}`}>
            {badgeConfig.text}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        {/* Product Name and Category */}
        <div className="mb-2">
          <h3 className="font-serif text-lg mb-1 text-gray-900">
            <Link 
              to={`/products/${product._id}`} 
              className="hover:text-primary-600 transition-colors line-clamp-1"
            >
              {product.name}
            </Link>
          </h3>
          <p className="text-sm text-gray-600 mb-1">{product.category}</p>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        {showRating && product.rating && (
          <div className="flex items-center mb-3">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(product.rating!.average) ? 'fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              {product.rating.average.toFixed(1)} ({product.rating.count})
            </span>
          </div>
        )}

        {/* Stats (for trending products) */}
        {showStats && variant === 'trending' && product.stats && (
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span>{product.stats.views || 0} views</span>
            <span>{product.stats.orders || 0} orders</span>
          </div>
        )}

        {/* Price */}
        <div className="mb-4">
          <span className="text-xl font-bold text-primary-600">
            ₹{product.price.toLocaleString()}
          </span>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          {/* Add to Cart / Notify Me Button */}
          {isAvailable ? (
            <button
              onClick={() => handleAddToCart(product)}
              className={getButtonClasses()}
            >
              <ShoppingCart className="w-4 h-4 mr-2 inline" />
              {variant === 'featured' ? 'Add to Cart' : 'Add'}
            </button>
          ) : (
            <button
              onClick={handleNotifyMe}
              className={`${getButtonClasses()} bg-brand-gold text-brand-ink hover:bg-brand-clay-dark hover:text-white`}
            >
              Notify Me
            </button>
          )}

          {/* Wishlist Button */}
          {showWishlist && (
            <WishlistButton 
              productId={product._id}
              className={`p-2 border border-gray-300 rounded hover:border-primary-600 hover:text-primary-600 transition-colors duration-200 ${
                variant === 'featured' ? 'hover:border-brand-clay hover:text-brand-clay' : ''
              }`}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default ProductCard;
