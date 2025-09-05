'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'
import { useAppContext } from '@/lib/contexts/AppContext'
import { sidebarSchema, getActiveItems, shouldShowBadge, getBadgeCount } from '@/lib/sidebar/SidebarSchema'
import type { SidebarItem, SidebarCategory } from '@/lib/sidebar/SidebarSchema'

interface BadgeProps {
  text: string
  color: 'red' | 'blue' | 'green' | 'yellow'
}

function Badge({ text, color }: BadgeProps) {
  const colorClasses = {
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800', 
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800'
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClasses[color]}`}>
      {text}
    </span>
  )
}

interface SidebarItemProps {
  item: SidebarItem
  isActive: boolean
  level: number
  onItemClick: () => void
}

function SidebarItemComponent({ item, isActive, level, onItemClick }: SidebarItemProps) {
  const [isExpanded, setIsExpanded] = useState(isActive || level === 0)
  const Icon = item.icon
  const hasChildren = item.children && item.children.length > 0
  const badgeCount = getBadgeCount(item.id)

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    } else {
      onItemClick()
    }
  }

  const itemClasses = `
    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
    hover:bg-gray-50 hover:scale-[1.02] group relative
    ${isActive 
      ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600 shadow-sm' 
      : 'text-gray-700 hover:text-blue-600'
    }
    ${level > 0 ? 'mr-4 text-sm' : ''}
  `

  return (
    <li>
      {hasChildren ? (
        <button
          onClick={handleClick}
          className={itemClasses}
        >
          <Icon className={`
            w-5 h-5 transition-colors
            ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-500'}
          `} />
          <span className="font-medium flex-1 text-right">{item.title}</span>
          
          {/* Badge */}
          {badgeCount > 0 && (
            <Badge 
              text={badgeCount.toString()} 
              color={item.badge?.color || 'red'} 
            />
          )}
          
          {/* Expand/Collapse Icon */}
          {isExpanded ? (
            <ChevronUpIcon className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          )}
        </button>
      ) : (
        <Link
          href={item.path}
          onClick={onItemClick}
          className={itemClasses}
        >
          <Icon className={`
            w-5 h-5 transition-colors
            ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-500'}
          `} />
          <span className="font-medium flex-1">{item.title}</span>
          
          {/* Badge */}
          {badgeCount > 0 && (
            <Badge 
              text={badgeCount.toString()} 
              color={item.badge?.color || 'red'} 
            />
          )}
        </Link>
      )}
      
      {/* Children */}
      {hasChildren && isExpanded && (
        <ul className="mt-2 space-y-1">
          {item.children!.map((child) => (
            <SidebarItemComponent
              key={child.id}
              item={child}
              isActive={isActive}
              level={level + 1}
              onItemClick={onItemClick}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

interface SidebarCategoryProps {
  category: SidebarCategory
  activeItems: string[]
  onItemClick: () => void
}

function SidebarCategoryComponent({ category, activeItems, onItemClick }: SidebarCategoryProps) {
  const [isExpanded, setIsExpanded] = useState(category.defaultExpanded !== false)
  const hasActiveItem = category.items.some(item => activeItems.includes(item.id))

  if (category.id === 'dashboard') {
    // Dashboard category is always shown without collapsible header
    return (
      <div className="mb-6">
        <ul className="space-y-2">
          {category.items.map((item) => (
            <SidebarItemComponent
              key={item.id}
              item={item}
              isActive={activeItems.includes(item.id)}
              level={0}
              onItemClick={onItemClick}
            />
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="mb-6">
      {/* Category Header */}
      {category.collapsible ? (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
        >
          <span>{category.title}</span>
          {isExpanded ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )}
        </button>
      ) : (
        <div className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {category.title}
        </div>
      )}

      {/* Category Items */}
      {isExpanded && (
        <ul className="mt-2 space-y-2">
          {category.items.map((item) => (
            <SidebarItemComponent
              key={item.id}
              item={item}
              isActive={activeItems.includes(item.id)}
              level={0}
              onItemClick={onItemClick}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ModularSidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppContext()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  
  const activeItems = getActiveItems(pathname)

  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen)
  const closeMobileSidebar = () => setIsMobileOpen(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={toggleMobileSidebar}
          className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {isMobileOpen ? (
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed right-0 top-0 h-full bg-white shadow-xl z-50 sidebar-transition
        ${isMobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-88'} w-80 flex flex-col
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-l from-blue-600 to-blue-700 text-white">
          <div className="text-center">
            {!sidebarCollapsed && (
              <>
                <h1 className="text-xl font-bold mb-1">دبستان مهرآیین</h1>
                <p className="text-blue-100 text-sm">سیستم اتوماسیون مدرسه</p>
              </>
            )}
            {sidebarCollapsed && (
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-lg">م</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {sidebarSchema.map((category) => (
            <SidebarCategoryComponent
              key={category.id}
              category={category}
              activeItems={activeItems}
              onItemClick={closeMobileSidebar}
            />
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm">
            <UserCircleIcon className="w-10 h-10 text-gray-400 flex-shrink-0" />
            {!sidebarCollapsed && (
              <div>
                <p className="font-medium text-gray-900 text-sm">Admin User</p>
                <p className="text-xs text-gray-500">مدیر سیستم</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse Toggle (Desktop) */}
        <div className="hidden lg:block p-2 border-t border-gray-200">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title={sidebarCollapsed ? 'باز کردن منو' : 'بستن منو'}
          >
            {sidebarCollapsed ? (
              <ChevronDownIcon className="w-5 h-5 mx-auto rotate-90" />
            ) : (
              <ChevronUpIcon className="w-5 h-5 mx-auto rotate-90" />
            )}
          </button>
        </div>
      </div>
    </>
  )
}
