const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  artisanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artisan',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalwork',
      'Leather', 'Bamboo', 'Stone', 'Glass', 'Paper', 'Home Decor',
      'Kitchenware', 'Accessories', 'Clothing', 'Footwear', 'Other',
      'Home Decor', 'Kitchenware', 'Accessories', 'Clothing', 'Footwear', 'Other', 'Festive Decor', 'Traditional Crafts', 'Paintings',
      'Diyas & Lamps', 'Decorations', 'Candles', 'Traditional Items'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [1, 'Price must be at least ₹1']
  },
  originalPrice: {
    type: Number,
    min: [1, 'Original price must be at least ₹1']
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  variants: [{
    name: String, // e.g., "Size", "Color"
    options: [String], // e.g., ["Small", "Medium", "Large"]
    price: Number, // Optional price override for this variant
    inventory: {
      total: { type: Number, default: 0 },
      available: { type: Number, default: 0 },
      reserved: { type: Number, default: 0 }
    }
  }],
  inventory: {
    total: {
      type: Number,
      required: [true, 'Total inventory is required'],
      min: [0, 'Inventory cannot be negative']
    },
    available: {
      type: Number,
      required: [true, 'Available inventory is required'],
      min: [0, 'Available inventory cannot be negative']
    },
    reserved: {
      type: Number,
      default: 0,
      min: [0, 'Reserved inventory cannot be negative']
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number,
    unit: { type: String, enum: ['cm', 'inches', 'kg', 'g', 'lbs'] }
  },
  materials: [String],
  colors: [String],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    fragile: { type: Boolean, default: false },
    estimatedDays: { type: Number, default: 7 }
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    orders: { type: Number, default: 0 }
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0, min: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();

  // VALIDATION: Ensure available inventory never exceeds total
  if (this.inventory.available > this.inventory.total) {
    const error = new Error('Available inventory cannot exceed total inventory');
    return next(error);
  }

  // VALIDATION: Ensure reserved inventory doesn't exceed available
  if (this.inventory.reserved > this.inventory.available) {
    const error = new Error('Reserved inventory cannot exceed available inventory');
    return next(error);
  }

  // Calculate discount if original price is provided
  if (this.originalPrice && this.price && this.originalPrice > this.price) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }

  next();
});

// Indexes for better query performance
productSchema.index({ artisanId: 1, isActive: 1 });
productSchema.index({ category: 1, isActive: 1, isApproved: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1, isActive: 1, isApproved: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'stats.orders': -1 });

// Text search index
productSchema.index({
  name: 'text',
  description: 'text',
  materials: 'text',
  tags: 'text'
});

module.exports = mongoose.model('Product', productSchema);

