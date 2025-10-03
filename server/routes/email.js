const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const emailService = require('../services/email');

const router = express.Router();

// @desc    Send contact form email
// @route   POST /api/email/contact
// @access  Public
router.post('/contact', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
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

    const { name, email, subject, message } = req.body;

    // Send email to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@kalakari.com';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">New Contact Form Submission</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Contact Details</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Message</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          
          <p>Please respond to this inquiry at your earliest convenience.</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 Kalakari. All rights reserved.</p>
        </div>
      </div>
    `;

    await emailService.sendEmail(adminEmail, `Contact Form: ${subject}`, emailHtml);

    // Send auto-reply to customer
    const autoReplyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Kalakari</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Handcrafted Treasures</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Thank You for Contacting Us!</h2>
          
          <p>Dear ${name},</p>
          
          <p>Thank you for reaching out to us. We have received your message and will get back to you within 24 hours.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Your Message</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          
          <p>In the meantime, feel free to explore our collection of handcrafted treasures!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/products" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Browse Products</a>
          </div>
          
          <p>Best regards,<br>The Kalakari Team</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 Kalakari. All rights reserved.</p>
        </div>
      </div>
    `;

    await emailService.sendEmail(email, 'Thank you for contacting Kalakari', autoReplyHtml);

    res.json({
      success: true,
      message: 'Message sent successfully. We will get back to you soon!'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

// @desc    Send newsletter subscription email
// @route   POST /api/email/newsletter
// @access  Public
router.post('/newsletter', [
  body('email').isEmail().withMessage('Valid email is required')
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

    // Send welcome email
    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Welcome to Kalakari!</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Handcrafted Treasures</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Thank You for Subscribing!</h2>
          
          <p>Dear Subscriber,</p>
          
          <p>Welcome to the Kalakari family! You're now subscribed to our newsletter and will receive updates about:</p>
          
          <ul style="color: #666;">
            <li>New handcrafted products from local artisans</li>
            <li>Special offers and discounts</li>
            <li>Artisan stories and behind-the-scenes content</li>
            <li>Cultural events and workshops</li>
          </ul>
          
          <p>We're excited to share the beauty of traditional craftsmanship with you!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/products" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Explore Our Collection</a>
          </div>
          
          <p>Best regards,<br>The Kalakari Team</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 Kalakari. All rights reserved.</p>
          <p>You can unsubscribe at any time by clicking the link in our emails.</p>
        </div>
      </div>
    `;

    await emailService.sendEmail(email, 'Welcome to Kalakari Newsletter!', welcomeHtml);

    res.json({
      success: true,
      message: 'Successfully subscribed to newsletter!'
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe. Please try again later.'
    });
  }
});

// @desc    Send test email (admin only)
// @route   POST /api/email/test
// @access  Private (Admin)
router.post('/test', protect, authorize('admin'), [
  body('to').isEmail().withMessage('Valid email is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required')
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

    const { to, subject, message } = req.body;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Test Email</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <p>This is a test email from Kalakari.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 Kalakari. All rights reserved.</p>
        </div>
      </div>
    `;

    await emailService.sendEmail(to, subject, emailHtml);

    res.json({
      success: true,
      message: 'Test email sent successfully!'
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email'
    });
  }
});

module.exports = router;
