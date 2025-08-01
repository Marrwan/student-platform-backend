const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const usersController = require('../controllers/users.controller');

// Get user profile
router.get('/profile', authenticateToken, usersController.getUserProfile);

// Update user profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required')
], usersController.updateUserProfile);

// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], usersController.changePassword);

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, usersController.getAllUsers);

// Get single user (admin only)
router.get('/:id', authenticateToken, requireAdmin, usersController.getUserById);

// Update user (admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('role').optional().isIn(['student', 'admin', 'partial_admin']).withMessage('Valid role required'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], usersController.updateUser);

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, usersController.deleteUser);

module.exports = router; 