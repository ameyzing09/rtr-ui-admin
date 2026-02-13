import { PERMISSIONS, can } from '@/lib/rbac/permissions';
import type { Permission } from '@/lib/rbac/permissions';

/**
 * Interview Permission Constants
 * Maps to TENANT_PERMISSIONS for consistency with existing pattern
 */
export const INTERVIEW_PERMISSIONS = {
  LIST: PERMISSIONS.INTERVIEW_LIST,
  VIEW: PERMISSIONS.INTERVIEW_READ,
  CREATE: PERMISSIONS.INTERVIEW_CREATE,
  UPDATE: PERMISSIONS.INTERVIEW_UPDATE,
  CANCEL: PERMISSIONS.INTERVIEW_DELETE,
} as const;

/**
 * Check if user has a specific interview permission
 */
export function hasInterviewPermission(
  userPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  return can(userPermissions, requiredPermission);
}

/**
 * Check if user can view interviews
 */
export function canViewInterviews(userPermissions: Permission[]): boolean {
  return can(userPermissions, INTERVIEW_PERMISSIONS.LIST) ||
         can(userPermissions, INTERVIEW_PERMISSIONS.VIEW);
}

/**
 * Check if user can create interviews
 */
export function canCreateInterviews(userPermissions: Permission[]): boolean {
  return can(userPermissions, INTERVIEW_PERMISSIONS.CREATE);
}

/**
 * Check if user can manage interviews (create/update/cancel)
 */
export function canManageInterviews(userPermissions: Permission[]): boolean {
  return can(userPermissions, INTERVIEW_PERMISSIONS.UPDATE) ||
         can(userPermissions, INTERVIEW_PERMISSIONS.CANCEL);
}
