/**
 * Environment configuration for the Kalakari application
 * Centralizes all environment variables and provides fallbacks
 */

import { CACHE_TTL, PAGINATION, FILE_SIZE, API_TIMEOUT, VALIDATION } from '../constants';

export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000/api' 
      : '/api'),
    devBaseUrl: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000/api' 
      : '/api',
    timeout: API_TIMEOUT.DEFAULT,
  },

  // Razorpay Configuration
  razorpay: {
    keyId: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_default',
    scriptUrl: 'https://checkout.razorpay.com/v1/checkout.js',
  },

  // Image Configuration
  images: {
    placeholder: 'https://placehold.co/600x400/EAE5DE/3A2E24?text=Image',
    fallback: 'https://via.placeholder.com/400x300',
    journalPlaceholder: 'https://placehold.co/800x400/EAE5DE/3A2E24?text=Journal+Article',
    artisanPlaceholder: 'https://placehold.co/600x700/EAE5DE/3A2E24?text=Artisan',
    productPlaceholder: 'https://placehold.co/600x800/EAE5DE/3A2E24?text=Product',
    avatarPlaceholder: 'https://placehold.co/100x100/EAE5DE/3A2E24?text=Avatar',
  },

  // Social Media Links
  social: {
    facebook: 'https://facebook.com/kalakari.shop',
    instagram: 'https://instagram.com/kalakari.shop',
    twitter: 'https://twitter.com/kalakari.shop',
  },

  // Application Configuration
  app: {
    name: 'Kalakari',
    version: '1.0.0',
    description: 'Indian Handicrafts E-commerce Platform',
    maxFileSize: FILE_SIZE.MAX_IMAGE_SIZE,
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImagesPerUpload: 5,
  },

  // Cache Configuration
  cache: {
    defaultTTL: CACHE_TTL.MEDIUM,
    longTTL: CACHE_TTL.LONG,
    shortTTL: CACHE_TTL.SHORT,
  },

  // Pagination Configuration
  pagination: {
    defaultPageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    maxPageSize: PAGINATION.MAX_PAGE_SIZE,
    maxVisiblePages: PAGINATION.MAX_VISIBLE_PAGES,
  },

  // Validation Configuration
  validation: {
    password: {
      minLength: VALIDATION.PASSWORD.MIN_LENGTH,
      maxLength: VALIDATION.PASSWORD.MAX_LENGTH,
    },
    name: {
      minLength: VALIDATION.NAME.MIN_LENGTH,
      maxLength: VALIDATION.NAME.MAX_LENGTH,
    },
    phone: {
      pattern: VALIDATION.PHONE.PATTERN,
      message: 'Please enter a valid Indian phone number',
    },
    email: {
      pattern: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      message: 'Please enter a valid email address',
    },
  },

  // Feature Flags
  features: {
    enableReviews: true,
    enableWishlist: true,
    enableSocialSharing: true,
    enableImageZoom: true,
    enableRecommendations: true,
    enableSearchHistory: true,
  },
} as const;

export default config;
