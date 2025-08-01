const leaderboardService = require('../services/leaderboard.service');

class LeaderboardController {
  // Get leaderboard data
  async getLeaderboard(req, res) {
    try {
      const result = await leaderboardService.getLeaderboard(req.query, req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error in getLeaderboard controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get leaderboard statistics
  async getLeaderboardStats(req, res) {
    try {
      const result = await leaderboardService.getLeaderboardStats();
      res.json(result);
    } catch (error) {
      console.error('Error in getLeaderboardStats controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get streak leaderboard
  async getStreakLeaderboard(req, res) {
    try {
      const result = await leaderboardService.getStreakLeaderboard(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error in getStreakLeaderboard controller:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new LeaderboardController(); 