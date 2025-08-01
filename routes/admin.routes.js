const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/admin.controller');

// Apply authentication and admin role requirement to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Admin dashboard statistics
router.get('/stats', adminController.getStats);

// Admin payments routes
router.get('/payments', adminController.getPayments);

// Admin projects routes
router.get('/projects', adminController.getProjects);
router.post('/projects', [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('day').isInt({ min: 1, max: 365 }).withMessage('Day must be between 1 and 365'),
  body('difficulty').isIn(['easy', 'medium', 'hard', 'advanced']).withMessage('Invalid difficulty level'),
  body('maxScore').isInt({ min: 1, max: 1000 }).withMessage('Max score must be between 1 and 1000'),
  body('deadline').isISO8601().withMessage('Valid deadline is required')
], adminController.createProject);

router.put('/projects/:id', [
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard', 'advanced']).withMessage('Invalid difficulty level'),
  body('maxScore').optional().isInt({ min: 1, max: 1000 }).withMessage('Max score must be between 1 and 1000'),
  body('deadline').optional().isISO8601().withMessage('Valid deadline is required')
], adminController.updateProject);

router.patch('/projects/:id/lock', adminController.toggleProjectLock);
router.delete('/projects/:id', adminController.deleteProject);
router.get('/projects/:id', adminController.getProjectById);

// Admin submissions routes
router.get('/submissions', adminController.getSubmissions);
router.put('/submissions/:id/review', [
  body('status').isIn(['accepted', 'rejected', 'reviewed']).withMessage('Invalid status'),
  body('score').optional().isInt({ min: 0, max: 1000 }).withMessage('Score must be between 0 and 1000'),
  body('feedback').optional().trim().isLength({ max: 1000 }).withMessage('Feedback too long')
], adminController.reviewSubmission);

// Admin users routes
router.get('/users', adminController.getUsers);
router.patch('/users/:id/activate', adminController.toggleUserStatus);
router.get('/users/:id', adminController.getUserDetails);

// Admin assignments routes
router.get('/assignments', adminController.getAssignments);
router.post('/assignments', adminController.createAssignment);

// Admin classes routes
router.get('/classes', adminController.getClasses);
router.post('/classes', adminController.createClass);
router.get('/classes/:classId/students', adminController.getClassStudents);
router.post('/classes/:classId/invite', adminController.sendClassInvitations);

// Admin activity routes
router.get('/activity', adminController.getActivity);
router.get('/recent-activity', adminController.getRecentActivity);

// Admin quick submissions routes
router.get('/quick-submissions', adminController.getQuickSubmissions);

// Test email functionality
router.post('/test-email', adminController.testEmail);

module.exports = router; 