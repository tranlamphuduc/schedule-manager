const express = require('express');
const Joi = require('joi');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation schema
const categorySchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).required(),
  description: Joi.string().max(500).allow(''),
  is_default: Joi.boolean().default(false)
});

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management endpoints
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories for the authenticated user
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
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
// Get all categories for user
router.get('/', auth, async (req, res) => {
  try {
    const categories = await db('categories')
      .where({ user_id: req.userId })
      .orderBy('created_at', 'asc');

    res.json({ categories });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Get single category
router.get('/:id', auth, async (req, res) => {
  try {
    const category = await db('categories')
      .where({ id: req.params.id, user_id: req.userId })
      .first();

    if (!category) {
      return res.status(404).json({ error: 'Category không tồn tại' });
    }

    res.json({ category });

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Create category
router.post('/', auth, async (req, res) => {
  try {
    // Validate input
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if category name already exists for user
    const existingCategory = await db('categories')
      .where({ user_id: req.userId, name: value.name })
      .first();

    if (existingCategory) {
      return res.status(400).json({ error: 'Tên category đã tồn tại' });
    }

    // Prepare category data
    const categoryData = {
      ...value,
      user_id: req.userId,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Create category
    const [categoryId] = await db('categories').insert(categoryData).returning('id');

    // Get created category
    const createdCategory = await db('categories')
      .where({ id: categoryId.id || categoryId })
      .first();

    res.status(201).json({
      message: 'Category đã được tạo thành công',
      category: createdCategory
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Update category
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if category exists and belongs to user
    const existingCategory = await db('categories')
      .where({ id: req.params.id, user_id: req.userId })
      .first();

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category không tồn tại' });
    }

    // Validate input
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if new name conflicts with existing categories
    if (value.name !== existingCategory.name) {
      const nameConflict = await db('categories')
        .where({ user_id: req.userId, name: value.name })
        .whereNot({ id: req.params.id })
        .first();

      if (nameConflict) {
        return res.status(400).json({ error: 'Tên category đã tồn tại' });
      }
    }

    // Prepare update data
    const updateData = {
      ...value,
      updated_at: new Date()
    };

    // Update category
    await db('categories')
      .where({ id: req.params.id, user_id: req.userId })
      .update(updateData);

    // Get updated category
    const updatedCategory = await db('categories')
      .where({ id: req.params.id })
      .first();

    res.json({
      message: 'Category đã được cập nhật thành công',
      category: updatedCategory
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Delete category
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if category exists and belongs to user
    const existingCategory = await db('categories')
      .where({ id: req.params.id, user_id: req.userId })
      .first();

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category không tồn tại' });
    }

    // Check if category is being used by events
    const eventsUsingCategory = await db('events')
      .where({ category_id: req.params.id, user_id: req.userId })
      .count('id as count')
      .first();

    if (eventsUsingCategory.count > 0) {
      return res.status(400).json({ 
        error: 'Không thể xóa category đang được sử dụng bởi events' 
      });
    }

    // Delete category
    await db('categories')
      .where({ id: req.params.id, user_id: req.userId })
      .del();

    res.json({ message: 'Category đã được xóa thành công' });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
