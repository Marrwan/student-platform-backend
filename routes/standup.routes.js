const express = require('express');
const router = express.Router();
const standupController = require('../controllers/standup.controller');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Standup CRUD
router.post('/', standupController.createStandup);
router.get('/', standupController.getStandups);
router.get('/:id', standupController.getStandupById);
router.put('/:id', standupController.updateStandup);

// Standup Response
router.post('/:id/respond', standupController.submitResponse);
router.get('/:id/attendance', standupController.getAttendance);

// Action Items
router.post('/:id/action-items', standupController.createActionItem);
router.get('/my/action-items', standupController.getMyActionItems);

// Update Action Item
router.put('/action-items/:id', standupController.updateActionItem);

module.exports = router;
