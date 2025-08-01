const { User, Submission, Project, sequelize } = require('../models');
const { Op } = require('sequelize');

class LeaderboardService {
  // Get leaderboard data
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

      // Use raw SQL for better performance and accuracy
      const leaderboardQuery = `
        SELECT 
          u.id,
          u."firstName",
          u."lastName",
          u.email,
          COUNT(s.id) as "totalSubmissions",
          COALESCE(SUM(s.score), 0) as "totalScore",
          COALESCE(AVG(s.score), 0) as "averageScore",
          MAX(s."submittedAt") as "lastSubmissionAt",
          COUNT(CASE WHEN s.status = 'accepted' THEN 1 END) as "completedProjects"
        FROM "Users" u
        LEFT JOIN "Submissions" s ON u.id = s."userId"
        ${Object.keys(finalWhere).length > 0 ? 'WHERE ' + Object.keys(finalWhere).map(key => {
          if (key === 'submittedAt') {
            return `s."submittedAt" >= '${finalWhere[key][Op.gte].toISOString()}'`;
          }
          return `s."${key}" = '${finalWhere[key]}'`;
        }).join(' AND ') : ''}
        GROUP BY u.id, u."firstName", u."lastName", u.email
        ORDER BY "totalScore" DESC
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
          SELECT u.id, COALESCE(SUM(s.score), 0) as total_score
          FROM "Users" u
          LEFT JOIN "Submissions" s ON u.id = s."userId" AND s.status = 'accepted'
          GROUP BY u.id
          HAVING COALESCE(SUM(s.score), 0) > (
            SELECT COALESCE(SUM(s2.score), 0)
            FROM "Submissions" s2
            WHERE s2."userId" = '${userId}' AND s2.status = 'accepted'
          )
        ) ranked_users
      `;

      const userRankResult = await sequelize.query(userRankQuery, {
        type: sequelize.QueryTypes.SELECT
      });

      // Format response
      const formattedData = leaderboardData.map((user, index) => ({
        id: user.id,
        rank: index + 1,
        userId: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        totalScore: parseInt(user.totalScore) || 0,
        completedProjects: parseInt(user.completedProjects) || 0,
        streakCount: Math.floor(Math.random() * 10) + 1, // Mock for now
        averageScore: parseFloat(user.averageScore) || 0,
        lastSubmissionAt: user.lastSubmissionAt || new Date().toISOString(),
        bonusPoints: Math.floor(Math.random() * 50), // Mock for now
        penaltyPoints: Math.floor(Math.random() * 20), // Mock for now
        finalScore: parseInt(user.totalScore) || 0,
        isCurrentUser: user.id === userId
      }));

      return {
        data: formattedData,
        total: formattedData.length,
        page: parseInt(page),
        totalPages: Math.ceil(formattedData.length / parseInt(limit)),
        userRank: userRankResult[0] ? parseInt(userRankResult[0].rank) : null
      };
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Return empty data instead of throwing error
      return {
        data: [],
        total: 0,
        page: parseInt(params.page || 1),
        totalPages: 0,
        userRank: null
      };
    }
  }

  // Get leaderboard statistics
  async getLeaderboardStats() {
    try {
      const [
        totalStudents,
        totalSubmissions,
        averageScore
      ] = await Promise.all([
        User.count({ where: { role: 'student' } }),
        Submission.count(),
        Submission.findOne({
          attributes: [[sequelize.fn('AVG', sequelize.col('score')), 'average']],
          where: { status: 'accepted' }
        })
      ]);

      return {
        stats: {
          totalStudents,
          totalSubmissions,
          averageScore: averageScore ? parseFloat(averageScore.getDataValue('average')) : 0
        }
      };
    } catch (error) {
      console.error('Error fetching leaderboard stats:', error);
      // Return default values instead of throwing error
      return {
        stats: {
          totalStudents: 0,
          totalSubmissions: 0,
          averageScore: 0
        }
      };
    }
  }

  // Get streak leaderboard
  async getStreakLeaderboard(userId) {
    try {
      // Mock streak data for now
      const streakData = await User.findAll({
        attributes: [
          'id',
          'firstName',
          'lastName',
          'email',
          [sequelize.literal('7'), 'streakCount'] // Mock streak count
        ],
        limit: 10,
        order: [[sequelize.literal('streakCount'), 'DESC']]
      });

      const formattedStreaks = streakData.map((user, index) => ({
        id: user.id,
        rank: index + 1,
        userId: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        streakCount: parseInt(user.getDataValue('streakCount')) || 0,
        isCurrentUser: user.id === userId
      }));

      return {
        data: formattedStreaks,
        total: formattedStreaks.length
      };
    } catch (error) {
      console.error('Error fetching streak leaderboard:', error);
      // Return empty data instead of throwing error
      return {
        data: [],
        total: 0
      };
    }
  }
}

module.exports = new LeaderboardService(); 