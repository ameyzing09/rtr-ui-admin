'use server';

import { revalidatePath } from 'next/cache';
import { tenantStatusService, TenantStatusApiError } from '@/domain/tracking/statusSettings/service';
import { getSession } from '@/lib/rbac/guard.server';
import { can } from '@/lib/rbac/permissions';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import type {
  TenantStatus,
  CreateTenantStatusRequest,
  UpdateTenantStatusRequest,
} from '@/domain/tracking/statusSettings/schemas';

/**
 * Generic action result type
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      code?: string;
    };

/**
 * Format error for ActionResult
 */
function formatError(error: unknown): { error: string; code?: string } {
  if (error instanceof TenantStatusApiError) {
    return {
      error: error.message,
      code: error.code,
    };
  }
  return { error: error instanceof Error ? error.message : String(error) };
}

/**
 * Check if user has admin permission for modifying statuses
 */
function isAdmin(permissions: string[]): boolean {
  return can(permissions as never[], PERMISSIONS.SETTINGS_UPDATE);
}

// ============================================================================
// List Statuses
// ============================================================================

/**
 * List all tenant statuses
 * Accessible by any authenticated user
 */
export async function listTenantStatusesAction(): Promise<ActionResult<TenantStatus[]>> {
  try {
    console.log('[listTenantStatusesAction] Fetching statuses');

    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    // Check for settings read permission
    if (!can(session.permissions, PERMISSIONS.SETTINGS_READ)) {
      return { success: false, error: 'Permission denied' };
    }

    const statuses = await tenantStatusService.listStatuses(session.token);

    console.log('[listTenantStatusesAction] Successfully fetched statuses:', statuses.length);

    return { success: true, data: statuses };
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('[listTenantStatusesAction] Failed:', error);
    return { success: false, ...formatError(error) };
  }
}

// ============================================================================
// Create Status
// ============================================================================

/**
 * Create a new tenant status
 * Admin only
 */
export async function createTenantStatusAction(
  data: CreateTenantStatusRequest
): Promise<ActionResult<TenantStatus>> {
  try {
    console.log('[createTenantStatusAction] Creating status:', data);

    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    // Check for admin permission
    if (!isAdmin(session.permissions)) {
      return { success: false, error: 'Admin permission required to create statuses' };
    }

    const status = await tenantStatusService.createStatus(session.token, data);

    // Revalidate settings page
    revalidatePath('/dashboard/settings/statuses');

    console.log('[createTenantStatusAction] Successfully created status');

    return { success: true, data: status };
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('[createTenantStatusAction] Failed:', error);
    return { success: false, ...formatError(error) };
  }
}

// ============================================================================
// Update Status
// ============================================================================

/**
 * Update an existing tenant status
 * Admin only
 */
export async function updateTenantStatusAction(
  statusId: string,
  data: UpdateTenantStatusRequest
): Promise<ActionResult<TenantStatus>> {
  try {
    console.log('[updateTenantStatusAction] Updating status:', { statusId, data });

    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    // Check for admin permission
    if (!isAdmin(session.permissions)) {
      return { success: false, error: 'Admin permission required to update statuses' };
    }

    const status = await tenantStatusService.updateStatus(session.token, statusId, data);

    // Revalidate settings page
    revalidatePath('/dashboard/settings/statuses');

    console.log('[updateTenantStatusAction] Successfully updated status');

    return { success: true, data: status };
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('[updateTenantStatusAction] Failed:', error);
    return { success: false, ...formatError(error) };
  }
}

// ============================================================================
// Delete Status
// ============================================================================

/**
 * Delete a tenant status
 * Admin only
 */
export async function deleteTenantStatusAction(
  statusId: string
): Promise<ActionResult<void>> {
  try {
    console.log('[deleteTenantStatusAction] Deleting status:', statusId);

    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    // Check for admin permission
    if (!isAdmin(session.permissions)) {
      return { success: false, error: 'Admin permission required to delete statuses' };
    }

    await tenantStatusService.deleteStatus(session.token, statusId);

    // Revalidate settings page
    revalidatePath('/dashboard/settings/statuses');

    console.log('[deleteTenantStatusAction] Successfully deleted status');

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('[deleteTenantStatusAction] Failed:', error);
    return { success: false, ...formatError(error) };
  }
}
