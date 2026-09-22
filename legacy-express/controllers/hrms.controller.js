const { User, Team, Department, Appraisal, Sequelize } = require('../models');
const { Op } = Sequelize;

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        // Assuming the user is a supervisor/lead, we get their team or department
        const user = await User.findByPk(userId, {
            include: [
                { model: Team, as: 'team' },
                { model: Department, as: 'department' }
            ]
        });

        let teamId = user.teamId;
        let departmentId = user.departmentId;

        // Filter for team members
        const whereClause = {};
        if (teamId) {
            whereClause.teamId = teamId;
        } else if (departmentId) {
            whereClause.departmentId = departmentId;
        }

        const totalMembers = await User.count({ where: whereClause });
        const onLeave = await User.count({ where: { ...whereClause, onLeave: true } });
        const onSuspension = await User.count({ where: { ...whereClause, isOnSuspension: true } });

        // For "Overall Teams", if user is Dept Head, count teams
        let totalTeams = 0;
        if (departmentId) {
            totalTeams = await Team.count({ where: { departmentId } });
        }

        res.json({
            totalMembers,
            onLeave,
            onSuspension,
            totalTeams,
            teamName: user.team ? user.team.name : (user.department ? user.department.name : 'My Team')
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

exports.getTeamMembers = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;

        const user = await User.findByPk(userId);
        const whereClause = {};

        // If user is team lead, show team members. If Dept head, show all Dept members? 
        // For now, simpler logic: if in a team, show team members.
        if (user.teamId) {
            whereClause.teamId = user.teamId;
        } else if (user.departmentId) {
            whereClause.departmentId = user.departmentId;
        }

        if (search) {
            whereClause[Op.or] = [
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            include: [
                { model: Team, as: 'team', attributes: ['name'] },
                { model: Department, as: 'department', attributes: ['name', 'location'] }
            ],
            attributes: ['id', 'firstName', 'lastName', 'email', 'jobTitle', 'staffRole', 'location', 'isActive', 'onLeave', 'isOnSuspension'],
            limit,
            offset,
            order: [['firstName', 'ASC']]
        });

        res.json({
            members: rows.map(u => ({
                id: u.id,
                name: `${u.firstName} ${u.lastName}`,
                email: u.email,
                designation: u.jobTitle || u.staffRole || 'Staff',
                location: u.location || (u.department ? u.department.location : 'N/A'),
                status: u.isActive ? (u.onLeave ? 'On Leave' : 'Active') : 'Inactive',
                team: u.team ? u.team.name : 'No Team'
            })),
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalMembers: count
        });
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({ message: 'Error fetching team members' });
    }
};

exports.getDemographics = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        const whereClause = {};
        if (user.teamId) whereClause.teamId = user.teamId;
        else if (user.departmentId) whereClause.departmentId = user.departmentId;

        // Fetch all users in scope to calculate demographics in memory (or use group by queries)
        // Group by queries are more efficient
        const users = await User.findAll({
            where: whereClause,
            attributes: ['id', 'staffRole', 'location', 'metadata'] // Assuming age/gender might be in metadata or we need to add fields
        });

        // Mocking Age/Gender for now as they aren't fully in schema yet, 
        // relying on the user.metadata or just randomization if data is missing for demo/challenge purposes.
        // But requested "Real Data" so we should try to use what we have.
        // Since Gender/DOB aren't in User model explicitly shown in view_file, checks implementation plan...
        // Implementation plan didn't strictly add Gender/DOB. 
        // I will return structure compatible with charts, filling with "Unknown" if real data missing.

        // Grade Band (staffRole)
        const gradeBand = {};
        users.forEach(u => {
            const role = u.staffRole || 'Unknown';
            gradeBand[role] = (gradeBand[role] || 0) + 1;
        });

        // Location
        const locationBand = {};
        users.forEach(u => {
            const loc = u.location || 'Unknown';
            locationBand[loc] = (locationBand[loc] || 0) + 1;
        });

        // Format for Recharts
        const formatForChart = (obj) => Object.keys(obj).map(key => ({ name: key, value: obj[key] }));

        res.json({
            gradeBand: formatForChart(gradeBand),
            officeLocation: formatForChart(locationBand),
            // Returning empty or placeholder for Age/Gender if fields don't exist
            ageGroup: [{ name: 'N/A', value: users.length }],
            genderRatio: [{ name: 'N/A', value: users.length }]
        });

    } catch (error) {
        console.error('Error fetching demographics:', error);
        res.status(500).json({ message: 'Error fetching demographics' });
    }
};

exports.getSupervisorAppraisals = async (req, res) => {
    try {
        const userId = req.user.id;
        // Fetch appraisals where user is reviewer
        // This relies on the 'reviewerId' field in Appraisal model
        const appraisals = await Appraisal.findAll({
            where: { reviewerId: userId },
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'departmentId', 'jobTitle'] }
            ]
        });

        // We also need Department info for the user
        // Sequelize include nested could work, or just fetch separately if needed.
        // Assuming User belongsTo Department
        const formatted = [];
        for (const appraisal of appraisals) {
            const dept = appraisal.user.departmentId ? await Department.findByPk(appraisal.user.departmentId) : null;
            formatted.push({
                id: appraisal.user.id, // Link to user report, or appraisal? user report page uses /appraisal/[id]/report
                appraisalId: appraisal.id,
                name: `${appraisal.user.firstName} ${appraisal.user.lastName}`,
                department: dept ? dept.name : 'N/A',
                status: appraisal.status, // e.g. 'Pending'
                box: appraisal.nineBoxPosition || '--',
                score: appraisal.totalScore || '--'
            });
        }

        res.json(formatted);

    } catch (error) {
        console.error('Error fetching supervisor appraisals:', error);
        res.status(500).json({ message: 'Error fetching appraisals' });
    }
};

exports.getTeams = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        const whereClause = {};
        // If user belongs to a department, only show teams in that department
        if (user.departmentId) {
            whereClause.departmentId = user.departmentId;
        }

        const teams = await Team.findAll({
            where: whereClause,
            include: [
                { model: User, as: 'lead', attributes: ['firstName', 'lastName'] },
                { model: Department, as: 'department', attributes: ['name'] }
            ]
        });

        // Count members for each team
        // We could use Sequelize.fn('COUNT') with group by, but iterating is simpler for now for small sets
        const formatted = [];
        for (const team of teams) {
            const memberCount = await User.count({ where: { teamId: team.id } });
            formatted.push({
                id: team.id,
                name: team.name,
                lead: team.lead ? `${team.lead.firstName} ${team.lead.lastName}` : '--',
                parentTeam: team.department ? team.department.name : 'N/A',
                staffCount: memberCount
            });
        }

        res.json(formatted);

    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ message: 'Error fetching teams' });
    }
};
