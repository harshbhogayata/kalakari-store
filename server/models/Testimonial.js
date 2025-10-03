const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    minlength: [10, 'Content must be at least 10 characters'],
    maxlength: [1000, 'Content cannot exceed 1000 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  images: [{
    type: String
  }],
  isApproved: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  helpfulVotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  adminNotes: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
testimonialSchema.index({ product: 1, isApproved: 1, createdAt: -1 });
testimonialSchema.index({ user: 1, createdAt: -1 });
testimonialSchema.index({ isFeatured: 1, isApproved: 1, createdAt: -1 });
testimonialSchema.index({ rating: 1, isApproved: 1 });

// Virtual for helpful votes count
testimonialSchema.virtual('helpfulCount').get(function() {
  return this.helpfulVotes.length;
});

// Method to add helpful vote
testimonialSchema.methods.addHelpfulVote = function(userId) {
  if (!this.helpfulVotes.includes(userId)) {
    this.helpfulVotes.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove helpful vote
testimonialSchema.methods.removeHelpfulVote = function(userId) {
  this.helpfulVotes = this.helpfulVotes.filter(id => !id.equals(userId));
  return this.save();
};

// Method to approve testimonial
testimonialSchema.methods.approve = function(adminId) {
  this.isApproved = true;
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  return this.save();
};

// Method to feature testimonial
testimonialSchema.methods.feature = function() {
  this.isFeatured = true;
  return this.save();
};

// Method to unfeature testimonial
testimonialSchema.methods.unfeature = function() {
  this.isFeatured = false;
  return this.save();
};

// Static method to get testimonials by product
testimonialSchema.statics.getByProduct = function(productId, options = {}) {
  const query = { product: productId, isApproved: true };
  
  if (options.featured) {
    query.isFeatured = true;
  }
  
  if (options.rating) {
    query.rating = options.rating;
  }
  
  return this.find(query)
    .populate('user', 'name email')
    .sort({ isFeatured: -1, createdAt: -1 })
    .limit(options.limit || 10)
    .skip(options.skip || 0);
};

// Static method to get average rating for product
testimonialSchema.statics.getAverageRating = function(productId) {
  return this.aggregate([
    { $match: { product: mongoose.Types.ObjectId(productId), isApproved: true } },
    { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
  ]);
};

module.exports = mongoose.model('Testimonial', testimonialSchema);
