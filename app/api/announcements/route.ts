import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Get latest 3 active announcements
    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        publishDate: 'desc'
      },
      take: 3
    })
    
    // Format announcements for frontend
    const formattedAnnouncements = announcements.map(announcement => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority.toLowerCase(),
      author: announcement.author,
      date: announcement.publishDate.toLocaleDateString('fa-IR'),
      targetAudience: announcement.targetAudience
    }))
    
    return NextResponse.json({ announcements: formattedAnnouncements })
    
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, content, priority, author, targetAudience } = body
    
    // Validate required fields
    if (!title || !content || !author) {
      return NextResponse.json(
        { error: 'Title, content, and author are required' },
        { status: 400 }
      )
    }
    
    // Create new announcement
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        priority: priority?.toUpperCase() || 'MEDIUM',
        author,
        targetAudience: targetAudience || 'all'
      }
    })
    
    return NextResponse.json({ 
      message: 'Announcement created successfully',
      announcement 
    })
    
  } catch (error) {
    console.error('Error creating announcement:', error)
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    )
  }
}
