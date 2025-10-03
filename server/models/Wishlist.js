const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
wishlistSchema.index({ customerId: 1, productId: 1 }, { unique: true });
wishlistSchema.index({ customerId: 1 });

module.exports = mongoose.model('Wishlist', wishlistSchema);
