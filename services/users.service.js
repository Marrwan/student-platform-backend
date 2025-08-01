const { User } = require('../models');

class UsersService {
  // Get user profile
  async getUserProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return { user };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(userId, profileData) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if email is being changed and if it's already taken
      if (profileData.email && profileData.email !== user.email) {
        const existingUser = await User.findOne({ where: { email: profileData.email } });
        if (existingUser) {
          throw new Error('Email already in use');
        }
      }

      await user.update(profileData);
      
      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });

      return { 
        message: 'Profile updated successfully',
        user: updatedUser
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(userId, passwordData) {
    try {
      const { currentPassword, newPassword } = passwordData;
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return { message: 'Password changed successfully' };
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  // Get all users (admin only)
  async getAllUsers(params) {
    try {
      const { page = 1, limit = 20, role, status } = params;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const whereClause = {};
      if (role) whereClause.role = role;
      if (status === 'active') whereClause.isActive = true;
      if (status === 'inactive') whereClause.isActive = false;

      const users = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        users: users.rows,
        total: users.count,
        page: parseInt(page),
        totalPages: Math.ceil(users.count / parseInt(limit))
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get single user (admin only)
  async getUserById(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return { user };
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Update user (admin only)
  async updateUser(userId, userData) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if email is being changed and if it's already taken
      if (userData.email && userData.email !== user.email) {
        const existingUser = await User.findOne({ where: { email: userData.email } });
        if (existingUser) {
          throw new Error('Email already in use');
        }
      }

      await user.update(userData);
      
      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });

      return { 
        message: 'User updated successfully',
        user: updatedUser
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user (admin only)
  async deleteUser(userId, currentUserId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Prevent admin from deleting themselves
      if (user.id === currentUserId) {
        throw new Error('Cannot delete your own account');
      }

      await user.destroy();

      return { message: 'User deleted successfully' };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

module.exports = new UsersService(); 