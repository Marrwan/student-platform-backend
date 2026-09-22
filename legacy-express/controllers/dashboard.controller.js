const dashboardService = require('../services/dashboard.service');

class DashboardController {
  // Get today's project
  async getTodayProject(req, res) {
    try {
      const result = await dashboardService.getTodayProject(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error in getTodayProject controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get all pending assignments (not yet submitted)
  async getPendingAssignments(req, res) {
    try {
      const result = await dashboardService.getPendingAssignments(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error in getPendingAssignments controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get assignments needing correction
  async getCorrectionsNeeded(req, res) {
    try {
      const result = await dashboardService.getCorrectionsNeeded(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error in getCorrectionsNeeded controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get recent submissions
  async getRecentSubmissions(req, res) {
    try {
      const result = await dashboardService.getRecentSubmissions(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error in getRecentSubmissions controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get progress statistics
  async getProgressStats(req, res) {
    try {
      const result = await dashboardService.getProgressStats(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error in getProgressStats controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Alias for /stats to maintain compatibility
  async getStats(req, res) {
    try {
      const result = await dashboardService.getProgressStats(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error in getStats controller:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new DashboardController(); 