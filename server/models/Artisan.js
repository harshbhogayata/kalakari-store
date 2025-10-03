const mongoose = require('mongoose');

const artisanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  craftType: {
    type: String,
    required: [true, 'Craft type is required'],
    enum: [
      'Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalwork', 
      'Leather', 'Bamboo', 'Stone', 'Glass', 'Paper', 'Other'
    ]
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    enum: [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
      'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
      'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry'
    ]
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  experience: {
    type: Number,
    required: [true, 'Experience in years is required'],
    min: [0, 'Experience cannot be negative']
  },
  languages: [{
    type: String,
    enum: ['Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Urdu', 'Kannada', 'Odia', 'Punjabi', 'Malayalam', 'Assamese', 'Other']
  }],
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },
  documents: {
    aadharNumber: String,
    panNumber: String,
    gstNumber: String
  },
  socialMedia: {
    instagram: String,
    facebook: String,
    website: String
  },
  profileImage: String,
  gallery: [String],
  isVerified: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  commissionRate: {
    type: Number,
    default: 10, // 10% commission
    min: 0,
    max: 30
  },
  totalSales: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
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

// Update timestamp on save and validate artisan integrity
artisanSchema.pre('save', function(next) {
  // VALIDATION: Ensure rating is within valid range
  if (this.rating.average > 5 || this.rating.average < 0) {
    const error = new Error('Artisan rating must be between 0 and 5');
    return next(error);
  }
  
  // VALIDATION: Ensure rating count matches count
  if (this.rating.count < 0) {
    const error = new Error('Rating count cannot be negative');
    return next(error);
  }
  
  // VALIDATION: Experience should be reasonable
  if (this.experience > 50) {
    const error = new Error('Experience cannot exceed 50 years');
    return next(error);
  }
  
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
artisanSchema.index({ craftType: 1, state: 1 });
artisanSchema.index({ isApproved: 1, isVerified: 1 });

module.exports = mongoose.model('Artisan', artisanSchema);

