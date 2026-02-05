const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payroll.controller');
const { auth, isAdmin, isStaff } = require('../middleware/auth.middleware');

router.post('/', [auth, isAdmin], payrollController.createPayrollEntry);
router.get('/my', [auth, isStaff], payrollController.getMyPayroll); // For staff to see their history
router.get('/:id', [auth, isStaff], payrollController.getPayrollById); // Details for payslip

module.exports = router;
