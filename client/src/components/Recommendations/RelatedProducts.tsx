import React from 'react';
import { Heart } from 'lucide-react';
import { useQuery } from 'react-query';
import { Product } from '../../types';
import { ProductCard } from '../ProductCard';
import api from '../../utils/api';

interface RelatedProductsProps {
  productId: string;
  category: string;
  state?: string;
  materials?: string[];
  limit?: number;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({
  productId,
  category,
  state,
  materials,
  limit = 4
}) => {

  // Fetch real related products from API
  const { data: relatedProducts = [] } = useQuery(
    ['related-products', productId, category, state, materials, limit],
    async () => {
      try {
        const params = new URLSearchParams({
          limit: limit.toString(),
          exclude: productId
        });

        if (category) {
          params.append('category', category);
        }

        if (state) {
          params.append('state', state);
        }

        const response = await api.get(`/api/products?${params}`);
        return response.data.data?.products || [];
      } catch (error) {
        console.error('Failed to fetch related products:', error);
        return [];
      }
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-4">
        <Heart className="w-6 h-6 text-primary-600 mr-2" />
        <h3 className="text-xl font-semibold text-gray-900">Related Products</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedProducts.map((product: Product) => (
          <ProductCard
            key={product._id}
            product={product}
            variant="compact"
            showRating={true}
            showStats={true}
            showWishlist={true}
            showQuickView={true}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;