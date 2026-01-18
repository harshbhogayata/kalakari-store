import React from 'react';

interface ProductCardSkeletonProps {
  className?: string;
}

const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-xl overflow-hidden shadow-lg animate-pulse ${className}`}>
      {/* Image skeleton - matches aspect-[4/5] */}
      <div className="aspect-[4/5] bg-gradient-to-br from-gray-200 to-gray-100" />

      {/* Content skeleton */}
      <div className="p-5">
        {/* Category skeleton */}
        <div className="h-3 bg-gray-200 rounded w-16 mb-3" />

        {/* Title skeleton */}
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />

        {/* Description skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>

        {/* Rating skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-3.5 h-3.5 bg-gray-200 rounded-sm" />
            ))}
          </div>
          <div className="h-3 bg-gray-200 rounded w-8" />
        </div>

        {/* Price skeleton */}
        <div className="h-6 bg-gray-200 rounded w-24" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
