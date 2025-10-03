const nodemailer = require('nodemailer');

// Email configuration for Titan email (.tech domain)
const emailConfig = {
  host: process.env.EMAIL_HOST || 'mail.titan.email',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for 587/25
  auth: {
    user: process.env.EMAIL_USER || 'noreply@your-domain.tech', // Replace with your Titan email
    pass: process.env.EMAIL_PASS // Your Titan email password
  },
  // Titan email specific settings
  authMethod: 'LOGIN',
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  },
  requireTLS: true,
  pool: true,
  maxConnections: 10,
  maxMessages: 10,
  rateDelta: 1000,
  rateLimit: 5
};

// Create transporters for dual email system
const customerTransporter = nodemailer.createTransport(emailConfig);

// Admin transporter (for order notifications to admin)
const adminTransporter = nodemailer.createTransport({
  ...emailConfig,
  auth: {
    user: process.env.ADMIN_EMAIL || 'Admin@kalakari-shop.tech',
    pass: process.env.ADMIN_EMAIL_PASS || 'BvbbqF#ANJ64uVP'
  }
});

// Email templates
const templates = {
  orderConfirmation: (order) => ({
    subject: `Order Confirmation - ${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Kalakari</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Handcrafted Treasures</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Order Confirmation</h2>
          
          <p>Dear ${order.shippingAddress.name},</p>
          
          <p>Thank you for your order! We're excited to bring you these beautiful handcrafted items.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Order Details</h3>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> ₹${order.pricing.total}</p>
            <p><strong>Payment Method:</strong> ${order.payment.method.toUpperCase()}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Shipping Address</h3>
            <p>${order.shippingAddress.name}<br>
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
            Phone: ${order.shippingAddress.phone}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Order Items</h3>
            ${order.items.map(item => `
              <div style="margin-bottom: 10px;">
                <p><strong>Product:</strong> ${item.name || 'Handcrafted Item'}</p>
                <p><strong>Quantity:</strong> ${item.quantity}</p>
                <p><strong>Price:</strong> ₹${item.price * item.quantity}</p>
              </div>
            `).join('')}
          </div>
          
          <p>We'll send you another email when your order ships. If you have any questions, please don't hesitate to contact us.</p>
          
          <p>Thank you for supporting local artisans!</p>
          
          <p>Best regards,<br>The Kalakari Team</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 Kalakari. All rights reserved.</p>
          <p>This email was sent to ${order.shippingAddress.name} because you placed an order on our website.</p>
        </div>
      </div>
    `
  }),

  orderShipped: (order) => ({
    subject: `Your Order Has Shipped - ${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Kalakari</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Handcrafted Treasures</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Your Order Has Shipped! 🚚</h2>
          
          <p>Dear ${order.shippingAddress.name},</p>
          
          <p>Great news! Your order has been shipped and is on its way to you.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Shipping Details</h3>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Tracking Number:</strong> ${order.tracking?.trackingNumber || 'Will be updated soon'}</p>
            <p><strong>Estimated Delivery:</strong> ${order.tracking?.estimatedDelivery ? new Date(order.tracking.estimatedDelivery).toLocaleDateString() : '3-5 business days'}</p>
          </div>
          
          <p>You can track your package using the tracking number above. If you have any questions, please contact us.</p>
          
          <p>Thank you for your patience and for supporting local artisans!</p>
          
          <p>Best regards,<br>The Kalakari Team</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 Kalakari. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  orderDelivered: (order) => ({
    subject: `Order Delivered - ${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Kalakari</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Handcrafted Treasures</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Order Delivered! ✅</h2>
          
          <p>Dear ${order.shippingAddress.name},</p>
          
          <p>Your order has been successfully delivered. We hope you love your handcrafted treasures!</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Delivery Details</h3>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Delivered On:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Delivery Address:</strong> ${order.shippingAddress.street}, ${order.shippingAddress.city}</p>
          </div>
          
          <p>We'd love to hear about your experience! Please consider leaving a review for the artisan.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Leave a Review</a>
          </div>
          
          <p>Thank you for supporting local artisans and choosing Kalakari!</p>
          
          <p>Best regards,<br>The Kalakari Team</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 Kalakari. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  productApproved: (product, artisan) => ({
    subject: `Product Approved - ${product.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Kalakari</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Handcrafted Treasures</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Product Approved! 🎉</h2>
          
          <p>Dear ${artisan.name},</p>
          
          <p>Great news! Your product has been approved and is now live on our platform.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Product Details</h3>
            <p><strong>Product Name:</strong> ${product.name}</p>
            <p><strong>Category:</strong> ${product.category}</p>
            <p><strong>Price:</strong> ₹${product.price}</p>
            <p><strong>Approved On:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>Your product is now visible to customers and ready for orders. Keep up the great work!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/products/${product._id}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Product</a>
          </div>
          
          <p>Thank you for being part of the Kalakari community!</p>
          
          <p>Best regards,<br>The Kalakari Team</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 Kalakari. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  productRejected: (product, artisan, reason) => ({
    subject: `Product Review - ${product.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Kalakari</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Handcrafted Treasures</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Product Review</h2>
          
          <p>Dear ${artisan.name},</p>
          
          <p>Thank you for submitting your product. After careful review, we need some adjustments before it can be approved.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Product Details</h3>
            <p><strong>Product Name:</strong> ${product.name}</p>
            <p><strong>Category:</strong> ${product.category}</p>
            <p><strong>Review Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #856404;">Feedback</h3>
            <p style="color: #856404;">${reason}</p>
          </div>
          
          <p>Please make the necessary changes and resubmit your product. We're here to help you succeed!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/artisan/products/${product._id}/edit" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Edit Product</a>
          </div>
          
          <p>Thank you for your understanding and for being part of the Kalakari community!</p>
          
          <p>Best regards,<br>The Kalakari Team</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 Kalakari. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  newsletterWelcome: (data) => ({
    subject: 'Welcome to Kalakari Newsletter! 🎨',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Kalakari</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Handcrafted Treasures</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to Our Newsletter! 🎉</h2>
          
          <p>Dear ${data.name},</p>
          
          <p>Thank you for subscribing to the Kalakari newsletter! We're thrilled to have you join our community of craft lovers and art enthusiasts.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">What to Expect</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>✨ Exclusive artisan spotlights and behind-the-scenes stories</li>
              <li>🛍️ Early access to new products and special collections</li>
              <li>🎨 Craft techniques and cultural heritage insights</li>
              <li>🌱 Sustainability tips and eco-friendly practices</li>
              <li>🎁 Special offers and seasonal promotions</li>
            </ul>
          </div>
          
          <p>We promise to keep our emails meaningful and inspiring, sharing the beautiful stories behind each handcrafted piece.</p>
          
          <p>If you have any questions or want to update your preferences, just reply to this email!</p>
          
          <p>Welcome aboard!<br>The Kalakari Team</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 Kalakari. All rights reserved.</p>
          <p>You received this email because you subscribed to our newsletter.</p>
        </div>
      </div>
    `
  }),

  newsletter: (data) => ({
    subject: data.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Kalakari</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Handcrafted Treasures</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">${data.subject}</h2>
          
          <p>Dear ${data.subscriberName},</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; line-height: 1.6;">
            ${data.content.replace(/\n/g, '<br>')}
          </div>
          
          <p>Thank you for being part of our community!</p>
          
          <p>Best regards,<br>The Kalakari Team</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 Kalakari. All rights reserved.</p>
          <p>You received this email because you subscribed to our newsletter.</p>
          ${data.unsubscribeLink ? `<p><a href="${data.unsubscribeLink}" style="color: #666;">Unsubscribe</a> | <a href="${process.env.CLIENT_URL}/newsletter/preferences" style="color: #666;">Update Preferences</a></p>` : ''}
        </div>
      </div>
    `
  }),

  adminOrderNotification: (order) => ({
    subject: `🚨 NEW ORDER RECEIVED - ${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc3545; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">NEW ORDER ALERT! 🛒</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Order Details</h2>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #856404;">ORDER SUMMARY</h3>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Customer:</strong> ${order.shippingAddress.name}</p>
            <p><strong>Email:</strong> ${order.shippingAddress.email}</p>
            <p><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
            <p><strong>Total Amount:</strong> ₹${order.pricing.total}</p>
            <p><strong>Payment Status:</strong> ${order.payment.status}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Shipping Address</h3>
            <p>${order.shippingAddress.name}<br>
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Order Items</h3>
            ${order.items.map(item => `
              <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                <p><strong>Product:</strong> ${item.name || 'Handcrafted Item'}</p>
                <p><strong>Quantity:</strong> ${item.quantity}</p>
                <p><strong>Unit Price:</strong> ₹${item.price}</p>
                <p><strong>Total:</strong> ₹${item.price * item.quantity}</p>
              </div>
            `).join('')}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.API_URL}/admin/orders/${order._id}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">View Order Details</a>
            <a href="${process.env.API_URL}/admin/orders" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Manage Orders</a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 Kalakari. Admin Email - Order Management System</p>
        </div>
      </div>
    `
  })
};

// Email service functions
const emailService = {
  // Send order confirmation email (dual setup)
  sendOrderConfirmation: async (order) => {
    try {
      // 1. Send confirmation to customer (from noreply)
      const customerTemplate = templates.orderConfirmation(order);
      const customerMailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Kalakari'}" <${
          process.env.EMAIL_FROM_ADDRESS || emailConfig.auth.user
        }>`,
        to: order.shippingAddress.email || 'customer@example.com',
        subject: customerTemplate.subject,
        html: customerTemplate.html
      };

      // 2. Send notification to admin (from admin email)
      const adminTemplate = templates.adminOrderNotification(order);
      const adminMailOptions = {
        from: `"Kalakari Admin" <${process.env.ADMIN_EMAIL || 'Admin@kalakari-shop.tech'}>`,
        to: process.env.ADMIN_EMAIL || 'Admin@kalakari-shop.tech',
        subject: adminTemplate.subject,
        html: adminTemplate.html
      };

      // Send both emails
      const customerResult = await customerTransporter.sendMail(customerMailOptions);
      const adminResult = await adminTransporter.sendMail(adminMailOptions);
      
      console.log('✅ Customer confirmation email sent:', customerResult.messageId);
      console.log('📧 Admin notification email sent:', adminResult.messageId);
      
      return { customer: customerResult, admin: adminResult };
    } catch (error) {
      console.error('Error sending order confirmation emails:', error);
      throw error;
    }
  },

  // Send order shipped email
  sendOrderShipped: async (order) => {
    try {
      const template = templates.orderShipped(order);
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Kalakari'}" <${
          process.env.EMAIL_FROM_ADDRESS || emailConfig.auth.user
        }>`,
        to: order.shippingAddress.email || 'customer@example.com',
        subject: template.subject,
        html: template.html
      };

      const result = await customerTransporter.sendMail(mailOptions);
      console.log('Order shipped email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending order shipped email:', error);
      throw error;
    }
  },

  // Send order delivered email
  sendOrderDelivered: async (order) => {
    try {
      const template = templates.orderDelivered(order);
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Kalakari'}" <${
          process.env.EMAIL_FROM_ADDRESS || emailConfig.auth.user
        }>`,
        to: order.shippingAddress.email || 'customer@example.com',
        subject: template.subject,
        html: template.html
      };

      const result = await customerTransporter.sendMail(mailOptions);
      console.log('Order delivered email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending order delivered email:', error);
      throw error;
    }
  },

  // Send product approval email
  sendProductApproved: async (product, artisan) => {
    try {
      const template = templates.productApproved(product, artisan);
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Kalakari'}" <${
          process.env.EMAIL_FROM_ADDRESS || emailConfig.auth.user
        }>`,
        to: artisan.email,
        subject: template.subject,
        html: template.html
      };

      const result = await customerTransporter.sendMail(mailOptions);
      console.log('Product approved email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending product approved email:', error);
      throw error;
    }
  },

  // Send product rejection email
  sendProductRejected: async (product, artisan, reason) => {
    try {
      const template = templates.productRejected(product, artisan, reason);
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Kalakari'}" <${
          process.env.EMAIL_FROM_ADDRESS || emailConfig.auth.user
        }>`,
        to: artisan.email,
        subject: template.subject,
        html: template.html
      };

      const result = await customerTransporter.sendMail(mailOptions);
      console.log('Product rejected email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending product rejected email:', error);
      throw error;
    }
  },

  // Send custom email
  sendEmail: async (to, subject, html) => {
    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Kalakari'}" <${
          process.env.EMAIL_FROM_ADDRESS || emailConfig.auth.user
        }>`,
        to,
        subject,
        html
      };

      const result = await customerTransporter.sendMail(mailOptions);
      console.log('Custom email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending custom email:', error);
      throw error;
    }
  },

  // Send newsletter email
  sendNewsletter: async ({ to, subject, template, data }) => {
    try {
      const templateData = templates[template](data);
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Kalakari'}" <${
          process.env.EMAIL_FROM_ADDRESS || emailConfig.auth.user
        }>`,
        to,
        subject: templateData.subject,
        html: templateData.html
      };

      const result = await customerTransporter.sendMail(mailOptions);
      console.log('Newsletter email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending newsletter email:', error);
      throw error;
    }
  }
};

module.exports = emailService;
