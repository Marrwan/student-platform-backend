const { User, Challenge, ChallengeRegistration, ChallengeLeaderboard, Class, Project, sequelize } = require('../models');
const { Op } = require('sequelize');
const { sendEmail } = require('../utils/email');

class ChallengesService {
  // Get all challenges
  async getAllChallenges(user, params) {
    try {
      const { page = 1, limit = 20, status } = params;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const whereClause = {};
      if (status === 'active') whereClause.isActive = true;
      if (status === 'upcoming') whereClause.startDate = { [Op.gt]: new Date() };

      const challenges = await Challenge.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          user.role === 'student' ? [
            {
              model: ChallengeRegistration,
              as: 'registrations',
              where: { userId: user.id },
              required: false
            }
          ] : []
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // For students, add registration status
      if (user.role === 'student') {
        challenges.rows = challenges.rows.map(challenge => {
          const challengeData = challenge.toJSON();
          challengeData.isRegistered = challenge.registrations && challenge.registrations.length > 0;
          return challengeData;
        });
      }

      return {
        challenges: challenges.rows,
        total: challenges.count,
        page: parseInt(page),
        totalPages: Math.ceil(challenges.count / parseInt(limit))
      };
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  }

  // Create new challenge (admin only)
  async createChallenge(challengeData, userId) {
    try {
      const {
        title,
        description,
        startDate,
        endDate,
        maxParticipants,
        exemptClasses = [],
        submissionTypes = ['github', 'code', 'zip'],
        latePenalty = 10,
        allowLateSubmission = true,
        maxLateHours = 24,
        requirePayment = false,
        lateFeeAmount = 500,
        settings = {}
      } = challengeData;

      const challenge = await Challenge.create({
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        maxParticipants,
        exemptClasses,
        submissionTypes,
        latePenalty,
        allowLateSubmission,
        maxLateHours,
        requirePayment,
        lateFeeAmount,
        createdBy: userId,
        settings: {
          autoUnlock: true,
          unlockTime: '00:00:00',
          unlockDelay: 0,
          ...settings
        }
      });

      return {
        message: 'Challenge created successfully',
        challenge
      };
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  }

  // Get single challenge
  async getChallengeById(challengeId, user) {
    try {
      const challenge = await Challenge.findByPk(challengeId, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: ChallengeRegistration,
            as: 'registrations',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email']
              }
            ]
          },
          {
            model: Project,
            as: 'projects',
            order: [['day', 'ASC']]
          }
        ]
      });

      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Check if user is registered
      if (user.role === 'student') {
        const registration = challenge.registrations.find(r => r.userId === user.id);
        challenge.dataValues.isRegistered = !!registration;
        challenge.dataValues.registrationDate = registration?.createdAt;
      }

      return challenge;
    } catch (error) {
      console.error('Error fetching challenge:', error);
      throw error;
    }
  }

  // Update challenge (admin only)
  async updateChallenge(challengeId, updateData, userId, userRole) {
    try {
      const challenge = await Challenge.findByPk(challengeId);

      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Check if user has access to this challenge
      if (challenge.createdBy !== userId && userRole !== 'admin') {
        throw new Error('Access denied');
      }

      await challenge.update(updateData);

      return {
        message: 'Challenge updated successfully',
        challenge
      };
    } catch (error) {
      console.error('Error updating challenge:', error);
      throw error;
    }
  }

  // Delete challenge (admin only)
  async deleteChallenge(challengeId, userId, userRole) {
    try {
      const challenge = await Challenge.findByPk(challengeId);

      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Check if user has access to this challenge
      if (challenge.createdBy !== userId && userRole !== 'admin') {
        throw new Error('Access denied');
      }

      // Check if there are any registrations
      const registrationCount = await ChallengeRegistration.count({ where: { challengeId } });
      if (registrationCount > 0) {
        throw new Error(`Cannot delete challenge with ${registrationCount} registrations`);
      }

      await challenge.destroy();

      return { message: 'Challenge deleted successfully' };
    } catch (error) {
      console.error('Error deleting challenge:', error);
      throw error;
    }
  }

  // Register for challenge
  async registerForChallenge(challengeId, user) {
    try {
      const challenge = await Challenge.findByPk(challengeId);
      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Check if challenge is active
      if (!challenge.isActive) {
        throw new Error('Challenge is not active');
      }

      // Check if challenge has started
      if (new Date() < challenge.startDate) {
        throw new Error('Challenge has not started yet');
      }

      // Check if challenge has ended
      if (new Date() > challenge.endDate) {
        throw new Error('Challenge has ended');
      }

      // Check if user is already registered
      const existingRegistration = await ChallengeRegistration.findOne({
        where: { challengeId, userId: user.id }
      });

      if (existingRegistration) {
        throw new Error('You are already registered for this challenge');
      }

      // Check if challenge is full
      if (challenge.maxParticipants) {
        const currentParticipants = await ChallengeRegistration.count({ where: { challengeId } });
        if (currentParticipants >= challenge.maxParticipants) {
          throw new Error('Challenge is full');
        }
      }

      // Check if user's class is exempt
      if (challenge.exemptClasses && challenge.exemptClasses.length > 0) {
        const userClasses = await sequelize.query(`
          SELECT c.id FROM "Classes" c
          JOIN "ClassEnrollments" ce ON c.id = ce."classId"
          WHERE ce."userId" = :userId
        `, {
          replacements: { userId: user.id },
          type: sequelize.QueryTypes.SELECT
        });

        const userClassIds = userClasses.map(c => c.id);
        const isExempt = challenge.exemptClasses.some(classId => userClassIds.includes(classId));
        
        if (isExempt) {
          throw new Error('Your class is exempt from this challenge');
        }
      }

      const registration = await ChallengeRegistration.create({
        challengeId,
        userId: user.id,
        registeredAt: new Date()
      });

      return {
        message: 'Successfully registered for challenge',
        registration
      };
    } catch (error) {
      console.error('Error registering for challenge:', error);
      throw error;
    }
  }

  // Unregister from challenge
  async unregisterFromChallenge(challengeId, userId) {
    try {
      const registration = await ChallengeRegistration.findOne({
        where: { challengeId, userId }
      });

      if (!registration) {
        throw new Error('Registration not found');
      }

      await registration.destroy();

      return { message: 'Successfully unregistered from challenge' };
    } catch (error) {
      console.error('Error unregistering from challenge:', error);
      throw error;
    }
  }

  // Get challenge leaderboard
  async getChallengeLeaderboard(challengeId, user, params) {
    try {
      const { page = 1, limit = 20, filter = 'all' } = params;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const challenge = await Challenge.findByPk(challengeId);
      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Build where clause based on filter
      let whereClause = { challengeId };
      if (filter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        whereClause.createdAt = { [Op.between]: [today, tomorrow] };
      } else if (filter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        whereClause.createdAt = { [Op.gte]: weekAgo };
      }

      const leaderboard = await ChallengeLeaderboard.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['totalScore', 'DESC'], ['createdAt', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Add user's rank if they're a student
      let userRank = null;
      if (user.role === 'student') {
        const userEntry = await ChallengeLeaderboard.findOne({
          where: { challengeId, userId: user.id }
        });
        
        if (userEntry) {
          const rank = await ChallengeLeaderboard.count({
            where: {
              challengeId,
              totalScore: { [Op.gt]: userEntry.totalScore }
            }
          });
          userRank = rank + 1;
        }
      }

      return {
        leaderboard: leaderboard.rows,
        total: leaderboard.count,
        page: parseInt(page),
        totalPages: Math.ceil(leaderboard.count / parseInt(limit)),
        userRank
      };
    } catch (error) {
      console.error('Error fetching challenge leaderboard:', error);
      throw error;
    }
  }

  // Get challenge participants
  async getChallengeParticipants(challengeId, params) {
    try {
      const { page = 1, limit = 20 } = params;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const challenge = await Challenge.findByPk(challengeId);
      if (!challenge) {
        throw new Error('Challenge not found');
      }

      const participants = await ChallengeRegistration.findAndCountAll({
        where: { challengeId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'role']
          }
        ],
        order: [['registeredAt', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        participants: participants.rows,
        total: participants.count,
        page: parseInt(page),
        totalPages: Math.ceil(participants.count / parseInt(limit))
      };
    } catch (error) {
      console.error('Error fetching challenge participants:', error);
      throw error;
    }
  }

  // Update challenge leaderboard
  async updateChallengeLeaderboard(challengeId) {
    try {
      const challenge = await Challenge.findByPk(challengeId);
      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Get all registrations for this challenge
      const registrations = await ChallengeRegistration.findAll({
        where: { challengeId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id']
          }
        ]
      });

      // Calculate scores for each participant
      for (const registration of registrations) {
        const submissions = await sequelize.query(`
          SELECT 
            COUNT(*) as total_submissions,
            SUM(score) as total_score,
            COUNT(CASE WHEN status = 'accepted' THEN 1 END) as completed_projects,
            MAX("submittedAt") as last_submission
          FROM "Submissions" s
          JOIN "Projects" p ON s."projectId" = p.id
          WHERE s."userId" = :userId AND p."challengeId" = :challengeId
        `, {
          replacements: { 
            userId: registration.userId, 
            challengeId 
          },
          type: sequelize.QueryTypes.SELECT
        });

        const stats = submissions[0];
        
        // Update or create leaderboard entry
        await ChallengeLeaderboard.upsert({
          challengeId,
          userId: registration.userId,
          totalScore: parseInt(stats.total_score) || 0,
          totalSubmissions: parseInt(stats.total_submissions) || 0,
          completedProjects: parseInt(stats.completed_projects) || 0,
          lastSubmissionAt: stats.last_submission,
          updatedAt: new Date()
        });
      }

      return { message: 'Leaderboard updated successfully' };
    } catch (error) {
      console.error('Error updating challenge leaderboard:', error);
      throw error;
    }
  }
}

module.exports = new ChallengesService(); 