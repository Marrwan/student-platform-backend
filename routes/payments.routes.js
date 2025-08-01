const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const paymentsController = require('../controllers/payments.controller');

// Get user payments (root route)
router.get('/', authenticateToken, paymentsController.getUserPayments);

// Initialize late fee payment
router.post('/late-fee', authenticateToken, paymentsController.initializeLateFeePayment);

// Verify payment
router.post('/verify', authenticateToken, paymentsController.verifyPayment);

// Get payment history
router.get('/history', authenticateToken, paymentsController.getPaymentHistory);

// Get payment status
router.get('/:reference', authenticateToken, paymentsController.getPaymentStatus);

// Get all payments (admin view)
router.get('/admin/all', authenticateToken, requireRole('admin'), paymentsController.getAllPayments);

// Get payment statistics
router.get('/stats', authenticateToken, requireRole('admin'), paymentsController.getPaymentStats);

module.exports = router; 