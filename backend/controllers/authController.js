/**
 * Authentication Controller
 * 
 * This controller handles user authentication including registration,
 * login, logout, token refresh, and password management.
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Wallet } = require('../models');

class AuthController {
  /**
   * Generate JWT tokens
   * @param {string} userId - User ID
   * @returns {Object} Access and refresh tokens
   */
  static generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
    
    return { accessToken, refreshToken };
  }

  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async register(req, res) {
    try {
      const { email, password, firstName, lastName, phoneNumber, role = 'client' } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { phoneNumber }]
      });
      
      if (existingUser) {
        const field = existingUser.email === email ? 'email' : 'phone number';
        return res.status(400).json({
          success: false,
          message: `User with this ${field} already exists`
        });
      }
      
      // Create new user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        role
      });
      
      await user.save();
      
      // Create wallet for the user
      const wallet = await Wallet.createWallet(user._id);
      user.walletId = wallet._id;
      await user.save();
      
      // Generate tokens
      const { accessToken, refreshToken } = AuthController.generateTokens(user._id);
      
      // Save refresh token
      await user.addRefreshToken(refreshToken);
      
      // Remove sensitive data from response
      const userResponse = user.toJSON();
      delete userResponse.password;
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userResponse,
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  }

  /**
   * Login user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await User.findByEmail(email).populate('walletId');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }
      
      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
      // Generate tokens
      const { accessToken, refreshToken } = AuthController.generateTokens(user._id);
      
      // Save refresh token and update last login
      await user.addRefreshToken(refreshToken);
      await user.updateLastLogin();
      
      // Remove sensitive data from response
      const userResponse = user.toJSON();
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }

  /**
   * Refresh access token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }
      
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      if (decoded.type !== 'refresh') {
        return res.status(403).json({
          success: false,
          message: 'Invalid token type'
        });
      }
      
      // Find user and check if refresh token exists
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'User not found or inactive'
        });
      }
      
      const tokenExists = user.refreshTokens.some(rt => 
        rt.token === refreshToken && rt.expiresAt > new Date()
      );
      
      if (!tokenExists) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }
      
      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = AuthController.generateTokens(user._id);
      
      // Remove old refresh token and add new one
      await user.removeRefreshToken(refreshToken);
      await user.addRefreshToken(newRefreshToken);
      
      res.json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: {
          tokens: {
            accessToken,
            refreshToken: newRefreshToken
          }
        }
      });
      
    } catch (error) {
      console.error('Token refresh error:', error);
      
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Token refresh failed',
        error: error.message
      });
    }
  }

  /**
   * Logout user (works with both valid and expired tokens)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      
      // Try to get user from token if available
      let user = req.user;
      
      // If no user attached (e.g., expired token), try to extract from token manually
      if (!user && req.headers.authorization) {
        try {
          const token = req.headers.authorization.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
          user = await User.findById(decoded.userId);
        } catch (tokenError) {
          console.log('Could not extract user from token, proceeding with logout anyway');
        }
      }
      
      // Remove refresh token if provided and user exists
      if (refreshToken && user) {
        try {
          await user.removeRefreshToken(refreshToken);
        } catch (removeError) {
          console.log('Could not remove refresh token, but logout proceeding');
        }
      }
      
      // Always return success for logout
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
      
    } catch (error) {
      console.error('Logout error:', error);
      // Still return success for logout to prevent loops
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    }
  }

  /**
   * Logout from all devices
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async logoutAll(req, res) {
    try {
      const user = req.user;
      
      // Clear all refresh tokens
      user.refreshTokens = [];
      await user.save();
      
      res.json({
        success: true,
        message: 'Logged out from all devices successfully'
      });
      
    } catch (error) {
      console.error('Logout all error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: error.message
      });
    }
  }

  /**
   * Request password reset
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      
      const user = await User.findByEmail(email);
      
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({
          success: true,
          message: 'If email exists, password reset instructions have been sent'
        });
      }
      
      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();
      
      // TODO: Send email with reset token
      // For now, return token in response (remove in production)
      console.log('Password reset token:', resetToken);
      
      res.json({
        success: true,
        message: 'Password reset instructions sent to email',
        // Remove in production
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      });
      
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        message: 'Password reset request failed',
        error: error.message
      });
    }
  }

  /**
   * Reset password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Token and new password are required'
        });
      }
      
      // Hash the token to compare with database
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      
      // Find user with valid reset token
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });
      
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }
      
      // Update password and clear reset token
      user.password = newPassword;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      
      // Clear all refresh tokens for security
      user.refreshTokens = [];
      
      await user.save();
      
      res.json({
        success: true,
        message: 'Password reset successfully'
      });
      
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        message: 'Password reset failed',
        error: error.message
      });
    }
  }

  /**
   * Change password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = req.user;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }
      
      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      
      // Update password
      user.password = newPassword;
      await user.save();
      
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
      
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({
        success: false,
        message: 'Password change failed',
        error: error.message
      });
    }
  }

  /**
   * Get current user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProfile(req, res) {
    try {
      const user = req.user;
      
      res.json({
        success: true,
        data: {
          user: user.toJSON()
        }
      });
      
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile',
        error: error.message
      });
    }
  }

  /**
   * Verify email
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      
      // Hash the token to compare with database
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      
      // Find user with valid verification token
      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() }
      });
      
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token'
        });
      }
      
      // Update verification status
      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      user.emailVerificationExpires = null;
      
      await user.save();
      
      res.json({
        success: true,
        message: 'Email verified successfully'
      });
      
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Email verification failed',
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();
