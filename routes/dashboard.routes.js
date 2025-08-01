const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboard.controller');

// Get today's project
router.get('/today-project', authenticateToken, dashboardController.getTodayProject);

// Get recent submissions
router.get('/recent-submissions', authenticateToken, dashboardController.getRecentSubmissions);

// Get progress statistics
router.get('/progress-stats', authenticateToken, dashboardController.getProgressStats);

// Alias for /stats to maintain compatibility
router.get('/stats', authenticateToken, dashboardController.getStats);

module.exports = router; 