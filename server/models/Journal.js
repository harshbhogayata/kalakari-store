const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [100, 'Content must be at least 100 characters']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['artisan-spotlight', 'craft-techniques', 'cultural-heritage', 'sustainability', 'behind-scenes', 'tutorials']
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  featuredImage: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isApproved: {
      type: Boolean,
      default: false
    }
  }],
  meta: {
    title: String,
    description: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Indexes for better performance
journalSchema.index({ title: 'text', content: 'text', tags: 'text' });
journalSchema.index({ category: 1, isPublished: 1, createdAt: -1 });
journalSchema.index({ author: 1, createdAt: -1 });
journalSchema.index({ isFeatured: 1, isPublished: 1, createdAt: -1 });

// Virtual for like count
journalSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
journalSchema.virtual('commentCount').get(function() {
  return this.comments.filter(comment => comment.isApproved).length;
});

// Method to add like
journalSchema.methods.addLike = function(userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove like
journalSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(id => !id.equals(userId));
  return this.save();
};

// Method to add comment
journalSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content,
    isApproved: false
  });
  return this.save();
};

// Method to approve comment
journalSchema.methods.approveComment = function(commentId) {
  const comment = this.comments.id(commentId);
  if (comment) {
    comment.isApproved = true;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to delete comment
journalSchema.methods.deleteComment = function(commentId) {
  this.comments = this.comments.filter(comment => !comment._id.equals(commentId));
  return this.save();
};

module.exports = mongoose.model('Journal', journalSchema);
