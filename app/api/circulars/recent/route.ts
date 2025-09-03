import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Get recent announcements (using announcements table for circulars)
    const recentCirculars = await prisma.announcement.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        publishDate: 'desc'
      },
      take: 3
    })

    const formattedCirculars = recentCirculars.map(circular => ({
      id: circular.id,
      title: circular.title,
      content: circular.content,
      priority: circular.priority.toLowerCase(),
      author: circular.author,
      publishDate: circular.publishDate.toLocaleDateString('fa-IR'),
      targetAudience: circular.targetAudience,
      isActive: circular.isActive
    }))

    return NextResponse.json({
      success: true,
      data: {
        recentCirculars: formattedCirculars,
        count: formattedCirculars.length,
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching recent circulars:', error)
    
    // Fallback data
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      data: {
        recentCirculars: [
          {
            id: 1,
            title: 'تعطیلات نوروزی',
            content: 'با عرض تبریک سال نو، اطلاع می‌رساند که تعطیلات نوروزی از تاریخ ۲۹ اسفند آغاز می‌شود.',
            priority: 'high',
            author: 'مدیریت مدرسه',
            publishDate: new Date().toLocaleDateString('fa-IR'),
            targetAudience: 'all',
            isActive: true
          },
          {
            id: 2,
            title: 'برنامه امتحانات پایان ترم',
            content: 'برنامه امتحانات نهایی ترم دوم از تاریخ ۱۵ خرداد شروع خواهد شد.',
            priority: 'medium',
            author: 'معاونت آموزشی',
            publishDate: new Date().toLocaleDateString('fa-IR'),
            targetAudience: 'all',
            isActive: true
          }
        ],
        count: 2,
        lastUpdated: new Date().toISOString()
      }
    })
  }
}
