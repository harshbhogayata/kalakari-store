import React from 'react';
import { CreditCard, Wallet, Building2, Smartphone, Check } from 'lucide-react';

export type PaymentMethodType = 'card' | 'upi' | 'netbanking' | 'cod' | 'razorpay';

interface PaymentMethodProps {
  selectedMethod: PaymentMethodType | null;
  onSelectMethod: (method: PaymentMethodType) => void;
}

const paymentMethods = [
  {
    id: 'razorpay' as PaymentMethodType,
    name: 'Razorpay',
    icon: CreditCard,
    description: 'Cards, UPI, Net Banking, Wallets - All in one'
  },
  {
    id: 'card' as PaymentMethodType,
    name: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'Visa, Mastercard, RuPay, Amex'
  },
  {
    id: 'upi' as PaymentMethodType,
    name: 'UPI',
    icon: Smartphone,
    description: 'Google Pay, PhonePe, Paytm, BHIM'
  },
  {
    id: 'netbanking' as PaymentMethodType,
    name: 'Net Banking',
    icon: Building2,
    description: 'All major banks'
  },
  {
    id: 'cod' as PaymentMethodType,
    name: 'Cash on Delivery',
    icon: Wallet,
    description: 'Pay when you receive'
  }
];

const PaymentMethod: React.FC<PaymentMethodProps> = ({
  selectedMethod,
  onSelectMethod
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
      
      {paymentMethods.map((method) => {
        const Icon = method.icon;
        const isSelected = selectedMethod === method.id;
        
        return (
          <div
            key={method.id}
            onClick={() => onSelectMethod(method.id)}
            className={`
              relative p-4 border-2 rounded-lg cursor-pointer transition-all
              ${isSelected
                ? 'border-primary-500 bg-primary-50/50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
              }
            `}
          >
            {/* Selection Indicator */}
            {isSelected && (
              <div className="absolute top-3 right-3 bg-primary-500 text-white rounded-full p-1">
                <Check className="w-4 h-4" />
              </div>
            )}

            <div className="flex items-center space-x-4 pr-10">
              <div className={`
                p-3 rounded-lg
                ${isSelected ? 'bg-primary-100' : 'bg-gray-100'}
              `}>
                <Icon className={`w-6 h-6 ${isSelected ? 'text-primary-600' : 'text-gray-600'}`} />
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">{method.name}</h4>
                <p className="text-sm text-gray-500">{method.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PaymentMethod;
