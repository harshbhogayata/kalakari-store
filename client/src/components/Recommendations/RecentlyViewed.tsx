import React, { useState, useEffect, useMemo } from 'react';
import { Clock } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../ProductCard';

interface RecentlyViewedProps {
  currentProductId?: string;
  limit?: number;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  currentProductId,
  limit = 4
}) => {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Load recently viewed products from localStorage
  useEffect(() => {
    const loadRecentlyViewed = () => {
      try {
        const stored = localStorage.getItem('recentlyViewed');
        if (stored) {
          const viewed = JSON.parse(stored);
          // Filter out current product and limit results
          const filtered = viewed
            .filter((product: Product) => product._id !== currentProductId)
            .slice(0, limit);
          setRecentlyViewed(filtered);
        }
    } catch (error) {
      // Recently viewed loading error handled silently - will use empty array
    }
    };

    loadRecentlyViewed();
  }, [currentProductId, limit]);

  // Add product to recently viewed
  // const addToRecentlyViewed = (product: Product) => {
  //   try {
  //     const stored = localStorage.getItem('recentlyViewed');
  //     let viewed: Product[] = stored ? JSON.parse(stored) : [];
  //     
  //     // Remove if already exists
  //     viewed = viewed.filter(p => p._id !== product._id);
  //     
  //     // Add to beginning
  //     viewed.unshift(product);
  //     
  //     // Keep only last 20 items
  //     viewed = viewed.slice(0, 20);
  //     
  //     localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
  //     setRecentlyViewed(viewed.slice(0, limit));
  //   } catch (error) {
  //     // Recently viewed saving error handled silently
  //   }
  // };

  // Mock recently viewed products if none in localStorage - using stable data with useMemo
  const mockRecentlyViewed = useMemo((): Product[] => {
    const categories = ['Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalwork'];
    const states = ['Rajasthan', 'Gujarat', 'West Bengal', 'Tamil Nadu', 'Kerala'];
    
    // Use a stable seed based on currentProductId to ensure consistent data
    const seed = currentProductId ? currentProductId.charCodeAt(0) + currentProductId.charCodeAt(currentProductId.length - 1) : 12345;
    
    return Array.from({ length: limit }, (_, i) => {
      const category = categories[(seed + i) % categories.length];
      const state = states[(seed + i + 1) % states.length];
      const colors = ['Terracotta', 'Brown', 'Blue', 'Green'];
      
      return {
        _id: `recent_${currentProductId || 'default'}_${i + 1}`,
        name: `${state} ${category} Collection`,
        description: `Recently viewed ${category.toLowerCase()} from ${state}`,
        price: 1000 + ((seed + i * 2) % 4000),
        category: category,
        images: [{ 
          url: `https://images.unsplash.com/photo-${1578662996442 + i}?w=300`, 
          alt: 'Recently Viewed Product' 
        }],
        inventory: { 
          total: 10 + ((seed + i * 3) % 15), 
          available: 5 + ((seed + i * 4) % 10), 
          reserved: ((seed + i * 5) % 3) 
        },
        rating: { 
          average: 3.0 + ((seed + i * 6) % 20) / 10, 
          count: ((seed + i * 7) % 80) 
        },
        isActive: true,
        isApproved: true,
        isFeatured: ((seed + i * 8) % 10) > 7,
        materials: ['Clay', 'Natural Dyes'],
        colors: [colors[(seed + i * 9) % colors.length]],
        tags: [category, state, 'Handmade', 'Traditional'],
        stats: { 
          views: ((seed + i * 10) % 300), 
          likes: ((seed + i * 11) % 80), 
          shares: ((seed + i * 12) % 30), 
          orders: ((seed + i * 13) % 60) 
        },
        artisanId: 'artisan_1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
  }, [limit, currentProductId]);

  const displayProducts = recentlyViewed.length > 0 ? recentlyViewed : mockRecentlyViewed;

  // Custom handler for add to cart
  const handleAddToCart = (product: Product) => {
    // This will be handled by the ProductCard component
  };

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-4">
        <Clock className="w-6 h-6 text-primary-600 mr-2" />
        <h3 className="text-xl font-semibold text-gray-900">
          Recently Viewed
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayProducts.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            variant="compact"
            showRating={true}
            showStats={false}
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
