import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { useQuery } from 'react-query';
import { Product } from '../../types';
import WishlistButton from '../WishlistButton';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
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

  // Fetch real product recommendations from API
  const { data: recommendations = [], isLoading } = useQuery(
    ['product-recommendations', productId, category, state, limit],
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
        console.error('Failed to fetch product recommendations:', error);
        return [];
      }
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

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
        {recommendations.map((product: Product) => (
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
