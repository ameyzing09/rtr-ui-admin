/**
 * Router utility functions for determining active states
 * 
 * This file provides utilities for checking if routes are active,
 * which is used across navigation components.
 */

/**
 * Check if a route is currently active
 */
export function isRouteActive(
  currentPath: string,
  targetPath: string,
  exact: boolean = false
): boolean {
  // Normalize paths by removing trailing slashes (except root)
  const normalizedCurrent = currentPath === '/' ? '/' : currentPath.replace(/\/$/, '');
  const normalizedTarget = targetPath === '/' ? '/' : targetPath.replace(/\/$/, '');

  if (exact) {
    return normalizedCurrent === normalizedTarget;
  }

  // For non-exact matching, check if current path starts with target path
  // Special case: root path should only match exactly
  if (normalizedTarget === '/') {
    return normalizedCurrent === '/';
  }

  return normalizedCurrent.startsWith(normalizedTarget);
}

/**
 * Get the active route from a list of routes
 */
export function getActiveRoute<T extends { href: string; exactMatch?: boolean }>(
  routes: T[],
  currentPath: string
): T | undefined {
  // First try to find an exact match
  for (const route of routes) {
    if (isRouteActive(currentPath, route.href, true)) {
      return route;
    }
  }

  // Then try to find a prefix match (prioritize longer matches)
  const prefixMatches = routes
    .filter(route => isRouteActive(currentPath, route.href, route.exactMatch))
    .sort((a, b) => b.href.length - a.href.length);

  return prefixMatches[0];
}

/**
 * Check if any route in a group is active
 */
export function isGroupActive<T extends { href: string; exactMatch?: boolean }>(
  routes: T[],
  currentPath: string
): boolean {
  return routes.some(route => 
    isRouteActive(currentPath, route.href, route.exactMatch)
  );
}

/**
 * Get breadcrumb items from current path
 */
export interface BreadcrumbItem {
  label: string;
  href: string;
  isActive: boolean;
}

export function getBreadcrumbs(
  currentPath: string,
  routeMap: Record<string, string> = {}
): BreadcrumbItem[] {
  const segments = currentPath.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Add home/root
  breadcrumbs.push({
    label: routeMap['/'] || 'Home',
    href: '/',
    isActive: currentPath === '/',
  });

  // Build breadcrumbs from path segments
  let currentHref = '';
  segments.forEach((segment, index) => {
    currentHref += `/${segment}`;
    const isLast = index === segments.length - 1;
    
    breadcrumbs.push({
      label: routeMap[currentHref] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: currentHref,
      isActive: isLast,
    });
  });

  return breadcrumbs;
}

/**
 * Check if a path matches a pattern with dynamic segments
 */
export function matchesPattern(path: string, pattern: string): boolean {
  // Convert pattern like '/users/[id]' to regex
  const regexPattern = pattern
    .replace(/\[\.\.\.(\w+)\]/g, '(?<$1>.*)')  // [...slug] -> named capture group for rest
    .replace(/\[(\w+)\]/g, '(?<$1>[^/]+)')    // [id] -> named capture group
    .replace(/\//g, '\\/');                   // escape forward slashes

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(path);
}

/**
 * Extract dynamic parameters from a path using a pattern
 */
export function extractParams(path: string, pattern: string): Record<string, string> {
  const regexPattern = pattern
    .replace(/\[\.\.\.(\w+)\]/g, '(?<$1>.*)')
    .replace(/\[(\w+)\]/g, '(?<$1>[^/]+)')
    .replace(/\//g, '\\/');

  const regex = new RegExp(`^${regexPattern}$`);
  const match = path.match(regex);

  return match?.groups || {};
}

/**
 * Build a path from a pattern and parameters
 */
export function buildPath(pattern: string, params: Record<string, string>): string {
  let path = pattern;
  
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`[${key}]`, value);
    path = path.replace(`[...${key}]`, value);
  });

  return path;
}

/**
 * Get the section from a dashboard path
 * e.g., '/dashboard/users/roles' -> 'users'
 */
export function getDashboardSection(path: string): string | null {
  const segments = path.split('/').filter(Boolean);
  
  if (segments.length < 2 || segments[0] !== 'dashboard') {
    return null;
  }
  
  return segments[1] || null;
}

/**
 * Check if two paths are in the same section
 */
export function isSameSection(path1: string, path2: string): boolean {
  const section1 = getDashboardSection(path1);
  const section2 = getDashboardSection(path2);
  
  return section1 !== null && section1 === section2;
}
