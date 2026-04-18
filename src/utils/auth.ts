import type { User } from '@/models/User'

export type AppRole = 'admin' | 'employee' | 'candidate' | 'superadmin'

export const normalizeRole = (role: string | null | undefined): AppRole | null => {
  if (!role) return null

  const normalizedRole = role.trim().toLowerCase()

  if (normalizedRole === 'admin') return 'admin'
  if (normalizedRole === 'employee') return 'employee'
  if (normalizedRole === 'candidate') return 'candidate'
  if (normalizedRole === 'superadmin') return 'superadmin'

  return null
}

export const getUserRole = (user: User | null | undefined): AppRole | null => {
  return normalizeRole(user?.system_role_name)
}

export const getDefaultRouteByRole = (role: AppRole | null): string => {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'employee':
      return '/employee/talent-needs'
    case 'candidate':
      return '/candidate'
    case 'superadmin':
      return '/superadmin'
    default:
      return '/'
  }
}

export const getDefaultRouteForUser = (user: User | null | undefined): string => {
  return getDefaultRouteByRole(getUserRole(user))
}

export const canAccessPath = (role: AppRole | null, path: string): boolean => {
  if (path.startsWith('/admin')) {
    return role === 'admin'
  }

  if (path.startsWith('/employee')) {
    return role === 'employee'
  }

  if (path.startsWith('/candidate')) {
    return role === 'candidate'
  }
  if (path.startsWith('/superadmin')) {
    return role === 'superadmin'
  }

  return true
}

export const isAuthPage = (path: string): boolean => {
  return path === '/login' || path === '/register'
}
