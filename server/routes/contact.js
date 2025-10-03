const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { sendEmail } = require('../services/email');

// Contact model
const Contact = require('../models/Contact');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters'),
  body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid Indian phone number'),
  body('category').optional().isIn(['general', 'support', 'sales', 'partnership', 'artisan', 'complaint']).withMessage('Invalid category')
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

    const { name, email, subject, message, phone, category = 'general' } = req.body;

    // Create contact record
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      phone,
      category,
      status: 'new',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Send notification email to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@kalakari.com';
      const emailSubject = `New Contact Form Submission: ${subject}`;
      const emailContent = `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>IP Address:</strong> ${req.ip}</p>
      `;

      await sendEmail(adminEmail, emailSubject, emailContent);
    } catch (emailError) {
      console.error('Error sending admin notification:', emailError);
      // Don't fail the contact form submission if email fails
    }

    // Send auto-reply to user
    try {
      const autoReplySubject = 'Thank you for contacting Kalakari';
      const autoReplyContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333; margin: 0;">Kalakari</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Handcrafted Treasures</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Thank You for Contacting Us!</h2>
            
            <p>Dear ${name},</p>
            
            <p>Thank you for reaching out to us! We have received your message and will get back to you within 24-48 hours.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Your Message Details</h3>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Category:</strong> ${category}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p>In the meantime, feel free to:</p>
            <ul style="color: #666; line-height: 1.6;">
              <li>Browse our <a href="${process.env.CLIENT_URL}/products">handcrafted products</a></li>
              <li>Read our <a href="${process.env.CLIENT_URL}/journal">artisan stories</a></li>
              <li>Follow us on social media for updates</li>
            </ul>
            
            <p>We appreciate your interest in supporting local artisans!</p>
            
            <p>Best regards,<br>The Kalakari Team</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>© 2024 Kalakari. All rights reserved.</p>
            <p>This is an automated response to your contact form submission.</p>
          </div>
        </div>
      `;

      await sendEmail(email, autoReplySubject, autoReplyContent);
    } catch (emailError) {
      console.error('Error sending auto-reply:', emailError);
      // Don't fail the contact form submission if auto-reply fails
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your message! We will get back to you within 24-48 hours.',
      data: { 
        contactId: contact._id,
        reference: `CONT-${contact._id.toString().slice(-8).toUpperCase()}`
      }
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit your message. Please try again.'
    });
  }
});

// @desc    Get contact submissions (Admin only)
// @route   GET /api/contact
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contact submissions'
    });
  }
});

// @desc    Get single contact submission
// @route   GET /api/contact/:id
// @access  Private (Admin)
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.json({
      success: true,
      data: { contact }
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contact submission'
    });
  }
});

// @desc    Update contact status
// @route   PUT /api/contact/:id
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), [
  body('status').optional().isIn(['new', 'in-progress', 'resolved', 'closed']).withMessage('Invalid status'),
  body('response').optional().trim().isLength({ max: 2000 }).withMessage('Response cannot exceed 2000 characters'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
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

    const { status, response, notes } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    // Update contact
    if (status) contact.status = status;
    if (response) contact.response = response;
    if (notes) contact.adminNotes = notes;
    
    contact.updatedBy = req.user._id;
    await contact.save();

    // Send response email to user if response is provided
    if (response) {
      try {
        const responseSubject = `Re: ${contact.subject}`;
        const responseContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 20px; text-align: center;">
              <h1 style="color: #333; margin: 0;">Kalakari</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Handcrafted Treasures</p>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #333; margin-bottom: 20px;">Response to Your Inquiry</h2>
              
              <p>Dear ${contact.name},</p>
              
              <p>Thank you for contacting us. Here's our response to your inquiry:</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; line-height: 1.6;">
                ${response.replace(/\n/g, '<br>')}
              </div>
              
              <p>If you have any further questions, please don't hesitate to contact us again.</p>
              
              <p>Best regards,<br>The Kalakari Team</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>© 2024 Kalakari. All rights reserved.</p>
            </div>
          </div>
        `;

        await sendEmail(contact.email, responseSubject, responseContent);
        contact.responseSentAt = new Date();
        await contact.save();
      } catch (emailError) {
        console.error('Error sending response email:', emailError);
        // Don't fail the update if email fails
      }
    }

    res.json({
      success: true,
      message: 'Contact submission updated successfully',
      data: { contact }
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact submission'
    });
  }
});

// @desc    Delete contact submission
// @route   DELETE /api/contact/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact submission deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact submission'
    });
  }
});

module.exports = router;
