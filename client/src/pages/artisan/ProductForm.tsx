import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ArrowLeft, Upload, X } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext'; // TODO: Use for authentication when needed
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: number;
  state: string;
  materials: string;
  colors: string;
  tags: string;
  inventory: {
    total: number;
    available: number;
  };
}

const categories = [
  'Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalwork',
  'Leather', 'Bamboo', 'Stone', 'Glass', 'Paper', 'Home Decor',
  'Kitchenware', 'Accessories', 'Clothing', 'Footwear', 'Other'
];

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>();

  // Fetch product if editing
  const { data: productData, isLoading: isLoadingProduct } = useQuery(
    ['product', id],
    async () => {
      const endpoint = '/api/products';
      const response = await api.get(`${endpoint}/${id}`);
      return response.data.data.product || response.data.data;
    },
    {
      enabled: isEditing
    }
  );

  // Populate form when editing
  useEffect(() => {
    if (productData && isEditing) {
      reset({
        name: productData.name,
        description: productData.description,
        category: productData.category,
        price: productData.price,
        state: productData.state || '',
        materials: productData.materials?.join(', ') || '',
        colors: productData.colors?.join(', ') || '',
        tags: productData.tags?.join(', ') || '',
        inventory: {
          total: productData.inventory?.total || 0,
          available: productData.inventory?.available || 0
        }
      });
      setExistingImages(productData.images?.map((img: any) => img.url) || []);
    }
  }, [productData, isEditing, reset]);

  // Create/Update product mutation
  const saveProductMutation = useMutation(
    async (data: ProductFormData) => {
      const endpoint = '/api/products';
      
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('price', data.price.toString());
      formData.append('state', data.state);
      formData.append('materials', data.materials);
      formData.append('colors', data.colors);
      formData.append('tags', data.tags);
      formData.append('inventory[total]', data.inventory.total.toString());
      formData.append('inventory[available]', data.inventory.available.toString());

      // Add images
      images.forEach((image) => {
        formData.append('images', image);
      });

      if (isEditing) {
        const response = await api.put(`${endpoint}/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
      } else {
        const response = await api.post(endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['artisan-products']);
        queryClient.invalidateQueries(['product', id]);
        toast.success(isEditing ? 'Product updated successfully' : 'Product created successfully');
        navigate('/artisan/products');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to save product');
      }
    }
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select valid image files');
        return false;
      }
      return true;
    });

    setImages(prev => [...prev, ...validFiles].slice(0, 5));
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: ProductFormData) => {
    if (images.length === 0 && existingImages.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }
    
    saveProductMutation.mutate(data);
  };

  if (isLoadingProduct) {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/artisan/products')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Products</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Update your product details' : 'Create a new product listing'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Product Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images * (Max 5, 5MB each)
            </label>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-3">
                {existingImages.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New Images */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-3">
                {images.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {(images.length + existingImages.length) < 5 && (
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Click to upload images</span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              {...register('name', {
                required: 'Product name is required',
                minLength: { value: 3, message: 'Name must be at least 3 characters' },
                maxLength: { value: 100, message: 'Name must not exceed 100 characters' }
              })}
              type="text"
              id="name"
              className="input-field"
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              {...register('description', {
                required: 'Description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' },
                maxLength: { value: 2000, message: 'Description must not exceed 2000 characters' }
              })}
              id="description"
              rows={5}
              className="input-field"
              placeholder="Describe your product, its features, materials used, and craftsmanship"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Category and State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                id="category"
                className="input-field"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State/Origin
              </label>
              <select
                {...register('state')}
                id="state"
                className="input-field"
              >
                <option value="">Select state</option>
                {indianStates.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price and Inventory */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹) *
              </label>
              <input
                {...register('price', {
                  required: 'Price is required',
                  min: { value: 1, message: 'Price must be at least ₹1' },
                  max: { value: 1000000, message: 'Price cannot exceed ₹10,00,000' }
                })}
                type="number"
                id="price"
                className="input-field"
                placeholder="0"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="inventory.total" className="block text-sm font-medium text-gray-700 mb-1">
                Total Stock *
              </label>
              <input
                {...register('inventory.total', {
                  required: 'Total stock is required',
                  min: { value: 0, message: 'Stock cannot be negative' }
                })}
                type="number"
                id="inventory.total"
                className="input-field"
                placeholder="0"
              />
              {errors.inventory?.total && (
                <p className="mt-1 text-sm text-red-600">{errors.inventory.total.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="inventory.available" className="block text-sm font-medium text-gray-700 mb-1">
                Available Stock *
              </label>
              <input
                {...register('inventory.available', {
                  required: 'Available stock is required',
                  min: { value: 0, message: 'Stock cannot be negative' }
                })}
                type="number"
                id="inventory.available"
                className="input-field"
                placeholder="0"
              />
              {errors.inventory?.available && (
                <p className="mt-1 text-sm text-red-600">{errors.inventory.available.message}</p>
              )}
            </div>
          </div>

          {/* Materials */}
          <div>
            <label htmlFor="materials" className="block text-sm font-medium text-gray-700 mb-1">
              Materials Used
            </label>
            <input
              {...register('materials')}
              type="text"
              id="materials"
              className="input-field"
              placeholder="e.g., Clay, Cotton, Wood (comma-separated)"
            />
            <p className="mt-1 text-xs text-gray-500">Separate multiple materials with commas</p>
          </div>

          {/* Colors */}
          <div>
            <label htmlFor="colors" className="block text-sm font-medium text-gray-700 mb-1">
              Colors Available
            </label>
            <input
              {...register('colors')}
              type="text"
              id="colors"
              className="input-field"
              placeholder="e.g., Red, Blue, Green (comma-separated)"
            />
            <p className="mt-1 text-xs text-gray-500">Separate multiple colors with commas</p>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              {...register('tags')}
              type="text"
              id="tags"
              className="input-field"
              placeholder="e.g., Handmade, Traditional, Eco-friendly (comma-separated)"
            />
            <p className="mt-1 text-xs text-gray-500">Separate multiple tags with commas</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/artisan/products')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={saveProductMutation.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveProductMutation.isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveProductMutation.isLoading
                ? 'Saving...'
                : isEditing
                  ? 'Update Product'
                  : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
