import { CalendarIcon, BellIcon } from '@heroicons/react/24/outline'

interface Announcement {
  id: number
  title: string
  content: string
  date: string
  priority: 'high' | 'medium' | 'low'
  author: string
}

interface AnnouncementCardProps {
  announcement: Announcement
}

const priorityColors = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
}

const priorityLabels = {
  high: 'فوری',
  medium: 'متوسط',
  low: 'عادی'
}

export default function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 card-shadow border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <BellIcon className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 text-sm">{announcement.title}</h3>
        </div>
        <span className={`
          px-2 py-1 rounded-full text-xs font-medium border
          ${priorityColors[announcement.priority]}
        `}>
          {priorityLabels[announcement.priority]}
        </span>
      </div>
      
      <p className="text-gray-700 text-sm mb-3 leading-relaxed">
        {announcement.content}
      </p>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <CalendarIcon className="w-4 h-4" />
          <span>{announcement.date}</span>
        </div>
        <span>توسط: {announcement.author}</span>
      </div>
    </div>
  )
}
