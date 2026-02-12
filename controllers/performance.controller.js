const { PerformanceSnapshot, User, StandupResponse, AssignmentSubmission, LeaderboardEntry, Appraisal, PeerReview, Team } = require('../models');
const { Op } = require('sequelize');

// Helper to get current week number
const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
};

// Calculate metrics for a user
const calculateUserMetrics = async (userId, weekNumber, year) => {
    // 1. Attendance Score (from Standups in that week)
    /* 
       Logic: Fetch standups for the week. 
       Score = (Present + Late*0.5) / Total Scheduled * 100
       (Simplified for now: Just checking if they submitted responses)
    */
    // For MVP, we'll placeholder this logical calculation or fetch from a service
    // Real implementation would require querying Standup and StandupResponse
    const attendanceScore = 85;

    // 2. Project Completion Rate
    const submissions = await AssignmentSubmission.count({ where: { userId } });
    const projectCompletionRate = submissions > 0 ? 90 : 0; // Simplified

    // 3. Challenge Score (Leaderboard)
    const leaderboardEntry = await LeaderboardEntry.findOne({ where: { userId } });
    const challengeScore = leaderboardEntry ? Math.min(leaderboardEntry.points / 10, 100) : 0;

    // 4. Appraisal Score
    const appraisals = await Appraisal.findAll({ where: { appraiseeId: userId } });
    let appraisalScore = 0;
    if (appraisals.length > 0) {
        const totalScore = appraisals.reduce((acc, curr) => acc + (curr.overallRating || 0), 0);
        appraisalScore = (totalScore / appraisals.length) * 20; // Assuming 5-point scale -> 100
    }

    // 5. Peer Feedback (Placeholder)
    const peerFeedbackScore = 75;

    // Overall Weighted Score
    // Attendance: 20%, Projects: 30%, Challenges: 10%, Appraisals: 30%, Peer: 10%
    const overallScore = (
        (attendanceScore * 0.2) +
        (projectCompletionRate * 0.3) +
        (challengeScore * 0.1) +
        (appraisalScore * 0.3) +
        (peerFeedbackScore * 0.1)
    );

    return {
        attendanceScore,
        projectCompletionRate,
        challengeScore,
        appraisalScore,
        peerFeedbackScore,
        overallScore
    };
};

exports.calculateAndSaveSnapshot = async (req, res) => {
    try {
        const { userId, weekNumber, year } = req.body;

        // If not provided, use current week
        const currentValidDate = new Date();
        const effectiveWeek = weekNumber || getWeekNumber(currentValidDate);
        const effectiveYear = year || currentValidDate.getFullYear();
        const effectiveUserId = userId || req.user.id;

        const metrics = await calculateUserMetrics(effectiveUserId, effectiveWeek, effectiveYear);

        const [snapshot, created] = await PerformanceSnapshot.findOrCreate({
            where: { userId: effectiveUserId, weekNumber: effectiveWeek, year: effectiveYear },
            defaults: metrics
        });

        if (!created) {
            await snapshot.update(metrics);
        }

        res.json(snapshot);
    } catch (error) {
        console.error('Error calculating snapshot:', error);
        res.status(500).json({ message: 'Error calculating performance metrics' });
    }
};

exports.getUserPerformance = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentYear = new Date().getFullYear();

        // Get latest snapshot
        const latestSnapshot = await PerformanceSnapshot.findOne({
            where: { userId, year: currentYear },
            order: [['weekNumber', 'DESC']]
        });

        // Get history for trends
        const history = await PerformanceSnapshot.findAll({
            where: { userId, year: currentYear },
            order: [['weekNumber', 'ASC']],
            limit: 12 // Last 12 weeks
        });

        res.json({
            current: latestSnapshot || {},
            history
        });
    } catch (error) {
        console.error('Error fetching user performance:', error);
        res.status(500).json({ message: 'Error fetching performance data' });
    }
};

exports.getTeamPerformance = async (req, res) => {
    try {
        const { teamId } = req.params;
        const currentYear = new Date().getFullYear();
        const currentWeek = getWeekNumber(new Date());

        // Get all members of the team
        // Assuming Team-User association exists or we filter Users by teamId
        const teamMembers = await User.findAll({
            where: { teamId },
            attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        });

        const memberIds = teamMembers.map(m => m.id);

        // Get snapshots for all members for current week
        const snapshots = await PerformanceSnapshot.findAll({
            where: {
                userId: { [Op.in]: memberIds },
                year: currentYear,
                weekNumber: currentWeek
            }
        });

        // Map snapshots to users
        const data = teamMembers.map(member => {
            const snapshot = snapshots.find(s => s.userId === member.id);
            return {
                user: member,
                performance: snapshot || null
            };
        });

        res.json(data);
    } catch (error) {
        console.error('Error fetching team performance:', error);
        res.status(500).json({ message: 'Error fetching team performance' });
    }
};

exports.getAtRiskInterns = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const currentWeek = getWeekNumber(new Date());

        // Find snapshots with low overall score
        const atRiskSnapshots = await PerformanceSnapshot.findAll({
            where: {
                year: currentYear,
                weekNumber: currentWeek,
                overallScore: { [Op.lt]: 60 } // alert if below 60%
            },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture']
            }],
            order: [['overallScore', 'ASC']]
        });

        res.json(atRiskSnapshots);
    } catch (error) {
        console.error('Error fetching at-risk interns:', error);
        res.status(500).json({ message: 'Error fetching at-risk interns' });
    }
};
