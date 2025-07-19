import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/notifications - Fetch notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const userId = 'current-user-id' // TODO: Get from session

    const notifications = await db.query(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `, [userId, limit, offset])

    return NextResponse.json({
      success: true,
      notifications: notifications.map(notification => ({
        id: notification.id,
        userId: notification.user_id,
        eventId: notification.event_id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.is_read,
        scheduledAt: notification.scheduled_at,
        sentAt: notification.sent_at,
        createdAt: notification.created_at,
      }))
    })

  } catch (error) {
    console.error('Fetch notifications error:', error)
    return NextResponse.json(
      { error: 'Không thể tải thông báo' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Create notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, eventId, title, message, type, scheduledAt } = body

    const notificationId = await db.insert(`
      INSERT INTO notifications (user_id, event_id, title, message, type, scheduled_at) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      userId,
      eventId || null,
      title,
      message,
      type || 'info',
      scheduledAt || null
    ])

    const notification = await db.querySingle(`
      SELECT * FROM notifications WHERE id = ?
    `, [notificationId])

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        userId: notification.user_id,
        eventId: notification.event_id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.is_read,
        scheduledAt: notification.scheduled_at,
        sentAt: notification.sent_at,
        createdAt: notification.created_at,
      }
    })

  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json(
      { error: 'Không thể tạo thông báo' },
      { status: 500 }
    )
  }
}
