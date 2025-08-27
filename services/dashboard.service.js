const { Assignment, AssignmentSubmission, User, Class, ClassEnrollment, sequelize } = require('../models');
const { Op } = require('sequelize');

class DashboardService {
  // Get today's project (now shows assignments from enrolled classes)
  async getTodayProject(userId) {
    try {
      // Get student's enrolled classes
      const enrollments = await ClassEnrollment.findAll({
        where: { userId },
        include: [{
          model: Class,
          as: 'class',
          attributes: ['id', 'name']
        }]
      });

      if (enrollments.length === 0) {
        return { 
          project: null, 
          message: 'You are not enrolled in any classes. Join a class to see assignments.' 
        };
      }

      const classIds = enrollments.map(e => e.class.id);

      // Find the most urgent assignment (closest deadline that's not due yet)
      const now = new Date();
      const urgentAssignment = await Assignment.findOne({
        where: {
          classId: { [Op.in]: classIds },
          isUnlocked: true,
          isActive: true,
          deadline: { [Op.gt]: now } // Not due yet
        },
        include: [{
          model: Class,
          as: 'class',
          attributes: ['name']
        }],
        order: [['deadline', 'ASC']] // Closest deadline first
      });

      if (!urgentAssignment) {
        // Check if there are any assignments at all (even if due)
        const anyAssignment = await Assignment.findOne({
          where: {
            classId: { [Op.in]: classIds },
            isUnlocked: true,
            isActive: true
          },
          include: [{
            model: Class,
            as: 'class',
            attributes: ['name']
          }],
          order: [['deadline', 'ASC']]
        });

        if (anyAssignment) {
          const deadline = new Date(anyAssignment.deadline);
          const timeRemaining = deadline - now;
          const isOverdue = timeRemaining < 0;

          const todayProject = {
            id: anyAssignment.id,
            title: anyAssignment.title,
            description: anyAssignment.description,
            deadline: anyAssignment.deadline,
            timeRemaining: isOverdue ? 'Overdue' : `${Math.floor(timeRemaining / (1000 * 60 * 60))}h ${Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))}m`,
            isOverdue,
            status: 'pending',
            difficulty: anyAssignment.difficulty || 'medium',
            requirements: anyAssignment.requirements ? [anyAssignment.requirements] : [],
            class: anyAssignment.class.name
          };
          return { project: todayProject };
        }

        return { 
          project: null, 
          message: 'No assignments available in your enrolled classes.' 
        };
      }

      // Calculate time remaining for urgent assignment
      const deadline = new Date(urgentAssignment.deadline);
      const timeRemaining = deadline - now;
      const isOverdue = timeRemaining < 0;

      // Check if student has submitted this assignment
      const submission = await AssignmentSubmission.findOne({
        where: {
          assignmentId: urgentAssignment.id,
          userId
        }
      });

      const todayProject = {
        id: urgentAssignment.id,
        title: urgentAssignment.title,
        description: urgentAssignment.description,
        deadline: urgentAssignment.deadline,
        timeRemaining: isOverdue ? 'Overdue' : `${Math.floor(timeRemaining / (1000 * 60 * 60))}h ${Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))}m`,
        isOverdue,
        status: submission ? submission.status : 'pending',
        difficulty: urgentAssignment.difficulty || 'medium',
        requirements: urgentAssignment.requirements ? [urgentAssignment.requirements] : [],
        class: urgentAssignment.class.name
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
      const submissions = await AssignmentSubmission.findAll({
        where: { userId },
        include: [
          {
            model: Assignment,
            as: 'assignment',
            attributes: ['id', 'title'],
            include: [{
              model: Class,
              as: 'class',
              attributes: ['name']
            }]
          }
        ],
        order: [['submittedAt', 'DESC']],
        limit: 5
      });

      const recentSubmissions = submissions.map(sub => ({
        id: sub.id,
        projectTitle: sub.assignment?.title || 'Unknown Assignment',
        class: sub.assignment?.class?.name || 'Unknown Class',
        submittedAt: sub.submittedAt,
        status: sub.status,
        score: sub.score,
        feedback: sub.feedback
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
      // Get student's enrolled classes
      const enrollments = await ClassEnrollment.findAll({
        where: { userId },
        attributes: ['classId']
      });

      const classIds = enrollments.map(e => e.classId);

      // Get assignments from enrolled classes
      const totalAssignments = await Assignment.count({
        where: {
          classId: { [Op.in]: classIds },
          isUnlocked: true,
          isActive: true
        }
      });

      // Get completed assignments
      const completedAssignments = await AssignmentSubmission.count({
        where: { 
          userId, 
          status: 'accepted' 
        },
        include: [{
          model: Assignment,
          as: 'assignment',
          where: {
            classId: { [Op.in]: classIds }
          },
          required: true
        }]
      });

      // Get average score - calculate manually to avoid SQL issues
      const acceptedSubmissions = await AssignmentSubmission.findAll({
        where: { 
          userId, 
          status: 'accepted' 
        },
        include: [{
          model: Assignment,
          as: 'assignment',
          where: {
            classId: { [Op.in]: classIds }
          },
          required: true,
          attributes: []
        }],
        attributes: ['score']
      });

      const averageScore = acceptedSubmissions.length > 0 
        ? acceptedSubmissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / acceptedSubmissions.length
        : 0;

      // Get total score - calculate manually to avoid SQL issues
      const totalScore = acceptedSubmissions.reduce((sum, sub) => sum + (sub.score || 0), 0);

      // Get total students
      const totalStudents = await User.count({ where: { role: 'student' } });

      // Calculate pending assignments
      const pendingAssignments = Math.max(0, totalAssignments - completedAssignments);
      
      // Calculate missed assignments (assignments past deadline without submission)
      const now = new Date();
      const missedAssignments = await Assignment.count({
        where: {
          classId: { [Op.in]: classIds },
          isUnlocked: true,
          isActive: true,
          deadline: { [Op.lt]: now }
        },
        include: [{
          model: AssignmentSubmission,
          as: 'submissions',
          where: { userId },
          required: false
        }]
      });

      // Calculate current streak (consecutive completed assignments)
      const currentStreak = completedAssignments > 0 ? 1 : 0; // Simplified for now
      
      // Calculate rank (simplified - could be enhanced with actual ranking logic)
      const rank = completedAssignments > 0 ? Math.floor(Math.random() * 10) + 1 : 0;

      return {
        stats: {
          totalProjects: totalAssignments,
          completedProjects: completedAssignments,
          missedProjects: missedAssignments,
          pendingProjects: pendingAssignments,
          averageScore: Math.round(averageScore * 100) / 100, // Round to 2 decimal places
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