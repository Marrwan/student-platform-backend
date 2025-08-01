const { body, validationResult } = require('express-validator');
const assignmentsService = require('../services/assignments.service');

class AssignmentsController {
  // Get all assignments (admin) or user's class assignments (student)
  async getAllAssignments(req, res) {
    try {
      const result = await assignmentsService.getAllAssignments(req.user, req.query);
      res.json(result);
    } catch (error) {
      console.error('Error in getAllAssignments controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Create new assignment (admin only)
  async createAssignment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await assignmentsService.createAssignment(req.body, req.user.id, req.user.role);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error in createAssignment controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get single assignment details
  async getAssignmentById(req, res) {
    try {
      const assignment = await assignmentsService.getAssignmentById(req.params.id, req.user);
      res.json(assignment);
    } catch (error) {
      console.error('Error in getAssignmentById controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Update assignment (admin only)
  async updateAssignment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await assignmentsService.updateAssignment(req.params.id, req.body, req.user.id, req.user.role);
      res.json(result);
    } catch (error) {
      console.error('Error in updateAssignment controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Delete assignment (admin only)
  async deleteAssignment(req, res) {
    try {
      const result = await assignmentsService.deleteAssignment(req.params.id, req.user.id, req.user.role);
      res.json(result);
    } catch (error) {
      console.error('Error in deleteAssignment controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Submit assignment
  async submitAssignment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await assignmentsService.submitAssignment(req.params.id, req.body, req.user, req.file);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error in submitAssignment controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get assignment submissions (admin only)
  async getAssignmentSubmissions(req, res) {
    try {
      const result = await assignmentsService.getAssignmentSubmissions(req.params.id, req.query, req.user.id, req.user.role);
      res.json(result);
    } catch (error) {
      console.error('Error in getAssignmentSubmissions controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Review submission (admin only)
  async reviewSubmission(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await assignmentsService.reviewSubmission(req.params.id, req.params.submissionId, req.body, req.user.id, req.user.role);
      res.json(result);
    } catch (error) {
      console.error('Error in reviewSubmission controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Unlock assignment (admin only)
  async unlockAssignment(req, res) {
    try {
      const result = await assignmentsService.unlockAssignment(req.params.id, req.user.id, req.user.role);
      res.json(result);
    } catch (error) {
      console.error('Error in unlockAssignment controller:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new AssignmentsController(); 