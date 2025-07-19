const express = require('express');
const Joi = require('joi');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation schema
const eventSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000).allow(''),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  all_day: Joi.boolean().default(false),
  category_id: Joi.string().required(),
  location: Joi.string().max(200).allow(''),
  reminder: Joi.object({
    enabled: Joi.boolean().default(false),
    minutes: Joi.number().integer().min(0).default(15)
  }).allow(null),
  repeat: Joi.object({
    type: Joi.string().valid('daily', 'weekly', 'monthly').required(),
    end_date: Joi.date().required(),
    dates: Joi.array().items(Joi.date())
  }).allow(null)
});

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management endpoints
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events for the authenticated user
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events from this date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events until this date
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *         description: Filter events by category ID
 *     responses:
 *       200:
 *         description: Events retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get all events for user
router.get('/', auth, async (req, res) => {
  try {
    const { start_date, end_date, category_id } = req.query;
    
    let query = db('events')
      .where({ user_id: req.userId })
      .orderBy('start_date', 'asc');

    // Filter by date range
    if (start_date && end_date) {
      query = query.whereBetween('start_date', [start_date, end_date]);
    }

    // Filter by category
    if (category_id) {
      query = query.where({ category_id });
    }

    const events = await query;

    // Parse JSON fields
    const parsedEvents = events.map(event => ({
      ...event,
      reminder: event.reminder ? JSON.parse(event.reminder) : null,
      repeat: event.repeat ? JSON.parse(event.repeat) : null
    }));

    res.json({ events: parsedEvents });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Get single event
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await db('events')
      .where({ id: req.params.id, user_id: req.userId })
      .first();

    if (!event) {
      return res.status(404).json({ error: 'Event không tồn tại' });
    }

    // Parse JSON fields
    const parsedEvent = {
      ...event,
      reminder: event.reminder ? JSON.parse(event.reminder) : null,
      repeat: event.repeat ? JSON.parse(event.repeat) : null
    };

    res.json({ event: parsedEvent });

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Create event
router.post('/', auth, async (req, res) => {
  try {
    // Validate input
    const { error, value } = eventSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if category exists and belongs to user
    const category = await db('categories')
      .where({ id: value.category_id, user_id: req.userId })
      .first();

    if (!category) {
      return res.status(400).json({ error: 'Category không tồn tại' });
    }

    // Prepare event data
    const eventData = {
      ...value,
      user_id: req.userId,
      reminder: value.reminder ? JSON.stringify(value.reminder) : null,
      repeat: value.repeat ? JSON.stringify(value.repeat) : null,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Create event
    const [eventId] = await db('events').insert(eventData).returning('id');

    // Get created event
    const createdEvent = await db('events')
      .where({ id: eventId.id || eventId })
      .first();

    // Parse JSON fields
    const parsedEvent = {
      ...createdEvent,
      reminder: createdEvent.reminder ? JSON.parse(createdEvent.reminder) : null,
      repeat: createdEvent.repeat ? JSON.parse(createdEvent.repeat) : null
    };

    res.status(201).json({
      message: 'Event đã được tạo thành công',
      event: parsedEvent
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Update event
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if event exists and belongs to user
    const existingEvent = await db('events')
      .where({ id: req.params.id, user_id: req.userId })
      .first();

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event không tồn tại' });
    }

    // Validate input
    const { error, value } = eventSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if category exists and belongs to user
    const category = await db('categories')
      .where({ id: value.category_id, user_id: req.userId })
      .first();

    if (!category) {
      return res.status(400).json({ error: 'Category không tồn tại' });
    }

    // Prepare update data
    const updateData = {
      ...value,
      reminder: value.reminder ? JSON.stringify(value.reminder) : null,
      repeat: value.repeat ? JSON.stringify(value.repeat) : null,
      updated_at: new Date()
    };

    // Update event
    await db('events')
      .where({ id: req.params.id, user_id: req.userId })
      .update(updateData);

    // Get updated event
    const updatedEvent = await db('events')
      .where({ id: req.params.id })
      .first();

    // Parse JSON fields
    const parsedEvent = {
      ...updatedEvent,
      reminder: updatedEvent.reminder ? JSON.parse(updatedEvent.reminder) : null,
      repeat: updatedEvent.repeat ? JSON.parse(updatedEvent.repeat) : null
    };

    res.json({
      message: 'Event đã được cập nhật thành công',
      event: parsedEvent
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if event exists and belongs to user
    const existingEvent = await db('events')
      .where({ id: req.params.id, user_id: req.userId })
      .first();

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event không tồn tại' });
    }

    // Delete event
    await db('events')
      .where({ id: req.params.id, user_id: req.userId })
      .del();

    res.json({ message: 'Event đã được xóa thành công' });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Get event statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const stats = await db('events')
      .where({ user_id: req.userId })
      .select(
        db.raw('COUNT(*) as total_events'),
        db.raw('COUNT(CASE WHEN start_date >= CURRENT_DATE THEN 1 END) as upcoming_events'),
        db.raw('COUNT(CASE WHEN start_date < CURRENT_DATE THEN 1 END) as past_events')
      )
      .first();

    res.json({ stats });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
