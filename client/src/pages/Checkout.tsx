import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CreditCard, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useQuery, useMutation } from 'react-query';
import api from '../utils/api';
import { Product } from '../types';
import toast from 'react-hot-toast';

interface CheckoutFormData {
  shippingName: string;
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  shippingPhone: string;
  useBillingAddress: boolean;
  billingName: string;
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingPincode: string;
  billingPhone: string;
}

const Checkout: React.FC = () => {
  const { user } = useAuth();
  const { items, clearCart, getTotalItems } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: products, isLoading } = useQuery(
    ['checkout-products', items],
    async () => {
      if (items.length === 0) return [];
      
      const productPromises = items.map(item => {
        const endpoint = process.env.NODE_ENV === 'development' ? '/api/dev/products' : '/products';
        return api.get(`${endpoint}/${item.productId}`).then(res => ({
          ...res.data.data.product,
          cartQuantity: item.quantity,
          cartVariant: item.variant
        }));
      });
      
      return Promise.all(productPromises);
    },
    { enabled: items.length > 0 }
  );

  const createOrderMutation = useMutation(
    async (orderData: any) => {
      const endpoint = process.env.NODE_ENV === 'development' ? '/api/dev/orders' : '/orders';
      const response = await api.post(endpoint, orderData);
      return response.data.data.order;
    },
    {
      onSuccess: (order) => {
        clearCart();
        navigate(`/orders/${order._id}`);
        toast.success('Order placed successfully!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to place order');
      },
    }
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    defaultValues: {
      useBillingAddress: false,
      shippingName: user?.name || '',
      shippingPhone: user?.phone || '',
    },
  });

  const useBillingAddress = watch('useBillingAddress');

  const calculateSubtotal = () => {
    if (!products) return 0;
    return products.reduce((total, product) => {
      return total + (product.price * product.cartQuantity);
    }, 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 1000 ? 0 : 50; // Fixed: Changed > to >= for consistency
  };

  const calculateTax = () => {
    return Math.round(calculateSubtotal() * 0.18);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (!products || products.length === 0) {
      toast.error('No items in cart');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        items: products.map(product => ({
          productId: product._id,
          quantity: product.cartQuantity,
          variant: product.cartVariant
        })),
        shippingAddress: {
          name: data.shippingName,
          street: data.shippingStreet,
          city: data.shippingCity,
          state: data.shippingState,
          pincode: data.shippingPincode,
          phone: data.shippingPhone,
        },
        billingAddress: data.useBillingAddress ? {
          name: data.billingName,
          street: data.billingStreet,
          city: data.billingCity,
          state: data.billingState,
          pincode: data.billingPincode,
          phone: data.billingPhone,
        } : undefined,
        paymentMethod: 'razorpay'
      };

      await createOrderMutation.mutateAsync(orderData);
    } catch (error) {
      // Checkout error handled by error boundary
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please login to checkout</h2>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <button onClick={() => navigate('/products')} className="btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">
            Complete your order for {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Shipping Address
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    {...register('shippingName', { required: 'Name is required' })}
                    type="text"
                    className="input-field"
                  />
                  {errors.shippingName && (
                    <p className="mt-1 text-sm text-red-600">{errors.shippingName.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    {...register('shippingPhone', {
                      required: 'Phone is required',
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: 'Invalid phone number',
                      },
                    })}
                    type="tel"
                    className="input-field"
                  />
                  {errors.shippingPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.shippingPhone.message}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    {...register('shippingStreet', { required: 'Street address is required' })}
                    type="text"
                    className="input-field"
                  />
                  {errors.shippingStreet && (
                    <p className="mt-1 text-sm text-red-600">{errors.shippingStreet.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    {...register('shippingCity', { required: 'City is required' })}
                    type="text"
                    className="input-field"
                  />
                  {errors.shippingCity && (
                    <p className="mt-1 text-sm text-red-600">{errors.shippingCity.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    {...register('shippingState', { required: 'State is required' })}
                    type="text"
                    className="input-field"
                  />
                  {errors.shippingState && (
                    <p className="mt-1 text-sm text-red-600">{errors.shippingState.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    {...register('shippingPincode', {
                      required: 'Pincode is required',
                      pattern: {
                        value: /^\d{6}$/,
                        message: 'Invalid pincode',
                      },
                    })}
                    type="text"
                    className="input-field"
                  />
                  {errors.shippingPincode && (
                    <p className="mt-1 text-sm text-red-600">{errors.shippingPincode.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Billing Address
                </h2>
                <label className="flex items-center">
                  <input
                    {...register('useBillingAddress')}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Same as shipping address</span>
                </label>
              </div>
              
              {!useBillingAddress && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      {...register('billingName', { required: !useBillingAddress && 'Name is required' })}
                      type="text"
                      className="input-field"
                    />
                    {errors.billingName && (
                      <p className="mt-1 text-sm text-red-600">{errors.billingName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      {...register('billingPhone', {
                        required: !useBillingAddress && 'Phone is required',
                        pattern: {
                          value: /^[6-9]\d{9}$/,
                          message: 'Invalid phone number',
                        },
                      })}
                      type="tel"
                      className="input-field"
                    />
                    {errors.billingPhone && (
                      <p className="mt-1 text-sm text-red-600">{errors.billingPhone.message}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      {...register('billingStreet', { required: !useBillingAddress && 'Street address is required' })}
                      type="text"
                      className="input-field"
                    />
                    {errors.billingStreet && (
                      <p className="mt-1 text-sm text-red-600">{errors.billingStreet.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      {...register('billingCity', { required: !useBillingAddress && 'City is required' })}
                      type="text"
                      className="input-field"
                    />
                    {errors.billingCity && (
                      <p className="mt-1 text-sm text-red-600">{errors.billingCity.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      {...register('billingState', { required: !useBillingAddress && 'State is required' })}
                      type="text"
                      className="input-field"
                    />
                    {errors.billingState && (
                      <p className="mt-1 text-sm text-red-600">{errors.billingState.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      {...register('billingPincode', {
                        required: !useBillingAddress && 'Pincode is required',
                        pattern: {
                          value: /^\d{6}$/,
                          message: 'Invalid pincode',
                        },
                      })}
                      type="text"
                      className="input-field"
                    />
                    {errors.billingPincode && (
                      <p className="mt-1 text-sm text-red-600">{errors.billingPincode.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              {/* Items */}
              <div className="space-y-3 mb-6">
                {products?.map((product: Product & { cartQuantity: number; cartVariant?: any }) => (
                  <div key={product._id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.images[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Qty: {product.cartQuantity} × ₹{product.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pricing */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{calculateSubtotal()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {calculateShipping() === 0 ? 'Free' : `₹${calculateShipping()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (18%)</span>
                  <span className="font-medium">₹{calculateTax()}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-primary-600">₹{calculateTotal()}</span>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <div className="loading-spinner w-4 h-4"></div>
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                <span>{isProcessing ? 'Processing...' : 'Place Order'}</span>
              </button>
              
              {calculateSubtotal() < 1000 && (
                <p className="text-sm text-gray-500 text-center mt-3">
                  Add ₹{1000 - calculateSubtotal()} more for free shipping
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
