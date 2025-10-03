import React from 'react';
import { Package, Search, Heart, ShoppingCart } from 'lucide-react';

interface EmptyStateProps {
  type?: 'products' | 'search' | 'wishlist' | 'cart' | 'orders';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'products',
  title,
  description,
  action,
  className = ''
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: <Search className="w-16 h-16 text-gray-300" />,
          title: 'No results found',
          description: 'Try adjusting your search terms or filters to find what you\'re looking for.'
        };
      case 'wishlist':
        return {
          icon: <Heart className="w-16 h-16 text-gray-300" />,
          title: 'Your wishlist is empty',
          description: 'Start adding products you love to your wishlist!'
        };
      case 'cart':
        return {
          icon: <ShoppingCart className="w-16 h-16 text-gray-300" />,
          title: 'Your cart is empty',
          description: 'Add some products to your cart to get started.'
        };
      case 'orders':
        return {
          icon: <Package className="w-16 h-16 text-gray-300" />,
          title: 'No orders yet',
          description: 'Your order history will appear here once you make your first purchase.'
        };
      case 'products':
      default:
        return {
          icon: <Package className="w-16 h-16 text-gray-300" />,
          title: 'No products found',
          description: 'There are no products available at the moment.'
        };
    }
  };

  const defaultContent = getDefaultContent();

  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="mb-6">
        {defaultContent.icon}
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title || defaultContent.title}
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md">
        {description || defaultContent.description}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
