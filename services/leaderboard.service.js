const { User, Submission, Project, Class, ClassEnrollment, Assignment, AssignmentSubmission, WeeklyAttendance, sequelize } = require('../models');
const { Op } = require('sequelize');

class LeaderboardService {
  // Get overall leaderboard data
  async getLeaderboard(params, userId) {
    try {
      const { filter = 'all-time', projectId, page = 1, limit = 20 } = params;
      
      let whereClause = {};
      let dateFilter = {};
      
      // Apply date filter
      if (filter === 'daily') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dateFilter = {
          submittedAt: {
            [Op.gte]: today
          }
        };
      } else if (filter === 'weekly') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFilter = {
          submittedAt: {
            [Op.gte]: weekAgo
          }
        };
      } else if (filter === 'monthly') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateFilter = {
          submittedAt: {
            [Op.gte]: monthAgo
          }
        };
      }

      // Apply project filter
      if (projectId && projectId !== 'all') {
        whereClause.projectId = projectId;
      }

      // Combine filters
      const finalWhere = { ...whereClause, ...dateFilter };

      // Enhanced leaderboard query with intelligent scoring - includes both project submissions and assignment submissions
      const leaderboardQuery = `
        SELECT 
          u.id,
          u."firstName",
          u."lastName",
          u.email,
          COALESCE(project_stats."totalSubmissions", 0) + COALESCE(assignment_stats."totalSubmissions", 0) as "totalSubmissions",
          COALESCE(project_stats."totalScore", 0) + COALESCE(assignment_stats."totalScore", 0) as "totalScore",
          CASE 
            WHEN (COALESCE(project_stats."totalSubmissions", 0) + COALESCE(assignment_stats."totalSubmissions", 0)) > 0 
            THEN (COALESCE(project_stats."totalScore", 0) + COALESCE(assignment_stats."totalScore", 0)) / (COALESCE(project_stats."totalSubmissions", 0) + COALESCE(assignment_stats."totalSubmissions", 0))
            ELSE 0 
          END as "averageScore",
          GREATEST(COALESCE(project_stats."lastSubmissionAt", '1900-01-01'::timestamp), COALESCE(assignment_stats."lastSubmissionAt", '1900-01-01'::timestamp)) as "lastSubmissionAt",
          COALESCE(project_stats."completedProjects", 0) + COALESCE(assignment_stats."completedAssignments", 0) as "completedProjects",
          COALESCE(project_stats."acceptedScore", 0) + COALESCE(assignment_stats."acceptedScore", 0) as "acceptedScore",
          COALESCE(project_stats."acceptedSubmissions", 0) + COALESCE(assignment_stats."acceptedSubmissions", 0) as "acceptedSubmissions",
          COALESCE(project_stats."rejectedSubmissions", 0) + COALESCE(assignment_stats."rejectedSubmissions", 0) as "rejectedSubmissions",
          COALESCE(project_stats."lateSubmissions", 0) + COALESCE(assignment_stats."lateSubmissions", 0) as "lateSubmissions"
        FROM "Users" u
        LEFT JOIN (
          SELECT 
            s."userId",
            COUNT(s.id) as "totalSubmissions",
            COALESCE(SUM(s.score), 0) as "totalScore",
            MAX(s."submittedAt") as "lastSubmissionAt",
            COUNT(CASE WHEN s.status = 'accepted' THEN 1 END) as "completedProjects",
            COALESCE(SUM(CASE WHEN s.status = 'accepted' THEN s.score ELSE 0 END), 0) as "acceptedScore",
            COUNT(CASE WHEN s.status = 'accepted' THEN 1 END) as "acceptedSubmissions",
            COALESCE(SUM(CASE WHEN s.status = 'rejected' THEN 1 ELSE 0 END), 0) as "rejectedSubmissions",
            COALESCE(SUM(CASE WHEN s."isLate" = true THEN 1 ELSE 0 END), 0) as "lateSubmissions"
          FROM "Submissions" s
          ${Object.keys(finalWhere).length > 0 ? 'WHERE ' + Object.keys(finalWhere).map(key => {
            if (key === 'submittedAt') {
              return `s."submittedAt" >= '${finalWhere[key][Op.gte].toISOString()}'`;
            }
            return `s."${key}" = '${finalWhere[key]}'`;
          }).join(' AND ') : ''}
          GROUP BY s."userId"
        ) project_stats ON u.id = project_stats."userId"
        LEFT JOIN (
          SELECT 
            asub."userId",
            COUNT(asub.id) as "totalSubmissions",
            COALESCE(SUM(asub.score), 0) as "totalScore",
            MAX(asub."submittedAt") as "lastSubmissionAt",
            COUNT(CASE WHEN asub.status = 'accepted' THEN 1 END) as "completedAssignments",
            COALESCE(SUM(CASE WHEN asub.status = 'accepted' THEN asub.score ELSE 0 END), 0) as "acceptedScore",
            COUNT(CASE WHEN asub.status = 'accepted' THEN 1 END) as "acceptedSubmissions",
            COALESCE(SUM(CASE WHEN asub.status = 'rejected' THEN 1 ELSE 0 END), 0) as "rejectedSubmissions",
            COALESCE(SUM(CASE WHEN asub."isLate" = true THEN 1 ELSE 0 END), 0) as "lateSubmissions"
          FROM "AssignmentSubmissions" asub
          ${Object.keys(finalWhere).length > 0 ? 'WHERE ' + Object.keys(finalWhere).map(key => {
            if (key === 'submittedAt') {
              return `asub."submittedAt" >= '${finalWhere[key][Op.gte].toISOString()}'`;
            }
            return `asub."${key}" = '${finalWhere[key]}'`;
          }).join(' AND ') : ''}
          GROUP BY asub."userId"
        ) assignment_stats ON u.id = assignment_stats."userId"
        GROUP BY u.id, u."firstName", u."lastName", u.email, project_stats.*, assignment_stats.*
        ORDER BY "acceptedScore" DESC, "averageScore" DESC, "completedProjects" DESC
        LIMIT ${parseInt(limit)}
        OFFSET ${(parseInt(page) - 1) * parseInt(limit)}
      `;

      const leaderboardData = await sequelize.query(leaderboardQuery, {
        type: sequelize.QueryTypes.SELECT
      });

      // Calculate user's rank
      const userRankQuery = `
        SELECT COUNT(*) + 1 as rank
        FROM (
          SELECT u.id, COALESCE(SUM(CASE WHEN s.status = 'accepted' THEN s.score ELSE 0 END), 0) as total_score
          FROM "Users" u
          LEFT JOIN "Submissions" s ON u.id = s."userId"
          GROUP BY u.id
          HAVING COALESCE(SUM(CASE WHEN s.status = 'accepted' THEN s.score ELSE 0 END), 0) > (
            SELECT COALESCE(SUM(CASE WHEN s2.status = 'accepted' THEN s2.score ELSE 0 END), 0)
            FROM "Submissions" s2
            WHERE s2."userId" = '${userId}'
          )
        ) ranked_users
      `;

      const userRankResult = await sequelize.query(userRankQuery, {
        type: sequelize.QueryTypes.SELECT
      });

      // Calculate intelligent scoring metrics
      const formattedData = leaderboardData.map((user, index) => {
        const totalSubmissions = parseInt(user.totalSubmissions) || 0;
        const acceptedSubmissions = parseInt(user.acceptedSubmissions) || 0;
        const rejectedSubmissions = parseInt(user.rejectedSubmissions) || 0;
        const lateSubmissions = parseInt(user.lateSubmissions) || 0;
        const acceptedScore = parseInt(user.acceptedScore) || 0;
        const averageScore = parseFloat(user.averageScore) || 0;
        
        // Calculate intelligent metrics
        const completionRate = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0;
        const qualityScore = acceptedSubmissions > 0 ? (acceptedScore / acceptedSubmissions) : 0;
        const penaltyPoints = lateSubmissions * 5; // 5 points penalty per late submission
        const bonusPoints = completionRate >= 80 ? 50 : (completionRate >= 60 ? 25 : 0); // Bonus for high completion rate
        
        const finalScore = acceptedScore + bonusPoints - penaltyPoints;

        return {
          id: user.id,
          rank: index + 1,
          userId: user.id,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
          totalScore: acceptedScore,
          completedProjects: acceptedSubmissions,
          totalSubmissions: totalSubmissions,
          averageScore: averageScore,
          lastSubmissionAt: user.lastSubmissionAt || new Date().toISOString(),
          bonusPoints: bonusPoints,
          penaltyPoints: penaltyPoints,
          finalScore: finalScore,
          completionRate: completionRate,
          qualityScore: qualityScore,
          isCurrentUser: user.id === userId
        };
      });

      return {
        data: formattedData,
        total: formattedData.length,
        page: parseInt(page),
        totalPages: Math.ceil(formattedData.length / parseInt(limit)),
        userRank: userRankResult[0] ? parseInt(userRankResult[0].rank) : null
      };
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return {
        data: [],
        total: 0,
        page: parseInt(params.page || 1),
        totalPages: 0,
        userRank: null
      };
    }
  }

  // Get class-based leaderboard with attendance scores
  async getClassLeaderboard(classId, userId) {
    try {
      const classLeaderboardQuery = `
        SELECT 
          u.id,
          u."firstName",
          u."lastName",
          u.email,
          ce."enrolledAt",
          ce.progress,
          ce."averageScore",
          ce."attendanceScore",
          COALESCE(project_stats."totalSubmissions", 0) + COALESCE(assignment_stats."totalSubmissions", 0) as "totalSubmissions",
          COALESCE(project_stats."acceptedScore", 0) + COALESCE(assignment_stats."acceptedScore", 0) as "acceptedScore",
          COALESCE(project_stats."acceptedSubmissions", 0) + COALESCE(assignment_stats."acceptedSubmissions", 0) as "acceptedSubmissions",
          COALESCE(project_stats."rejectedSubmissions", 0) + COALESCE(assignment_stats."rejectedSubmissions", 0) as "rejectedSubmissions",
          COALESCE(project_stats."lateSubmissions", 0) + COALESCE(assignment_stats."lateSubmissions", 0) as "lateSubmissions"
        FROM "Users" u
        INNER JOIN "ClassEnrollments" ce ON u.id = ce."userId"
        LEFT JOIN (
          SELECT 
            s."userId",
            COUNT(s.id) as "totalSubmissions",
            COALESCE(SUM(CASE WHEN s.status = 'accepted' THEN s.score ELSE 0 END), 0) as "acceptedScore",
            COUNT(CASE WHEN s.status = 'accepted' THEN 1 END) as "acceptedSubmissions",
            COUNT(CASE WHEN s.status = 'rejected' THEN 1 END) as "rejectedSubmissions",
            COALESCE(SUM(CASE WHEN s."isLate" = true THEN 1 ELSE 0 END), 0) as "lateSubmissions"
          FROM "Submissions" s
          GROUP BY s."userId"
        ) project_stats ON u.id = project_stats."userId"
        LEFT JOIN (
          SELECT 
            asub."userId",
            COUNT(asub.id) as "totalSubmissions",
            COALESCE(SUM(CASE WHEN asub.status = 'accepted' THEN asub.score ELSE 0 END), 0) as "acceptedScore",
            COUNT(CASE WHEN asub.status = 'accepted' THEN 1 END) as "acceptedSubmissions",
            COUNT(CASE WHEN asub.status = 'rejected' THEN 1 END) as "rejectedSubmissions",
            COALESCE(SUM(CASE WHEN asub."isLate" = true THEN 1 ELSE 0 END), 0) as "lateSubmissions"
          FROM "AssignmentSubmissions" asub
          INNER JOIN "Assignments" a ON asub."assignmentId" = a.id
          WHERE a."classId" = '${classId}'
          GROUP BY asub."userId"
        ) assignment_stats ON u.id = assignment_stats."userId"
        WHERE ce."classId" = '${classId}'
        GROUP BY u.id, u."firstName", u."lastName", u.email, ce."enrolledAt", ce.progress, ce."averageScore", ce."attendanceScore", project_stats.*, assignment_stats.*
        ORDER BY (ce."attendanceScore" * 0.3 + (COALESCE(project_stats."acceptedScore", 0) + COALESCE(assignment_stats."acceptedScore", 0)) * 0.7) DESC
      `;

      const leaderboardData = await sequelize.query(classLeaderboardQuery, {
        type: sequelize.QueryTypes.SELECT
      });

      const formattedData = leaderboardData.map((user, index) => {
        const attendanceScore = parseFloat(user.attendanceScore) || 0;
        const acceptedScore = parseInt(user.acceptedScore) || 0;
        const totalSubmissions = parseInt(user.totalSubmissions) || 0;
        const acceptedSubmissions = parseInt(user.acceptedSubmissions) || 0;
        const lateSubmissions = parseInt(user.lateSubmissions) || 0;
        
        // Class-specific scoring: 30% attendance + 70% assignment scores
        const assignmentScore = acceptedScore;
        const finalScore = (attendanceScore * 0.3) + (assignmentScore * 0.7);
        const completionRate = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0;

        return {
          id: user.id,
          rank: index + 1,
          userId: user.id,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
          attendanceScore: attendanceScore,
          assignmentScore: assignmentScore,
          finalScore: finalScore,
          completedProjects: acceptedSubmissions,
          totalSubmissions: totalSubmissions,
          completionRate: completionRate,
          lateSubmissions: lateSubmissions,
          enrolledAt: user.enrolledAt,
          isCurrentUser: user.id === userId
        };
      });

      return {
        data: formattedData,
        total: formattedData.length,
        classId: classId
      };
    } catch (error) {
      console.error('Error fetching class leaderboard:', error);
      return {
        data: [],
        total: 0,
        classId: classId
      };
    }
  }

  // Get project-specific leaderboard with intelligent metrics
  async getProjectLeaderboard(projectId, userId) {
    try {
      const projectLeaderboardQuery = `
        SELECT 
          u.id,
          u."firstName",
          u."lastName",
          u.email,
          s.id as "submissionId",
          s.score,
          s.status,
          s."submittedAt",
          s."isLate",
          s."reviewedAt",
          s."adminFeedback",
          s."adminComments",
          s."bonusPoints",
          s."deductions",
          s."finalScore",
          EXTRACT(EPOCH FROM (s."submittedAt" - p."createdAt")) / 3600 as "hoursToSubmit"
        FROM "Users" u
        INNER JOIN "Submissions" s ON u.id = s."userId"
        INNER JOIN "Projects" p ON s."projectId" = p.id
        WHERE s."projectId" = '${projectId}'
        ORDER BY s."finalScore" DESC, s."submittedAt" ASC
      `;

      const leaderboardData = await sequelize.query(projectLeaderboardQuery, {
        type: sequelize.QueryTypes.SELECT
      });

      const formattedData = leaderboardData.map((user, index) => {
        const baseScore = parseInt(user.score) || 0;
        const bonusPoints = parseInt(user.bonusPoints) || 0;
        const deductions = parseInt(user.deductions) || 0;
        const finalScore = parseInt(user.finalScore) || baseScore;
        const hoursToSubmit = parseFloat(user.hoursToSubmit) || 0;
        const isLate = user.isLate || false;
        
        // Calculate intelligent metrics
        const timeBonus = hoursToSubmit <= 24 ? 10 : (hoursToSubmit <= 48 ? 5 : 0); // Bonus for early submission
        const qualityBonus = baseScore >= 90 ? 15 : (baseScore >= 80 ? 10 : (baseScore >= 70 ? 5 : 0)); // Quality bonus
        const latePenalty = isLate ? 10 : 0; // Late penalty
        
        const intelligentScore = finalScore + timeBonus + qualityBonus - latePenalty;

        return {
          id: user.id,
          rank: index + 1,
          userId: user.id,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
          submissionId: user.submissionId,
          baseScore: baseScore,
          bonusPoints: bonusPoints,
          deductions: deductions,
          finalScore: finalScore,
          intelligentScore: intelligentScore,
          timeBonus: timeBonus,
          qualityBonus: qualityBonus,
          latePenalty: latePenalty,
          hoursToSubmit: hoursToSubmit,
          isLate: isLate,
          status: user.status,
          submittedAt: user.submittedAt,
          reviewedAt: user.reviewedAt,
          adminFeedback: user.adminFeedback,
          isCurrentUser: user.id === userId
        };
      });

      return {
        data: formattedData,
        total: formattedData.length,
        projectId: projectId
      };
    } catch (error) {
      console.error('Error fetching project leaderboard:', error);
      return {
        data: [],
        total: 0,
        projectId: projectId
      };
    }
  }

  // Get leaderboard statistics
  async getLeaderboardStats() {
    try {
      const [
        totalStudents,
        totalSubmissions,
        averageScore,
        totalClasses,
        activeClasses
      ] = await Promise.all([
        User.count({ where: { role: 'student' } }),
        Submission.count(),
        Submission.findOne({
          attributes: [[sequelize.fn('AVG', sequelize.col('score')), 'average']],
          where: { status: 'accepted' }
        }),
        Class.count(),
        Class.count({ where: { isActive: true } })
      ]);

      return {
        stats: {
          totalStudents,
          totalSubmissions,
          averageScore: averageScore ? parseFloat(averageScore.getDataValue('average')) : 0,
          totalClasses,
          activeClasses
        }
      };
    } catch (error) {
      console.error('Error fetching leaderboard stats:', error);
      return {
        stats: {
          totalStudents: 0,
          totalSubmissions: 0,
          averageScore: 0,
          totalClasses: 0,
          activeClasses: 0
        }
      };
    }
  }

  // Get streak leaderboard
  async getStreakLeaderboard(userId) {
    try {
      // Calculate actual streaks based on submission patterns
      const streakQuery = `
        SELECT 
          u.id,
          u."firstName",
          u."lastName",
          u.email,
          COUNT(DISTINCT DATE(s."submittedAt")) as "consecutiveDays"
        FROM "Users" u
        LEFT JOIN "Submissions" s ON u.id = s."userId" 
          AND s."submittedAt" >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY u.id, u."firstName", u."lastName", u.email
        HAVING COUNT(DISTINCT DATE(s."submittedAt")) > 0
        ORDER BY "consecutiveDays" DESC
        LIMIT 10
      `;

      const streakData = await sequelize.query(streakQuery, {
        type: sequelize.QueryTypes.SELECT
      });

      const formattedStreaks = streakData.map((user, index) => ({
        id: user.id,
        rank: index + 1,
        userId: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        streakCount: parseInt(user.consecutiveDays) || 0,
        isCurrentUser: user.id === userId
      }));

      return {
        data: formattedStreaks,
        total: formattedStreaks.length
      };
    } catch (error) {
      console.error('Error fetching streak leaderboard:', error);
      return {
        data: [],
        total: 0
      };
    }
  }

  // Update attendance score for a student in a class
  async updateAttendanceScore(classId, userId, attendanceScore) {
    try {
      await ClassEnrollment.update(
        { attendanceScore: attendanceScore },
        { where: { classId, userId } }
      );
      return { success: true, message: 'Attendance score updated successfully' };
    } catch (error) {
      console.error('Error updating attendance score:', error);
      throw new Error('Failed to update attendance score');
    }
  }
}

module.exports = new LeaderboardService(); 