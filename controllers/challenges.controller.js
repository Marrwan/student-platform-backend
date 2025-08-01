const { body, validationResult } = require('express-validator');
const challengesService = require('../services/challenges.service');

class ChallengesController {
  // Get all challenges
  async getAllChallenges(req, res) {
    try {
      const result = await challengesService.getAllChallenges(req.user, req.query);
      res.json(result);
    } catch (error) {
      console.error('Error in getAllChallenges controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Create new challenge (admin only)
  async createChallenge(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await challengesService.createChallenge(req.body, req.user.id);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error in createChallenge controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get single challenge
  async getChallengeById(req, res) {
    try {
      const challenge = await challengesService.getChallengeById(req.params.id, req.user);
      res.json(challenge);
    } catch (error) {
      console.error('Error in getChallengeById controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Update challenge (admin only)
  async updateChallenge(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await challengesService.updateChallenge(req.params.id, req.body, req.user.id, req.user.role);
      res.json(result);
    } catch (error) {
      console.error('Error in updateChallenge controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Delete challenge (admin only)
  async deleteChallenge(req, res) {
    try {
      const result = await challengesService.deleteChallenge(req.params.id, req.user.id, req.user.role);
      res.json(result);
    } catch (error) {
      console.error('Error in deleteChallenge controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Register for challenge
  async registerForChallenge(req, res) {
    try {
      const result = await challengesService.registerForChallenge(req.params.id, req.user);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error in registerForChallenge controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Unregister from challenge
  async unregisterFromChallenge(req, res) {
    try {
      const result = await challengesService.unregisterFromChallenge(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error in unregisterFromChallenge controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get challenge leaderboard
  async getChallengeLeaderboard(req, res) {
    try {
      const result = await challengesService.getChallengeLeaderboard(req.params.id, req.user, req.query);
      res.json(result);
    } catch (error) {
      console.error('Error in getChallengeLeaderboard controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get challenge participants
  async getChallengeParticipants(req, res) {
    try {
      const result = await challengesService.getChallengeParticipants(req.params.id, req.query);
      res.json(result);
    } catch (error) {
      console.error('Error in getChallengeParticipants controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Update challenge leaderboard
  async updateChallengeLeaderboard(req, res) {
    try {
      const result = await challengesService.updateChallengeLeaderboard(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Error in updateChallengeLeaderboard controller:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ChallengesController(); 