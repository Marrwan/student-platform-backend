const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamification.controller');
const { authenticateToken, authorize } = require('../middleware/auth');

router.use(authenticateToken);

// Badges
router.get('/badges', gamificationController.getAllBadges);
router.get('/leaderboard', gamificationController.getLeaderboard);
router.get('/badges/user/:userId', gamificationController.getUserBadges);
router.post('/badges/award', authorize(['admin', 'admin']), gamificationController.awardBadge);

// Recognitions
router.get('/recognitions', gamificationController.getRecognitions); // Public feed
router.get('/recognitions/user/:userId', gamificationController.getRecognitions); // Specific user
router.post('/recognitions', gamificationController.giveRecognition);

// Intern of the Month
router.get('/intern-of-month', gamificationController.getInternsOfTheMonth);
router.post('/intern-of-month', authorize(['admin', 'manager']), gamificationController.nominateInternOfTheMonth);

module.exports = router;
