/**
 * Notification Controller
 * Handles creation, retrieval, and management of user notifications
 */

const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Get user notifications
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { userId: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId: userId, isRead: false });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message
    });
  }
};

/**
 * Get unread notification count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const count = await Notification.countDocuments({ userId: userId, isRead: false });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

/**
 * Mark notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id || req.user.id;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    await Notification.updateMany(
      { userId: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

/**
 * Delete notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id || req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId: userId
    });

    if (!notification) {
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
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

/**
 * Create notification (internal use - called from other controllers)
 */
exports.createNotification = async (recipientId, type, title, message, data = {}) => {
  try {
    const notification = new Notification({
      recipientId,
      type,
      title,
      message,
      data,
      read: false
    });

    await notification.save();
    
    console.log(`Notification created for user ${recipientId}: ${title}`);
    
    return { success: true, notification };
  } catch (error) {
    console.error('Create notification error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = exports;
