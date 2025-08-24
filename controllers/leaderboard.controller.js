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

  // Get class-based leaderboard
  async getClassLeaderboard(req, res) {
    try {
      const { classId } = req.params;
      const result = await leaderboardService.getClassLeaderboard(classId, req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error in getClassLeaderboard controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get project-based leaderboard
  async getProjectLeaderboard(req, res) {
    try {
      const { projectId } = req.params;
      const result = await leaderboardService.getProjectLeaderboard(projectId, req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error in getProjectLeaderboard controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Update attendance score (admin only)
  async updateAttendanceScore(req, res) {
    try {
      const { classId, userId } = req.params;
      const { attendanceScore } = req.body;
      
      if (!attendanceScore || attendanceScore < 0 || attendanceScore > 100) {
        return res.status(400).json({ message: 'Attendance score must be between 0 and 100' });
      }
      
      const result = await leaderboardService.updateAttendanceScore(classId, userId, attendanceScore);
      res.json(result);
    } catch (error) {
      console.error('Error in updateAttendanceScore controller:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new LeaderboardController(); 