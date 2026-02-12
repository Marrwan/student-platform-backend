const { Badge, UserBadge, Recognition, InternOfTheMonth, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// --- Badges ---

exports.getAllBadges = async (req, res) => {
    try {
        const badges = await Badge.findAll();
        res.json(badges);
    } catch (error) {
        console.error('Error fetching badges:', error);
        res.status(500).json({ message: 'Error fetching badges' });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        // Rank users by total badges earned
        // This is a simplified leaderboard. In a real app, you might use points.
        const leaderboard = await User.findAll({
            attributes: [
                'id', 'firstName', 'lastName', 'profilePicture',
                [sequelize.fn('COUNT', sequelize.col('userBadges.id')), 'badgeCount']
            ],
            include: [{
                model: UserBadge,
                as: 'userBadges',
                attributes: []
            }],
            group: ['User.id'],
            order: [[sequelize.literal('badgeCount'), 'DESC']],
            limit: 10,
            subQuery: false // Necessary for limit with group by in some sequelize versions
        });

        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
};

exports.getUserBadges = async (req, res) => {
    try {
        const { userId } = req.params;
        const userBadges = await UserBadge.findAll({
            where: { userId },
            include: [{ model: Badge, as: 'badge' }]
        });
        res.json(userBadges);
    } catch (error) {
        console.error('Error fetching user badges:', error);
        res.status(500).json({ message: 'Error fetching user badges' });
    }
};

// Admin only: Award a badge manually
exports.awardBadge = async (req, res) => {
    try {
        const { userId, badgeId } = req.body;

        // Check if already awarded
        const existing = await UserBadge.findOne({ where: { userId, badgeId } });
        if (existing) {
            return res.status(400).json({ message: 'User already has this badge' });
        }

        const userBadge = await UserBadge.create({ userId, badgeId });

        // Fetch with badge details for response
        const awarded = await UserBadge.findByPk(userBadge.id, {
            include: [{ model: Badge, as: 'badge' }]
        });

        res.status(201).json(awarded);
    } catch (error) {
        console.error('Error awarding badge:', error);
        res.status(500).json({ message: 'Error awarding badge' });
    }
};

// --- Recognitions ---

exports.giveRecognition = async (req, res) => {
    try {
        const fromUserId = req.user.id;
        const { toUserId, message, category, isPublic } = req.body;

        if (fromUserId === toUserId) {
            return res.status(400).json({ message: 'You cannot give recognition to yourself' });
        }

        const recognition = await Recognition.create({
            fromUserId,
            toUserId,
            message,
            category,
            isPublic
        });

        res.status(201).json(recognition);
    } catch (error) {
        console.error('Error giving recognition:', error);
        res.status(500).json({ message: 'Error giving recognition' });
    }
};

exports.getRecognitions = async (req, res) => {
    try {
        const { userId } = req.params; // Optional filters
        const where = {};
        if (userId) {
            where.toUserId = userId;
        }

        // If not looking at own, only show public
        // Simplified logic: show all public + private if I am sender or receiver
        // For MVP public feed:
        if (!userId) {
            where.isPublic = true;
        }

        const recognitions = await Recognition.findAll({
            where,
            include: [
                { model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] },
                { model: User, as: 'receiver', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        res.json(recognitions);
    } catch (error) {
        console.error('Error fetching recognitions:', error);
        res.status(500).json({ message: 'Error fetching recognitions' });
    }
};

// --- Intern of the Month ---

exports.getInternsOfTheMonth = async (req, res) => {
    try {
        const winners = await InternOfTheMonth.findAll({
            include: [
                { model: User, as: 'winner', attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'email'] },
                { model: User, as: 'nominator', attributes: ['firstName', 'lastName'] }
            ],
            order: [['year', 'DESC'], ['month', 'DESC']]
        });
        res.json(winners);
    } catch (error) {
        console.error('Error fetching interns of the month:', error);
        res.status(500).json({ message: 'Error fetching interns of the month' });
    }
};

exports.nominateInternOfTheMonth = async (req, res) => {
    try {
        const nominatedBy = req.user.id;
        const { userId, month, year, reason } = req.body;

        // Check uniqueness constraint
        const existing = await InternOfTheMonth.findOne({ where: { month, year } });
        if (existing) {
            return res.status(400).json({ message: 'Intern of the Month already selected for this period' });
        }

        const nomination = await InternOfTheMonth.create({
            userId,
            month,
            year,
            reason,
            nominatedBy
        });

        res.status(201).json(nomination);
    } catch (error) {
        console.error('Error nominating intern:', error);
        res.status(500).json({ message: 'Error nominating intern' });
    }
};
