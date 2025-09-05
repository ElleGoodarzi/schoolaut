/**
 * Route Migration Mapper
 * Maps old flat routes to new modular architecture
 */

interface RouteMapping {
  oldRoute: string
  newRoute: string
  context?: string
  description: string
}

export const routeMappings: RouteMapping[] = [
  // Dashboard remains the same
  {
    oldRoute: '/',
    newRoute: '/',
    description: 'Dashboard - no change needed'
  },

  // People Management
  {
    oldRoute: '/students',
    newRoute: '/people/students',
    description: 'Students moved to People Management category'
  },
  {
    oldRoute: '/teachers',
    newRoute: '/people/teachers', 
    description: 'Teachers moved to People Management category'
  },

  // Academic Operations
  {
    oldRoute: '/attendance',
    newRoute: '/academic/attendance',
    description: 'Attendance moved to Academic Operations'
  },
  {
    oldRoute: '/attendance/today',
    newRoute: '/academic/attendance/today',
    description: 'Today\'s attendance in Academic section'
  },

  // Financial Management (enhanced)
  {
    oldRoute: '/financial',
    newRoute: '/financial',
    description: 'Financial management enhanced with modules'
  },
  {
    oldRoute: '/financial/reports',
    newRoute: '/financial/reports',
    description: 'Financial reports remain in same location'
  },

  // Services
  {
    oldRoute: '/services',
    newRoute: '/services',
    description: 'Services enhanced with modular components'
  },

  // Communications
  {
    oldRoute: '/communications',
    newRoute: '/communications',
    description: 'Communications enhanced'
  },
  {
    oldRoute: '/circulars',
    newRoute: '/communications/circulars',
    description: 'Circulars moved under Communications'
  },

  // Analytics & Insights
  {
    oldRoute: '/surveys',
    newRoute: '/analytics/surveys',
    description: 'Surveys moved to Analytics category'
  },
  {
    oldRoute: '/rewards',
    newRoute: '/analytics/rewards',
    description: 'Rewards moved to Analytics category'
  },
  {
    oldRoute: '/evaluation',
    newRoute: '/people/teachers?tab=evaluation',
    context: 'evaluation',
    description: 'Teacher evaluation becomes tab in Teachers'
  },

  // System Management
  {
    oldRoute: '/management',
    newRoute: '/management',
    description: 'Management panel enhanced with better organization'
  },
  {
    oldRoute: '/system',
    newRoute: '/system',
    description: 'System settings remain separate'
  }
]

/**
 * Get new route for an old route
 */
export function getNewRoute(oldRoute: string): string {
  const mapping = routeMappings.find(m => m.oldRoute === oldRoute)
  return mapping?.newRoute || oldRoute
}

/**
 * Get context for a route migration
 */
export function getRouteContext(oldRoute: string): string | undefined {
  const mapping = routeMappings.find(m => m.oldRoute === oldRoute)
  return mapping?.context
}

/**
 * Check if a route needs migration
 */
export function needsMigration(route: string): boolean {
  const mapping = routeMappings.find(m => m.oldRoute === route)
  return mapping ? mapping.oldRoute !== mapping.newRoute : false
}

/**
 * Get migration description for a route
 */
export function getMigrationDescription(oldRoute: string): string {
  const mapping = routeMappings.find(m => m.oldRoute === oldRoute)
  return mapping?.description || 'No migration needed'
}

/**
 * Generate redirect middleware for old routes
 */
export function generateRedirectMiddleware(): string {
  const redirects = routeMappings
    .filter(m => m.oldRoute !== m.newRoute)
    .map(m => `  '${m.oldRoute}': '${m.newRoute}'`)
    .join(',\n')

  return `
// Auto-generated redirect middleware for modular architecture
export const routeRedirects: Record<string, string> = {
${redirects}
}

export function getRedirectUrl(pathname: string): string | null {
  return routeRedirects[pathname] || null
}
`
}

/**
 * Contextual Navigation Helpers
 */
export interface NavigationContext {
  sourceModule: string
  targetModule: string
  entityId?: number
  entityType?: 'student' | 'teacher' | 'class'
  highlightField?: string
  activeTab?: string
}

export function buildContextualUrl(
  baseRoute: string, 
  context: NavigationContext
): string {
  const params = new URLSearchParams()
  
  if (context.activeTab) params.set('tab', context.activeTab)
  if (context.highlightField) params.set('highlight', context.highlightField)
  if (context.sourceModule) params.set('from', context.sourceModule)
  
  return `${baseRoute}${params.toString() ? '?' + params.toString() : ''}`
}

/**
 * Smart Badge Calculation
 */
export interface BadgeConfig {
  itemId: string
  apiEndpoint?: string
  fallbackCount?: number
  color: 'red' | 'blue' | 'green' | 'yellow'
}

export const badgeConfigs: BadgeConfig[] = [
  {
    itemId: 'students-financial',
    apiEndpoint: '/api/financial/overdue-count',
    fallbackCount: 18,
    color: 'red'
  },
  {
    itemId: 'financial-overdue', 
    apiEndpoint: '/api/financial/overdue-count',
    fallbackCount: 18,
    color: 'red'
  },
  {
    itemId: 'attendance-alerts',
    apiEndpoint: '/api/attendance/frequent-absentees',
    fallbackCount: 5,
    color: 'yellow'
  }
]

export async function getBadgeCount(itemId: string): Promise<number> {
  const config = badgeConfigs.find(c => c.itemId === itemId)
  if (!config) return 0

  try {
    if (config.apiEndpoint) {
      const response = await fetch(config.apiEndpoint)
      const data = await response.json()
      
      // Extract count based on API structure
      if (itemId.includes('financial')) {
        return data.data?.overdueStudentsCount || config.fallbackCount || 0
      }
      if (itemId.includes('attendance')) {
        return data.data?.count || config.fallbackCount || 0
      }
    }
    
    return config.fallbackCount || 0
  } catch (error) {
    console.error(`Error fetching badge count for ${itemId}:`, error)
    return config.fallbackCount || 0
  }
}
