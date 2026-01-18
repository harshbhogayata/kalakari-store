const twilio = require('twilio');

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client only if credentials are provided
let client = null;
if (accountSid && authToken && accountSid.startsWith('AC')) {
  try {
    client = twilio(accountSid, authToken);
  } catch (error) {
    console.warn('Twilio initialization failed:', error.message);
    client = null;
  }
}

// SMS service functions
const smsService = {
  // Send OTP for phone verification
  sendOTP: async (phoneNumber, otp) => {
    if (!client) {
      console.log(`SMS OTP would be sent to ${phoneNumber}: ${otp} (Twilio not configured)`);
      return { success: true, message: 'OTP sent (development mode)' };
    }
    
    try {
      const message = await client.messages.create({
        body: `Your Kalakari verification code is: ${otp}. This code expires in 10 minutes. Do not share this code with anyone.`,
        from: twilioPhoneNumber,
        to: phoneNumber
      });

      console.log('✅ OTP SMS sent successfully:', message.sid);
      return {
        success: true,
        messageId: message.sid,
        message: 'OTP sent successfully'
      };
    } catch (error) {
      console.error('❌ Error sending OTP SMS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Send order confirmation SMS
  sendOrderConfirmation: async (phoneNumber, orderData) => {
    if (!client) {
      console.log(`Order confirmation SMS would be sent to ${phoneNumber} for order ${orderData.orderId} (Twilio not configured)`);
      return { success: true, message: 'Order confirmation sent (development mode)' };
    }
    
    try {
      const message = await client.messages.create({
        body: `🎉 Order Confirmed! Order ID: ${orderData.orderId}\nTotal: ₹${orderData.total}\nEstimated delivery: 3-5 business days\nThank you for choosing Kalakari!`,
        from: twilioPhoneNumber,
        to: phoneNumber
      });

      console.log('✅ Order confirmation SMS sent:', message.sid);
      return {
        success: true,
        messageId: message.sid
      };
    } catch (error) {
      console.error('❌ Error sending order confirmation SMS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Send order shipped notification
  sendOrderShipped: async (phoneNumber, orderData) => {
    if (!client) {
      console.log(`Order shipped SMS would be sent to ${phoneNumber} for order ${orderData.orderId} (Twilio not configured)`);
      return { success: true, message: 'Order shipped notification sent (development mode)' };
    }
    
    try {
      const message = await client.messages.create({
        body: `🚚 Your Kalakari order has shipped! Order ID: ${orderData.orderId}\nTracking: ${orderData.trackingNumber || 'Will be updated soon'}\nExpected delivery: ${orderData.estimatedDelivery || '3-5 business days'}`,
        from: twilioPhoneNumber,
        to: phoneNumber
      });

      console.log('✅ Order shipped SMS sent:', message.sid);
      return {
        success: true,
        messageId: message.sid
      };
    } catch (error) {
      console.error('❌ Error sending order shipped SMS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Send password reset OTP
  sendPasswordResetOTP: async (phoneNumber, otp) => {
    if (!client) {
      console.log(`Password reset SMS would be sent to ${phoneNumber}: ${otp} (Twilio not configured)`);
      return { success: true, message: 'Password reset OTP sent (development mode)' };
    }
    
    try {
      const message = await client.messages.create({
        body: `🔐 Password Reset Code: ${otp}\nThis code expires in 10 minutes.\nIf you didn't request this, please ignore this message.`,
        from: twilioPhoneNumber,
        to: phoneNumber
      });

      console.log('✅ Password reset OTP SMS sent:', message.sid);
      return {
        success: true,
        messageId: message.sid
      };
    } catch (error) {
      console.error('❌ Error sending password reset OTP SMS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Send delivery notification
  sendDeliveryNotification: async (phoneNumber, orderData) => {
    try {
      const message = await client.messages.create({
        body: `✅ Order Delivered! Order ID: ${orderData.orderId}\nThank you for your purchase! Please rate your experience at Kalakari.`,
        from: twilioPhoneNumber,
        to: phoneNumber
      });

      console.log('✅ Delivery notification SMS sent:', message.sid);
      return {
        success: true,
        messageId: message.sid
      };
    } catch (error) {
      console.error('❌ Error sending delivery notification SMS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Send custom SMS
  sendCustomSMS: async (phoneNumber, messageText) => {
    try {
      const message = await client.messages.create({
        body: messageText,
        from: twilioPhoneNumber,
        to: phoneNumber
      });

      console.log('✅ Custom SMS sent:', message.sid);
      return {
        success: true,
        messageId: message.sid
      };
    } catch (error) {
      console.error('❌ Error sending custom SMS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Verify phone number format (Indian numbers)
  validatePhoneNumber: (phoneNumber) => {
    // Remove any spaces or special characters
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Check if it's a valid Indian mobile number
    const indianMobileRegex = /^(\+91|91|0)?[6-9]\d{9}$/;
    
    if (!indianMobileRegex.test(cleaned)) {
      return {
        valid: false,
        message: 'Please enter a valid Indian mobile number'
      };
    }

    // Format to international format
    let formatted = cleaned;
    if (cleaned.startsWith('0')) {
      formatted = '+91' + cleaned.substring(1);
    } else if (cleaned.startsWith('91')) {
      formatted = '+' + cleaned;
    } else if (cleaned.startsWith('+91')) {
      formatted = cleaned;
    } else if (cleaned.length === 10) {
      formatted = '+91' + cleaned;
    }

    return {
      valid: true,
      formatted: formatted
    };
  }
};

module.exports = smsService;
