/**
 * API-related type definitions
 */

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Pagination response
export interface PaginatedResponse<T = any> {
  products: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Error response
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Upload response
export interface UploadResponse {
  imageUrl: string;
  filename?: string;
  size?: number;
}

// Payment response
export interface PaymentResponse {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}

// Order creation request
export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
    variant?: Record<string, string>;
  }>;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  billingAddress?: {
    name: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  paymentMethod: string;
  paymentId?: string;
  notes?: string;
}

// Search filters
export interface SearchFilters {
  search?: string;
  category?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  materials?: string[];
  colors?: string[];
  inStock?: boolean;
  featured?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Form validation error
export interface ValidationError {
  field: string;
  message: string;
}

// File upload error
export interface UploadError {
  code: string;
  message: string;
  field?: string;
}
