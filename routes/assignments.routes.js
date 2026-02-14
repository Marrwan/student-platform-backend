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
  body('requirements').optional().trim().isLength({ min: 10 }).withMessage('Requirements must be at least 10 characters'),
  body('submissionMode').optional().isIn(['code', 'link', 'both']).withMessage('Invalid submission mode'),
  body('latePenalty').optional().isFloat({ min: 0, max: 100 }).withMessage('Late penalty must be between 0 and 100'),
  body('paymentRequired').optional().isBoolean().withMessage('Payment required must be a boolean'),
  body('paymentAmount').optional().isFloat({ min: 0 }).withMessage('Payment amount must be positive'),
  body('sampleOutputUrl').optional().isURL().withMessage('Valid sample output URL required'),
  body('sampleOutputCode').optional().isObject().withMessage('Sample output code must be an object')
], assignmentsController.createAssignment);

// Get single assignment details
router.get('/:id', authenticateToken, assignmentsController.getAssignmentById);

// Get current user's submission for this assignment
router.get('/:id/my-submission', authenticateToken, requireUser, assignmentsController.getMySubmission);

// Update assignment (admin or class instructor)
router.put('/:id', authenticateToken, [
  body('title').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('type').optional().isIn(['html', 'css', 'javascript', 'fullstack', 'other']).withMessage('Invalid assignment type'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard', 'advanced']).withMessage('Invalid difficulty level'),
  body('maxScore').optional().isInt({ min: 1, max: 1000 }).withMessage('Max score must be between 1 and 1000'),
  body('startDate').optional().isISO8601().withMessage('Valid start date required'),
  body('deadline').optional().isISO8601().withMessage('Valid deadline required'),
  body('requirements').optional().trim().isLength({ min: 10 }).withMessage('Requirements must be at least 10 characters'),
  body('submissionMode').optional().isIn(['code', 'link', 'both']).withMessage('Invalid submission mode'),
  body('latePenalty').optional().isFloat({ min: 0, max: 100 }).withMessage('Late penalty must be between 0 and 100'),
  body('paymentRequired').optional().isBoolean().withMessage('Payment required must be a boolean'),
  body('paymentAmount').optional().isFloat({ min: 0 }).withMessage('Payment amount must be positive'),
  body('sampleOutputUrl').optional().isURL().withMessage('Valid sample output URL required'),
  body('sampleOutputCode').optional().isObject().withMessage('Sample output code must be an object')
], assignmentsController.updateAssignment);

// Delete assignment (admin only)
router.delete('/:id', authenticateToken, requireAdmin, assignmentsController.deleteAssignment);

// Submit assignment
router.post('/:id/submit', authenticateToken, requireUser, upload.single('zipFile'), [
  body('submissionType').isIn(['github', 'code', 'zip', 'link']).withMessage('Valid submission type required'),
  body('githubLink').optional().custom((value, { req }) => {
    // Only validate if submissionType is 'github' and value is provided
    if (req.body.submissionType === 'github' && value) {
      if (!value.match(/^https?:\/\/github\.com\/.+/)) {
        throw new Error('Valid GitHub URL required');
      }
    }
    return true;
  }),
  body('submissionLink').optional().custom((value, { req }) => {
    // Only validate if submissionType is 'link' and value is provided
    if (req.body.submissionType === 'link' && value) {
      if (!value.match(/^https?:\/\//)) {
        throw new Error('Valid submission link URL required');
      }
    }
    return true;
  }),
  body('codeSubmission').optional().custom((value, { req }) => {
    if (value) {
      try {
        // If it's a string, try to parse it as JSON
        if (typeof value === 'string') {
          const parsed = JSON.parse(value);
          if (typeof parsed === 'object' && parsed !== null) {
            return true;
          }
        } else if (typeof value === 'object' && value !== null) {
          return true;
        }
        throw new Error('Code submission must be a valid object');
      } catch (error) {
        throw new Error('Code submission must be a valid JSON object');
      }
    }
    return true;
  }).withMessage('Code submission must be a valid object')
], assignmentsController.submitAssignment);

// Get assignment submissions (admin only)
router.get('/:id/submissions', authenticateToken, requireAdmin, assignmentsController.getAssignmentSubmissions);

// Mark submission (admin only)
router.put('/:id/submissions/:submissionId/mark', authenticateToken, requireAdmin, [
  body('score').optional().isFloat({ min: 0 }).withMessage('Score must be positive'),
  body('feedback').optional().trim().isLength({ max: 2000 }).withMessage('Feedback too long'),
  body('status').optional().isIn(['pending', 'reviewed', 'accepted']).withMessage('Valid status required'),
  body('requestCorrection').optional().isBoolean().withMessage('Request correction must be boolean'),
  body('correctionComments').optional().trim().isLength({ max: 2000 }).withMessage('Correction comments too long')
], assignmentsController.markSubmission);

// Review submission (admin only)
router.put('/:id/submissions/:submissionId/review', authenticateToken, requireAdmin, [
  body('status').isIn(['pending', 'reviewed', 'accepted']).withMessage('Valid status required'),
  body('score').optional().isInt({ min: 0, max: 1000 }).withMessage('Score must be between 0 and 1000'),
  body('adminFeedback').optional().trim().isLength({ max: 2000 }).withMessage('Feedback too long'),
  body('adminComments').optional().trim().isLength({ max: 2000 }).withMessage('Comments too long'),
  body('bonusPoints').optional().isInt({ min: 0 }).withMessage('Bonus points must be positive'),
  body('deductions').optional().isInt({ min: 0 }).withMessage('Deductions must be positive')
], assignmentsController.reviewSubmission);

// Delete submission (admin or owner)
router.delete('/:id/submissions/:submissionId', authenticateToken, assignmentsController.deleteSubmission);

// Unlock assignment (admin only)
router.post('/:id/unlock', authenticateToken, requireAdmin, assignmentsController.unlockAssignment);

// Award attendance score (admin only)
router.post('/:classId/attendance', authenticateToken, requireAdmin, [
  body('userId').isUUID().withMessage('Valid user ID required'),
  body('score').isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes too long')
], assignmentsController.awardAttendanceScore);

// Get class leaderboard
router.get('/:id/leaderboard', authenticateToken, assignmentsController.getClassLeaderboard);

// Refresh class leaderboard (admin only)
router.post('/:classId/leaderboard/refresh', authenticateToken, requireAdmin, assignmentsController.refreshClassLeaderboard);

// Check user block status
router.get('/user/block-status', authenticateToken, assignmentsController.checkUserBlockStatus);

// Process overdue payment
router.post('/user/process-payment', authenticateToken, [
  body('paymentReference').trim().isLength({ min: 1 }).withMessage('Payment reference required'),
  body('amount').isFloat({ min: 0 }).withMessage('Valid amount required')
], assignmentsController.processOverduePayment);

// Update submission (for students)
router.put('/:id/submission', [
  authenticateToken,
  requireUser,
  body('submissionType').optional().isIn(['github', 'code', 'link', 'zip']).withMessage('Invalid submission type'),
  body('githubLink').optional().custom((value, { req }) => {
    // Only validate if submissionType is 'github' and value is provided
    if (req.body.submissionType === 'github' && value) {
      if (!value.match(/^https?:\/\/github\.com\/.+/)) {
        throw new Error('Valid GitHub URL required');
      }
    }
    return true;
  }),
  body('submissionLink').optional().custom((value, { req }) => {
    // Only validate if submissionType is 'link' and value is provided
    if (req.body.submissionType === 'link' && value) {
      if (!value.match(/^https?:\/\//)) {
        throw new Error('Valid submission link URL required');
      }
    }
    return true;
  }),
  body('codeSubmission').optional().custom((value, { req }) => {
    if (value) {
      try {
        if (typeof value === 'string') {
          const parsed = JSON.parse(value);
          if (typeof parsed === 'object' && parsed !== null) {
            return true;
          }
        } else if (typeof value === 'object' && value !== null) {
          return true;
        }
        throw new Error('Code submission must be a valid object');
      } catch (error) {
        throw new Error('Code submission must be a valid JSON object');
      }
    }
    return true;
  }).withMessage('Code submission must be a valid object')
], assignmentsController.updateSubmission);

// Check if user can edit submission
router.get('/:id/can-edit', authenticateToken, requireUser, assignmentsController.canEditSubmission);

module.exports = router; 