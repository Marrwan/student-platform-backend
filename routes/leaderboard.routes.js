const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const leaderboardController = require('../controllers/leaderboard.controller');

// Get leaderboard data
router.get('/', authenticateToken, leaderboardController.getLeaderboard);

// Get leaderboard statistics
router.get('/stats', authenticateToken, leaderboardController.getLeaderboardStats);

// Get streak leaderboard
router.get('/streaks', authenticateToken, leaderboardController.getStreakLeaderboard);

// Get class-based leaderboard
router.get('/class/:classId', authenticateToken, leaderboardController.getClassLeaderboard);

// Get project-based leaderboard
router.get('/project/:projectId', authenticateToken, leaderboardController.getProjectLeaderboard);

// Update attendance score (admin only)
router.put('/class/:classId/attendance/:userId', authenticateToken, leaderboardController.updateAttendanceScore);

module.exports = router; 