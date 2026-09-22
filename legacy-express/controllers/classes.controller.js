const { body, validationResult } = require('express-validator');
const classesService = require('../services/classes.service');

class ClassesController {
  // Get all classes (admin) or user's enrolled classes (student)
  async getAllClasses(req, res) {
    try {
      const result = await classesService.getAllClasses(req.user, req.query);
      res.json(result);
    } catch (error) {
      console.error('Error in getAllClasses controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Create new class (admin only)
  async createClass(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await classesService.createClass(req.body, req.user.id);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error in createClass controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get single class details
  async getClassById(req, res) {
    try {
      const classData = await classesService.getClassById(req.params.id, req.user);
      res.json(classData);
    } catch (error) {
      console.error('Error in getClassById controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Update class (admin only)
  async updateClass(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await classesService.updateClass(req.params.id, req.body, req.user.id, req.user.role);
      res.json(result);
    } catch (error) {
      console.error('Error in updateClass controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Delete class (admin only)
  async deleteClass(req, res) {
    try {
      const result = await classesService.deleteClass(req.params.id, req.user.id, req.user.role);
      res.json(result);
    } catch (error) {
      console.error('Error in deleteClass controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Join class using enrollment code
  async joinClass(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await classesService.joinClass(req.body.enrollmentCode, req.user);
      
      // If user is already enrolled, return 200 with special response
      if (result.alreadyEnrolled) {
        return res.status(200).json(result);
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Error in joinClass controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Request to join class
  async requestToJoinClass(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await classesService.requestToJoinClass(req.body.classId, req.user, req.body.message);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error in requestToJoinClass controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Leave class
  async leaveClass(req, res) {
    try {
      const result = await classesService.leaveClass(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error in leaveClass controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get class assignments
  async getClassAssignments(req, res) {
    try {
      const result = await classesService.getClassAssignments(req.params.id, req.user, req.query);
      res.json(result);
    } catch (error) {
      console.error('Error in getClassAssignments controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Invite students to class (admin only)
  async inviteStudents(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await classesService.inviteStudents(req.params.id, req.body, req.user.id, req.user.role);
      res.json(result);
    } catch (error) {
      console.error('Error in inviteStudents controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Create class schedule
  async createClassSchedule(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await classesService.createClassSchedule(req.params.id, req.body, req.user.id, req.user.role);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error in createClassSchedule controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Update class schedule
  async updateClassSchedule(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await classesService.updateClassSchedule(req.params.scheduleId, req.body, req.user.id, req.user.role);
      res.json(result);
    } catch (error) {
      console.error('Error in updateClassSchedule controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Delete class schedule
  async deleteClassSchedule(req, res) {
    try {
      const result = await classesService.deleteClassSchedule(req.params.scheduleId, req.user.id, req.user.role);
      res.json(result);
    } catch (error) {
      console.error('Error in deleteClassSchedule controller:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ClassesController(); 