import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../../types';
import WishlistButton from '../WishlistButton';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import LazyImage from '../LazyImage';

export interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact';
  showRating?: boolean;
  showStats?: boolean;
  showWishlist?: boolean;
  showQuickView?: boolean;
  className?: string;
  onAddToCart?: (product: Product) => void;
}

/**
 * Unified ProductCard Component
 * Premium design with consistent styling across all sections
 */
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'default',
  showRating = true,
  showStats = false,
  showWishlist = true,
  showQuickView = true,
  className = '',
  onAddToCart
}) => {
  const { addItem } = useCart();
  const { user } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
      variant: product.variants && product.variants.length > 0
        ? { [product.variants[0].name]: product.variants[0].options[0] }
        : undefined,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleNotifyMe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success('We\'ll notify you when this item is back in stock!');
  };

  const isAvailable = (product.inventory?.available ?? 0) > 0;

  // Badge configuration
  const getBadge = () => {
    if (!isAvailable) {
      return { text: 'Sold Out', bg: 'bg-gray-800', textColor: 'text-white' };
    }
    if (product.isFeatured) {
      return { text: 'Featured', bg: 'bg-brand-gold', textColor: 'text-brand-ink' };
    }
    if (product.tags?.includes('Bestseller')) {
      return { text: 'Bestseller', bg: 'bg-emerald-500', textColor: 'text-white' };
    }
    if (product.discount && product.discount > 0) {
      return { text: `-${product.discount}%`, bg: 'bg-rose-500', textColor: 'text-white' };
    }
    return null;
  };

  const badge = getBadge();

  return (
    <div
      className={`group relative bg-white rounded-xl overflow-hidden transition-all duration-500 
        hover:shadow-2xl hover:-translate-y-2 
        ${variant === 'compact' ? 'shadow-sm' : 'shadow-lg'}
        ${className}`}
    >
      {/* Image Container */}
      <Link to={`/products/${product._id}`} className="block relative overflow-hidden">
        <div className={`relative ${variant === 'compact' ? 'aspect-square' : 'aspect-[4/5]'}`}>
          <LazyImage
            src={product.images[0]?.url || 'https://placehold.co/600x750/EAE5DE/3A2E24?text=Product'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Badge */}
        {badge && (
          <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide ${badge.bg} ${badge.textColor} shadow-lg`}>
            {badge.text}
          </div>
        )}

        {/* Quick Action Buttons - Appear on Hover */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
          {showWishlist && (
            <WishlistButton
              productId={product._id}
              className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-brand-clay hover:text-white transition-all duration-300"
            />
          )}
          {showQuickView && (
            <Link
              to={`/products/${product._id}`}
              className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-brand-clay hover:text-white transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <Eye className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Add to Cart Button - Appears at Bottom on Hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          {isAvailable ? (
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/95 backdrop-blur-sm text-brand-ink font-semibold rounded-lg hover:bg-brand-clay hover:text-white transition-all duration-300 shadow-lg"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          ) : (
            <button
              onClick={handleNotifyMe}
              className="w-full py-3 px-4 bg-brand-gold/95 backdrop-blur-sm text-brand-ink font-semibold rounded-lg hover:bg-brand-clay hover:text-white transition-all duration-300 shadow-lg"
            >
              Notify Me
            </button>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5">
        {/* Category */}
        <p className="text-xs font-medium text-brand-clay uppercase tracking-widest mb-2">
          {product.category}
        </p>

        {/* Product Name */}
        <h3 className="font-serif text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-brand-clay transition-colors">
          <Link to={`/products/${product._id}`}>
            {product.name}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        {showRating && product.rating && product.rating.count > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.round(product.rating!.average)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-200'
                    }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.rating.count})
            </span>
          </div>
        )}

        {/* Stats - Optional */}
        {showStats && product.stats && (
          <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
            <span>{product.stats.views || 0} views</span>
            <span>•</span>
            <span>{product.stats.orders || 0} sold</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">
            ₹{product.price.toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-400 line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {!isAvailable && (
          <p className="text-xs text-rose-500 font-medium mt-2">Out of Stock</p>
        )}
        {isAvailable && product.inventory?.available && product.inventory.available <= 5 && (
          <p className="text-xs text-amber-600 font-medium mt-2">
            Only {product.inventory.available} left!
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
