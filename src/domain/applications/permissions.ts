import { getServerSession } from '@/lib/auth/session';
import { UnauthorizedError } from '@/lib/errors';

// ============================================================================
// Permission Constants
// ============================================================================

/**
 * Application-related permissions
 * These should match the permission strings in your RBAC system
 */
export const APPLICATION_PERMISSIONS = {
  VIEW: 'applications:view',
  CREATE: 'applications:create',
  UPDATE: 'applications:update',
  DELETE: 'applications:delete',
} as const;

// ============================================================================
// Permission Helpers
// ============================================================================

/**
 * Check if user has a specific application permission
 */
export function hasApplicationPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean {
  return userPermissions.includes(requiredPermission);
}

/**
 * Check if user can perform any application operation
 */
export function canManageApplications(userPermissions: string[]): boolean {
  return Object.values(APPLICATION_PERMISSIONS).some((perm) =>
    userPermissions.includes(perm)
  );
}

// ============================================================================
// Permission Guards
// ============================================================================

/**
 * Require permission to list applications
 * Throws UnauthorizedError if user lacks permission
 */
export async function requireCanListApplications() {
  const session = await getServerSession();

  if (!session) {
    throw new UnauthorizedError('Authentication required to view applications');
  }

  if (!hasApplicationPermission(session.user.permissions, APPLICATION_PERMISSIONS.VIEW)) {
    throw new UnauthorizedError('You do not have permission to view applications');
  }

  return session;
}

/**
 * Require permission to create applications
 * Throws UnauthorizedError if user lacks permission
 */
export async function requireCanCreateApplications() {
  const session = await getServerSession();

  if (!session) {
    throw new UnauthorizedError('Authentication required to create applications');
  }

  if (!hasApplicationPermission(session.user.permissions, APPLICATION_PERMISSIONS.CREATE)) {
    throw new UnauthorizedError('You do not have permission to create applications');
  }

  return session;
}

/**
 * Require permission to update applications
 * Throws UnauthorizedError if user lacks permission
 */
export async function requireCanUpdateApplications() {
  const session = await getServerSession();

  if (!session) {
    throw new UnauthorizedError('Authentication required to update applications');
  }

  if (!hasApplicationPermission(session.user.permissions, APPLICATION_PERMISSIONS.UPDATE)) {
    throw new UnauthorizedError('You do not have permission to update applications');
  }

  return session;
}

/**
 * Require permission to delete applications
 * Throws UnauthorizedError if user lacks permission
 */
export async function requireCanDeleteApplications() {
  const session = await getServerSession();

  if (!session) {
    throw new UnauthorizedError('Authentication required to delete applications');
  }

  if (!hasApplicationPermission(session.user.permissions, APPLICATION_PERMISSIONS.DELETE)) {
    throw new UnauthorizedError('You do not have permission to delete applications');
  }

  return session;
}
