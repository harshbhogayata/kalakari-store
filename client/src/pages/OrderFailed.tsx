import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCw, Home, HelpCircle } from 'lucide-react';

const OrderFailed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason') || 'Payment failed';

  const handleRetry = () => {
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Error Icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Failed
          </h1>
          <p className="text-gray-600 mb-8">
            {reason}
          </p>

          {/* Common Reasons */}
          <div className="text-left bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-yellow-600" />
              <span>Common reasons for payment failure:</span>
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
              <li>Insufficient balance in account</li>
              <li>Card declined by bank</li>
              <li>Incorrect card details or OTP</li>
              <li>Payment gateway timeout</li>
              <li>Network connectivity issues</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Try Again</span>
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="btn-outline flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Go Home</span>
            </button>
          </div>

          {/* Support Link */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              Still having issues?
            </p>
            <a
              href="/contact"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              Contact our support team
            </a>
          </div>
        </div>

        {/* Payment Tips */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Tips for successful payment:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start space-x-2">
              <span className="text-primary-600 mt-0.5">✓</span>
              <span>Ensure you have sufficient balance in your account</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary-600 mt-0.5">✓</span>
              <span>Double-check card details (number, expiry, CVV)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary-600 mt-0.5">✓</span>
              <span>Use a stable internet connection</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary-600 mt-0.5">✓</span>
              <span>Try a different payment method if the issue persists</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary-600 mt-0.5">✓</span>
              <span>Contact your bank if card is repeatedly declined</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderFailed;
