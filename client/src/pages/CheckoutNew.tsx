import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useMutation } from 'react-query';
import api from '../utils/api';
import { Address } from '../types';
import AddressSelector from '../components/Checkout/AddressSelector';
import PaymentMethod, { PaymentMethodType } from '../components/Checkout/PaymentMethod';
import OrderSummary from '../components/Checkout/OrderSummary';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { createRazorpayOrder, verifyPayment, openRazorpayCheckout } from '../utils/razorpay';
import { getErrorMessage } from '../utils/errorUtils';
import logger from '../utils/logger';

const CheckoutNew: React.FC = () => {
  const { user } = useAuth();
  const { items, clearCart, getTotalPrice } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState<'address' | 'payment' | 'review'>(user ? 'address' : 'address');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !isProcessing) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [items.length, navigate, isProcessing]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    }
  }, [user, navigate]);

  // Calculate totals with proper state management
  const subtotal = getTotalPrice();
  const shipping = subtotal >= 1000 ? 0 : 50;
  const discount = 0; // Can be calculated based on coupons
  const total = subtotal + shipping - discount;

  // Debug logging for shipping calculation
  logger.log('CheckoutNew - Cart totals:', {
    itemsCount: items.length,
    subtotal,
    shipping,
    discount,
    total
  });

  // Place order mutation
  const placeOrderMutation = useMutation(
    async (orderData: any) => {
      const endpoint = '/api/orders';
      const response = await api.post(endpoint, orderData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        clearCart();
        toast.success('Order placed successfully!');
        navigate(`/orders/${data.data.order._id}`, { replace: true });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to place order');
      }
    }
  );

  const handleContinueToPayment = () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }
    setStep('payment');
  };

  const handleContinueToReview = () => {
    if (!selectedPayment) {
      toast.error('Please select a payment method');
      return;
    }
    setStep('review');
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedPayment) {
      toast.error('Please complete all checkout steps');
      return;
    }

    setIsProcessing(true);

    try {
      // If Razorpay is selected, handle payment first
      if (selectedPayment === 'razorpay') {
        await handleRazorpayPayment();
      } else {
        // For other payment methods, proceed with order creation
        await createOrder();
      }
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to place order. Please try again.');
      toast.error(message);
      setIsProcessing(false);
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      const totalAmount = getTotalPrice();

      // Create Razorpay order
      const order = await createRazorpayOrder(totalAmount);

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
        amount: order.amount,
        currency: order.currency,
        name: 'Kalakari',
        description: 'Payment for your order',
        order_id: order.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        notes: {
          address: selectedAddress?.street || ''
        },
        theme: {
          color: '#ed7a1a'
        },
        handler: async (response: any) => {
          try {
            logger.log('Razorpay payment response:', response);
            logger.log('Response keys:', Object.keys(response));
            logger.log('Available order object:', order);

            // Extract payment details from response - handle different possible field names
            const orderId = response.razorpay_order_id || response.order_id || response.orderId || order?.id;
            const paymentId = response.razorpay_payment_id || response.payment_id || response.paymentId;
            const signature = response.razorpay_signature || response.signature;

            logger.log('Extracted payment details:', { orderId, paymentId, signature });

            // Ensure we have all required fields
            const finalOrderId = orderId || order?.id || 'unknown_order_id';
            const finalPaymentId = paymentId || 'unknown_payment_id';
            const finalSignature = signature || 'unknown_signature';

            logger.log('Final payment details being sent:', { finalOrderId, finalPaymentId, finalSignature });

            // Verify payment
            const verification = await verifyPayment(
              finalOrderId,
              finalPaymentId,
              finalSignature
            );

            logger.log('Payment verification result:', verification);

            if (verification.success) {
              // Payment verified, create order
              await createOrder(response.razorpay_payment_id);
            } else {
              toast.error('Payment verification failed');
              setIsProcessing(false);
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            const message = getErrorMessage(error, 'Payment verification failed');
            toast.error(message);
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
            setIsProcessing(false);
          }
        }
      };

      openRazorpayCheckout(options);
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to initiate payment');
      toast.error(message);
      setIsProcessing(false);
    }
  };

  const createOrder = async (paymentId?: string) => {
    const orderData = {
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant
      })),
      shippingAddress: selectedAddress,
      paymentMethod: selectedPayment,
      paymentId: paymentId,
      subtotal,
      shipping,
      discount,
      total
    };

    try {
      // Place order with payment details
      await placeOrderMutation.mutateAsync(orderData);
    } catch (error) {
      throw error;
    }
  };

  if (!user || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Cart</span>
          </button>

          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Lock className="w-4 h-4" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[
              { id: 'address', label: 'Address', num: 1 },
              { id: 'payment', label: 'Payment', num: 2 },
              { id: 'review', label: 'Review', num: 3 }
            ].map((s, index) => (
              <React.Fragment key={s.id}>
                <div className="flex items-center space-x-2">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-semibold
                    ${step === s.id
                      ? 'bg-primary-600 text-white'
                      : index < ['address', 'payment', 'review'].indexOf(step)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {s.num}
                  </div>
                  <span className={`text-sm font-medium ${step === s.id ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                    {s.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-16 h-1 ${index < ['address', 'payment', 'review'].indexOf(step)
                      ? 'bg-primary-600'
                      : 'bg-gray-200'
                    }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Address Selection */}
            {step === 'address' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <AddressSelector
                  selectedAddressId={selectedAddress?._id || null}
                  onSelectAddress={setSelectedAddress}
                />

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleContinueToPayment}
                    disabled={!selectedAddress}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 'payment' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Show selected address */}
                {selectedAddress && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Delivering to:</h4>
                      <button
                        onClick={() => setStep('address')}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">
                      {selectedAddress.name}, {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                  </div>
                )}

                <PaymentMethod
                  selectedMethod={selectedPayment}
                  onSelectMethod={setSelectedPayment}
                />

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setStep('address')}
                    className="btn-outline"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleContinueToReview}
                    disabled={!selectedPayment}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Review
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review Order */}
            {step === 'review' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Order</h3>

                {/* Delivery Address */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Delivery Address</h4>
                    <button
                      onClick={() => setStep('address')}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      Change
                    </button>
                  </div>
                  {selectedAddress && (
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                      <p className="font-medium">{selectedAddress.name}</p>
                      <p>{selectedAddress.street}</p>
                      <p>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                      <p>Phone: {selectedAddress.phone}</p>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Payment Method</h4>
                    <button
                      onClick={() => setStep('payment')}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      Change
                    </button>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 capitalize">
                    {selectedPayment === 'card' && 'Credit/Debit Card'}
                    {selectedPayment === 'upi' && 'UPI'}
                    {selectedPayment === 'netbanking' && 'Net Banking'}
                    {selectedPayment === 'cod' && 'Cash on Delivery'}
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Order Items ({items.length})</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.productId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Product Item</p>
                          <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Place Order Button */}
                <div className="flex justify-between pt-6 border-t">
                  <button
                    onClick={() => setStep('payment')}
                    className="btn-outline"
                    disabled={isProcessing}
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        <span>Place Order - ₹{total.toFixed(2)}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              items={items}
              subtotal={subtotal}
              shipping={shipping}
              discount={discount}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutNew;
