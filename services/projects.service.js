const { Project, Submission, User } = require('../models');
const { sendEmail } = require('../utils/email');

class ProjectsService {
  // Get all projects (filtered by user role and unlock status)
  async getAllProjects(user, params) {
    try {
      const { page = 1, limit = 30, difficulty, status } = params;
      
      const offset = (page - 1) * limit;
      const whereClause = {};
      
      // Users can only see unlocked projects
      if (user.role === 'user') {
        whereClause.isUnlocked = true;
      }
      
      if (difficulty) {
        whereClause.difficulty = difficulty;
      }
      
      const projects = await Project.findAndCountAll({
        where: whereClause,
        order: [['day', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: user.role === 'user' ? [{
          model: Submission,
          where: { userId: user.id },
          required: false
        }] : []
      });
      
      // For users, add submission status and parse requirements
      if (user.role === 'user') {
        projects.rows = projects.rows.map(project => {
          const submission = project.Submissions?.[0];
          const now = new Date();
          const deadline = new Date(project.deadline);
          const isOverdue = now > deadline;
          
          const projectData = project.toJSON();
          
          // Parse requirements from JSON string to array
          if (projectData.requirements) {
            try {
              projectData.requirements = JSON.parse(projectData.requirements);
            } catch (error) {
              // If parsing fails, treat as plain text and split by newlines
              projectData.requirements = projectData.requirements.split('\n').filter(req => req.trim());
            }
          } else {
            projectData.requirements = [];
          }
          
          return {
            ...projectData,
            submissionStatus: submission ? submission.status : 'not_submitted',
            submissionScore: submission ? submission.score : null,
            isOverdue,
            timeRemaining: isOverdue ? 0 : deadline.getTime() - now.getTime()
          };
        });
      }
      
      return {
        data: projects.rows,
        total: projects.count,
        totalPages: Math.ceil(projects.count / parseInt(limit)),
        currentPage: parseInt(page)
      };
    } catch (error) {
      console.error('Get projects error:', error);
      throw error;
    }
  }

  // Get single project by ID
  async getProjectById(projectId, user) {
    try {
      const project = await Project.findByPk(projectId, {
        include: user.role === 'user' ? [{
          model: Submission,
          where: { userId: user.id },
          required: false
        }] : []
      });
      
      if (!project) {
        throw new Error('Project not found.');
      }
      
      // Users can only access unlocked projects
      if (user.role === 'user' && !project.isUnlocked) {
        throw new Error('This project is not yet unlocked.');
      }
      
      const projectData = project.toJSON();
      
      // Parse requirements from JSON string to array
      if (projectData.requirements) {
        try {
          projectData.requirements = JSON.parse(projectData.requirements);
        } catch (error) {
          // If parsing fails, treat as plain text and split by newlines
          projectData.requirements = projectData.requirements.split('\n').filter(req => req.trim());
        }
      } else {
        projectData.requirements = [];
      }
      
      if (user.role === 'user') {
        const submission = project.Submissions?.[0];
        const now = new Date();
        const deadline = new Date(project.deadline);
        const isOverdue = now > deadline;
        
        projectData.submissionStatus = submission ? submission.status : 'not_submitted';
        projectData.submissionScore = submission ? submission.score : null;
        projectData.isOverdue = isOverdue;
        projectData.timeRemaining = isOverdue ? 0 : deadline.getTime() - now.getTime();
      }
      
      return { project: projectData };
    } catch (error) {
      console.error('Get project error:', error);
      throw error;
    }
  }

  // Create new project (admin only)
  async createProject(projectData, userId) {
    try {
      const {
        title,
        description,
        day,
        difficulty,
        submissionType,
        maxScore,
        deadline,
        requirements = [],
        sampleOutput
      } = projectData;

      // Check if project for this day already exists
      const existingProject = await Project.findOne({ where: { day } });
      if (existingProject) {
        throw new Error(`Project for day ${day} already exists`);
      }

      const project = await Project.create({
        title,
        description,
        day,
        difficulty,
        submissionType,
        maxScore,
        deadline: new Date(deadline),
        requirements,
        sampleOutput,
        isUnlocked: false,
        createdBy: userId
      });

      return project;
    } catch (error) {
      console.error('Create project error:', error);
      throw error;
    }
  }

  // Update project (admin only)
  async updateProject(projectId, updateData) {
    try {
      const project = await Project.findByPk(projectId);
      
      if (!project) {
        throw new Error('Project not found.');
      }

      await project.update(updateData);
      return project;
    } catch (error) {
      console.error('Update project error:', error);
      throw error;
    }
  }

  // Toggle project lock status (admin only)
  async toggleProjectLock(projectId, isUnlocked) {
    try {
      const project = await Project.findByPk(projectId);
      if (!project) {
        throw new Error('Project not found.');
      }

      await project.update({ isUnlocked });

      // If unlocking, send notification to all active users
      if (isUnlocked) {
        const activeUsers = await User.findAll({
          where: { role: 'user', isActive: true }
        });

        for (const user of activeUsers) {
          await sendEmail({
            to: user.email,
            subject: `New Project Unlocked: Day ${project.day}`,
            html: `
              <h2>New Project Available!</h2>
              <p>Day ${project.day}: ${project.title} is now unlocked.</p>
              <p><strong>Difficulty:</strong> ${project.difficulty}</p>
              <p><strong>Deadline:</strong> ${new Date(project.deadline).toLocaleDateString()}</p>
              <p>Log in to your dashboard to start working on this project!</p>
            `
          });
        }
      }

      return project;
    } catch (error) {
      console.error('Toggle project lock error:', error);
      throw error;
    }
  }

  // Delete project (admin only)
  async deleteProject(projectId) {
    try {
      const project = await Project.findByPk(projectId);
      
      if (!project) {
        throw new Error('Project not found.');
      }

      // Check if there are any submissions for this project
      const submissionCount = await Submission.count({ where: { projectId } });
      if (submissionCount > 0) {
        throw new Error(`Cannot delete project with ${submissionCount} existing submissions`);
      }

      await project.destroy();
      return { message: 'Project deleted successfully' };
    } catch (error) {
      console.error('Delete project error:', error);
      throw error;
    }
  }

  // Get project statistics (admin only)
  async getProjectStats(projectId) {
    try {
      const project = await Project.findByPk(projectId);
      if (!project) {
        throw new Error('Project not found.');
      }

      const submissions = await Submission.findAndCountAll({
        where: { projectId },
        include: [{
          model: User,
          attributes: ['id', 'name', 'email']
        }]
      });

      const stats = {
        totalSubmissions: submissions.count,
        pendingReviews: submissions.rows.filter(s => s.status === 'pending').length,
        acceptedSubmissions: submissions.rows.filter(s => s.status === 'accepted').length,
        rejectedSubmissions: submissions.rows.filter(s => s.status === 'rejected').length,
        averageScore: submissions.rows.length > 0 
          ? submissions.rows.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.rows.length 
          : 0,
        lateSubmissions: submissions.rows.filter(s => s.isLate).length
      };

      return stats;
    } catch (error) {
      console.error('Get project stats error:', error);
      throw error;
    }
  }
}

module.exports = new ProjectsService(); 