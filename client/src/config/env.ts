/**
 * Environment configuration for the Kalakari application
 * Centralizes all environment variables and provides fallbacks
 */

import { CACHE_TTL, PAGINATION, FILE_SIZE, API_TIMEOUT, VALIDATION } from '../constants';

// Production API host, used when REACT_APP_API_URL is not set at build time
const DEFAULT_PRODUCTION_API = 'https://kalakari-backend.onrender.com';

// Every API call in the app already starts with "/api", so the base URL must be the bare host.
// Tolerate an env value that ends in "/api" (or a trailing slash) instead of producing "/api/api/...".
const normalizeApiBase = (url: string): string => url.trim().replace(/\/+$/, '').replace(/\/api$/, '');

export const config = {
  // API Configuration
  api: {
    // Base URL should NOT include /api since all API calls include it
    baseUrl: normalizeApiBase(process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000'
      : DEFAULT_PRODUCTION_API)),
    devBaseUrl: process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000'
      : '',
    timeout: API_TIMEOUT.DEFAULT,
  },

  // Razorpay Configuration
  razorpay: {
    keyId: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_default',
    scriptUrl: 'https://checkout.razorpay.com/v1/checkout.js',
  },

  // Image Configuration
  images: {
    placeholder: '/images/placeholder-product.webp',
    fallback: '/images/placeholder-product.webp',
    journalPlaceholder: '/images/placeholder-journal.webp',
    artisanPlaceholder: '/images/placeholder-artisan.webp',
    productPlaceholder: '/images/placeholder-product.webp',
    avatarPlaceholder: '/images/placeholder-avatar.webp',
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
