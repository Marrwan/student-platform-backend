const { body, validationResult } = require('express-validator');
const usersService = require('../services/users.service');

class UsersController {
  // Get user profile
  async getUserProfile(req, res) {
    try {
      const result = await usersService.getUserProfile(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error in getUserProfile controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Update user profile
  async updateUserProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await usersService.updateUserProfile(req.user.id, req.body);
      res.json(result);
    } catch (error) {
      console.error('Error in updateUserProfile controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await usersService.changePassword(req.user.id, req.body);
      res.json(result);
    } catch (error) {
      console.error('Error in changePassword controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const result = await usersService.getAllUsers(req.query);
      res.json(result);
    } catch (error) {
      console.error('Error in getAllUsers controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get single user (admin only)
  async getUserById(req, res) {
    try {
      const result = await usersService.getUserById(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Error in getUserById controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Update user (admin only)
  async updateUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await usersService.updateUser(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      console.error('Error in updateUser controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Delete user (admin only)
  async deleteUser(req, res) {
    try {
      const result = await usersService.deleteUser(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error in deleteUser controller:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new UsersController(); 