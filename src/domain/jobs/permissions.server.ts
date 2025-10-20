'use server';

/**
 * Server-Only Job Permissions
 *
 * This file contains server-side job permission checks that require authentication.
 * It should only be imported in server components and server actions.
 *
 * For client-side permission checking, use permissions.ts instead.
 */

import { requireAuth } from '@/lib/rbac/guard.server';
import { can } from '@/lib/rbac/permissions';
import type { Permission } from '@/lib/rbac/permissions';
import type { UserSession } from '@/lib/rbac/guard';
import { JOB_PERMISSIONS } from './permissions';

/**
 * Require user to have a specific job permission
 * Throws UnauthorizedError if user doesn't have permission
 *
 * @param permission - The required job permission
 * @returns The authenticated session
 */
export async function requireJobPermission(permission: Permission): Promise<UserSession> {
  const session = await requireAuth();

  if (!can(session.permissions, permission)) {
    throw new Error(`Missing required permission: ${permission}`);
  }

  return session;
}

/**
 * Check if user can list jobs
 * @returns The authenticated session
 */
export async function requireCanListJobs(): Promise<UserSession> {
  return requireJobPermission(JOB_PERMISSIONS.LIST);
}

/**
 * Check if user can create jobs
 * @returns The authenticated session
 */
export async function requireCanCreateJobs(): Promise<UserSession> {
  return requireJobPermission(JOB_PERMISSIONS.CREATE);
}

/**
 * Check if user can read job details
 * @returns The authenticated session
 */
export async function requireCanReadJobs(): Promise<UserSession> {
  return requireJobPermission(JOB_PERMISSIONS.READ);
}

/**
 * Check if user can update jobs
 * @returns The authenticated session
 */
export async function requireCanUpdateJobs(): Promise<UserSession> {
  return requireJobPermission(JOB_PERMISSIONS.UPDATE);
}

/**
 * Check if user can delete jobs
 * @returns The authenticated session
 */
export async function requireCanDeleteJobs(): Promise<UserSession> {
  return requireJobPermission(JOB_PERMISSIONS.DELETE);
}

/**
 * Check if user can publish jobs
 * Requires ADMIN or HR role
 * @returns The authenticated session
 */
export async function requireCanPublishJobs(): Promise<UserSession> {
  return requireJobPermission(JOB_PERMISSIONS.PUBLISH);
}

/**
 * Check if user can unpublish jobs
 * Requires ADMIN or HR role
 * @returns The authenticated session
 */
export async function requireCanUnpublishJobs(): Promise<UserSession> {
  return requireJobPermission(JOB_PERMISSIONS.UNPUBLISH);
}

/**
 * Check if user can manage jobs (create, update, delete)
 * @returns The authenticated session
 */
export async function requireCanManageJobs(): Promise<UserSession> {
  const session = await requireAuth();

  const canManage =
    can(session.permissions, JOB_PERMISSIONS.CREATE) &&
    can(session.permissions, JOB_PERMISSIONS.UPDATE) &&
    can(session.permissions, JOB_PERMISSIONS.DELETE);

  if (!canManage) {
    throw new Error('Missing required permissions to manage jobs');
  }

  return session;
}

/**
 * Check if user can manage job publishing (publish/unpublish)
 * Requires ADMIN or HR role
 * @returns The authenticated session
 */
export async function requireCanManageJobPublishing(): Promise<UserSession> {
  const session = await requireAuth();

  const canManagePublishing =
    can(session.permissions, JOB_PERMISSIONS.PUBLISH) &&
    can(session.permissions, JOB_PERMISSIONS.UNPUBLISH);

  if (!canManagePublishing) {
    throw new Error('Missing required permissions to publish/unpublish jobs');
  }

  return session;
}
