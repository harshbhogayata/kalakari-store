import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import LanguageSelector from '../LanguageSelector';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const cartItemsCount = getTotalItems();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-brand-base/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-4xl font-serif font-semibold text-brand-ink">
          Kalakari
        </Link>

        {/* Navigation - Desktop */}
        <div className="hidden lg:flex items-center space-x-10 text-lg">
          <Link to="/" className="hover:text-brand-clay transition-colors">
            {t('navigation.home')}
          </Link>
          <Link to="/products" className="hover:text-brand-clay transition-colors">
            {t('navigation.products')}
          </Link>
          <Link to="/artisans" className="hover:text-brand-clay transition-colors">
            {t('navigation.artisans')}
          </Link>
          <Link to="/journal" className="hover:text-brand-clay transition-colors">
            {t('navigation.journal')}
          </Link>
          <Link to="/diwali" className="hover:text-brand-clay transition-colors bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            ✨ Diwali
          </Link>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <LanguageSelector />
          
          {/* Search */}
          <Link to="/search" className="text-brand-ink hover:text-brand-clay transition-colors">
            <Search className="w-6 h-6" />
          </Link>
          
          {/* User Menu */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="text-brand-ink hover:text-brand-clay transition-colors"
              >
                <User className="w-6 h-6" />
              </button>
              
              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                  
                  {/* Dashboard Link */}
                  {user.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  
                  {user.role === 'artisan' && (
                    <Link
                      to="/artisan/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Artisan Dashboard
                    </Link>
                  )}
                  
                  {user.role === 'customer' && (
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      My Dashboard
                    </Link>
                  )}
                  
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  
                  {user.role === 'customer' && (
                    <>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/wishlist"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Wishlist
                      </Link>
                    </>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="text-brand-ink hover:text-brand-clay transition-colors">
              <User className="w-6 h-6" />
            </Link>
          )}
          
          
          {/* Cart */}
          <Link
            to="/cart"
            className="text-brand-ink hover:text-brand-clay transition-colors relative"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-clay text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-brand-base rounded-md p-1"
          >
            <span className="sr-only">Open main menu</span>
            <div className="w-6 h-6 flex flex-col justify-around">
              <span className={`block h-0.5 w-full bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block h-0.5 w-full bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block h-0.5 w-full bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-brand-base/95 backdrop-blur-xl absolute top-full left-0 w-full">
            <div className="px-8 py-6 space-y-4">
              <Link
                to="/"
                className="block text-lg hover:text-brand-clay transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="block text-lg hover:text-brand-clay transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                to="/artisans"
                className="block text-lg hover:text-brand-clay transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Artisans
              </Link>
              <Link
                to="/journal"
                className="block text-lg hover:text-brand-clay transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                The Journal
              </Link>
              <Link
                to="/diwali"
                className="block text-lg hover:text-brand-clay transition-colors bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-full text-center font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                ✨ Diwali Collection
              </Link>
              <Link
                to="/search"
                className="block text-lg hover:text-brand-clay transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Search
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
