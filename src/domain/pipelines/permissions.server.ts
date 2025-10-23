'use server';

/**
 * Server-Only Pipeline Permissions
 *
 * This file contains server-side pipeline permission checks that require authentication.
 * It should only be imported in server components and server actions.
 *
 * For client-side permission checking, use permissions.ts instead.
 */

import { requireAuth } from '@/lib/rbac/guard.server';
import { can } from '@/lib/rbac/permissions';
import type { Permission } from '@/lib/rbac/permissions';
import type { UserSession } from '@/lib/rbac/guard';
import { PIPELINE_PERMISSIONS } from './permissions';

/**
 * Require user to have a specific pipeline permission
 * Throws UnauthorizedError if user doesn't have permission
 *
 * @param permission - The required pipeline permission
 * @returns The authenticated session
 */
export async function requirePipelinePermission(permission: Permission): Promise<UserSession> {
  const session = await requireAuth();

  if (!can(session.permissions, permission)) {
    throw new Error(`Missing required permission: ${permission}`);
  }

  return session;
}

/**
 * Check if user can list pipelines
 * @returns The authenticated session
 */
export async function requireCanListPipelines(): Promise<UserSession> {
  return requirePipelinePermission(PIPELINE_PERMISSIONS.LIST);
}

/**
 * Check if user can create pipelines
 * Requires ADMIN or HR role
 * @returns The authenticated session
 */
export async function requireCanCreatePipelines(): Promise<UserSession> {
  return requirePipelinePermission(PIPELINE_PERMISSIONS.CREATE);
}

/**
 * Check if user can read pipeline details
 * @returns The authenticated session
 */
export async function requireCanReadPipelines(): Promise<UserSession> {
  return requirePipelinePermission(PIPELINE_PERMISSIONS.READ);
}

/**
 * Check if user can update pipelines
 * @returns The authenticated session
 */
export async function requireCanUpdatePipelines(): Promise<UserSession> {
  return requirePipelinePermission(PIPELINE_PERMISSIONS.UPDATE);
}

/**
 * Check if user can delete pipelines
 * @returns The authenticated session
 */
export async function requireCanDeletePipelines(): Promise<UserSession> {
  return requirePipelinePermission(PIPELINE_PERMISSIONS.DELETE);
}

/**
 * Check if user can assign pipelines to jobs
 * Requires ADMIN or HR role
 * @returns The authenticated session
 */
export async function requireCanAssignPipelines(): Promise<UserSession> {
  return requirePipelinePermission(PIPELINE_PERMISSIONS.ASSIGN);
}

/**
 * Check if user can manage pipelines (create, update, delete)
 * @returns The authenticated session
 */
export async function requireCanManagePipelines(): Promise<UserSession> {
  const session = await requireAuth();

  const canManage =
    can(session.permissions, PIPELINE_PERMISSIONS.CREATE) &&
    can(session.permissions, PIPELINE_PERMISSIONS.UPDATE) &&
    can(session.permissions, PIPELINE_PERMISSIONS.DELETE);

  if (!canManage) {
    throw new Error('Missing required permissions to manage pipelines');
  }

  return session;
}
