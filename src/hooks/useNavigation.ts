'use client';

import { useMemo } from 'react';
import {
  getNavItemsForRole,
  type UserRole,
  type NavLinkConfig,
  type NavSectionConfig
} from '@/config/navigationConfig';
import type { Permission } from '@/lib/rbac/permissions';
import { getPermissionsForRole } from '@/lib/rbac/permissions';

interface UseNavigationProps {
  userRole: UserRole;
  userPermissions?: Permission[];
}

interface NavigationItems {
  navbar: NavLinkConfig[];
  sidebarSections: NavSectionConfig[];
}

/**
 * Get navigation items based on user role and permissions
 * Uses permission-based filtering - only shows items the user has access to
 */
export function useNavigation({ userRole, userPermissions = [] }: UseNavigationProps): NavigationItems {
  return useMemo(() => {
    // If no permissions provided, derive from role for backward compatibility
    const effectivePermissions = userPermissions.length > 0
      ? userPermissions
      : getPermissionsForRole(userRole.toUpperCase());

    return getNavItemsForRole(userRole, effectivePermissions);
  }, [userRole, userPermissions]);
}

/**
 * Hook to get the appropriate dashboard URL based on user role
 */
export function useDashboardUrl(userRole: UserRole): string {
  return useMemo(() => {
    switch (userRole) {
      case 'superadmin':
      case 'admin':
      case 'hr':
        return '/dashboard';

      case 'interviewer':
        return '/dashboard/interviews';

      case 'candidate':
        return '/dashboard/candidate/applications';

      default:
        return '/dashboard';
    }
  }, [userRole]);
}

/**
 * Hook to determine if current path is accessible for user role
 */
export function usePathAccess(
  pathname: string, 
  userRole: UserRole, 
  userPermissions: Permission[] = []
): boolean {
  const { navbar, sidebarSections } = useNavigation({ userRole, userPermissions });
  
  return useMemo(() => {
    // Check if path exists in navbar
    const hasNavbarAccess = navbar.some(item => pathname.startsWith(item.href));
    
    // Check if path exists in sidebar sections
    const hasSidebarAccess = sidebarSections.some(section =>
      section.items.some(item => pathname.startsWith(item.href))
    );
    
    return hasNavbarAccess || hasSidebarAccess;
  }, [pathname, navbar, sidebarSections]);
}

/**
 * Hook to get breadcrumb items for current path
 */
export function useBreadcrumbs(
  pathname: string,
  userRole: UserRole,
  userPermissions: Permission[] = []
): Array<{ label: string; href?: string }> {
  const { navbar, sidebarSections } = useNavigation({ userRole, userPermissions });
  
  return useMemo(() => {
    const breadcrumbs: Array<{ label: string; href?: string }> = [];
    
    // Find matching item in navigation
    let matchedItem: NavLinkConfig | null = null;
    let matchedSection: NavSectionConfig | null = null;
    
    // Search in sidebar sections first (more specific)
    for (const section of sidebarSections) {
      for (const item of section.items) {
        if (pathname.startsWith(item.href)) {
          if (!matchedItem || item.href.length > matchedItem.href.length) {
            matchedItem = item;
            matchedSection = section;
          }
        }
      }
    }
    
    // Search in navbar if not found in sidebar
    if (!matchedItem) {
      for (const item of navbar) {
        if (pathname.startsWith(item.href)) {
          if (!matchedItem || item.href.length > matchedItem.href.length) {
            matchedItem = item;
          }
        }
      }
    }
    
    // Build breadcrumbs
    if (matchedSection) {
      breadcrumbs.push({ label: matchedSection.title });
    }
    
    if (matchedItem) {
      breadcrumbs.push({ 
        label: matchedItem.label, 
        href: matchedItem.href 
      });
    }
    
    return breadcrumbs;
  }, [pathname, navbar, sidebarSections]);
}