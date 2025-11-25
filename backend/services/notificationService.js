/**
 * Notification Service
 * Centralized service for creating and managing notifications
 */

const Notification = require('../models/Notification');

/**
 * Create a notification for a user
 * @param {Object} params - Notification parameters
 * @param {String} params.userId - User ID to send notification to
 * @param {String} params.title - Notification title
 * @param {String} params.message - Notification message
 * @param {String} params.type - Notification type (booking, payment, emergency, system, promotion, reminder, info)
 * @param {String} params.priority - Priority level (low, normal, high, critical)
 * @param {Object} params.data - Additional data related to the notification
 * @returns {Promise<Object>} Created notification
 */
async function createNotification({ userId, title, message, type = 'info', priority = 'normal', data = {} }) {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      priority,
      data,
      isRead: false,
      sent: true
    });

    console.log(`✅ Notification created for user ${userId}: ${title}`);
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
}

/**
 * Create booking notification
 */
async function createBookingNotification(userId, booking, status) {
  const statusMessages = {
    submitted: {
      title: 'Booking Submitted',
      message: `Your booking for ${booking.serviceType} has been submitted successfully.`,
      priority: 'normal'
    },
    confirmed: {
      title: 'Booking Confirmed',
      message: `Your booking has been confirmed. A technician will be assigned soon.`,
      priority: 'high'
    },
    technician_assigned: {
      title: 'Technician Assigned',
      message: `A technician has been assigned to your booking for ${booking.serviceType}.`,
      priority: 'high'
    },
    in_progress: {
      title: 'Service Started',
      message: `Your ${booking.serviceType} service is now in progress.`,
      priority: 'normal'
    },
    completed: {
      title: 'Service Completed',
      message: `Your ${booking.serviceType} service has been completed. Please rate your experience.`,
      priority: 'high'
    },
    cancelled: {
      title: 'Booking Cancelled',
      message: `Your booking for ${booking.serviceType} has been cancelled.`,
      priority: 'normal'
    }
  };

  const config = statusMessages[status] || {
    title: 'Booking Update',
    message: `Your booking status has been updated to ${status}.`,
    priority: 'normal'
  };

  return createNotification({
    userId,
    title: config.title,
    message: config.message,
    type: 'booking',
    priority: config.priority,
    data: {
      bookingId: booking._id,
      status: status
    }
  });
}

/**
 * Create payment notification
 */
async function createPaymentNotification(userId, payment, status) {
  const statusMessages = {
    success: {
      title: 'Payment Successful',
      message: `Your payment of KES ${payment.amount} has been processed successfully.`,
      priority: 'high'
    },
    failed: {
      title: 'Payment Failed',
      message: `Your payment of KES ${payment.amount} could not be processed. Please try again.`,
      priority: 'high'
    },
    pending: {
      title: 'Payment Pending',
      message: `Your payment of KES ${payment.amount} is being processed.`,
      priority: 'normal'
    }
  };

  const config = statusMessages[status] || {
    title: 'Payment Update',
    message: `Your payment status has been updated.`,
    priority: 'normal'
  };

  return createNotification({
    userId,
    title: config.title,
    message: config.message,
    type: 'payment',
    priority: config.priority,
    data: {
      transactionId: payment._id,
      amount: payment.amount,
      status: status
    }
  });
}

/**
 * Create profile update notification
 */
async function createProfileUpdateNotification(userId) {
  return createNotification({
    userId,
    title: 'Profile Updated',
    message: 'Your profile information has been updated successfully.',
    type: 'system',
    priority: 'low'
  });
}

/**
 * Create technician approval notification
 */
async function createTechnicianApprovalNotification(userId, approved) {
  if (approved) {
    return createNotification({
      userId,
      title: 'Account Approved',
      message: 'Congratulations! Your technician account has been approved. You can now start accepting jobs.',
      type: 'system',
      priority: 'high'
    });
  } else {
    return createNotification({
      userId,
      title: 'Account Under Review',
      message: 'Your technician account is currently under review. We will notify you once the review is complete.',
      type: 'system',
      priority: 'normal'
    });
  }
}

/**
 * Create technician rejection notification
 */
async function createTechnicianRejectionNotification(userId, reason) {
  return createNotification({
    userId,
    title: 'Account Application Rejected',
    message: reason || 'Your technician account application has been rejected. Please contact support for more information.',
    type: 'system',
    priority: 'high'
  });
}

/**
 * Create new job notification for technician
 */
async function createNewJobNotification(technicianId, booking) {
  return createNotification({
    userId: technicianId,
    title: 'New Job Available',
    message: `New ${booking.serviceType} job available in your area. Tap to view details.`,
    type: 'booking',
    priority: 'high',
    data: {
      bookingId: booking._id,
      serviceType: booking.serviceType
    }
  });
}

/**
 * Create emergency booking notification
 */
async function createEmergencyNotification(userId, booking) {
  return createNotification({
    userId,
    title: 'Emergency Service Requested',
    message: `Your emergency ${booking.serviceType} request has been submitted. We are finding a technician immediately.`,
    type: 'emergency',
    priority: 'critical',
    data: {
      bookingId: booking._id,
      isEmergency: true
    }
  });
}

/**
 * Create registration success notification
 */
async function createRegistrationNotification(userId, role) {
  const messages = {
    client: {
      title: 'Welcome to QuickFix!',
      message: 'Your account has been created successfully. Start booking quality repair services now!'
    },
    technician: {
      title: 'Welcome to QuickFix!',
      message: 'Your technician account has been created. Your profile is under review and will be approved shortly.'
    }
  };

  const config = messages[role] || messages.client;

  return createNotification({
    userId,
    title: config.title,
    message: config.message,
    type: 'system',
    priority: 'normal'
  });
}

module.exports = {
  createNotification,
  createBookingNotification,
  createPaymentNotification,
  createProfileUpdateNotification,
  createTechnicianApprovalNotification,
  createTechnicianRejectionNotification,
  createNewJobNotification,
  createEmergencyNotification,
  createRegistrationNotification
};
