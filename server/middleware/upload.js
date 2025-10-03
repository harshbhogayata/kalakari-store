const multer = require('multer');
const path = require('path');
const fs = require('fs');

// SECURE: Strict image filter with explicit mime types and extension validation
const imageFilter = (req, file, cb) => {
  // SECURITY: Strict whitelist of allowed image mime types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  // SECURITY: Check mime type against whitelist
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed!'), false);
  }
  
  // SECURITY: Validate file extension as additional protection
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    return cb(new Error('Invalid file extension. Only .jpg, .jpeg, .png, .gif, .webp are allowed!'), false);
  }
  
  // SECURITY: Check file size at filter level (additional protection)
  if (file.size && file.size > 5 * 1024 * 1024) { // 5MB
    return cb(new Error('File size exceeds 5MB limit!'), false);
  }
  
  cb(null, true);
};

// LOCAL STORAGE ONLY - No AWS dependencies
console.log('Using local file storage only');

// LOCAL storage configuration - Enhanced for production use
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadPath = 'uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log('Created uploads directory:', uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // SECURITY: Generate secure filename with user info
    const userId = req.user ? req.user._id.toString() : 'anonymous';
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1E9)}`;
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const filename = `${userId}_${uniqueSuffix}${fileExtension}`;
    
    console.log('Uploading file:', filename);
    cb(null, filename);
  }
});

// Use only local storage
const storage = localStorage;

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  }
});

// Upload middleware functions
const uploadSingle = (fieldName) => upload.single(fieldName);
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);
const uploadFields = (fields) => upload.fields(fields);

// SECURE: Enhanced error handling middleware
const handleUploadError = (error, req, res, next) => {
  // LOG: Security violation attempt
  console.log('Upload Error:', {
    error: error.message,
    code: error.code,
    file: error.field,
    user: req.user ? req.user._id : 'anonymous',
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum allowed size is 5MB.',
          code: 'FILE_TOO_LARGE'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files uploaded. Maximum is 5 files per request.',
          code: 'TOO_MANY_FILES'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected field name in file upload.',
          code: 'INVALID_FIELD'
        });
      case 'LIMIT_PART_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Request contains too many parts.',
          code: 'TOO_MANY_PARTS'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error occurred.',
          code: 'UPLOAD_ERROR'
        });
    }
  }
  
  // SECURITY: Handle file type validation errors
  if (error.message.includes('Only JPEG') || error.message.includes('Invalid file extension')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
      code: 'INVALID_FILE_TYPE'
    });
  }

  // SECURITY: Handle file size validation errors  
  if (error.message.includes('File size exceeds')) {
    return res.status(400).json({
      success: false,
      message: 'File size exceeds the 5MB limit.',
      code: 'FILE_TOO_LARGE'
    });
  }
  
  // GENERIC: Handle other upload errors
  if (error.message) {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${error.message}`,
      code: 'UPLOAD_ERROR'
    });
  }
  
  next(error);
};

// Helper function to get file URL - LOCAL STORAGE ONLY
const getFileUrl = (file) => {
  if (file.path) {
    // Return local file URL for serving static files
    return `${process.env.API_URL || 'http://localhost:5000'}/${file.path}`;
  }
  return null;
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  handleUploadError,
  getFileUrl
};
