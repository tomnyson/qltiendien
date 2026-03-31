export type AppRole = 'admin' | 'warehouse' | 'lecturer' | 'director';

const lecturerAllowedPaths = ['/equipment', '/borrow', '/borrow/history'] as const;

function normalizePath(path: string) {
  if (!path || path === '/') return '/';
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

export function isLecturerRole(role?: string | null): role is AppRole {
  return role === 'lecturer';
}

export function getDefaultRouteForRole(role?: string | null) {
  return isLecturerRole(role) ? '/equipment' : '/dashboard';
}

export function canAccessPath(role: string | null | undefined, path: string) {
  if (!role) return false;

  const normalizedPath = normalizePath(path);
  if (!isLecturerRole(role)) return true;

  return lecturerAllowedPaths.includes(normalizedPath as (typeof lecturerAllowedPaths)[number]);
}
