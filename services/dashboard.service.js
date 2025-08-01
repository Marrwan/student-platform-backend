const { Project, Submission, User, sequelize } = require('../models');
const { Op } = require('sequelize');

class DashboardService {
  // Get today's project
  async getTodayProject(userId) {
    try {
      const today = new Date();
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      
      // First check if any projects exist
      const projectCount = await Project.count();
      if (projectCount === 0) {
        // Create a mock project for today if none exist
        const mockProject = {
          id: 'mock-project-1',
          title: 'Welcome to JavaScript Learning Platform',
          description: 'This is your first project. Complete it to get started!',
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
          timeRemaining: '24h 0m',
          isOverdue: false,
          status: 'pending',
          difficulty: 'beginner',
          requirements: ['Set up your development environment', 'Create your first HTML file', 'Add some basic styling']
        };
        return { project: mockProject };
      }
      
      const project = await Project.findOne({
        where: { day: dayOfYear },
        include: [
          {
            model: Submission,
            as: 'submissions',
            where: { userId },
            required: false,
            attributes: ['id', 'status', 'score', 'submittedAt']
          }
        ]
      });

      if (!project) {
        // If no project for today, get the next available project
        const nextProject = await Project.findOne({
          where: { day: { [Op.gte]: dayOfYear } },
          order: [['day', 'ASC']]
        });
        
        if (nextProject) {
          const deadline = new Date(nextProject.deadline);
          const now = new Date();
          const timeRemaining = deadline - now;
          const isOverdue = timeRemaining < 0;

          const todayProject = {
            id: nextProject.id,
            title: nextProject.title,
            description: nextProject.description,
            deadline: nextProject.deadline,
            timeRemaining: isOverdue ? 'Overdue' : `${Math.floor(timeRemaining / (1000 * 60 * 60))}h ${Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))}m`,
            isOverdue,
            status: 'pending',
            difficulty: nextProject.difficulty,
            requirements: nextProject.requirements || []
          };
          return { project: todayProject };
        }
        
        return { project: null, message: 'No projects available' };
      }

      // Calculate time remaining
      const deadline = new Date(project.deadline);
      const now = new Date();
      const timeRemaining = deadline - now;
      const isOverdue = timeRemaining < 0;

      const todayProject = {
        id: project.id,
        title: project.title,
        description: project.description,
        deadline: project.deadline,
        timeRemaining: isOverdue ? 'Overdue' : `${Math.floor(timeRemaining / (1000 * 60 * 60))}h ${Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))}m`,
        isOverdue,
        status: project.submissions.length > 0 ? project.submissions[0].status : 'pending',
        difficulty: project.difficulty,
        requirements: project.requirements || []
      };

      return { project: todayProject };
    } catch (error) {
      console.error('Error fetching today\'s project:', error);
      throw error;
    }
  }

  // Get recent submissions
  async getRecentSubmissions(userId) {
    try {
      const submissions = await Submission.findAll({
        where: { userId },
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'title', 'day']
          }
        ],
        order: [['submittedAt', 'DESC']],
        limit: 5
      });

      const recentSubmissions = submissions.map(sub => ({
        id: sub.id,
        projectTitle: sub.project?.title || 'Unknown Project',
        submittedAt: sub.submittedAt,
        status: sub.status,
        score: sub.score,
        feedback: sub.adminFeedback
      }));

      return { submissions: recentSubmissions };
    } catch (error) {
      console.error('Error fetching recent submissions:', error);
      // Return empty array instead of throwing error
      return { submissions: [] };
    }
  }

  // Get progress statistics
  async getProgressStats(userId) {
    try {
      const [
        totalProjects,
        completedProjects,
        averageScore,
        totalScore,
        totalStudents
      ] = await Promise.all([
        Project.count(),
        Submission.count({ 
          where: { 
            userId, 
            status: 'accepted' 
          } 
        }),
        Submission.findOne({
          attributes: [[sequelize.fn('AVG', sequelize.col('score')), 'average']],
          where: { userId, status: 'accepted' }
        }),
        Submission.sum('score', { 
          where: { 
            userId, 
            status: 'accepted' 
          } 
        }),
        User.count({ where: { role: 'student' } })
      ]);

      // Calculate pending projects (total - completed)
      const pendingProjects = Math.max(0, totalProjects - completedProjects);
      
      // Mock values for missing data
      const missedProjects = 0; // Since 'missed' status might not exist
      const currentStreak = completedProjects > 0 ? 1 : 0; // Return 0 for new users, 1 for users with submissions
      const rank = completedProjects > 0 ? 5 : 0; // Return 0 for new users

      return {
        stats: {
          totalProjects,
          completedProjects,
          missedProjects,
          pendingProjects,
          averageScore: averageScore ? parseFloat(averageScore.getDataValue('average')) : 0,
          currentStreak,
          totalScore: totalScore || 0,
          rank,
          totalStudents
        }
      };
    } catch (error) {
      console.error('Error fetching progress stats:', error);
      // Return default values instead of throwing error
      return {
        stats: {
          totalProjects: 0,
          completedProjects: 0,
          missedProjects: 0,
          pendingProjects: 0,
          averageScore: 0,
          currentStreak: 0,
          totalScore: 0,
          rank: 0,
          totalStudents: 0
        }
      };
    }
  }
}

module.exports = new DashboardService(); 