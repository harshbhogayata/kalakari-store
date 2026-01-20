import React from 'react';
import { Eye } from 'lucide-react';
import { useQuery } from 'react-query';
import { Product } from '../../types';
import { ProductCard } from '../ProductCard';
import api from '../../utils/api';

interface RecentlyViewedProps {
  currentProductId?: string;
  limit?: number;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  currentProductId,
  limit = 4
}) => {

  // Fetch real recently viewed products from API
  const { data: recentlyViewedProducts = [] } = useQuery(
    ['recently-viewed', currentProductId, limit],
    async () => {
      try {
        const params = new URLSearchParams({
          limit: limit.toString(),
          sort: 'updatedAt',
          order: 'desc'
        });

        if (currentProductId) {
          params.append('exclude', currentProductId);
        }

        const response = await api.get(`/api/products?${params}`);
        return response.data.data?.products || [];
      } catch (error) {
        console.error('Failed to fetch recently viewed products:', error);
        return [];
      }
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Custom handler for add to cart
  const handleAddToCart = (product: Product) => {
    // This will be handled by the ProductCard component
  };

  if (recentlyViewedProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-4">
        <Eye className="w-6 h-6 text-primary-600 mr-2" />
        <h3 className="text-xl font-semibold text-gray-900">Recently Viewed</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recentlyViewedProducts.map((product: Product) => (
          <ProductCard
            key={product._id}
            product={product}
            variant="compact"
            showRating={true}
            showStats={true}
            showWishlist={true}
            showQuickView={true}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;