// Razorpay integration utilities

import config from '../config/env';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
  handler: (response: any) => void;
  modal: {
    ondismiss: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = config.razorpay.scriptUrl;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createRazorpayOrder = async (amount: number, receipt?: string) => {
  try {
    const response = await fetch('/api/dev/payments/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: receipt || `receipt_${Date.now()}`
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to create order');
    }
  } catch (error) {
    throw error;
  }
};

export const verifyPayment = async (orderId: string, paymentId: string, signature: string) => {
  try {
    const response = await fetch('/api/dev/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        paymentId,
        signature
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const openRazorpayCheckout = (options: RazorpayOptions) => {
  if (!window.Razorpay) {
    throw new Error('Razorpay not loaded');
  }

  const razorpay = new window.Razorpay(options);
  razorpay.open();
  return razorpay;
};

export const formatAmount = (amount: number): number => {
  // Convert rupees to paise
  return Math.round(amount * 100);
};

export const formatAmountFromPaise = (amount: number): number => {
  // Convert paise to rupees
  return amount / 100;
};
