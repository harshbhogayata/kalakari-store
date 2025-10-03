import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../../types';
import WishlistButton from '../WishlistButton';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ProductRecommendationsProps {
  productId: string;
  category: string;
  state?: string;
  limit?: number;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  productId,
  category,
  state,
  limit = 4
}) => {
  const { addItem } = useCart();
  const { user } = useAuth();

  // Mock recommendations based on category and state - using stable data with useMemo
  const recommendations = useMemo((): Product[] => {
    // Generate stable recommendations using productId as seed for consistent data
    const seed = productId.charCodeAt(0) + productId.charCodeAt(productId.length - 1);
    const allRecommendations: Product[] = [];
    
    // Same category recommendations
    const sameCategoryProducts = [
      {
        _id: `rec_${productId}_1`,
        name: `${state || 'Traditional'} ${category} Collection`,
        description: `Beautiful ${category.toLowerCase()} piece from ${state || 'skilled artisans'}`,
        price: 1200 + (seed % 3000),
        category: category,
        images: [{ url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300', alt: 'Recommended Product' }],
        inventory: { total: 10, available: 5 + (seed % 5), reserved: 0 },
        rating: { average: 3.5 + (seed % 15) / 10, count: (seed % 50) },
        isActive: true,
        isApproved: true,
        isFeatured: (seed % 10) > 7,
        materials: ['Clay', 'Natural Dyes'],
        colors: ['Terracotta', 'Brown'],
        tags: [category, state || 'Traditional', 'Handmade'],
        stats: { views: (seed % 200), likes: (seed % 50), shares: (seed % 20), orders: (seed % 30) },
        artisanId: 'artisan_1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: `rec_${productId}_2`,
        name: `Premium ${category} Artisan Piece`,
        description: `Exquisite ${category.toLowerCase()} crafted with traditional techniques`,
        price: 800 + ((seed + 1) % 4000),
        category: category,
        images: [{ url: 'https://images.unsplash.com/photo-1600661633315-7389108b31a1?w=300', alt: 'Recommended Product' }],
        inventory: { total: 8, available: 3 + ((seed + 1) % 5), reserved: 0 },
        rating: { average: 3.5 + ((seed + 1) % 15) / 10, count: ((seed + 1) % 50) },
        isActive: true,
        isApproved: true,
        isFeatured: ((seed + 1) % 10) > 7,
        materials: ['Clay', 'Natural Dyes'],
        colors: ['Blue', 'White'],
        tags: [category, state || 'Traditional', 'Handmade'],
        stats: { views: ((seed + 1) % 200), likes: ((seed + 1) % 50), shares: ((seed + 1) % 20), orders: ((seed + 1) % 30) },
        artisanId: 'artisan_1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    allRecommendations.push(...sameCategoryProducts);
    
    // Add other category recommendations
    const categories = ['Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalwork', 'Paintings', 'Bamboo', 'Leather', 'Stone', 'Glass'];
    const otherCategories = categories.filter(cat => cat !== category).slice(0, 2);
    
    otherCategories.forEach((cat, index) => {
      const productState = state || ['Rajasthan', 'Gujarat', 'West Bengal'][(seed + index) % 3];
      
      allRecommendations.push({
        _id: `rec_${productId}_${index + 3}`,
        name: `${productState} ${cat} Collection`,
        description: `Beautiful ${cat.toLowerCase()} piece from ${productState}`,
        price: 1500 + ((seed + index) % 2500),
        category: cat,
        images: [{ url: `https://images.unsplash.com/photo-${1578662996442 + index}?w=300`, alt: 'Recommended Product' }],
        inventory: { total: 10 + ((seed + index) % 15), available: 5 + ((seed + index) % 10), reserved: ((seed + index) % 3) },
        rating: { average: 3.0 + ((seed + index) % 20) / 10, count: ((seed + index) % 80) },
        isActive: true,
        isApproved: true,
        isFeatured: ((seed + index) % 10) > 7,
        materials: ['Clay', 'Natural Dyes'],
        colors: [['Terracotta', 'Brown', 'Blue', 'Green'][(seed + index) % 4]],
        tags: [cat, productState, 'Handmade', 'Traditional'],
        stats: { views: ((seed + index) % 300), likes: ((seed + index) % 80), shares: ((seed + index) % 30), orders: ((seed + index) % 60) },
        artisanId: 'artisan_1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
    
    // Filter out the current product and return recommendations
    return allRecommendations
      .filter(product => product._id !== productId)
      .slice(0, limit);
  }, [productId, category, state, limit]);

  const handleAddToCart = (product: Product) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    addItem({
      productId: product._id,
      quantity: 1,
      price: product.price,
      variant: product.variants && product.variants.length > 0 ? { [product.variants[0].name]: product.variants[0].options[0] } : undefined,
    });
    toast.success(`${product.name} added to cart!`);
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-4">
        <Star className="w-6 h-6 text-primary-600 mr-2" />
        <h3 className="text-xl font-semibold text-gray-900">
          You Might Also Like
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <div
            key={product._id}
            className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <Link to={`/products/${product._id}`}>
              <img
                src={product.images[0]?.url || 'https://via.placeholder.com/300x200'}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            </Link>
            <div className="p-4">
              <Link to={`/products/${product._id}`}>
                <h4 className="font-medium text-gray-900 mb-1 line-clamp-2 hover:text-primary-600 transition-colors">
                  {product.name}
                </h4>
              </Link>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">
                    {product.rating?.average?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <span className="text-sm text-gray-500 mx-2">•</span>
                <span className="text-sm text-gray-600">
                  ₹{product.price?.toLocaleString() || '0'}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 bg-primary-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Add to Cart
                </button>
                <WishlistButton 
                  productId={product._id}
                  showText={false}
                  className="p-2 border border-gray-300 rounded-lg hover:border-primary-600 hover:text-primary-600 transition-colors duration-200"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;
