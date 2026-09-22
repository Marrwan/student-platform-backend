const { Notification, User } = require('../models');
const { v4: uuidv4 } = require('uuid');

class NotificationsService {
  // Create notification
  async createNotification(notificationData) {
    try {
      const { type, title, content, targetUserId, metadata } = notificationData;
      if (!type || !title || !content || !targetUserId) {
        throw new Error('Missing required fields');
      }

      const notification = await Notification.create({
        id: uuidv4(),
        userId: targetUserId,
        type,
        title,
        content,
        isRead: false,
        metadata: metadata || {},
      });

      return { notification };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // List notifications for current user
  async getUserNotifications(userId) {
    try {
      const notifications = await Notification.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
      });
      return { notifications };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({ 
        where: { id: notificationId, userId } 
      });
      
      if (!notification) {
        throw new Error('Notification not found');
      }

      notification.isRead = true;
      await notification.save();
      return { notification };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOne({ 
        where: { id: notificationId, userId } 
      });
      
      if (!notification) {
        throw new Error('Notification not found');
      }

      await notification.destroy();
      return { message: 'Notification deleted' };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

module.exports = new NotificationsService(); 