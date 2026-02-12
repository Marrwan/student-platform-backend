const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performance.controller');
const { authenticateToken, authorize } = require('../middleware/auth');

router.use(authenticateToken);

// Individual Performance
router.get('/:userId', performanceController.getUserPerformance);
router.post('/calculate', performanceController.calculateAndSaveSnapshot);

// Team/Admin Views
router.get('/team/:teamId', authorize(['admin', 'manager', 'mentor']), performanceController.getTeamPerformance);
router.get('/analytics/at-risk', authorize(['admin', 'manager', 'mentor']), performanceController.getAtRiskInterns);

module.exports = router;
