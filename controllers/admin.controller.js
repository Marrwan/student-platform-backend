const { body, validationResult } = require('express-validator');
const adminService = require('../services/admin.service');

class AdminController {
  // Get admin dashboard statistics
  async getStats(req, res) {
    try {
      const stats = await adminService.getStats();
      res.json({ stats });
    } catch (error) {
      console.error('Error in getStats controller:', error);
      res.status(500).json({ message: 'Failed to fetch admin statistics' });
    }
  }

  // Get admin payments (paginated)
  async getPayments(req, res) {
    try {
      const payments = await adminService.getPayments(req.query);
      res.json(payments);
    } catch (error) {
      console.error('Error in getPayments controller:', error);
      res.status(500).json({ message: 'Failed to fetch payments' });
    }
  }

  // Get all projects (admin view)
  async getProjects(req, res) {
    try {
      const projects = await adminService.getProjects();
      res.json({ projects });
    } catch (error) {
      console.error('Error in getProjects controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Create new project
  async createProject(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const project = await adminService.createProject(req.body);
      res.status(201).json(project);
    } catch (error) {
      console.error('Error in createProject controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Update project
  async updateProject(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const project = await adminService.updateProject(req.params.id, req.body);
      res.json(project);
    } catch (error) {
      console.error('Error in updateProject controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Toggle project lock status
  async toggleProjectLock(req, res) {
    try {
      const { isUnlocked } = req.body;
      const project = await adminService.toggleProjectLock(req.params.id, isUnlocked);
      res.json(project);
    } catch (error) {
      console.error('Error in toggleProjectLock controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Delete project
  async deleteProject(req, res) {
    try {
      const result = await adminService.deleteProject(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Error in deleteProject controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get all submissions (admin view)
  async getSubmissions(req, res) {
    try {
      const submissions = await adminService.getSubmissions(req.query);
      res.json(submissions);
    } catch (error) {
      console.error('Error in getSubmissions controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Review submission
  async reviewSubmission(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await adminService.reviewSubmission(req.params.id, req.body, req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error in reviewSubmission controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get all users (admin view)
  async getUsers(req, res) {
    try {
      const users = await adminService.getUsers(req.query);
      res.json(users);
    } catch (error) {
      console.error('Error in getUsers controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Activate/deactivate user
  async toggleUserStatus(req, res) {
    try {
      const { isActive } = req.body;
      const user = await adminService.toggleUserStatus(req.params.id, isActive);
      res.json(user);
    } catch (error) {
      console.error('Error in toggleUserStatus controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Verify user manually
  async verifyUser(req, res) {
    try {
      const user = await adminService.verifyUser(req.params.id);
      res.json(user);
    } catch (error) {
      console.error('Error in verifyUser controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get user details with full statistics
  async getUserDetails(req, res) {
    try {
      const user = await adminService.getUserDetails(req.params.id);
      res.json(user);
    } catch (error) {
      console.error('Error in getUserDetails controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get admin assignments
  async getAssignments(req, res) {
    try {
      const assignments = await adminService.getAssignments();
      res.json(assignments);
    } catch (error) {
      console.error('Error in getAssignments controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Create assignment
  async createAssignment(req, res) {
    try {
      const assignment = await adminService.createAssignment(req.body);
      res.status(201).json(assignment);
    } catch (error) {
      console.error('Error in createAssignment controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Update assignment
  async updateAssignment(req, res) {
    try {
      const assignment = await adminService.updateAssignment(req.params.id, req.body);
      res.json(assignment);
    } catch (error) {
      console.error('Error in updateAssignment controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get admin classes
  async getClasses(req, res) {
    try {
      const classes = await adminService.getClasses(req.query);
      res.json(classes);
    } catch (error) {
      console.error('Error in getClasses controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Create class
  async createClass(req, res) {
    try {
      const classData = await adminService.createClass(req.body, req.user.id);
      res.status(201).json(classData);
    } catch (error) {
      console.error('Error in createClass controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get class students
  async getClassStudents(req, res) {
    try {
      const students = await adminService.getClassStudents(req.params.classId);
      res.json(students);
    } catch (error) {
      console.error('Error in getClassStudents controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Send class invitations
  async sendClassInvitations(req, res) {
    try {
      const result = await adminService.sendClassInvitations(req.params.classId, req.body);
      res.json(result);
    } catch (error) {
      console.error('Error in sendClassInvitations controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get project by ID
  async getProjectById(req, res) {
    try {
      const project = await adminService.getProjectById(req.params.id);
      res.json(project);
    } catch (error) {
      console.error('Error in getProjectById controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get admin activity
  async getActivity(req, res) {
    try {
      const activity = await adminService.getActivity();
      res.json(activity);
    } catch (error) {
      console.error('Error in getActivity controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get admin recent activity
  async getRecentActivity(req, res) {
    try {
      const activity = await adminService.getRecentActivity();
      res.json(activity);
    } catch (error) {
      console.error('Error in getRecentActivity controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get quick submissions
  async getQuickSubmissions(req, res) {
    try {
      const submissions = await adminService.getQuickSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error('Error in getQuickSubmissions controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Test email functionality
  async testEmail(req, res) {
    try {
      const { to, subject, message } = req.body;

      if (!to || !subject || !message) {
        return res.status(400).json({
          message: 'Missing required fields: to, subject, message'
        });
      }

      const { sendEmail } = require('../utils/email');

      const emailResult = await sendEmail({
        to,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Test Email</h2>
            <p>This is a test email from the Learning Platform.</p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p><strong>Message:</strong> ${message}</p>
              <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>If you received this email, the email system is working correctly!</p>
            <p>Best regards,<br>The Learning Platform Team</p>
          </div>
        `
      });

      res.json({
        message: 'Email test completed',
        result: emailResult
      });
    } catch (error) {
      console.error('Error in testEmail controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Resend assignment notification
  async resendAssignmentNotification(req, res) {
    try {
      // So I will import assignmentsService in admin.controller.
      const assignmentsService = require('../services/assignments.service');
      const result = await assignmentsService.resendAssignmentNotification(req.params.id, req.user.id, req.user.role);
      res.json(result);
    } catch (error) {
      console.error('Error in resendAssignmentNotification controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Update user (admin)
  async updateUser(req, res) {
    try {
      const result = await adminService.updateUser(req.params.id, req.body, req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error in updateUser controller:', error);
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new AdminController(); 