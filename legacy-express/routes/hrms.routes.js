const express = require('express');
const router = express.Router();
const hrmsController = require('../controllers/hrms.controller');
const { authenticateToken } = require('../middleware/auth');
const { hasPermission } = require('../middleware/has-permission.middleware');

// All routes require authentication
router.use(authenticateToken);

// Dashboard Stats
router.get('/dashboard/stats', hrmsController.getDashboardStats);
router.get('/dashboard/demographics', hrmsController.getDemographics);

// Team Management
router.get('/team/members', hrmsController.getTeamMembers);
router.get('/teams', hrmsController.getTeams);

// Appraisals (Supervisor View)
router.get('/supervisor/appraisals', hrmsController.getSupervisorAppraisals);

module.exports = router;
