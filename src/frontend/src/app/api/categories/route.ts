import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  description: z.string().optional(),
  userId: z.string(),
})

// GET /api/categories - Fetch categories
export async function GET(request: NextRequest) {
  try {
    const userId = 'current-user-id' // TODO: Get from session

    const categories = await db.query(`
      SELECT * FROM categories 
      WHERE user_id = ? 
      ORDER BY is_default DESC, name ASC
    `, [userId])

    return NextResponse.json({
      success: true,
      categories: categories.map(category => ({
        id: category.id,
        name: category.name,
        color: category.color,
        description: category.description,
        isDefault: category.is_default,
        userId: category.user_id,
        createdAt: category.created_at,
        updatedAt: category.updated_at,
      }))
    })

  } catch (error) {
    console.error('Fetch categories error:', error)
    return NextResponse.json(
      { error: 'Không thể tải danh mục' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const data = createCategorySchema.parse(body)

    // Check if category name already exists for this user
    const existingCategory = await db.querySingle(
      'SELECT id FROM categories WHERE user_id = ? AND name = ?',
      [data.userId, data.name]
    )

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Tên danh mục đã tồn tại' },
        { status: 400 }
      )
    }

    // Create category
    const categoryId = await db.insert(`
      INSERT INTO categories (name, color, description, user_id, is_default) 
      VALUES (?, ?, ?, ?, ?)
    `, [
      data.name,
      data.color,
      data.description || null,
      data.userId,
      false // User-created categories are not default
    ])

    // Get created category
    const category = await db.querySingle(`
      SELECT * FROM categories WHERE id = ?
    `, [categoryId])

    return NextResponse.json({
      success: true,
      message: 'Tạo danh mục thành công',
      category: {
        id: category.id,
        name: category.name,
        color: category.color,
        description: category.description,
        isDefault: category.is_default,
        userId: category.user_id,
        createdAt: category.created_at,
        updatedAt: category.updated_at,
      }
    })

  } catch (error) {
    console.error('Create category error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Không thể tạo danh mục' },
      { status: 500 }
    )
  }
}
