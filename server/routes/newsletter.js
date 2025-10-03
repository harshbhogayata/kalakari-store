const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { sendNewsletter } = require('../services/email');

// Newsletter model
const Newsletter = require('../models/Newsletter');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
router.post('/subscribe', [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, name, preferences } = req.body;

    // Check if email already exists
    const existingSubscription = await Newsletter.findOne({ email });
    
    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return res.status(400).json({
          success: false,
          message: 'This email is already subscribed to our newsletter'
        });
      } else {
        // Reactivate subscription
        existingSubscription.isActive = true;
        existingSubscription.name = name || existingSubscription.name;
        existingSubscription.preferences = preferences || existingSubscription.preferences;
        existingSubscription.subscribedAt = new Date();
        await existingSubscription.save();

        return res.json({
          success: true,
          message: 'Welcome back! Your newsletter subscription has been reactivated.'
        });
      }
    }

    // Create new subscription
    const subscription = await Newsletter.create({
      email,
      name,
      preferences: preferences || ['general', 'products', 'artisan-spotlights'],
      isActive: true,
      subscribedAt: new Date()
    });

    // Send welcome email
    try {
      await sendNewsletter({
        to: email,
        subject: 'Welcome to Kalakari Newsletter!',
        template: 'newsletterWelcome',
        data: { name: name || 'there' }
      });
    } catch (emailError) {
      console.error('Welcome email error:', emailError);
      // Don't fail the subscription if welcome email fails
    }

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to our newsletter! Check your email for a welcome message.'
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Subscription failed. Please try again.'
    });
  }
});

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
router.post('/unsubscribe', [
  body('email').isEmail().withMessage('Please provide a valid email address')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const subscription = await Newsletter.findOne({ email });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our newsletter subscription list'
      });
    }

    if (!subscription.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This email is already unsubscribed'
      });
    }

    subscription.isActive = false;
    subscription.unsubscribedAt = new Date();
    await subscription.save();

    res.json({
      success: true,
      message: 'Successfully unsubscribed from our newsletter. We\'re sorry to see you go!'
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Unsubscribe failed. Please try again.'
    });
  }
});

// @desc    Update subscription preferences
// @route   PUT /api/newsletter/preferences
// @access  Private (if user is logged in) or Public (with email verification)
router.put('/preferences', [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('preferences').isArray().withMessage('Preferences must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, preferences, name } = req.body;

    const subscription = await Newsletter.findOne({ email });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our newsletter subscription list'
      });
    }

    if (!subscription.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update preferences for inactive subscription'
      });
    }

    subscription.preferences = preferences;
    if (name) subscription.name = name;
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription preferences updated successfully'
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Update failed. Please try again.'
    });
  }
});

// @desc    Get subscription status
// @route   GET /api/newsletter/status/:email
// @access  Public
router.get('/status/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const subscription = await Newsletter.findOne({ email });
    
    if (!subscription) {
      return res.json({
        success: true,
        data: {
          isSubscribed: false,
          message: 'Email not found in our subscription list'
        }
      });
    }

    res.json({
      success: true,
      data: {
        isSubscribed: subscription.isActive,
        preferences: subscription.preferences,
        subscribedAt: subscription.subscribedAt,
        message: subscription.isActive ? 'Email is subscribed' : 'Email is unsubscribed'
      }
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription status'
    });
  }
});

// @desc    Send newsletter (Admin only)
// @route   POST /api/newsletter/send
// @access  Private (Admin)
router.post('/send', protect, authorize('admin'), [
  body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
  body('content').trim().isLength({ min: 100 }).withMessage('Content must be at least 100 characters'),
  body('preferences').optional().isArray().withMessage('Preferences must be an array'),
  body('testMode').optional().isBoolean().withMessage('Test mode must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { subject, content, preferences, testMode = false } = req.body;

    // Get subscribers based on preferences
    const query = { isActive: true };
    if (preferences && preferences.length > 0) {
      query.preferences = { $in: preferences };
    }

    const subscribers = await Newsletter.find(query);
    
    if (subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active subscribers found for the specified preferences'
      });
    }

    // If test mode, send only to admin
    if (testMode) {
      await sendNewsletter({
        to: req.user.email,
        subject: `[TEST] ${subject}`,
        template: 'newsletter',
        data: {
          subject,
          content,
          subscriberName: req.user.name
        }
      });

      return res.json({
        success: true,
        message: 'Test newsletter sent to admin email',
        data: { recipients: 1 }
      });
    }

    // Send to all subscribers
    let successCount = 0;
    let failCount = 0;

    for (const subscriber of subscribers) {
      try {
        await sendNewsletter({
          to: subscriber.email,
          subject,
          template: 'newsletter',
          data: {
            subject,
            content,
            subscriberName: subscriber.name || 'there',
            unsubscribeLink: `${process.env.CLIENT_URL}/newsletter/unsubscribe?email=${subscriber.email}`
          }
        });
        successCount++;
      } catch (emailError) {
        console.error(`Failed to send newsletter to ${subscriber.email}:`, emailError);
        failCount++;
      }
    }

    res.json({
      success: true,
      message: `Newsletter sent successfully to ${successCount} subscribers`,
      data: {
        totalSubscribers: subscribers.length,
        successful: successCount,
        failed: failCount
      }
    });
  } catch (error) {
    console.error('Send newsletter error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send newsletter'
    });
  }
});

// @desc    Get newsletter subscribers (Admin only)
// @route   GET /api/newsletter/subscribers
// @access  Private (Admin)
router.get('/subscribers', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 50, status = 'active' } = req.query;
    
    const query = {};
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const subscribers = await Newsletter.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Newsletter.countDocuments(query);

    res.json({
      success: true,
      data: {
        subscribers,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscribers'
    });
  }
});

module.exports = router;
