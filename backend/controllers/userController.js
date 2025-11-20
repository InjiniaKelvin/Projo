const User = require('../models/User');

class UserController {
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async updateProfile(req, res) {
    try {
      const { id } = req.user;
      const updates = req.body;

      // Prevent changing role or other sensitive data
      delete updates.role;
      delete updates.password;

      const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');

      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}

module.exports = new UserController();
