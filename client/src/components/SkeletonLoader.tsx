import React from 'react';

interface SkeletonLoaderProps {
  type?: 'text' | 'image' | 'card' | 'product-card' | 'list';
  lines?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'text', 
  lines = 1, 
  className = '' 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'image':
        return (
          <div className={`bg-gray-200 animate-pulse rounded ${className}`}>
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
            </div>
          </div>
        );

      case 'card':
        return (
          <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
            <div className="space-y-3">
              <div className="bg-gray-200 animate-pulse rounded h-32 w-full"></div>
              <div className="space-y-2">
                <div className="bg-gray-200 animate-pulse rounded h-4 w-3/4"></div>
                <div className="bg-gray-200 animate-pulse rounded h-4 w-1/2"></div>
                <div className="bg-gray-200 animate-pulse rounded h-4 w-2/3"></div>
              </div>
            </div>
          </div>
        );

      case 'product-card':
        return (
          <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
            <div className="space-y-4">
              <div className="bg-gray-200 animate-pulse rounded h-48 w-full"></div>
              <div className="p-4 space-y-3">
                <div className="space-y-2">
                  <div className="bg-gray-200 animate-pulse rounded h-4 w-full"></div>
                  <div className="bg-gray-200 animate-pulse rounded h-3 w-3/4"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="bg-gray-200 animate-pulse rounded h-5 w-20"></div>
                  <div className="bg-gray-200 animate-pulse rounded h-4 w-16"></div>
                </div>
                <div className="bg-gray-200 animate-pulse rounded h-8 w-full"></div>
              </div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className={`space-y-3 ${className}`}>
            {Array.from({ length: lines }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="bg-gray-200 animate-pulse rounded h-10 w-10"></div>
                <div className="flex-1 space-y-2">
                  <div className="bg-gray-200 animate-pulse rounded h-4 w-3/4"></div>
                  <div className="bg-gray-200 animate-pulse rounded h-3 w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'text':
      default:
        return (
          <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, index) => (
              <div
                key={index}
                className={`bg-gray-200 animate-pulse rounded h-4 ${
                  index === lines - 1 ? 'w-3/4' : 'w-full'
                }`}
              ></div>
            ))}
          </div>
        );
    }
  };

  return renderSkeleton();
};

export default SkeletonLoader;
