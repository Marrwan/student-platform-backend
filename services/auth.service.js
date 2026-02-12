const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { sendEmail } = require('../utils/email');
const { sequelize } = require('../models'); // Added sequelize import

class AuthService {
  // Register user
  async register(userData) {
    try {
      const { email, password, firstName, lastName } = userData;

      // Normalize email (trim whitespace and convert to lowercase)
      const normalizedEmail = email.trim().toLowerCase();

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: normalizedEmail } });
      if (existingUser) {
        throw new Error('User with this email already exists.');
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create user
      const user = await User.create({
        email: normalizedEmail,
        password,
        firstName,
        lastName,
        emailVerificationToken: otp,
        emailVerificationExpires: otpExpires,
        emailVerified: false,
        isActive: false,
        role: 'student'
      });

      // Send verification email with OTP
      await sendEmail({
        to: normalizedEmail,
        subject: 'Email Verification - JavaScript Learning Platform',
        html: `
          <h2>Welcome to JavaScript Learning Platform!</h2>
          <p>Hi ${firstName} ${lastName},</p>
          <p>Thank you for registering! Please use the following 6-digit code to verify your email address:</p>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't create this account, please ignore this email.</p>
          <p>Best regards,<br>The JavaScript Learning Platform Team</p>
        `

      }).catch(err => {
        console.warn('Failed to send verification email during registration:', err.message);
        // Continue with registration even if email fails - user can resend later or admin can verify
      });

      return {
        success: true,
        message: 'Registration successful. Please check your email for the verification code.',
        needsVerification: true
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Verify email with OTP
  async verifyEmail(token) {
    try {
      if (!token) {
        throw new Error('Verification code is required.');
      }

      const user = await User.findOne({
        where: {
          emailVerificationToken: token,
          emailVerified: false
        }
      });

      if (!user) {
        throw new Error('Invalid or expired verification code.');
      }

      if (user.emailVerificationExpires < new Date()) {
        throw new Error('Verification code has expired.');
      }

      // Verify user
      await user.update({
        emailVerified: true,
        isActive: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      });

      // Generate JWT token
      const jwtToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return {
        success: true,
        message: 'Email verified successfully!',
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: user.permissions
        }
      };
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  // Resend verification email with rate limiting
  async resendVerification(email) {
    try {
      if (!email) {
        throw new Error('Email is required.');
      }

      // Check database connection
      try {
        await sequelize.authenticate();
      } catch (dbError) {
        console.error('Database connection error:', dbError);
        throw new Error('Service temporarily unavailable. Please try again in a few minutes.');
      }

      // Normalize email (trim whitespace and convert to lowercase)
      const normalizedEmail = email.trim().toLowerCase();

      const user = await User.findOne({
        where: {
          email: normalizedEmail
        }
      });

      if (!user) {
        // For security reasons, don't reveal if user exists or not
        console.log(`Resend verification requested for non - existent email: ${normalizedEmail}`);
        return {
          message: 'If an account with that email exists and is not verified, a verification code has been sent.'
        };
      }

      if (user.emailVerified) {
        return {
          message: 'This email is already verified. You can now log in to your account.'
        };
      }

      // Check if user has a recent OTP that hasn't expired yet
      if (user.emailVerificationExpires && user.emailVerificationExpires > new Date()) {
        const timeLeft = Math.ceil((user.emailVerificationExpires - new Date()) / 1000 / 60);
        if (timeLeft > 8) { // If more than 8 minutes left, don't allow resend
          throw new Error(`Please wait ${timeLeft} minutes before requesting a new verification code.`);
        }
      }

      // Generate new 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await user.update({
        emailVerificationToken: otp,
        emailVerificationExpires: otpExpires
      });

      // Send verification email with OTP
      await sendEmail({
        to: normalizedEmail,
        subject: 'Email Verification Code - JavaScript Learning Platform',
        html: `
          <h2>Email Verification Code</h2>
          <p>Hi ${user.firstName} ${user.lastName},</p>
          <p>You requested a new verification code. Please use the following 6-digit code to verify your email address:</p>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Best regards,<br>The JavaScript Learning Platform Team</p>
        `
      }).catch(err => {
        console.warn('Failed to send verification email during resend:', err.message);
        // Continue even if email fails
      });

      return {
        message: 'Verification code sent successfully! Please check your email for the 6-digit code.'
      };
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  }

  // Login user - Fixed to handle unverified users properly
  async login(loginData) {
    try {
      const { email, password, verificationOtp } = loginData;

      // Check database connection
      try {
        await sequelize.authenticate();
      } catch (dbError) {
        console.error('Database connection error:', dbError);
        throw new Error('Service temporarily unavailable. Please try again in a few minutes.');
      }

      // Normalize email (trim whitespace and convert to lowercase)
      const normalizedEmail = email.trim().toLowerCase();

      // Find user by email
      const user = await User.findOne({ where: { email: normalizedEmail } });
      if (!user) {
        throw new Error('Invalid credentials.');
      }

      // Check password first
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials.');
      }

      // If user is not verified, handle verification
      if (!user.emailVerified) {
        // If verification OTP is provided, verify it
        if (verificationOtp) {
          if (user.emailVerificationToken !== verificationOtp) {
            throw new Error('Invalid verification code.');
          }

          if (user.emailVerificationExpires < new Date()) {
            throw new Error('Verification code has expired. Please request a new one.');
          }

          // Verify user
          await user.update({
            emailVerified: true,
            isActive: true,
            emailVerificationToken: null,
            emailVerificationExpires: null
          });

          // Generate JWT token
          const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
          );

          return {
            success: true,
            message: 'Email verified and login successful',
            token,
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              permissions: user.permissions
            }
          };
        } else {
          // No verification OTP provided, return needsVerification flag
          const error = new Error('Your account is not verified. Please verify your email before proceeding.');
          error.needsVerification = true;
          error.email = user.email;
          throw error;
        }
      }

      // Check if account is active
      if (!user.isActive) {
        throw new Error('Account is deactivated. Please contact support.');
      }

      // Update last login
      await user.update({ lastLogin: new Date() });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: user.permissions
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      if (!email) {
        throw new Error('Email is required.');
      }

      const user = await User.findOne({ where: { email } });

      // For security reasons, always return success message even if user doesn't exist
      if (!user) {
        console.log(`Password reset requested for non - existent email: ${email} `);
        return { message: 'If an account with that email exists, a password reset link has been sent.' };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await user.update({
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires
      });
    }
    }

  // Reset password
  async resetPassword(token, password) {
    try {
      if (!token || !password) {
        throw new Error('Token and new password are required.');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const user = await User.findOne({ where: { resetPasswordToken: token } });
      if (!user) {
        throw new Error('Invalid or expired reset token.');
      }

      if (user.resetPasswordExpires < new Date()) {
        throw new Error('Reset token has expired.');
      }

      // Update password and clear reset token
      // The User model's beforeUpdate hook will automatically hash the password
      await user.update({
        password: password,
        resetPasswordToken: null,
        resetPasswordExpires: null
      });

      return { message: 'Password reset successfully.' };
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password', 'emailVerificationToken', 'resetPasswordToken'] }
      });

      if (!user) {
        throw new Error('User not found.');
      }

      return { user };
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  // Get user profile
  async getProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password', 'emailVerificationToken', 'resetPasswordToken'] }
      });

      if (!user) {
        throw new Error('User not found.');
      }

      return { user };
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userId, profileData) {
    try {
      const { firstName, lastName, bio, githubUsername, linkedinUrl, avatar } = profileData;
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('User not found.');
      }

      await user.update({
        firstName,
        lastName,
        bio,
        githubUsername,
        linkedinUrl,
        avatar
      });

      return {
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          bio: user.bio,
          githubUsername: user.githubUsername,
          linkedinUrl: user.linkedinUrl,
          avatar: user.avatar
        }
      };
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(userId, passwordData) {
    try {
      const { currentPassword, newPassword } = passwordData;

      if (!currentPassword || !newPassword) {
        throw new Error('Current password and new password are required.');
      }

      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long.');
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found.');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect.');
      }

      // Update password
      await user.update({ password: newPassword });

      return { message: 'Password changed successfully.' };
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // Update notification settings
  async updateNotifications(userId, notificationData) {
    try {
      const { emailNotifications, pushNotifications } = notificationData;
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('User not found.');
      }

      await user.update({ emailNotifications, pushNotifications });

      return {
        message: 'Notification settings updated successfully.',
        settings: { emailNotifications, pushNotifications }
      };
    } catch (error) {
      console.error('Update notifications error:', error);
      throw error;
    }
  }

  // Logout
  async logout(userId) {
    try {
      const user = await User.findByPk(userId);
      if (user) {
        await user.update({ lastLogout: new Date() });
      }

      return { message: 'Logged out successfully.' };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
}

module.exports = new AuthService(); 