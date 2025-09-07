'use client'

import { useAuthStore } from '@/lib/stores/authStore'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Props {
  resource: 'STUDENT' | 'TEACHER' | 'CLASS' | 'MEAL' | 'TRANSPORT' | 'PAYMENT'
  onAdd?: () => void
  onEdit?: () => void
  onDelete?: () => void
  addText?: string
  editText?: string
  deleteText?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const PERMISSIONS = {
  ADMIN: {
    STUDENT: ['CREATE', 'UPDATE', 'DELETE'],
    TEACHER: ['CREATE', 'UPDATE', 'DELETE'],
    CLASS: ['CREATE', 'UPDATE', 'DELETE'],
    MEAL: ['CREATE', 'UPDATE', 'DELETE'],
    TRANSPORT: ['CREATE', 'UPDATE', 'DELETE'],
    PAYMENT: ['CREATE', 'UPDATE', 'DELETE']
  },
  VICE_PRINCIPAL: {
    STUDENT: ['CREATE', 'UPDATE', 'DELETE'],
    TEACHER: ['CREATE', 'UPDATE', 'DELETE'],
    CLASS: ['CREATE', 'UPDATE', 'DELETE'],
    MEAL: [],
    TRANSPORT: [],
    PAYMENT: []
  },
  TEACHER: {
    STUDENT: ['UPDATE'], // Only their own classes
    TEACHER: [],
    CLASS: [],
    MEAL: [],
    TRANSPORT: [],
    PAYMENT: []
  },
  FINANCE: {
    STUDENT: [],
    TEACHER: [],
    CLASS: [],
    MEAL: ['CREATE', 'UPDATE'],
    TRANSPORT: [],
    PAYMENT: ['CREATE', 'UPDATE', 'DELETE']
  }
}

export default function RoleAwareActions({
  resource,
  onAdd,
  onEdit,
  onDelete,
  addText = 'افزودن',
  editText = 'ویرایش',
  deleteText = 'حذف',
  className = '',
  size = 'md'
}: Props) {
  const { user } = useAuthStore()

  if (!user) return null

  const userPermissions = PERMISSIONS[user.role as keyof typeof PERMISSIONS]?.[resource] || []
  
  const canCreate = userPermissions.includes('CREATE')
  const canUpdate = userPermissions.includes('UPDATE')
  const canDelete = userPermissions.includes('DELETE')

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  }

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <div className={`flex items-center space-x-2 space-x-reverse ${className}`}>
      {/* Add Button */}
      {canCreate && onAdd && (
        <button
          onClick={onAdd}
          className={`
            flex items-center space-x-1 space-x-reverse
            bg-green-600 text-white rounded-lg
            hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2
            transition-colors duration-200
            ${sizeClasses[size]}
          `}
        >
          <PlusIcon className={iconSizeClasses[size]} />
          <span>{addText}</span>
        </button>
      )}

      {/* Edit Button */}
      {canUpdate && onEdit && (
        <button
          onClick={onEdit}
          className={`
            flex items-center space-x-1 space-x-reverse
            bg-blue-600 text-white rounded-lg
            hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transition-colors duration-200
            ${sizeClasses[size]}
          `}
        >
          <PencilIcon className={iconSizeClasses[size]} />
          <span>{editText}</span>
        </button>
      )}

      {/* Delete Button */}
      {canDelete && onDelete && (
        <button
          onClick={onDelete}
          className={`
            flex items-center space-x-1 space-x-reverse
            bg-red-600 text-white rounded-lg
            hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2
            transition-colors duration-200
            ${sizeClasses[size]}
          `}
        >
          <TrashIcon className={iconSizeClasses[size]} />
          <span>{deleteText}</span>
        </button>
      )}
    </div>
  )
}

// Helper function to check permissions programmatically
export function hasPermission(
  userRole: string,
  resource: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE'
): boolean {
  const permissions = PERMISSIONS[userRole as keyof typeof PERMISSIONS]
  if (!permissions) return false
  
  const resourcePermissions = permissions[resource as keyof typeof permissions[keyof typeof permissions]]
  return resourcePermissions?.includes(action) || false
}

// Role-aware wrapper component for conditional rendering
interface RoleGateProps {
  roles: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGate({ roles, children, fallback = null }: RoleGateProps) {
  const { user } = useAuthStore()
  
  if (!user || !roles.includes(user.role)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}
