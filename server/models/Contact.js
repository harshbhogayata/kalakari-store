const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters'],
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  category: {
    type: String,
    enum: ['general', 'support', 'sales', 'partnership', 'artisan', 'complaint'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved', 'closed'],
    default: 'new'
  },
  response: {
    type: String,
    trim: true,
    maxlength: [2000, 'Response cannot exceed 2000 characters']
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responseSentAt: {
    type: Date
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better performance
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ category: 1, status: 1 });
contactSchema.index({ email: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ updatedBy: 1 });

// Virtual for response time
contactSchema.virtual('responseTime').get(function() {
  if (this.responseSentAt && this.createdAt) {
    return Math.floor((this.responseSentAt - this.createdAt) / (1000 * 60 * 60)); // hours
  }
  return null;
});

// Method to mark as resolved
contactSchema.methods.resolve = function(adminId, response = '') {
  this.status = 'resolved';
  this.updatedBy = adminId;
  if (response) {
    this.response = response;
    this.responseSentAt = new Date();
  }
  return this.save();
};

// Method to close contact
contactSchema.methods.close = function(adminId, notes = '') {
  this.status = 'closed';
  this.updatedBy = adminId;
  if (notes) {
    this.adminNotes = notes;
  }
  return this.save();
};

// Method to assign priority
contactSchema.methods.setPriority = function(priority) {
  this.priority = priority;
  return this.save();
};

// Method to add tag
contactSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove tag
contactSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

// Static method to get stats
contactSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
        avgResponseTime: {
          $avg: {
            $cond: [
              { $and: ['$responseSentAt', '$createdAt'] },
              { $divide: [{ $subtract: ['$responseSentAt', '$createdAt'] }, 1000 * 60 * 60] }, // hours
              null
            ]
          }
        }
      }
    }
  ]);
};

// Static method to get contacts by status
contactSchema.statics.getByStatus = function(status, limit = 10) {
  return this.find({ status })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Pre-save middleware to set priority based on category
contactSchema.pre('save', function(next) {
  if (this.category === 'complaint' && this.priority === 'medium') {
    this.priority = 'high';
  } else if (this.category === 'artisan' && this.priority === 'medium') {
    this.priority = 'high';
  }
  next();
});

module.exports = mongoose.model('Contact', contactSchema);
