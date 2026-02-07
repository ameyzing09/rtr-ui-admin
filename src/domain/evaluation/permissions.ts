import { PERMISSIONS, can } from '@/lib/rbac/permissions';
import type { Permission } from '@/lib/rbac/permissions';

/**
 * Evaluation Permission Constants
 * Maps to TENANT_PERMISSIONS for consistency with existing pattern
 */
export const EVALUATION_PERMISSIONS = {
  LIST: PERMISSIONS.FEEDBACK_LIST,      // Reuse feedback:list for viewing evaluations
  RESPOND: PERMISSIONS.FEEDBACK_CREATE, // Reuse feedback:create for submitting responses
  VIEW: PERMISSIONS.FEEDBACK_READ,      // Reuse feedback:read for viewing evaluation details
} as const;

/**
 * Signal Permission Constants
 */
export const SIGNAL_PERMISSIONS = {
  VIEW: PERMISSIONS.APPLICATION_READ,   // View signals requires application:read
  SET_MANUAL: PERMISSIONS.APPLICATION_UPDATE, // Set manual signals requires application:update
} as const;

/**
 * Check if user has a specific evaluation permission
 */
export function hasEvaluationPermission(
  userPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  return can(userPermissions, requiredPermission);
}

/**
 * Check if user has a specific signal permission
 */
export function hasSignalPermission(
  userPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  return can(userPermissions, requiredPermission);
}

/**
 * Check if user can view evaluations
 */
export function canViewEvaluations(userPermissions: Permission[]): boolean {
  return can(userPermissions, EVALUATION_PERMISSIONS.LIST) ||
         can(userPermissions, EVALUATION_PERMISSIONS.VIEW);
}

/**
 * Check if user can respond to evaluations
 */
export function canRespondToEvaluations(userPermissions: Permission[]): boolean {
  return can(userPermissions, EVALUATION_PERMISSIONS.RESPOND);
}

/**
 * Check if user can view signals
 */
export function canViewSignals(userPermissions: Permission[]): boolean {
  return can(userPermissions, SIGNAL_PERMISSIONS.VIEW);
}

/**
 * Check if user can set manual signals
 */
export function canSetManualSignals(userPermissions: Permission[]): boolean {
  return can(userPermissions, SIGNAL_PERMISSIONS.SET_MANUAL);
}
