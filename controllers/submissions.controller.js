const submissionsService = require('../services/submissions.service');

class SubmissionsController {
  // Submit project
  async submitProject(req, res) {
    try {
      const result = await submissionsService.submitProject(req.body, req.user, req.file);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error in submitProject controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get user's submissions
  async getUserSubmissions(req, res) {
    try {
      const result = await submissionsService.getUserSubmissions(req.user.id, req.query);
      res.json(result);
    } catch (error) {
      console.error('Error in getUserSubmissions controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get single submission
  async getSubmissionById(req, res) {
    try {
      const submission = await submissionsService.getSubmissionById(req.params.id, req.user);
      res.json(submission);
    } catch (error) {
      console.error('Error in getSubmissionById controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Update submission (admin only)
  async updateSubmission(req, res) {
    try {
      const submission = await submissionsService.updateSubmission(req.params.id, req.body, req.user.id);
      res.json(submission);
    } catch (error) {
      console.error('Error in updateSubmission controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Delete submission (admin only)
  async deleteSubmission(req, res) {
    try {
      const result = await submissionsService.deleteSubmission(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Error in deleteSubmission controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get submission statistics (admin only)
  async getSubmissionStats(req, res) {
    try {
      const stats = await submissionsService.getSubmissionStats();
      res.json(stats);
    } catch (error) {
      console.error('Error in getSubmissionStats controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get submissions by project (admin only)
  async getSubmissionsByProject(req, res) {
    try {
      const result = await submissionsService.getSubmissionsByProject(req.params.projectId, req.query);
      res.json(result);
    } catch (error) {
      console.error('Error in getSubmissionsByProject controller:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new SubmissionsController(); 