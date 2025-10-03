// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'artisan' | 'admin';
  avatar?: string;
  addresses?: Address[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Context types
export interface AuthContextType {
  user: User | null;
  artisan: Artisan | null;
  login: (email: string, password: string) => Promise<User | undefined>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loading: boolean;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variant?: { [key: string]: string }) => void;
  updateQuantity: (productId: string, quantity: number, variant?: { [key: string]: string }) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export interface Address {
  _id: string;
  type: 'home' | 'work' | 'other';
  name: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

// Product types
export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: ProductImage[];
  inventory: {
    total: number;
    available: number;
    reserved: number;
  };
  dimensions?: {
    length: number;
    width: number;
    height: number;
    weight: number;
    unit: string;
  };
  materials?: string[];
  colors?: string[];
  tags?: string[];
  isActive: boolean;
  isApproved: boolean;
  isFeatured: boolean;
  rating?: {
    average: number;
    count: number;
  };
  shipping?: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    fragile: boolean;
    estimatedDays: number;
  };
  stats?: {
    views: number;
    likes: number;
    shares: number;
    orders: number;
  };
  variants?: Array<{
    name: string;
    options: string[];
    price?: number;
    inventory?: {
      total: number;
      available: number;
      reserved: number;
    };
  }>;
  artisanId: string | Artisan;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  url: string;
  alt: string;
}

// Review types
export interface Review {
  _id: string;
  productId: string | Product;
  customerId: string | User;
  rating: number;
  title: string;
  comment: string;
  images?: ReviewImage[];
  isVerified: boolean;
  helpful: {
    count: number;
    users: string[];
  };
  response?: {
    text: string;
    respondedBy: string | User;
    respondedAt: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ReviewImage {
  url: string;
  alt: string;
}

export interface ReviewStats {
  average: number;
  total: number;
  breakdown: Array<{
    _id: number;
    count: number;
  }>;
}

// Artisan types
export interface Artisan {
  _id: string;
  userId: string | User;
  businessName: string;
  description: string;
  craftType: string;
  experience: number;
  state: string;
  city: string;
  address: string;
  pincode: string;
  phone: string;
  profileImage?: string;
  isVerified?: boolean;
  languages?: string[];
  gallery?: string[];
  email: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    website?: string;
  };
  images: {
    profile: string;
    gallery: string[];
  };
  documents: {
    aadhar: string;
    pan: string;
    bankDetails: {
      accountNumber: string;
      ifscCode: string;
      bankName: string;
      accountHolderName: string;
    };
  };
  isApproved: boolean;
  isActive: boolean;
  commissionRate: number;
  totalSales: number;
  rating: {
    average: number;
    count: number;
  };
  createdAt: string;
  updatedAt: string;
  // Additional properties for ArtisanDetail page
  story?: string;
  products?: Array<{
    _id: string;
    name: string;
    price: number;
    image: string;
    category: string;
  }>;
  achievements?: string[];
}

// Order types
export interface Order {
  _id: string;
  orderId: string;
  customerId: string | User;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  pricing: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    discount?: number;
  };
  payment: {
    method: string;
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    transactionId?: string;
  };
  tracking?: {
    number?: string;
    carrier?: string;
    estimatedDelivery?: string;
    actualDelivery?: string;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  timeline: Array<{
    status: string;
    note: string;
    updatedBy: string;
    updatedAt: string;
    timestamp?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string | Product;
  artisanId: string | Artisan;
  quantity: number;
  price: number;
  variant?: { [key: string]: string };
}

// Cart types
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  cartVariant?: { [key: string]: string };
  variant?: { [key: string]: string };
}

// Auth types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  role: 'customer' | 'artisan';
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  current: number;
  pages: number;
  total: number;
}

// Filter types
export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  order?: string;
  rating?: number;
  artisanId?: string;
}

// Wishlist types
export interface WishlistItem {
  _id: string;
  productId: string | Product;
  customerId: string;
  createdAt: string;
}

// Search types
export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  materials?: string[];
  colors?: string[];
  artisanId?: string;
  sortBy?: 'price' | 'rating' | 'createdAt' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Analytics types
export interface AnalyticsData {
  totalUsers: number;
  totalArtisans: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
  topProducts: Product[];
  topArtisans: Artisan[];
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalArtisans: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  activeArtisans: number;
  pendingArtisans: number;
  pendingProducts: number;
  recentOrders: any[];
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalViews: number;
  totalLikes: number;
  activeProducts: number;
  totalSales: number;
  rating: {
    average: number;
    count: number;
  };
  recentOrders: any[];
  topProducts: any[];
}

// Notification types
export interface Notification {
  _id: string;
  userId: string;
  type: 'order' | 'product' | 'review' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
}

// Types are already exported above, no need for duplicate exports
