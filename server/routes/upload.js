const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple, handleUploadError } = require('../middleware/upload');
const { getFileUrl } = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// Single file upload - PROTECTED
router.post('/single', protect, uploadSingle('image'), handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileUrl = getFileUrl(req.file);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

// Multiple files upload - PROTECTED
router.post('/multiple', protect, uploadMultiple('images', 5), handleUploadError, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const files = req.files.map(file => ({
      filename: file.originalname,
      url: getFileUrl(file),
      size: file.size,
      mimetype: file.mimetype
    }));

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: {
        files,
        count: files.length
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

// Product image upload - PROTECTED (Artisan only)
router.post('/product', protect, uploadSingle('productImage'), handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No product image uploaded'
      });
    }

    const fileUrl = getFileUrl(req.file);

    res.json({
      success: true,
      message: 'Product image uploaded successfully',
      data: {
        imageUrl: fileUrl,
        filename: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Product upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Product image upload failed',
      error: error.message
    });
  }
});

// Artisan profile image upload - PROTECTED
router.post('/artisan', protect, uploadSingle('profileImage'), handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No profile image uploaded'
      });
    }

    const fileUrl = getFileUrl(req.file);

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        imageUrl: fileUrl,
        filename: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Artisan upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile image upload failed',
      error: error.message
    });
  }
});

// Review image upload - PROTECTED
router.post('/review', protect, uploadMultiple('reviewImages', 3), handleUploadError, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No review images uploaded'
      });
    }

    const images = req.files.map(file => getFileUrl(file));

    res.json({
      success: true,
      message: 'Review images uploaded successfully',
      data: {
        imageUrls: images,
        count: images.length
      }
    });
  } catch (error) {
    console.error('Review upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Review images upload failed',
      error: error.message
    });
  }
});

module.exports = router;