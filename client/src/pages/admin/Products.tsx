import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Package, CheckCircle, XCircle, Award, Star } from 'lucide-react';
import api from '../../utils/api';
import { Product } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';

const AdminProducts: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: productsData, isLoading } = useQuery(
    ['admin-products', statusFilter, categoryFilter],
    async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      
      const endpoint = '/api/admin/products';
      const response = await api.get(`${endpoint}?${params.toString()}`);
      return response.data.data;
    }
  );

  // Approve/Reject product mutation
  const approveProductMutation = useMutation(
    async ({ productId, isApproved }: { productId: string; isApproved: boolean }) => {
      const endpoint = '/api/admin/products';
      const response = await api.put(`${endpoint}/${productId}/approve`, {
        isApproved,
        notes: isApproved ? 'Approved by admin' : 'Rejected by admin'
      });
      return response.data;
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['admin-products']);
        toast.success(`Product ${variables.isApproved ? 'approved' : 'rejected'} successfully`);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update product status');
      }
    }
  );

  const handleApproveProduct = (productId: string, isApproved: boolean) => {
    approveProductMutation.mutate({ productId, isApproved });
  };

  const categories = [
    'Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalwork',
    'Leather', 'Bamboo', 'Stone', 'Glass', 'Paper', 'Home Decor',
    'Kitchenware', 'Accessories', 'Clothing', 'Footwear', 'Other'
  ];

  const products: Product[] = productsData?.products || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner size="lg" className="py-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
          <p className="text-gray-600 mt-2">
            Review and approve product listings
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products List */}
        {productsData?.products?.length > 0 ? (
          <div className="space-y-6">
            {products.map((product: Product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.images[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Award className="w-4 h-4" />
                          <span>{product.category}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4" />
                          <span>by {typeof product.artisanId === 'object' ? (product.artisanId as any).businessName : product.artisanId}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>₹{product.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.isApproved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.isApproved ? 'Approved' : 'Pending'}
                    </span>
                    {!product.isApproved && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveProduct(product._id, true)}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleApproveProduct(product._id, false)}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{product.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Product Details</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Materials: {product.materials?.join(', ') || 'N/A'}</p>
                      <p>Colors: {product.colors?.join(', ') || 'N/A'}</p>
                      <p>Inventory: {product.inventory.available} available</p>
                      <p>Views: {product.stats?.views || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Orders: {product.stats?.orders || 0}</span>
                      <span>Likes: {product.stats?.likes || 0}</span>
                      <span>Shares: {product.stats?.shares || 0}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Created: {new Date(product.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            type="products"
            title="No products found"
            description={statusFilter || categoryFilter
              ? 'No products match your filter criteria. Try adjusting your filters.'
              : 'No products have been submitted yet.'}
          />
        )}

        {/* Pagination */}
        {productsData?.pagination && productsData.pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              {Array.from({ length: productsData.pagination.pages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`px-3 py-2 rounded ${
                    page === productsData.pagination.current
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
