/**
 * Application constants
 */

// Time constants (in milliseconds)
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

// Cache TTL constants
export const CACHE_TTL = {
  SHORT: TIME.MINUTE,
  MEDIUM: 5 * TIME.MINUTE,
  LONG: 30 * TIME.MINUTE,
} as const;

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
  MAX_VISIBLE_PAGES: 5,
} as const;

// File size constants (in bytes)
export const FILE_SIZE = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

// Image dimensions
export const IMAGE_DIMENSIONS = {
  PRODUCT_THUMBNAIL: { width: 300, height: 200 },
  PRODUCT_MAIN: { width: 600, height: 800 },
  AVATAR: { width: 100, height: 100 },
  JOURNAL: { width: 800, height: 400 },
} as const;

// Validation constants
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  EMAIL: {
    MAX_LENGTH: 254,
  },
  PHONE: {
    LENGTH: 10,
    PATTERN: /^[6-9]\d{9}$/,
  },
  PINCODE: {
    LENGTH: 6,
    PATTERN: /^[1-9]\d{5}$/,
  },
} as const;

// API timeout constants
export const API_TIMEOUT = {
  DEFAULT: 30000, // 30 seconds
  UPLOAD: 60000, // 60 seconds
  PAYMENT: 45000, // 45 seconds
} as const;

// Retry constants
export const RETRY = {
  MAX_ATTEMPTS: 3,
  DELAY: 1000, // 1 second
  BACKOFF_MULTIPLIER: 2,
} as const;

// Recently viewed products limit
export const RECENTLY_VIEWED_LIMIT = 20;

// Search history limit
export const SEARCH_HISTORY_LIMIT = 10;

// Rating constants
export const RATING = {
  MIN: 1,
  MAX: 5,
  DEFAULT: 0,
} as const;

// Order status constants
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

// Payment status constants
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

// User roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  ARTISAN: 'artisan',
  ADMIN: 'admin',
} as const;

// Product status
export const PRODUCT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock',
} as const;

// Artisan status
export const ARTISAN_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
} as const;
