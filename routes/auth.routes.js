const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validation');
const authController = require('../controllers/auth.controller');

// Register user
router.post('/register', registerValidation, authController.register);

// Verify email
router.post('/verify-email', authController.verifyEmail);

// Resend verification email
router.post('/resend-verification', authController.resendVerification);

// Login user
router.post('/login', loginValidation, authController.login);

// Forgot password
router.post('/forgot-password', authController.forgotPassword);

// Reset password
router.post('/reset-password', authController.resetPassword);

// Get current user
router.get('/me', authenticateToken, authController.getCurrentUser);

// Get user profile
router.get('/profile', authenticateToken, authController.getProfile);

// Update user profile
router.put('/profile', authenticateToken, authController.updateProfile);

// Change password
router.put('/change-password', authenticateToken, authController.changePassword);

// Update notification settings
router.put('/notifications', authenticateToken, authController.updateNotifications);

// Logout
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;