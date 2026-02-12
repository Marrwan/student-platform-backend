const { Standup, StandupResponse, ActionItem, User, Team } = require('../models');
const { Op } = require('sequelize');

exports.createStandup = async (req, res) => {
    try {
        const { title, scheduledFor, description, teamId } = req.body;
        const userId = req.user.id;

        const standup = await Standup.create({
            title,
            scheduledFor,
            description,
            teamId,
            createdBy: userId,
            status: 'scheduled'
        });

        res.status(201).json(standup);
    } catch (error) {
        console.error('Error creating standup:', error);
        res.status(500).json({ message: 'Error creating standup' });
    }
};

exports.getStandups = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, teamId } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (status) whereClause.status = status;
        if (teamId) whereClause.teamId = teamId;

        const { count, rows } = await Standup.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: Team, as: 'team', attributes: ['id', 'name'] }
            ],
            limit: parseInt(limit),
            offset,
            order: [['scheduledFor', 'DESC']]
        });

        res.json({
            standups: rows,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalStandups: count
        });
    } catch (error) {
        console.error('Error fetching standups:', error);
        res.status(500).json({ message: 'Error fetching standups' });
    }
};

exports.getStandupById = async (req, res) => {
    try {
        const { id } = req.params;

        const standup = await Standup.findByPk(id, {
            include: [
                { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: Team, as: 'team', attributes: ['id', 'name'] },
                {
                    model: StandupResponse,
                    as: 'responses',
                    include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }]
                },
                {
                    model: ActionItem,
                    as: 'actionItems',
                    include: [
                        { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName'] },
                        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
                    ]
                }
            ]
        });

        if (!standup) {
            return res.status(404).json({ message: 'Standup not found' });
        }

        res.json(standup);
    } catch (error) {
        console.error('Error fetching standup:', error);
        res.status(500).json({ message: 'Error fetching standup' });
    }
};

exports.submitResponse = async (req, res) => {
    try {
        const { id } = req.params;
        const { whatDidYouDo, whatWillYouDo, blockers, attendanceStatus } = req.body;
        const userId = req.user.id;

        // Check if standup exists
        const standup = await Standup.findByPk(id);
        if (!standup) {
            return res.status(404).json({ message: 'Standup not found' });
        }

        // Check if user already responded
        const existingResponse = await StandupResponse.findOne({
            where: { standupId: id, userId }
        });

        if (existingResponse) {
            // Update existing response
            await existingResponse.update({
                whatDidYouDo,
                whatWillYouDo,
                blockers,
                attendanceStatus,
                submittedAt: new Date()
            });
            return res.json(existingResponse);
        }

        // Create new response
        const response = await StandupResponse.create({
            standupId: id,
            userId,
            whatDidYouDo,
            whatWillYouDo,
            blockers,
            attendanceStatus,
            submittedAt: new Date()
        });

        res.status(201).json(response);
    } catch (error) {
        console.error('Error submitting response:', error);
        res.status(500).json({ message: 'Error submitting response' });
    }
};

exports.getAttendance = async (req, res) => {
    try {
        const { id } = req.params;

        const responses = await StandupResponse.findAll({
            where: { standupId: id },
            include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }]
        });

        const attendance = {
            total: responses.length,
            present: responses.filter(r => r.attendanceStatus === 'present').length,
            absent: responses.filter(r => r.attendanceStatus === 'absent').length,
            late: responses.filter(r => r.attendanceStatus === 'late').length,
            responses
        };

        res.json(attendance);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ message: 'Error fetching attendance' });
    }
};

exports.createActionItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedTo, description, dueDate } = req.body;
        const userId = req.user.id;

        const actionItem = await ActionItem.create({
            standupId: id,
            assignedTo,
            description,
            dueDate,
            createdBy: userId,
            status: 'pending'
        });

        res.status(201).json(actionItem);
    } catch (error) {
        console.error('Error creating action item:', error);
        res.status(500).json({ message: 'Error creating action item' });
    }
};

exports.updateActionItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, description, dueDate } = req.body;

        const actionItem = await ActionItem.findByPk(id);
        if (!actionItem) {
            return res.status(404).json({ message: 'Action item not found' });
        }

        await actionItem.update({
            ...(status && { status }),
            ...(description && { description }),
            ...(dueDate && { dueDate })
        });

        res.json(actionItem);
    } catch (error) {
        console.error('Error updating action item:', error);
        res.status(500).json({ message: 'Error updating action item' });
    }
};

exports.updateStandup = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, scheduledFor, description, status } = req.body;

        const standup = await Standup.findByPk(id);
        if (!standup) {
            return res.status(404).json({ message: 'Standup not found' });
        }

        await standup.update({
            ...(title && { title }),
            ...(scheduledFor && { scheduledFor }),
            ...(description && { description }),
            ...(status && { status })
        });

        res.json(standup);
    } catch (error) {
        console.error('Error updating standup:', error);
        res.status(500).json({ message: 'Error updating standup' });
    }
};

exports.getMyActionItems = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        const whereClause = { assignedTo: userId };
        if (status) whereClause.status = status;

        const actionItems = await ActionItem.findAll({
            where: whereClause,
            include: [
                {
                    model: Standup,
                    as: 'standup',
                    attributes: ['id', 'title', 'scheduledFor']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'firstName', 'lastName']
                }
            ],
            order: [['dueDate', 'ASC']]
        });

        res.json(actionItems);
    } catch (error) {
        console.error('Error fetching action items:', error);
        res.status(500).json({ message: 'Error fetching action items' });
    }
};
