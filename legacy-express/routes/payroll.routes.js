const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payroll.controller');
const { auth } = require('../middleware/auth');
const { hasPermission, hasRole } = require('../middleware/has-permission.middleware');

router.post('/', [auth, hasPermission('hrms.manage_payroll')], payrollController.createPayrollEntry);
router.get('/my', [auth, hasRole('Staff', 'Admin', 'Super Admin')], payrollController.getMyPayroll); // For staff to see their history
router.get('/:id', [auth, hasRole('Staff', 'Admin', 'Super Admin')], payrollController.getPayrollById); // Details for payslip

module.exports = router;
