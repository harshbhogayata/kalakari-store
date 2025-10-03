import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  ArrowLeft, Package, MapPin, CreditCard, Truck,
  CheckCircle, XCircle, AlertCircle, FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import toast from 'react-hot-toast';
import { downloadOrderInvoice } from '../utils/pdfGenerator';

const OrderDetailNew: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);

  // Fetch order details
  const { data: orderData, isLoading, error, refetch } = useQuery(
    ['order', id],
    async () => {
      const endpoint = process.env.NODE_ENV === 'development' ? '/api/dev/orders' : '/orders';
      const response = await api.get(`${endpoint}/${id}`);
      return response.data.data.order;
    },
    {
      enabled: !!id && !!user
    }
  );

  // Cancel order mutation
  const cancelOrderMutation = useMutation(
    async (reason: string) => {
      const endpoint = process.env.NODE_ENV === 'development' ? '/api/dev/orders' : '/orders';
      const response = await api.patch(`${endpoint}/${id}/cancel`, { reason });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['order', id]);
        queryClient.invalidateQueries(['orders']);
        setShowCancelDialog(false);
        toast.success('Order cancelled successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to cancel order');
      }
    }
  );

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }
    cancelOrderMutation.mutate(cancelReason);
  };

  const getStatusTimeline = (status: string) => {
    const timeline = [
      { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle, color: 'text-green-600' },
      { key: 'processing', label: 'Processing', icon: Package, color: 'text-blue-600' },
      { key: 'shipped', label: 'Shipped', icon: Truck, color: 'text-yellow-600' },
      { key: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'text-green-600' }
    ];

    const statusOrder = ['confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);

    return timeline.map((step, index) => ({
      ...step,
      isCompleted: index <= currentIndex,
      isCurrent: index === currentIndex
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadInvoice = async () => {
    if (!id) return;
    
    try {
      setIsDownloadingInvoice(true);
      await downloadOrderInvoice(id);
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600">Please login to view order details</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner size="lg" className="py-12" />
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorMessage
            title="Failed to load order"
            message="We couldn't load this order. Please try again."
            onRetry={() => refetch()}
            showHomeButton
          />
        </div>
      </div>
    );
  }

  const order = orderData;
  const canCancel = ['confirmed', 'processing'].includes(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Orders</span>
          </button>
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order {order.orderId}</h1>
              <p className="text-gray-600 mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            
            {canCancel && (
              <button
                onClick={() => setShowCancelDialog(true)}
                className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Timeline */}
            {!['cancelled', 'returned'].includes(order.status) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h2>
                
                <div className="relative">
                  {getStatusTimeline(order.status).map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="relative flex items-start pb-8 last:pb-0">
                        {/* Connector Line */}
                        {index < 3 && (
                          <div className={`absolute left-5 top-10 w-0.5 h-full ${
                            step.isCompleted ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                        )}
                        
                        {/* Icon */}
                        <div className={`
                          relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                          ${step.isCompleted
                            ? 'bg-green-100 border-2 border-green-500'
                            : step.isCurrent
                              ? 'bg-blue-100 border-2 border-blue-500 animate-pulse'
                              : 'bg-gray-100 border-2 border-gray-300'
                          }
                        `}>
                          <Icon className={`w-5 h-5 ${
                            step.isCompleted
                              ? 'text-green-600'
                              : step.isCurrent
                                ? 'text-blue-600'
                                : 'text-gray-400'
                          }`} />
                        </div>
                        
                        {/* Label */}
                        <div className="ml-4 flex-1">
                          <p className={`font-medium ${
                            step.isCompleted || step.isCurrent ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {step.label}
                          </p>
                          {step.isCurrent && (
                            <p className="text-sm text-blue-600 mt-1">In Progress</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cancelled/Returned Status */}
            {['cancelled', 'returned'].includes(order.status) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-900">
                    Order {order.status === 'cancelled' ? 'Cancelled' : 'Returned'}
                  </h3>
                </div>
                {order.cancellation?.reason && (
                  <p className="text-sm text-red-700">
                    <span className="font-medium">Reason:</span> {order.cancellation.reason}
                  </p>
                )}
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              
              <div className="space-y-4">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Product Item</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      {item.variant && Object.keys(item.variant).length > 0 && (
                        <p className="text-xs text-gray-500">
                          {Object.entries(item.variant).map(([key, value]) => `${key}: ${value}`).join(', ')}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{item.price * item.quantity}</p>
                      <p className="text-sm text-gray-500">₹{item.price} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Price Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Price Details</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">₹{order.pricing.subtotal}</span>
                </div>
                
                {order.pricing.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.pricing.discount}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {order.pricing.shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${order.pricing.shipping}`
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-primary-600">₹{order.pricing.total}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Shipping Address</span>
              </h3>
              
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.pincode}</p>
                <p className="pt-2">Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Payment Information</span>
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method</span>
                  <span className="text-gray-900 capitalize">{order.payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium capitalize ${
                    order.payment.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {order.payment.status}
                  </span>
                </div>
                {order.payment.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="text-gray-900 font-mono text-xs">{order.payment.transactionId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleDownloadInvoice}
                disabled={isDownloadingInvoice}
                className="w-full btn-outline flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-5 h-5" />
                <span>
                  {isDownloadingInvoice ? 'Generating PDF...' : 'Download PDF Invoice'}
                </span>
              </button>
              
              <button
                onClick={() => navigate('/contact')}
                className="w-full btn-outline flex items-center justify-center space-x-2"
              >
                <AlertCircle className="w-5 h-5" />
                <span>Need Help?</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cancel Order Dialog */}
        {showCancelDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Order</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation *
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="input-field"
                  rows={4}
                  placeholder="Please tell us why you're cancelling this order..."
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setShowCancelDialog(false);
                    setCancelReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={cancelOrderMutation.isLoading}
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelOrderMutation.isLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelOrderMutation.isLoading ? 'Cancelling...' : 'Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailNew;
