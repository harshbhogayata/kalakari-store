import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../ProductCard';

interface TrendingProductsProps {
  state?: string;
  limit?: number;
}

const TrendingProducts: React.FC<TrendingProductsProps> = ({
  state,
  limit = 8
}) => {

  // Mock trending products based on state
  const getTrendingProducts = (): Product[] => {
    const trendingProducts: Product[] = [];
    
    const categories = ['Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalwork', 'Paintings', 'Bamboo', 'Leather', 'Stone', 'Glass'];
    const states = ['Rajasthan', 'Gujarat', 'West Bengal', 'Tamil Nadu', 'Kerala', 'Karnataka', 'Maharashtra', 'Uttar Pradesh', 'Bihar', 'Odisha'];
    
    // Generate trending products
    for (let i = 0; i < limit; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const productState = state || states[Math.floor(Math.random() * states.length)];
      const isTrending = Math.random() > 0.3; // 70% chance of being trending
      
      trendingProducts.push({
        _id: `trending_${i + 1}`,
        name: `${productState} ${category} ${isTrending ? 'Trending' : 'Popular'}`,
        description: `Popular ${category.toLowerCase()} from ${productState} - ${isTrending ? 'trending now' : 'customer favorite'}`,
        price: 600 + Math.floor(Math.random() * 5000),
        category: category,
        images: [{ 
          url: `https://images.unsplash.com/photo-${1578662996442 + i}?w=300`, 
          alt: 'Trending Product' 
        }],
        inventory: { 
          total: 15 + Math.floor(Math.random() * 20), 
          available: 8 + Math.floor(Math.random() * 15), 
          reserved: Math.floor(Math.random() * 5) 
        },
        rating: { 
          average: 3.5 + Math.random() * 1.5, 
          count: Math.floor(Math.random() * 150) 
        },
        isActive: true,
        isApproved: true,
        isFeatured: true, // All trending products are featured
        materials: ['Clay', 'Natural Dyes', 'Water', 'Glaze'],
        colors: [['Terracotta', 'Brown', 'Blue', 'Green', 'Red', 'Gold'][Math.floor(Math.random() * 6)]],
        tags: [category, productState, 'Handmade', 'Traditional', isTrending ? 'Trending' : 'Popular'],
        stats: { 
          views: 200 + Math.floor(Math.random() * 800), 
          likes: 50 + Math.floor(Math.random() * 200), 
          shares: 10 + Math.floor(Math.random() * 100), 
          orders: 30 + Math.floor(Math.random() * 150) 
        },
        artisanId: 'artisan_1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Sort by trending score (views + orders + likes)
    return trendingProducts.sort((a, b) => {
      const scoreA = (a.stats?.views || 0) + (a.stats?.orders || 0) + (a.stats?.likes || 0);
      const scoreB = (b.stats?.views || 0) + (b.stats?.orders || 0) + (b.stats?.likes || 0);
      return scoreB - scoreA;
    });
  };

  const trendingProducts = getTrendingProducts();

  // Custom handler for add to cart
  const handleAddToCart = (product: Product) => {
    // This will be handled by the ProductCard component
  };

  if (trendingProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-4">
        <TrendingUp className="w-6 h-6 text-primary-600 mr-2" />
        <h3 className="text-xl font-semibold text-gray-900">
          {state ? `Trending in ${state}` : 'Trending Products'}
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {trendingProducts.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            variant="trending"
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

export default TrendingProducts;
