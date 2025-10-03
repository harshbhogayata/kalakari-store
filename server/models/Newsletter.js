const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  preferences: [{
    type: String,
    enum: ['general', 'products', 'artisan-spotlights', 'craft-techniques', 'cultural-heritage', 'sustainability', 'promotions'],
    default: ['general', 'products']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  },
  source: {
    type: String,
    enum: ['website', 'signup-form', 'checkout', 'manual', 'import'],
    default: 'website'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  lastEmailSent: {
    type: Date
  },
  emailCount: {
    type: Number,
    default: 0
  },
  bounceCount: {
    type: Number,
    default: 0
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockReason: {
    type: String,
    enum: ['bounced', 'complaint', 'manual', 'spam']
  }
}, {
  timestamps: true
});

// Indexes for better performance
// email index is automatically created by unique: true constraint
newsletterSchema.index({ isActive: 1, subscribedAt: -1 });
newsletterSchema.index({ preferences: 1, isActive: 1 });
newsletterSchema.index({ isBlocked: 1, isActive: 1 });

// Virtual for subscription duration
newsletterSchema.virtual('subscriptionDuration').get(function() {
  const endDate = this.unsubscribedAt || new Date();
  return Math.floor((endDate - this.subscribedAt) / (1000 * 60 * 60 * 24)); // days
});

// Method to unsubscribe
newsletterSchema.methods.unsubscribe = function(reason = 'manual') {
  this.isActive = false;
  this.unsubscribedAt = new Date();
  return this.save();
};

// Method to reactivate
newsletterSchema.methods.reactivate = function() {
  this.isActive = true;
  this.unsubscribedAt = undefined;
  this.isBlocked = false;
  this.blockReason = undefined;
  return this.save();
};

// Method to block
newsletterSchema.methods.block = function(reason = 'manual') {
  this.isBlocked = true;
  this.blockReason = reason;
  this.isActive = false;
  return this.save();
};

// Method to record email sent
newsletterSchema.methods.recordEmailSent = function() {
  this.lastEmailSent = new Date();
  this.emailCount += 1;
  return this.save();
};

// Method to record bounce
newsletterSchema.methods.recordBounce = function() {
  this.bounceCount += 1;
  if (this.bounceCount >= 3) {
    this.block('bounced');
  }
  return this.save();
};

// Static method to get active subscribers by preferences
newsletterSchema.statics.getActiveSubscribers = function(preferences = []) {
  const query = { isActive: true, isBlocked: false };
  
  if (preferences.length > 0) {
    query.preferences = { $in: preferences };
  }
  
  return this.find(query).sort({ subscribedAt: -1 });
};

// Static method to get subscription stats
newsletterSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: ['$isActive', 1, 0] } },
        inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
        blocked: { $sum: { $cond: ['$isBlocked', 1, 0] } },
        avgEmailCount: { $avg: '$emailCount' }
      }
    }
  ]);
};

// Pre-save middleware to normalize email
newsletterSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

module.exports = mongoose.model('Newsletter', newsletterSchema);
