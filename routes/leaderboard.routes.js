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

module.exports = router; 