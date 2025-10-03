import React from 'react';

interface ProductCardSkeletonProps {
  variant?: 'featured' | 'trending' | 'related' | 'compact';
  className?: string;
}

const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({
  variant = 'compact',
  className = ''
}) => {
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

  return (
    <div className={`bg-white rounded-lg overflow-hidden shadow-lg animate-pulse ${className}`}>
      {/* Image skeleton */}
      <div className={`w-full ${getImageHeight()} bg-gray-200`}></div>
      
      {/* Content skeleton */}
      <div className="p-6">
        {/* Title skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        
        {/* Rating skeleton */}
        <div className="flex items-center mb-3">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="ml-2 h-4 bg-gray-200 rounded w-16"></div>
        </div>
        
        {/* Price skeleton */}
        <div className="h-6 bg-gray-200 rounded w-20 mb-4"></div>
        
        {/* Button skeleton */}
        <div className="flex space-x-2">
          <div className="flex-1 h-10 bg-gray-200 rounded"></div>
          <div className="w-10 h-10 bg-gray-200 rounded"></div>
          <div className="w-10 h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
