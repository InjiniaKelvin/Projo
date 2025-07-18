/**
 * Notification Routes
 * 
 * Routes for notification management including:
 * - Get user notifications
 * - Mark notifications as read
 * - Notification preferences
 * - Push notification subscriptions
 */

const express = require('express');
const router = express.Router();
const { authenticateToken: auth, requireAdmin } = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');
const NotificationService = require('../services/NotificationService');

// Get user notifications with pagination
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      priority,
      unreadOnly = false
    } = req.query;

    const notifications = await Notification.getNotificationsForUser(
      req.user.id,
      {
        page: parseInt(page),
        limit: parseInt(limit),
        type,
        priority,
        unreadOnly: unreadOnly === 'true'
      }
    );

    const unreadCount = await Notification.getUnreadCount(req.user.id);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: notifications.length === parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);
    res.json({ success: true, data: { count } });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
});

// Mark notification as read
router.put('/:notificationId/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.notificationId,
      userId: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user.id);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// Delete notification
router.delete('/:notificationId', auth, async (req, res) => {
  try {
    const result = await Notification.deleteOne({
      _id: req.params.notificationId,
      userId: req.user.id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

// Get user notification preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('preferences');
    
    const defaultPreferences = {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      bookingUpdates: true,
      paymentNotifications: true,
      promotionalEmails: false,
      emergencyAlerts: true
    };

    res.json({
      success: true,
      data: { ...defaultPreferences, ...user.preferences }
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification preferences'
    });
  }
});

// Update notification preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const {
      emailNotifications,
      smsNotifications,
      pushNotifications,
      bookingUpdates,
      paymentNotifications,
      promotionalEmails,
      emergencyAlerts
    } = req.body;

    await User.findByIdAndUpdate(req.user.id, {
      preferences: {
        emailNotifications,
        smsNotifications,
        pushNotifications,
        bookingUpdates,
        paymentNotifications,
        promotionalEmails,
        emergencyAlerts
      }
    });

    res.json({
      success: true,
      message: 'Notification preferences updated'
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences'
    });
  }
});

// Test notification (for development)
router.post('/test', auth, async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        message: 'Test notifications only available in development'
      });
    }

    const { type = 'email', message = 'Test notification' } = req.body;
    const user = await User.findById(req.user.id);

    switch (type) {
      case 'email':
        if (user.email) {
          await NotificationService.sendEmail(
            user.email,
            'Test Notification - QuickFix',
            `<h2>Test Email</h2><p>${message}</p>`
          );
        }
        break;
      case 'sms':
        if (user.phoneNumber) {
          await NotificationService.sendSMS(user.phoneNumber, message);
        }
        break;
      case 'inapp':
        await NotificationService.createInAppNotification(
          req.user.id,
          'Test Notification',
          message,
          { type: 'system' }
        );
        break;
    }

    res.json({
      success: true,
      message: `Test ${type} notification sent`
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification'
    });
  }
});

module.exports = router;
