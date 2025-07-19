const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  email: Joi.string().email()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await db('users')
      .select('id', 'name', 'email', 'created_at', 'updated_at')
      .where({ id: req.userId })
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User không tồn tại' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    // Validate input
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if email is being changed and if it's already taken
    if (value.email) {
      const existingUser = await db('users')
        .where({ email: value.email })
        .whereNot({ id: req.userId })
        .first();

      if (existingUser) {
        return res.status(400).json({ error: 'Email đã được sử dụng' });
      }
    }

    // Prepare update data
    const updateData = {
      ...value,
      updated_at: new Date()
    };

    // Update user
    await db('users')
      .where({ id: req.userId })
      .update(updateData);

    // Get updated user
    const updatedUser = await db('users')
      .select('id', 'name', 'email', 'created_at', 'updated_at')
      .where({ id: req.userId })
      .first();

    res.json({
      message: 'Profile đã được cập nhật thành công',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    // Validate input
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { currentPassword, newPassword } = value;

    // Get current user
    const user = await db('users')
      .where({ id: req.userId })
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User không tồn tại' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db('users')
      .where({ id: req.userId })
      .update({
        password: hashedNewPassword,
        updated_at: new Date()
      });

    res.json({ message: 'Mật khẩu đã được thay đổi thành công' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Delete user account
router.delete('/account', auth, async (req, res) => {
  try {
    // This will cascade delete all user's events and categories
    await db('users')
      .where({ id: req.userId })
      .del();

    res.json({ message: 'Tài khoản đã được xóa thành công' });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await db.raw(`
      SELECT 
        (SELECT COUNT(*) FROM events WHERE user_id = ?) as total_events,
        (SELECT COUNT(*) FROM categories WHERE user_id = ?) as total_categories,
        (SELECT COUNT(*) FROM events WHERE user_id = ? AND start_date >= CURRENT_DATE) as upcoming_events,
        (SELECT COUNT(*) FROM events WHERE user_id = ? AND start_date < CURRENT_DATE) as past_events
    `, [req.userId, req.userId, req.userId, req.userId]);

    const userStats = stats.rows[0];

    res.json({ stats: userStats });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
