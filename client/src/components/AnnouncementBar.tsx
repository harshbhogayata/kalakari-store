import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

const AnnouncementBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if announcement was previously closed
    const wasClosed = sessionStorage.getItem('kalakariAnnounceBarClosed') === 'true';
    if (wasClosed) {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('kalakariAnnounceBarClosed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-brand-gold text-brand-ink text-center py-3 px-4 sm:px-6 relative transition-all duration-500">
      <p className="text-sm font-medium">
        Our new Diwali Collection is here! ✨{' '}
        <Link to="/diwali" className="underline font-bold hover:text-white">
          Shop Now
        </Link>
      </p>
      <button
        onClick={handleClose}
        className="absolute top-1/2 right-4 -translate-y-1/2 text-brand-ink hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-brand-base rounded-full p-1"
      >
        <span className="sr-only">Dismiss</span>
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default AnnouncementBar;
