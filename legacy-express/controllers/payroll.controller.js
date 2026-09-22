const db = require('../models');
const Payroll = db.Payroll;
const User = db.User;

exports.createPayrollEntry = async (req, res) => {
    try {
        const { userId, month, year, basicSalary, housing, transport, tax, pensionEmployee, otherDeductions, bonus, paymentDate } = req.body;

        // Calculate Totals automatically
        // This is a simplified calculation, real world might be more complex
        const grossPay = parseFloat(basicSalary || 0) + parseFloat(housing || 0) + parseFloat(transport || 0) + parseFloat(bonus || 0); // + others
        const totalDeductions = parseFloat(tax || 0) + parseFloat(pensionEmployee || 0) + parseFloat(otherDeductions || 0);
        const netPay = grossPay - totalDeductions;

        // Sanity check
        if (netPay < 0) {
            return res.status(400).send({ message: "Net Pay cannot be negative." });
        }

        const payroll = await Payroll.create({
            ...req.body,
            grossPay,
            totalDeductions,
            netPay,
            status: 'processing'
        });

        res.status(201).send(payroll);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getMyPayroll = async (req, res) => {
    try {
        const payrolls = await Payroll.findAll({
            where: { userId: req.user.id, isPublished: true },
            order: [['year', 'DESC'], ['month', 'DESC']] // Not perfect sort for string month, but okay for now
        });
        res.send(payrolls);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getPayrollById = async (req, res) => {
    const { id } = req.params;
    try {
        const payroll = await Payroll.findByPk(id, {
            include: [{ model: User, as: 'employee', attributes: ['id', 'firstName', 'lastName', 'email', 'jobTitle', 'departmentId'] }]
        });

        if (!payroll) return res.status(404).send({ message: "Payroll entry not found" });

        // Auth check
        if (payroll.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).send({ message: "Unauthorized" });
        }

        res.send(payroll);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
