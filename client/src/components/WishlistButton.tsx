import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';

interface WishlistButtonProps {
  productId: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  size = 'md',
  showText = true,
  className = ''
}) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const isWishlisted = isInWishlist(productId);

  const handleToggleWishlist = async () => {
    if (!user) {
      // Could redirect to login or show login modal
      return;
    }

    if (isWishlisted) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  return (
    <button
      onClick={handleToggleWishlist}
      className={`flex items-center space-x-2 transition-colors duration-200 ${
        isWishlisted
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-400 hover:text-red-500'
      } ${className}`}
      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={`${sizeClasses[size]} ${
          isWishlisted ? 'fill-current' : ''
        }`}
      />
      {showText && (
        <span className="text-sm font-medium">
          {isWishlisted ? 'Wishlisted' : 'Wishlist'}
        </span>
      )}
    </button>
  );
};

export default WishlistButton;
