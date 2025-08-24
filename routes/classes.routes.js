const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken, requireAdmin, requireUser } = require('../middleware/auth');
const classesController = require('../controllers/classes.controller');

// Get all classes (admin) or user's enrolled classes (student)
router.get('/', authenticateToken, classesController.getAllClasses);

// Create new class (admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Class name must be between 3 and 100 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description too long'),
  body('maxStudents').optional().isInt({ min: 1, max: 200 }).withMessage('Max students must be between 1 and 200'),
  body('startDate').optional().isISO8601().withMessage('Valid start date required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date required')
], classesController.createClass);

// Get single class details
router.get('/:id', authenticateToken, classesController.getClassById);

// Update class (admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  body('name').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Class name must be between 3 and 100 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description too long'),
  body('maxStudents').optional().isInt({ min: 1, max: 200 }).withMessage('Max students must be between 1 and 200'),
  body('startDate').optional().isISO8601().withMessage('Valid start date required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date required')
], classesController.updateClass);

// Delete class (admin only)
router.delete('/:id', authenticateToken, requireAdmin, classesController.deleteClass);

// Join class using enrollment code
router.post('/join', authenticateToken, requireUser, [
  body('enrollmentCode').trim().isLength({ min: 3, max: 15 }).withMessage('Invalid enrollment code')
], classesController.joinClass);

// Request to join class (for classes that require approval)
router.post('/request-join', authenticateToken, requireUser, [
  body('classId').isUUID().withMessage('Valid class ID required'),
  body('message').optional().trim().isLength({ max: 500 }).withMessage('Message too long')
], classesController.requestToJoinClass);

// Leave class
router.post('/:id/leave', authenticateToken, requireUser, classesController.leaveClass);

// Get class assignments
router.get('/:id/assignments', authenticateToken, classesController.getClassAssignments);

// Invite students to class (admin only)
router.post('/:id/invite', authenticateToken, requireAdmin, [
  body('emails').isArray({ min: 1 }).withMessage('At least one email is required'),
  body('emails.*').isEmail().withMessage('Invalid email format'),
  body('message').optional().trim().isLength({ max: 500 }).withMessage('Message too long')
], classesController.inviteStudents);

module.exports = router; 