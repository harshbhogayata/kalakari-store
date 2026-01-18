import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit, Trash2, Eye, Package, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../utils/api';
import { Product } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';

const ArtisanProducts: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');

  const { data: productsData, isLoading } = useQuery(
    ['artisan-products', statusFilter],
    async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const endpoint = '/api/products/artisan/my-products';
      
      const response = await api.get(`${endpoint}?${params.toString()}`);
      return response.data.data;
    }
  );

  // Delete product mutation
  const deleteProductMutation = useMutation(
    async (productId: string) => {
      const endpoint = '/api/products';
      const response = await api.delete(`${endpoint}/${productId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['artisan-products']);
        toast.success('Product deleted successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to delete product');
      }
    }
  );

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const getStatusIcon = (product: Product) => {
    if (!product.isApproved) {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    } else if (product.isActive) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = (product: Product) => {
    if (!product.isApproved) {
      return 'Pending Approval';
    } else if (product.isActive) {
      return 'Active';
    } else {
      return 'Inactive';
    }
  };

  const getStatusColor = (product: Product) => {
    if (!product.isApproved) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (product.isActive) {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
            <p className="text-gray-600 mt-2">
              Manage your product listings and inventory
            </p>
          </div>
          <Link
            to="/artisan/products/new"
            className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === '' 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'active' 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'pending' 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending Approval
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'inactive' 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: Product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-square bg-gray-100 relative">
                  {product.images[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product)}`}>
                      {getStatusText(product)}
                    </span>
                  </div>
                  {product.discount && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      -{product.discount}%
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-primary-600">
                      ₹{product.price}
                    </span>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(product)}
                      <span className="text-sm text-gray-600">
                        {product.inventory.available} left
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{product.category}</span>
                    <span>{product.stats?.views || 0} views</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/products/${product._id}`}
                      className="flex-1 btn-outline flex items-center justify-center space-x-1 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </Link>
                    <Link
                      to={`/artisan/products/${product._id}/edit`}
                      className="flex-1 btn-primary flex items-center justify-center space-x-1 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            type="products"
            title="No products found"
            description={statusFilter 
              ? `No products with selected filter found.`
              : "You haven't added any products yet. Start creating your first product listing!"}
            action={{
              label: 'Add Your First Product',
              onClick: () => navigate('/artisan/products/new')
            }}
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

export default ArtisanProducts;
