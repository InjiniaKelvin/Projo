/**
 * Notification Service
 * 
 * This service handles all types of notifications including:
 * - SMS notifications via Twilio/Africa's Talking
 * - Email notifications
 * - Push notifications
 * - In-app notifications
 */

const axios = require('axios');
const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');
const User = require('../models/User');

// SMS Service Configuration (Africa's Talking for Kenya)
const AT_CONFIG = {
  apiKey: process.env.AFRICAS_TALKING_API_KEY,
  username: process.env.AFRICAS_TALKING_USERNAME,
  baseUrl: 'https://api.africastalking.com/version1'
};

// Email Configuration
const emailTransporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send SMS notification
 */
const sendSMS = async (phoneNumber, message, options = {}) => {
  try {
    // Format phone number for Kenya
    let formattedNumber = phoneNumber;
    if (phoneNumber.startsWith('0')) {
      formattedNumber = '+254' + phoneNumber.substring(1);
    } else if (!phoneNumber.startsWith('+')) {
      formattedNumber = '+254' + phoneNumber;
    }

    const response = await axios.post(
      `${AT_CONFIG.baseUrl}/messaging`,
      {
        username: AT_CONFIG.username,
        to: formattedNumber,
        message: message,
        from: options.shortCode || 'QuickFix'
      },
      {
        headers: {
          'ApiKey': AT_CONFIG.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return {
      success: true,
      messageId: response.data.SMSMessageData.Recipients[0].messageId,
      cost: response.data.SMSMessageData.Recipients[0].cost
    };
  } catch (error) {
    console.error('SMS sending error:', error);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

/**
 * Send email notification
 */
const sendEmail = async (to, subject, htmlContent, options = {}) => {
  try {
    const mailOptions = {
      from: `${options.senderName || 'QuickFix'} <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
      ...options
    };

    const info = await emailTransporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Create in-app notification
 */
const createInAppNotification = async (userId, title, message, data = {}) => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type: data.type || 'info',
      data,
      priority: data.priority || 'normal'
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('In-app notification error:', error);
    throw error;
  }
};

/**
 * Send booking confirmation notification
 */
const sendBookingConfirmation = async (booking, type = 'created') => {
  try {
    const client = await User.findById(booking.clientId);
    const technician = booking.technicianId ? await User.findById(booking.technicianId) : null;

    const templates = {
      created: {
        sms: `QuickFix: Your ${booking.serviceType} service request #${booking._id.toString().slice(-6)} has been created. We're finding a technician for you.`,
        email: {
          subject: 'Service Request Confirmed - QuickFix',
          html: generateBookingEmailTemplate(booking, client, 'created')
        },
        inApp: {
          title: 'Booking Confirmed',
          message: `Your ${booking.serviceType} service request has been created successfully.`
        }
      },
      assigned: {
        sms: `QuickFix: Technician ${technician?.firstName} has been assigned to your ${booking.serviceType} job. ETA: ${booking.estimatedArrival} mins. Contact: ${technician?.phoneNumber}`,
        email: {
          subject: 'Technician Assigned - QuickFix',
          html: generateBookingEmailTemplate(booking, client, 'assigned', technician)
        },
        inApp: {
          title: 'Technician Assigned',
          message: `${technician?.firstName} ${technician?.lastName} will handle your ${booking.serviceType} service.`
        }
      },
      in_progress: {
        sms: `QuickFix: Your ${booking.serviceType} service has started. Technician: ${technician?.firstName}`,
        email: {
          subject: 'Service Started - QuickFix',
          html: generateBookingEmailTemplate(booking, client, 'in_progress', technician)
        },
        inApp: {
          title: 'Service Started',
          message: `Your ${booking.serviceType} service is now in progress.`
        }
      },
      completed: {
        sms: `QuickFix: Your ${booking.serviceType} service is complete! Please rate your experience in the app.`,
        email: {
          subject: 'Service Completed - QuickFix',
          html: generateBookingEmailTemplate(booking, client, 'completed', technician)
        },
        inApp: {
          title: 'Service Completed',
          message: `Your ${booking.serviceType} service has been completed successfully.`
        }
      }
    };

    const template = templates[type];
    if (!template) return;

    // Send SMS if user has phone number
    if (client.phoneNumber && client.preferences?.smsNotifications !== false) {
      await sendSMS(client.phoneNumber, template.sms);
    }

    // Send email if user has email
    if (client.email && client.preferences?.emailNotifications !== false) {
      await sendEmail(client.email, template.email.subject, template.email.html);
    }

    // Create in-app notification
    await createInAppNotification(
      client._id,
      template.inApp.title,
      template.inApp.message,
      {
        type: 'booking',
        bookingId: booking._id,
        status: type
      }
    );

    // If technician assigned, notify technician too
    if (technician && type === 'created') {
      const techTemplate = {
        sms: `QuickFix: New ${booking.serviceType} job assigned! Client: ${client.firstName}, Location: ${booking.location.address || 'Location provided'}, Fee: $${booking.estimatedPrice}`,
        inApp: {
          title: 'New Job Assigned',
          message: `New ${booking.serviceType} job from ${client.firstName} ${client.lastName}`
        }
      };

      if (technician.phoneNumber) {
        await sendSMS(technician.phoneNumber, techTemplate.sms);
      }

      await createInAppNotification(
        technician._id,
        techTemplate.inApp.title,
        techTemplate.inApp.message,
        {
          type: 'job',
          bookingId: booking._id,
          priority: booking.urgency === 'emergency' ? 'high' : 'normal'
        }
      );
    }
  } catch (error) {
    console.error('Send booking confirmation error:', error);
  }
};

/**
 * Send payment notification
 */
const sendPaymentNotification = async (userId, transaction, type = 'received') => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const templates = {
      received: {
        sms: `QuickFix: Payment of $${transaction.amount} received successfully. New balance: Check app for details.`,
        email: {
          subject: 'Payment Received - QuickFix',
          html: generatePaymentEmailTemplate(user, transaction, 'received')
        },
        inApp: {
          title: 'Payment Received',
          message: `You received $${transaction.amount} for your service.`
        }
      },
      sent: {
        sms: `QuickFix: Payment of $${Math.abs(transaction.amount)} processed successfully. Transaction ID: ${transaction._id.toString().slice(-8)}`,
        email: {
          subject: 'Payment Processed - QuickFix',
          html: generatePaymentEmailTemplate(user, transaction, 'sent')
        },
        inApp: {
          title: 'Payment Processed',
          message: `Your payment of $${Math.abs(transaction.amount)} has been processed.`
        }
      },
      escrow: {
        sms: `QuickFix: $${transaction.amount} has been placed in escrow for your service. Funds will be released upon completion.`,
        inApp: {
          title: 'Funds in Escrow',
          message: `$${transaction.amount} is being held in escrow for your service.`
        }
      }
    };

    const template = templates[type];
    if (!template) return;

    // Send notifications
    if (user.phoneNumber && template.sms) {
      await sendSMS(user.phoneNumber, template.sms);
    }

    if (user.email && template.email) {
      await sendEmail(user.email, template.email.subject, template.email.html);
    }

    await createInAppNotification(
      userId,
      template.inApp.title,
      template.inApp.message,
      {
        type: 'payment',
        transactionId: transaction._id,
        amount: transaction.amount
      }
    );
  } catch (error) {
    console.error('Send payment notification error:', error);
  }
};

/**
 * Send emergency alert
 */
const sendEmergencyAlert = async (booking, emergencyType, description) => {
  try {
    // Send to all admins
    const admins = await User.find({ role: 'admin', isActive: true });
    
    const emergencyMessage = `EMERGENCY ALERT: ${emergencyType} reported for booking #${booking._id.toString().slice(-6)}. Description: ${description}. Client: ${booking.clientId.firstName}, Location: ${booking.location.address || 'Location provided'}`;

    for (const admin of admins) {
      // SMS to admins
      if (admin.phoneNumber) {
        await sendSMS(admin.phoneNumber, emergencyMessage);
      }

      // Email to admins
      if (admin.email) {
        await sendEmail(
          admin.email,
          'EMERGENCY ALERT - QuickFix',
          generateEmergencyEmailTemplate(booking, emergencyType, description)
        );
      }

      // In-app notification
      await createInAppNotification(
        admin._id,
        'Emergency Alert',
        emergencyMessage,
        {
          type: 'emergency',
          bookingId: booking._id,
          priority: 'critical'
        }
      );
    }
  } catch (error) {
    console.error('Send emergency alert error:', error);
  }
};

/**
 * Generate booking email template
 */
const generateBookingEmailTemplate = (booking, client, status, technician = null) => {
  const statusMessages = {
    created: 'Your service request has been confirmed and we are finding the best technician for you.',
    assigned: `Great news! ${technician?.firstName} ${technician?.lastName} has been assigned to your service.`,
    in_progress: 'Your technician has started working on your service request.',
    completed: 'Your service has been completed successfully!'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0d6efd; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .booking-details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>QuickFix Service Update</h1>
            </div>
            <div class="content">
                <h2>Hello ${client.firstName},</h2>
                <p>${statusMessages[status]}</p>
                
                <div class="booking-details">
                    <h3>Booking Details</h3>
                    <p><strong>Service:</strong> ${booking.serviceType}</p>
                    <p><strong>Booking ID:</strong> #${booking._id.toString().slice(-6)}</p>
                    <p><strong>Status:</strong> ${status.replace('_', ' ').toUpperCase()}</p>
                    <p><strong>Estimated Price:</strong> $${booking.estimatedPrice}</p>
                    ${technician ? `
                    <p><strong>Technician:</strong> ${technician.firstName} ${technician.lastName}</p>
                    <p><strong>Contact:</strong> ${technician.phoneNumber}</p>
                    <p><strong>Rating:</strong> ${technician.technicianProfile?.rating || 'New'}/5</p>
                    ` : ''}
                </div>
                
                <p>You can track your service progress in the QuickFix app.</p>
            </div>
            <div class="footer">
                <p>Thank you for choosing QuickFix!</p>
                <p>Need help? Contact us at support@quickfix.com</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * Generate payment email template
 */
const generatePaymentEmailTemplate = (user, transaction, type) => {
  const isCredit = transaction.amount > 0;
  const amount = Math.abs(transaction.amount);

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .transaction-details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Payment ${type === 'received' ? 'Received' : 'Processed'}</h1>
            </div>
            <div class="content">
                <h2>Hello ${user.firstName},</h2>
                <p>Your payment has been ${type === 'received' ? 'received' : 'processed'} successfully.</p>
                
                <div class="transaction-details">
                    <h3>Transaction Details</h3>
                    <p><strong>Amount:</strong> $${amount}</p>
                    <p><strong>Type:</strong> ${transaction.type.replace('_', ' ').toUpperCase()}</p>
                    <p><strong>Status:</strong> ${transaction.status.toUpperCase()}</p>
                    <p><strong>Transaction ID:</strong> ${transaction._id}</p>
                    <p><strong>Date:</strong> ${new Date(transaction.createdAt).toLocaleString()}</p>
                </div>
            </div>
            <div class="footer">
                <p>Thank you for using QuickFix!</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * Generate emergency email template
 */
const generateEmergencyEmailTemplate = (booking, emergencyType, description) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .emergency-details { background: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545; }
            .footer { text-align: center; padding: 20px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚨 EMERGENCY ALERT</h1>
            </div>
            <div class="content">
                <h2>Emergency Reported</h2>
                <p>An emergency has been reported that requires immediate attention.</p>
                
                <div class="emergency-details">
                    <h3>Emergency Details</h3>
                    <p><strong>Type:</strong> ${emergencyType}</p>
                    <p><strong>Description:</strong> ${description}</p>
                    <p><strong>Booking ID:</strong> #${booking._id.toString().slice(-6)}</p>
                    <p><strong>Service Type:</strong> ${booking.serviceType}</p>
                    <p><strong>Client:</strong> ${booking.clientId.firstName} ${booking.clientId.lastName}</p>
                    <p><strong>Client Phone:</strong> ${booking.clientId.phoneNumber}</p>
                    <p><strong>Location:</strong> ${booking.location.address || 'Location coordinates provided'}</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                </div>
                
                <p><strong>Action Required:</strong> Please respond immediately through the admin panel or contact the parties directly.</p>
            </div>
            <div class="footer">
                <p>QuickFix Emergency Response System</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendSMS,
  sendEmail,
  createInAppNotification,
  sendBookingConfirmation,
  sendPaymentNotification,
  sendEmergencyAlert
};
