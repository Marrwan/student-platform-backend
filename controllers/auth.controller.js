const authService = require('../services/auth.service');

class AuthController {
  // Register user
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  // Verify email
  async verifyEmail(req, res) {
    try {
      const result = await authService.verifyEmail(req.body.token);
      res.json(result);
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  // Resend verification email
  async resendVerification(req, res) {
    try {
      const result = await authService.resendVerification(req.body.email);
      res.json(result);
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle needsVerification case
      if (error.needsVerification) {
        return res.status(401).json({ 
          success: false,
          message: error.message,
          needsVerification: true,
          email: error.email
        });
      }
      
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  // Forgot password
  async forgotPassword(req, res) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.json(result);
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  // Reset password
  async resetPassword(req, res) {
    try {
      const result = await authService.resetPassword(req.body.token, req.body.password);
      res.json(result);
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  // Get current user
  async getCurrentUser(req, res) {
    try {
      const result = await authService.getCurrentUser(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      const result = await authService.getProfile(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const result = await authService.updateProfile(req.user.id, req.body);
      res.json(result);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const result = await authService.changePassword(req.user.id, req.body);
      res.json(result);
    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  // Update notification settings
  async updateNotifications(req, res) {
    try {
      const result = await authService.updateNotifications(req.user.id, req.body);
      res.json(result);
    } catch (error) {
      console.error('Update notifications error:', error);
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      const result = await authService.logout(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Logout error:', error);
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  }
}

module.exports = new AuthController(); 