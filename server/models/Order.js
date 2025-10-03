const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  artisanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  variant: {
    type: Map,
    of: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: {
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  billingAddress: {
    type: {
      type: String,
      enum: ['home', 'work', 'other']
    },
    name: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    phone: String
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    shipping: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'cod', 'wallet'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paymentId: String,
    paidAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    comment: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tracking: {
    carrier: String,
    trackingNumber: String,
    trackingUrl: String,
    estimatedDelivery: Date,
    actualDelivery: Date
  },
  notes: {
    customer: String,
    admin: String
  },
  cancellation: {
    reason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    refundStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed']
    }
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

// Indexes
// orderId index is automatically created by unique: true constraint
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ 'items.artisanId': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });

// Update timestamp on save and validate order integrity
orderSchema.pre('save', function(next) {
  // VALIDATION: Ensure order has at least one item
  if (!this.items || this.items.length === 0) {
    const error = new Error('Order must have at least one item');
    return next(error);
  }
  
  // VALIDATION: Ensure all items have required fields
  for (const item of this.items) {
    if (!item.productId || !item.quantity || !item.price) {
      const error = new Error('Order item must have productId, quantity, and price');
      return next(error);
    }
    if (item.quantity <= 0) {
      const error = new Error('Order item quantity must be greater than 0');
      return next(error);
    }
  }
  
  // VALIDATION: Ensure shipping address is complete
  if (!this.shippingAddress || !this.shippingAddress.name || !this.shippingAddress.street) {
    const error = new Error('Shipping address must be complete');
    return next(error);
  }
  
  this.updatedAt = Date.now();
  next();
});

// Generate order ID
orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderId = `ORD${year}${month}${day}${random}`;
  }
  next();
});

// Virtual for order total items
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Method to add status history
orderSchema.methods.addStatusHistory = function(status, comment, updatedBy) {
  this.statusHistory.push({
    status,
    comment,
    updatedBy,
    updatedAt: new Date()
  });
  this.status = status;
};

// Method to cancel order
orderSchema.methods.cancelOrder = async function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancellation = {
    reason,
    cancelledBy,
    cancelledAt: new Date(),
    refundStatus: this.payment.method === 'cod' ? 'completed' : 'pending'
  };
  
  this.addStatusHistory('cancelled', reason, cancelledBy);
  await this.save();
};

// Static method to get order stats
orderSchema.statics.getOrderStats = async function(query = {}) {
  const stats = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: '$pricing.total' }
      }
    }
  ]);

  return stats;
};

module.exports = mongoose.model('Order', orderSchema);