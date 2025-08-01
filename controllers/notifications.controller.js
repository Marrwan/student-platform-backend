const notificationsService = require('../services/notifications.service');

class NotificationsController {
  // Create notification
  async createNotification(req, res) {
    try {
      const result = await notificationsService.createNotification(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error in createNotification controller:', error);
      res.status(500).json({ message: 'Failed to create notification', error: error.message });
    }
  }

  // List notifications for current user
  async getUserNotifications(req, res) {
    try {
      const result = await notificationsService.getUserNotifications(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error in getUserNotifications controller:', error);
      res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
  }

  // Mark notification as read
  async markNotificationAsRead(req, res) {
    try {
      const result = await notificationsService.markNotificationAsRead(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error in markNotificationAsRead controller:', error);
      res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
    }
  }

  // Delete notification
  async deleteNotification(req, res) {
    try {
      const result = await notificationsService.deleteNotification(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error in deleteNotification controller:', error);
      res.status(500).json({ message: 'Failed to delete notification', error: error.message });
    }
  }
}

module.exports = new NotificationsController(); 