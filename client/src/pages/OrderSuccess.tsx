import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Home, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateOrderConfirmationPDF } from '../utils/pdfGenerator';
import { Order } from '../types';

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    // Show success message
    toast.success('Order placed successfully!');
    
    // Fetch order details if orderId is available
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, fetchOrderDetails]);

  const handleDownloadInvoice = () => {
    if (!order) {
      toast.error('Order details not available');
      return;
    }

    try {
      // Create invoice data
      const invoiceData = {
        order,
        customerInfo: {
          name: order.shippingAddress?.name || 'Customer',
          email: 'customer@kalakari.shop', // You might want to get this from user context
          phone: order.shippingAddress?.phone || '',
          address: {
            street: order.shippingAddress?.street || '',
            city: order.shippingAddress?.city || '',
            state: order.shippingAddress?.state || '',
            pincode: order.shippingAddress?.pincode || ''
          }
        },
        companyInfo: {
          name: 'Kalakari',
          address: '123 Artisan Street, Craft City, India',
          phone: '+91 9876543210',
          email: 'support@kalakari.shop',
          website: 'www.kalakari.shop',
          gstin: '29ABCDE1234F1Z5'
        }
      };

      generateOrderConfirmationPDF(invoiceData);
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate invoice');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 mb-8">
            Thank you for your purchase. Your order has been confirmed and will be delivered soon.
          </p>

          {/* Order Details */}
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="text-sm text-gray-600 mb-1">Order ID</div>
              <div className="text-2xl font-bold text-gray-900">{orderId}</div>
              <div className="text-sm text-gray-500 mt-2">
                You will receive an email confirmation shortly
              </div>
            </div>
          )}

          {/* What's Next */}
          <div className="text-left bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                  1
                </span>
                <span>You'll receive an order confirmation email with all the details</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                  2
                </span>
                <span>The artisan will prepare your order with care</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                  3
                </span>
                <span>We'll send you shipping updates via email and SMS</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                  4
                </span>
                <span>Your order will be delivered to your doorstep</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(`/orders/${orderId || ''}`)}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <Package className="w-5 h-5" />
              <span>Track Order</span>
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="btn-outline flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Continue Shopping</span>
            </button>
          </div>

          {/* Download PDF Invoice */}
          {orderId && (
            <button
              onClick={handleDownloadInvoice}
              disabled={isLoading || !order}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center justify-center space-x-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              <span>
                {isLoading ? 'Loading...' : 'Download PDF Invoice'}
              </span>
            </button>
          )}
        </div>

        {/* Support Information */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Need help with your order?</p>
          <a
            href="/contact"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Contact our support team
          </a>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
