import React, { useState } from 'react';
import { X, Mail, CheckCircle } from 'lucide-react';

interface NotifyMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

const NotifyMeModal: React.FC<NotifyMeModalProps> = ({ isOpen, onClose, productName }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
      setEmail('');
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-brand-ink/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="bg-brand-base rounded-lg shadow-2xl w-full max-w-md p-8 relative transition-all duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-brand-ink transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-brand-base rounded-full p-1"
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </button>

        {!isSubmitted ? (
          <div>
            <div className="text-center">
              <Mail className="h-12 w-12 text-brand-gold mx-auto mb-4" />
              <h2 className="text-2xl font-serif mb-2">Be the first to know!</h2>
              <p className="text-gray-600 mb-6">
                {productName 
                  ? `"${productName}" is currently sold out. Enter your email to be notified when it's back in stock.`
                  : 'This item is currently sold out. Enter your email to be notified when it\'s back in stock.'
                }
              </p>
            </div>
            <form onSubmit={handleSubmit}>
              <label htmlFor="email" className="sr-only">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition"
              />
              <button
                type="submit"
                className="w-full bg-brand-clay text-white font-bold py-3 px-4 rounded-md mt-4 hover:bg-brand-clay-dark transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-brand-base"
              >
                Notify Me
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-serif mb-2">You're on the list!</h2>
            <p className="text-gray-600">
              Thank you! We'll send you an email as soon as this item is available again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotifyMeModal;
