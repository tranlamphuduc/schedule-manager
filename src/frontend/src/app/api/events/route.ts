import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  allDay: z.boolean().default(false),
  categoryId: z.string(),
  userId: z.string(),
  location: z.string().optional(),
  reminder: z.object({
    enabled: z.boolean().default(false),
    minutes: z.number().min(0).max(10080).default(15),
  }).optional(),
})

// GET /api/events - Fetch events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const userId = 'current-user-id' // TODO: Get from session

    let query = `
      SELECT 
        e.*,
        c.name as category_name,
        c.color as category_color
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = ?
    `
    const params = [userId]

    if (startDate && endDate) {
      query += ' AND e.start_date >= ? AND e.end_date <= ?'
      params.push(startDate, endDate)
    }

    query += ' ORDER BY e.start_date ASC'

    const events = await db.query(query, params)

    return NextResponse.json({
      success: true,
      events: events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        allDay: event.all_day,
        categoryId: event.category_id,
        userId: event.user_id,
        location: event.location,
        reminder: {
          enabled: event.reminder_enabled,
          minutes: event.reminder_minutes,
        },
        category: {
          name: event.category_name,
          color: event.category_color,
        },
        createdAt: event.created_at,
        updatedAt: event.updated_at,
      }))
    })

  } catch (error) {
    console.error('Fetch events error:', error)
    return NextResponse.json(
      { error: 'Không thể tải sự kiện' },
      { status: 500 }
    )
  }
}

// POST /api/events - Create event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const data = createEventSchema.parse(body)

    // Create event
    const eventId = await db.insert(`
      INSERT INTO events (
        title, description, start_date, end_date, all_day,
        category_id, user_id, location, reminder_enabled, reminder_minutes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.title,
      data.description || null,
      data.startDate,
      data.endDate,
      data.allDay,
      data.categoryId,
      data.userId,
      data.location || null,
      data.reminder?.enabled || false,
      data.reminder?.minutes || 15,
    ])

    // Get created event
    const event = await db.querySingle(`
      SELECT 
        e.*,
        c.name as category_name,
        c.color as category_color
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.id = ?
    `, [eventId])

    return NextResponse.json({
      success: true,
      message: 'Tạo sự kiện thành công',
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        allDay: event.all_day,
        categoryId: event.category_id,
        userId: event.user_id,
        location: event.location,
        reminder: {
          enabled: event.reminder_enabled,
          minutes: event.reminder_minutes,
        },
        category: {
          name: event.category_name,
          color: event.category_color,
        },
        createdAt: event.created_at,
        updatedAt: event.updated_at,
      }
    })

  } catch (error) {
    console.error('Create event error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Không thể tạo sự kiện' },
      { status: 500 }
    )
  }
}
