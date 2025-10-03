const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  response: {
    text: {
      type: String,
      maxlength: [500, 'Response cannot exceed 500 characters']
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date
    }
  },
  reports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      required: true,
      maxlength: [500, 'Report reason cannot exceed 500 characters']
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    maxlength: [200, 'Admin notes cannot exceed 200 characters']
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

// Indexes for better performance
reviewSchema.index({ productId: 1, status: 1 });
reviewSchema.index({ customerId: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ 'helpful.count': -1 });

// Compound index to prevent duplicate reviews
reviewSchema.index({ productId: 1, customerId: 1 }, { unique: true });

// Update timestamp on save
reviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for average rating (can be used for product aggregation)
reviewSchema.virtual('isHelpful').get(function() {
  return this.helpful.count > 0;
});

// Method to check if user has marked as helpful
reviewSchema.methods.isMarkedHelpful = function(userId) {
  return this.helpful.users.some(id => id.toString() === userId.toString());
};

// Method to check if user has reported
reviewSchema.methods.isReported = function(userId) {
  return this.reports.some(report => report.reportedBy.toString() === userId.toString());
};

// Static method to get product rating stats
reviewSchema.statics.getProductStats = async function(productId) {
  const stats = await this.aggregate([
    { $match: { productId, status: 'approved' } },
    {
      $group: {
        _id: null,
        average: { $avg: '$rating' },
        total: { $sum: 1 },
        breakdown: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      average: 0,
      total: 0,
      breakdown: [1, 2, 3, 4, 5].map(rating => ({ _id: rating, count: 0 }))
    };
  }

  const breakdown = [1, 2, 3, 4, 5].map(rating => ({
    _id: rating,
    count: stats[0].breakdown.filter(r => r === rating).length
  }));

  return {
    average: stats[0].average,
    total: stats[0].total,
    breakdown
  };
};

module.exports = mongoose.model('Review', reviewSchema);