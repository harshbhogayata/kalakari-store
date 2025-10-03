import React, { useMemo } from 'react';
import { Heart } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../ProductCard';

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

  // Mock related products based on category, state, and materials - using stable data with useMemo
  const relatedProducts = useMemo((): Product[] => {
    // Generate stable recommendations using productId as seed for consistent data
    const seed = productId.charCodeAt(0) + productId.charCodeAt(productId.length - 1);
    const relatedProductsList: Product[] = [];
    
    // Generate related products based on category and state
    const categories = ['Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalwork', 'Paintings', 'Bamboo', 'Leather', 'Stone', 'Glass'];
    const states = ['Rajasthan', 'Gujarat', 'West Bengal', 'Tamil Nadu', 'Kerala', 'Karnataka', 'Maharashtra', 'Uttar Pradesh', 'Bihar', 'Odisha'];
    
    // Same category, different state
    const sameCategoryProducts = categories
      .filter(cat => cat === category)
      .flatMap(cat => {
        return states
          .filter(s => s !== state)
          .slice(0, 2)
          .map((productState, index) => ({
            _id: `related_${productId}_${cat}_${index + 1}`,
            name: `${productState} ${cat} Collection`,
            description: `Beautiful ${cat.toLowerCase()} from ${productState} artisans`,
            price: 800 + ((seed + index) % 3500),
            category: cat,
            images: [{ 
              url: `https://images.unsplash.com/photo-${1578662996442 + index}?w=300`, 
              alt: 'Related Product' 
            }],
            inventory: { 
              total: 10 + ((seed + index) % 15), 
              available: 5 + ((seed + index) % 10), 
              reserved: ((seed + index) % 3) 
            },
            rating: { 
              average: 3.0 + ((seed + index) % 20) / 10, 
              count: ((seed + index) % 80) 
            },
            isActive: true,
            isApproved: true,
            isFeatured: ((seed + index) % 10) > 7,
            materials: materials || ['Clay', 'Natural Dyes'],
            colors: [['Terracotta', 'Brown', 'Blue', 'Green'][(seed + index) % 4]],
            tags: [cat, productState, 'Handmade', 'Traditional'],
            stats: { 
              views: ((seed + index) % 300), 
              likes: ((seed + index) % 80), 
              shares: ((seed + index) % 30), 
              orders: ((seed + index) % 60) 
            },
            artisanId: 'artisan_1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
      });
    
    relatedProductsList.push(...sameCategoryProducts);
    
    // Same state, different category
    const sameStateProducts = states
      .filter(s => s === state)
      .flatMap(productState => {
        return categories
          .filter(cat => cat !== category)
          .slice(0, 2)
          .map((cat, index) => ({
            _id: `related_${productId}_${productState}_${index + 1}`,
            name: `${productState} ${cat} Special`,
            description: `Exquisite ${cat.toLowerCase()} from ${productState}`,
            price: 1200 + ((seed + index + 10) % 2800),
            category: cat,
            images: [{ 
              url: `https://images.unsplash.com/photo-${1578662996442 + index + 10}?w=300`, 
              alt: 'Related Product' 
            }],
            inventory: { 
              total: 8 + ((seed + index + 10) % 12), 
              available: 3 + ((seed + index + 10) % 8), 
              reserved: ((seed + index + 10) % 2) 
            },
            rating: { 
              average: 3.2 + ((seed + index + 10) % 18) / 10, 
              count: ((seed + index + 10) % 70) 
            },
            isActive: true,
            isApproved: true,
            isFeatured: ((seed + index + 10) % 10) > 6,
            materials: ['Clay', 'Natural Dyes'],
            colors: [['Red', 'Gold', 'Yellow', 'Orange'][(seed + index + 10) % 4]],
            tags: [cat, productState, 'Handmade', 'Traditional'],
            stats: { 
              views: ((seed + index + 10) % 250), 
              likes: ((seed + index + 10) % 70), 
              shares: ((seed + index + 10) % 25), 
              orders: ((seed + index + 10) % 50) 
            },
            artisanId: 'artisan_1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
      });
    
    relatedProductsList.push(...sameStateProducts);
    
    // Filter out the current product and return related products
    return relatedProductsList
      .filter(product => product._id !== productId)
      .slice(0, limit);
  }, [productId, category, state, materials, limit]);

  // Custom handler for add to cart
  const handleAddToCart = (product: Product) => {
    // This will be handled by the ProductCard component
  };

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-4">
        <Heart className="w-6 h-6 text-primary-600 mr-2" />
        <h3 className="text-xl font-semibold text-gray-900">
          Related Products
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedProducts.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            variant="related"
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

export default RelatedProducts;
