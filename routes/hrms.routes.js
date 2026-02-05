const express = require('express');
const router = express.Router();
const hrmsController = require('../controllers/hrms.controller');
const { auth, isAdmin, isStaff } = require('../middleware/auth.middleware');

// Department Routes (Admin only)
router.post('/departments', [auth, isAdmin], hrmsController.createDepartment);
router.get('/departments', [auth, isStaff], hrmsController.getAllDepartments);
router.put('/departments/:id', [auth, isAdmin], hrmsController.updateDepartment);
router.delete('/departments/:id', [auth, isAdmin], hrmsController.deleteDepartment);

// Staff Routes
router.post('/staff/promote/:id', [auth, isAdmin], hrmsController.promoteToStaff);
router.get('/staff', [auth, isStaff], hrmsController.getAllStaff);
router.get('/staff/:id', [auth, isStaff], hrmsController.getStaffProfile);

module.exports = router;
