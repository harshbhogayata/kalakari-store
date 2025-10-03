// Mock authentication for development when MongoDB is not available
const jwt = require('jsonwebtoken');
const { mockComprehensiveProducts } = require('./mock-comprehensive-products');

const mockUsers = [
  // ADMIN (1 user)
  {
    _id: 'admin_1',
    name: 'Admin User',
    email: 'admin@kalakari.shop',
    phone: '9876543210',
    password: 'Kalakari2024!',
    role: 'admin',
    permissions: ['all'],
    createdAt: new Date('2024-01-01').toISOString()
  },
  
  // CUSTOMERS (3 users)
  {
    _id: 'customer_1',
    name: 'Priya Sharma',
    email: 'priya@gmail.com',
    phone: '9876543211',
    password: 'Kalakari2024!',
    role: 'customer',
    permissions: ['browse', 'order', 'review', 'wishlist'],
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    _id: 'customer_2',
    name: 'Arjun Patel',
    email: 'arjun@gmail.com',
    phone: '9876543212',
    password: 'Kalakari2024!',
    role: 'customer',
    permissions: ['browse', 'order', 'review', 'wishlist'],
    createdAt: new Date('2024-02-01').toISOString()
  },
  {
    _id: 'customer_3',
    name: 'Sneha Reddy',
    email: 'sneha@gmail.com',
    phone: '9876543213',
    password: 'Kalakari2024!',
    role: 'customer',
    permissions: ['browse', 'order', 'review', 'wishlist'],
    createdAt: new Date('2024-02-15').toISOString()
  },
  
  // ARTISANS/SELLERS (3 users)
  {
    _id: 'artisan_1',
    name: 'Raj Mehta',
    email: 'raj@craftville.com',
    phone: '9876543214',
    password: 'Kalakari2024!',
    role: 'artisan',
    permissions: ['browse', 'sell', 'manage_products', 'view_orders'],
    shopName: 'Raj\'s Craft Corner',
    description: 'Traditional Rajasthan pottery and handicrafts',
    location: 'Jaipur, Rajasthan',
    verified: true,
    createdAt: new Date('2024-01-10').toISOString()
  },
  {
    _id: 'artisan_2',
    name: 'Meera Singh',
    email: 'meera@handicrafts.com',
    phone: '9876543215',
    password: 'Kalakari2024!',
    role: 'artisan',
    permissions: ['browse', 'sell', 'manage_products', 'view_orders'],
    shopName: 'Meera\'s Textile Studio',
    description: 'Authentic Gujarat textiles and embroidery',
    location: 'Ahmedabad, Gujarat',
    verified: true,
    createdAt: new Date('2024-01-20').toISOString()
  },
  {
    _id: 'artisan_3',
    name: 'Vikram Kumar',
    email: 'vikram@woodcraft.com',
    phone: '9876543216',
    password: 'Kalakari2024!',
    role: 'artisan',
    permissions: ['browse', 'sell', 'manage_products', 'view_orders'],
    shopName: 'Vikram\'s Wood Works',
    description: 'Kerala wooden sculptures and furniture',
    location: 'Kochi, Kerala',
    verified: true,
    createdAt: new Date('2024-02-01').toISOString()
  }
];

// Mock wishlist data - consistent across all endpoints
const mockWishlists = {
  'customer_1': [ // Priya Sharma - 22 products
    'product_1', 'product_5', 'product_12', 'product_18', 'product_25',
    'product_33', 'product_41', 'product_47', 'product_52', 'product_58',
    'product_65', 'product_71', 'product_77', 'product_83', 'product_89',
    'product_95', 'product_101', 'product_107', 'product_113', 'product_119',
    'product_125', 'product_131'
  ],
  'customer_2': [ // Arjun Patel - 15 products
    'product_2', 'product_7', 'product_14', 'product_21', 'product_28',
    'product_35', 'product_42', 'product_49', 'product_56', 'product_63',
    'product_70', 'product_77', 'product_84', 'product_91', 'product_98'
  ],
  'customer_3': [ // Sneha Reddy - 8 products
    'product_3', 'product_10', 'product_17', 'product_24', 'product_31',
    'product_38', 'product_45', 'product_52'
  ],
  'artisan_1': [ // Raj Mehta - 5 products (artisans can also wishlist)
    'product_4', 'product_11', 'product_18', 'product_25', 'product_32'
  ],
  'artisan_2': [ // Meera Singh - 3 products
    'product_6', 'product_13', 'product_20'
  ],
  'artisan_3': [ // Vikram Kumar - 7 products
    'product_8', 'product_15', 'product_22', 'product_29', 'product_36',
    'product_43', 'product_50'
  ],
  'admin_1': [] // Admin has no wishlist
};

// Mock orders data - consistent across all endpoints
const mockOrders = {
  'customer_1': [ // Priya Sharma's orders
    {
      _id: 'order_1',
      orderId: 'ORD-001',
      customerId: 'customer_1',
      items: [
        { productId: 'product_1', name: 'Rajasthan Pottery Bowl', price: 1200, quantity: 1 },
        { productId: 'product_5', name: 'Gujarat Textile Scarf', price: 800, quantity: 1 }
      ],
      pricing: { subtotal: 2000, shipping: 100, tax: 200, total: 2300 },
      status: 'processing',
      paymentStatus: 'paid',
      payment: {
        method: 'razorpay',
        transactionId: 'txn_001',
        amount: 2300,
        currency: 'INR',
        status: 'completed',
        paidAt: new Date(Date.now() - 86400000).toISOString()
      },
      shippingAddress: {
        name: 'Priya Sharma',
        street: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        phone: '9876543211'
      },
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      _id: 'order_2',
      orderId: 'ORD-002',
      customerId: 'customer_1',
      items: [
        { productId: 'product_12', name: 'Kashmir Shawl', price: 3500, quantity: 1 }
      ],
      pricing: { subtotal: 3500, shipping: 0, tax: 350, total: 3850 },
      status: 'shipped',
      paymentStatus: 'paid',
      payment: {
        method: 'razorpay',
        transactionId: 'txn_002',
        amount: 3850,
        currency: 'INR',
        status: 'completed',
        paidAt: new Date(Date.now() - 172800000).toISOString()
      },
      shippingAddress: {
        name: 'Priya Sharma',
        street: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        phone: '9876543211'
      },
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ],
  'customer_2': [ // Arjun Patel's orders
    {
      _id: 'order_3',
      orderId: 'ORD-003',
      customerId: 'customer_2',
      items: [
        { productId: 'product_3', name: 'Kerala Wooden Sculpture', price: 2500, quantity: 1 }
      ],
      pricing: { subtotal: 2500, shipping: 0, tax: 250, total: 2750 },
      status: 'delivered',
      paymentStatus: 'paid',
      payment: {
        method: 'razorpay',
        transactionId: 'txn_003',
        amount: 2750,
        currency: 'INR',
        status: 'completed',
        paidAt: new Date(Date.now() - 259200000).toISOString()
      },
      shippingAddress: {
        name: 'Arjun Patel',
        street: '456 Patel Street',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380001',
        phone: '9876543212'
      },
      createdAt: new Date(Date.now() - 259200000).toISOString()
    }
  ],
  'customer_3': [ // Sneha Reddy's orders
    {
      _id: 'order_4',
      orderId: 'ORD-004',
      customerId: 'customer_3',
      items: [
        { productId: 'product_7', name: 'Madhubani Painting', price: 1800, quantity: 2 }
      ],
      pricing: { subtotal: 3600, shipping: 100, tax: 360, total: 4060 },
      status: 'pending',
      payment: {
        method: 'razorpay',
        transactionId: 'txn_004',
        amount: 4060,
        currency: 'INR',
        status: 'pending',
        paidAt: null
      },
      paymentStatus: 'pending',
      shippingAddress: {
        name: 'Sneha Reddy',
        street: '789 Reddy Nagar',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500001',
        phone: '9876543213'
      },
      createdAt: new Date(Date.now() - 43200000).toISOString()
    }
  ],
  'artisan_1': [], // Artisans don't place orders (they receive them)
  'artisan_2': [],
  'artisan_3': [],
  'admin_1': [] // Admin doesn't place orders
};

// Mock addresses data - consistent across all endpoints
const mockAddresses = {
  'customer_1': [ // Priya Sharma's addresses
    {
      _id: 'addr_1',
      name: 'Priya Sharma',
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '9876543211',
      isDefault: true
    },
    {
      _id: 'addr_2',
      name: 'Priya Sharma',
      street: '456 Office Building',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      phone: '9876543211',
      isDefault: false
    }
  ],
  'customer_2': [ // Arjun Patel's addresses
    {
      _id: 'addr_3',
      name: 'Arjun Patel',
      street: '789 Patel Street',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380001',
      phone: '9876543212',
      isDefault: true
    },
    {
      _id: 'addr_4',
      name: 'Arjun Patel',
      street: '321 Business Park',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395001',
      phone: '9876543212',
      isDefault: false
    }
  ],
  'customer_3': [ // Sneha Reddy's addresses
    {
      _id: 'addr_5',
      name: 'Sneha Reddy',
      street: '654 Reddy Nagar',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
      phone: '9876543213',
      isDefault: true
    }
  ],
  'artisan_1': [ // Raj Mehta's addresses
    {
      _id: 'addr_6',
      name: 'Raj Mehta',
      street: '987 Craft Center',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001',
      phone: '9876543214',
      isDefault: true
    }
  ],
  'artisan_2': [ // Meera Singh's addresses
    {
      _id: 'addr_7',
      name: 'Meera Singh',
      street: '147 Textile Hub',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380001',
      phone: '9876543215',
      isDefault: true
    }
  ],
  'artisan_3': [ // Vikram Kumar's addresses
    {
      _id: 'addr_8',
      name: 'Vikram Kumar',
      street: '258 Wood Workshop',
      city: 'Kochi',
      state: 'Kerala',
      pincode: '682001',
      phone: '9876543216',
      isDefault: true
    }
  ],
  'admin_1': [] // Admin has no addresses
};

// Use comprehensive products (2,900 products across all states and categories)
const mockProducts = mockComprehensiveProducts();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'HARSHBHOGAYATAKALAKARI', {
    expiresIn: '7d',
  });
};

// Simple password comparison for development
const comparePassword = (plainPassword, hashedPassword) => {
  // For development, just compare plain text
  return plainPassword === hashedPassword;
};

const mockAuthMiddleware = (req, res, next) => {
  try {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.token;
  
  if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token, authorization denied',
        code: 'MISSING_TOKEN',
        requestId: req.id
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'HARSHBHOGAYATAKALAKARI');
    const user = mockUsers.find(u => u._id === decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token - user not found',
        code: 'INVALID_TOKEN',
        requestId: req.id
      });
    }

    // Check if user is active
    if (!user.isActive && user.isActive !== undefined) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED',
        requestId: req.id
      });
    }
    
    req.user = { 
      id: user._id, 
      _id: user._id,
      email: user.email, 
      role: user.role,
      name: user.name,
      phone: user.phone,
      permissions: user.permissions,
      createdAt: user.createdAt,
      isActive: user.isActive !== undefined ? user.isActive : true
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    let message = 'Invalid token';
    let code = 'INVALID_TOKEN';
    
    if (error.name === 'TokenExpiredError') {
      message = 'Token expired';
      code = 'TOKEN_EXPIRED';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token format';
      code = 'INVALID_TOKEN_FORMAT';
    }

    return res.status(401).json({ 
      success: false, 
      message,
      code,
      requestId: req.id,
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

module.exports = {
  mockUsers,
  mockProducts,
  mockWishlists,
  mockOrders,
  mockAddresses,
  generateToken,
  mockAuthMiddleware,
  comparePassword
};
