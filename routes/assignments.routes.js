const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken, requireAdmin, requireUser } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const assignmentsController = require('../controllers/assignments.controller');

// Get all assignments (admin) or user's class assignments (student)
router.get('/', authenticateToken, assignmentsController.getAllAssignments);

// Create new assignment (admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('classId').isUUID().withMessage('Valid class ID required'),
  body('type').optional().isIn(['html', 'css', 'javascript', 'fullstack', 'other']).withMessage('Invalid assignment type'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard', 'advanced']).withMessage('Invalid difficulty level'),
  body('maxScore').optional().isInt({ min: 1, max: 1000 }).withMessage('Max score must be between 1 and 1000'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('deadline').isISO8601().withMessage('Valid deadline required'),
  body('requirements').trim().isLength({ min: 10 }).withMessage('Requirements must be at least 10 characters'),
  body('submissionTypes').optional().isArray().withMessage('Submission types must be an array'),
  body('latePenalty').optional().isFloat({ min: 0, max: 100 }).withMessage('Late penalty must be between 0 and 100'),
  body('lateFeeAmount').optional().isFloat({ min: 0 }).withMessage('Late fee must be positive')
], assignmentsController.createAssignment);

// Get single assignment details
router.get('/:id', authenticateToken, assignmentsController.getAssignmentById);

// Update assignment (admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  body('title').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('type').optional().isIn(['html', 'css', 'javascript', 'fullstack', 'other']).withMessage('Invalid assignment type'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard', 'advanced']).withMessage('Invalid difficulty level'),
  body('maxScore').optional().isInt({ min: 1, max: 1000 }).withMessage('Max score must be between 1 and 1000'),
  body('startDate').optional().isISO8601().withMessage('Valid start date required'),
  body('deadline').optional().isISO8601().withMessage('Valid deadline required'),
  body('requirements').optional().trim().isLength({ min: 10 }).withMessage('Requirements must be at least 10 characters'),
  body('latePenalty').optional().isFloat({ min: 0, max: 100 }).withMessage('Late penalty must be between 0 and 100')
], assignmentsController.updateAssignment);

// Delete assignment (admin only)
router.delete('/:id', authenticateToken, requireAdmin, assignmentsController.deleteAssignment);

// Submit assignment
router.post('/:id/submit', authenticateToken, requireUser, upload.single('zipFile'), [
  body('submissionType').isIn(['github', 'code', 'zip']).withMessage('Valid submission type required'),
  body('githubLink').optional().isURL().withMessage('Valid GitHub URL required'),
  body('codeSubmission').optional().isObject().withMessage('Code submission must be an object')
], assignmentsController.submitAssignment);

// Get assignment submissions (admin only)
router.get('/:id/submissions', authenticateToken, requireAdmin, assignmentsController.getAssignmentSubmissions);

// Review submission (admin only)
router.put('/:id/submissions/:submissionId/review', authenticateToken, requireAdmin, [
  body('status').isIn(['pending', 'reviewed', 'accepted', 'rejected']).withMessage('Valid status required'),
  body('score').optional().isInt({ min: 0, max: 1000 }).withMessage('Score must be between 0 and 1000'),
  body('adminFeedback').optional().trim().isLength({ max: 2000 }).withMessage('Feedback too long'),
  body('adminComments').optional().trim().isLength({ max: 2000 }).withMessage('Comments too long'),
  body('bonusPoints').optional().isInt({ min: 0 }).withMessage('Bonus points must be positive'),
  body('deductions').optional().isInt({ min: 0 }).withMessage('Deductions must be positive')
], assignmentsController.reviewSubmission);

// Unlock assignment (admin only)
router.post('/:id/unlock', authenticateToken, requireAdmin, assignmentsController.unlockAssignment);

module.exports = router; 