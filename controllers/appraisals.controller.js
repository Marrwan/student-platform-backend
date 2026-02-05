const db = require('../models');
const Appraisal = db.Appraisal;
const AppraisalCycle = db.AppraisalCycle;
const Objective = db.Objective;
const KeyResult = db.KeyResult;
const User = db.User;

// --- Appraisal Cycles ---

exports.createCycle = async (req, res) => {
    try {
        const cycle = await AppraisalCycle.create(req.body);
        res.status(201).send(cycle);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getAllCycles = async (req, res) => {
    try {
        const cycles = await AppraisalCycle.findAll({
            order: [['startDate', 'DESC']]
        });
        res.send(cycles);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// --- Appraisals ---

// Initiate an appraisal for a user (or self)
exports.initiateAppraisal = async (req, res) => {
    try {
        const { userId, cycleId, reviewerId, counterSignerId } = req.body;

        // Check if already exists
        const existing = await Appraisal.findOne({ where: { userId, cycleId } });
        if (existing) {
            return res.status(400).send({ message: "Appraisal already exists for this cycle." });
        }

        const appraisal = await Appraisal.create({
            userId,
            cycleId,
            reviewerId,
            counterSignerId,
            status: 'goal_setting'
        });
        res.status(201).send(appraisal);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getMyAppraisals = async (req, res) => {
    try {
        const appraisals = await Appraisal.findAll({
            where: { userId: req.user.id },
            include: [{ model: AppraisalCycle, as: 'cycle' }]
        });
        res.send(appraisals);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getAppraisalDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const appraisal = await Appraisal.findByPk(id, {
            include: [
                { model: AppraisalCycle, as: 'cycle' },
                { model: User, as: 'employee', attributes: ['id', 'firstName', 'lastName'] },
                { model: User, as: 'reviewer', attributes: ['id', 'firstName', 'lastName'] },
                { model: User, as: 'counterSigner', attributes: ['id', 'firstName', 'lastName'] },
                {
                    model: Objective,
                    as: 'objectives',
                    include: [{ model: KeyResult, as: 'keyResults' }]
                }
            ]
        });

        if (!appraisal) return res.status(404).send({ message: "Appraisal not found" });

        // Authorization check (simplistic)
        if (appraisal.userId !== req.user.id &&
            appraisal.reviewerId !== req.user.id &&
            appraisal.counterSignerId !== req.user.id &&
            req.user.role !== 'admin') {
            return res.status(403).send({ message: "Unauthorized" });
        }

        res.send(appraisal);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// --- Objectives & Key Results ---

exports.addObjective = async (req, res) => {
    try {
        const objective = await Objective.create({
            ...req.body,
            appraisalId: req.params.appraisalId
        });
        res.status(201).send(objective);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.addKeyResult = async (req, res) => {
    try {
        const keyResult = await KeyResult.create({
            ...req.body,
            objectiveId: req.params.objectiveId
        });
        res.status(201).send(keyResult);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.updateKeyResultScore = async (req, res) => {
    const { id } = req.params;
    const { selfScore, reviewerScore, employeeComments, reviewerComments } = req.body;

    try {
        const keyResult = await KeyResult.findByPk(id);
        if (!keyResult) return res.status(404).send({ message: "Key Result not found" });

        // Update fields conditionally
        if (selfScore !== undefined) keyResult.selfScore = selfScore;
        if (reviewerScore !== undefined) keyResult.reviewerScore = reviewerScore;
        if (employeeComments !== undefined) keyResult.employeeComments = employeeComments;
        if (reviewerComments !== undefined) keyResult.reviewerComments = reviewerComments;

        await keyResult.save();

        // Automatically recalculate Objective Score?
        // Not implementing full recalculation recursion here for brevity, 
        // but typically we'd sum average of KR scores -> Objective Score -> Appraisal Score.

        res.send(keyResult);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
