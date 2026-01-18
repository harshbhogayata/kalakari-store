import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { useQuery } from 'react-query';
import { Product } from '../../types';
import { ProductCard, ProductCardSkeleton } from '../ProductCard';
import api from '../../utils/api';

interface TrendingProductsProps {
  state?: string;
  limit?: number;
}

const TrendingProducts: React.FC<TrendingProductsProps> = ({
  state,
  limit = 8
}) => {

  // Fetch real trending products from API
  const { data: trendingProducts = [], isLoading } = useQuery(
    ['trending-products', state, limit],
    async () => {
      try {
        const params = new URLSearchParams({
          featured: 'true',
          limit: limit.toString(),
          sort: 'stats.views',
          order: 'desc'
        });

        if (state) {
          params.append('state', state);
        }

        const response = await api.get(`/api/products?${params}`);
        return response.data.data?.products || [];
      } catch (error) {
        console.error('Failed to fetch trending products:', error);
        return [];
      }
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-rose-600" />
              </div>
              <span className="text-rose-600 font-medium tracking-wide text-sm uppercase">
                Hot Right Now
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900">
              {state ? `Trending in ${state}` : 'Trending This Week'}
            </h2>
          </div>
          <Link
            to="/products?sort=views&order=desc"
            className="hidden md:inline-flex items-center gap-2 text-brand-clay font-medium hover:gap-4 transition-all duration-300 mt-4 md:mt-0"
          >
            View All Trending
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))
          ) : trendingProducts.length > 0 ? (
            trendingProducts.slice(0, 8).map((product: Product) => (
              <ProductCard
                key={product._id}
                product={product}
                variant="compact"
                showRating={true}
                showStats={true}
                showWishlist={true}
                showQuickView={true}
              />
            ))
          ) : (
            // Placeholder when no products
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No trending products at the moment</p>
            </div>
          )}
        </div>

        {/* Mobile View All Link */}
        <div className="text-center mt-10 md:hidden">
          <Link
            to="/products?sort=views&order=desc"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-brand-clay text-brand-clay font-medium rounded-full hover:bg-brand-clay hover:text-white transition-all duration-300"
          >
            View All Trending
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;
