const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken, requireAdmin, requireUser } = require('../middleware/auth');
const challengesController = require('../controllers/challenges.controller');

// Get all challenges
router.get('/', authenticateToken, challengesController.getAllChallenges);

// Create new challenge (admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
  body('maxParticipants').optional().isInt({ min: 1 }).withMessage('Max participants must be positive'),
  body('exemptClasses').optional().isArray().withMessage('Exempt classes must be an array'),
  body('submissionTypes').optional().isArray().withMessage('Submission types must be an array'),
  body('latePenalty').optional().isFloat({ min: 0, max: 100 }).withMessage('Late penalty must be between 0 and 100')
], challengesController.createChallenge);

// Get single challenge
router.get('/:id', authenticateToken, challengesController.getChallengeById);

// Update challenge (admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  body('title').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('startDate').optional().isISO8601().withMessage('Valid start date required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date required'),
  body('maxParticipants').optional().isInt({ min: 1 }).withMessage('Max participants must be positive'),
  body('latePenalty').optional().isFloat({ min: 0, max: 100 }).withMessage('Late penalty must be between 0 and 100')
], challengesController.updateChallenge);

// Delete challenge (admin only)
router.delete('/:id', authenticateToken, requireAdmin, challengesController.deleteChallenge);

// Register for challenge
router.post('/:id/register', authenticateToken, requireUser, challengesController.registerForChallenge);

// Unregister from challenge
router.post('/:id/unregister', authenticateToken, requireUser, challengesController.unregisterFromChallenge);

// Get challenge leaderboard
router.get('/:id/leaderboard', authenticateToken, challengesController.getChallengeLeaderboard);

// Get challenge participants
router.get('/:id/participants', authenticateToken, requireAdmin, challengesController.getChallengeParticipants);

// Update challenge leaderboard
router.post('/:id/update-leaderboard', authenticateToken, requireAdmin, challengesController.updateChallengeLeaderboard);

module.exports = router; 