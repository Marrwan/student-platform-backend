const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const notificationsController = require('../controllers/notifications.controller');

// Create notification
router.post('/', authenticateToken, notificationsController.createNotification);

// List notifications for current user
router.get('/', authenticateToken, notificationsController.getUserNotifications);

// Mark notification as read
router.patch('/:id/read', authenticateToken, notificationsController.markNotificationAsRead);

// Delete notification
router.delete('/:id', authenticateToken, notificationsController.deleteNotification);

module.exports = router; 