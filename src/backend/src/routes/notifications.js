const express = require('express');
const Joi = require('joi');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation schema
const notificationSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  message: Joi.string().max(1000).required(),
  type: Joi.string().valid('event', 'system', 'reminder').required(),
  event_id: Joi.string().uuid().allow(null),
  scheduled_for: Joi.date().allow(null)
});

// Get all notifications for user
router.get('/', auth, async (req, res) => {
  try {
    const { type, unread_only } = req.query;
    
    let query = db('notifications')
      .where({ user_id: req.userId })
      .orderBy('created_at', 'desc');

    // Filter by type
    if (type) {
      query = query.where({ type });
    }

    // Filter unread only
    if (unread_only === 'true') {
      query = query.where({ is_read: false });
    }

    const notifications = await query;

    res.json({ notifications });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Get single notification
router.get('/:id', auth, async (req, res) => {
  try {
    const notification = await db('notifications')
      .where({ id: req.params.id, user_id: req.userId })
      .first();

    if (!notification) {
      return res.status(404).json({ error: 'Notification không tồn tại' });
    }

    res.json({ notification });

  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Create notification
router.post('/', auth, async (req, res) => {
  try {
    // Validate input
    const { error, value } = notificationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // If event_id is provided, check if event exists and belongs to user
    if (value.event_id) {
      const event = await db('events')
        .where({ id: value.event_id, user_id: req.userId })
        .first();

      if (!event) {
        return res.status(400).json({ error: 'Event không tồn tại' });
      }
    }

    // Prepare notification data
    const notificationData = {
      ...value,
      user_id: req.userId,
      is_read: false,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Create notification
    const [notificationId] = await db('notifications').insert(notificationData).returning('id');

    // Get created notification
    const createdNotification = await db('notifications')
      .where({ id: notificationId.id || notificationId })
      .first();

    res.status(201).json({
      message: 'Notification đã được tạo thành công',
      notification: createdNotification
    });

  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    // Check if notification exists and belongs to user
    const existingNotification = await db('notifications')
      .where({ id: req.params.id, user_id: req.userId })
      .first();

    if (!existingNotification) {
      return res.status(404).json({ error: 'Notification không tồn tại' });
    }

    // Mark as read
    await db('notifications')
      .where({ id: req.params.id, user_id: req.userId })
      .update({
        is_read: true,
        updated_at: new Date()
      });

    res.json({ message: 'Notification đã được đánh dấu là đã đọc' });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await db('notifications')
      .where({ user_id: req.userId, is_read: false })
      .update({
        is_read: true,
        updated_at: new Date()
      });

    res.json({ message: 'Tất cả notifications đã được đánh dấu là đã đọc' });

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if notification exists and belongs to user
    const existingNotification = await db('notifications')
      .where({ id: req.params.id, user_id: req.userId })
      .first();

    if (!existingNotification) {
      return res.status(404).json({ error: 'Notification không tồn tại' });
    }

    // Delete notification
    await db('notifications')
      .where({ id: req.params.id, user_id: req.userId })
      .del();

    res.json({ message: 'Notification đã được xóa thành công' });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Delete all read notifications
router.delete('/read-all', auth, async (req, res) => {
  try {
    const deletedCount = await db('notifications')
      .where({ user_id: req.userId, is_read: true })
      .del();

    res.json({ 
      message: `Đã xóa ${deletedCount} notifications đã đọc`,
      deleted_count: deletedCount
    });

  } catch (error) {
    console.error('Delete read notifications error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Get notification statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const stats = await db('notifications')
      .where({ user_id: req.userId })
      .select(
        db.raw('COUNT(*) as total_notifications'),
        db.raw('COUNT(CASE WHEN is_read = false THEN 1 END) as unread_notifications'),
        db.raw('COUNT(CASE WHEN type = ? THEN 1 END) as event_notifications', ['event']),
        db.raw('COUNT(CASE WHEN type = ? THEN 1 END) as system_notifications', ['system'])
      )
      .first();

    res.json({ stats });

  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
