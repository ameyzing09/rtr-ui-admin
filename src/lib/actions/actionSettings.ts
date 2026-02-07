'use server';

import { actionSettingsService, ActionSettingsApiError } from '@/domain/tracking/actionSettings/service';
import { getSession } from '@/lib/rbac/guard.server';
import { can } from '@/lib/rbac/permissions';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import type { StageAction, RoleCapability } from '@/domain/tracking/actionSettings/schemas';

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
  if (error instanceof ActionSettingsApiError) {
    return {
      error: error.message,
      code: error.code,
    };
  }
  return { error: error instanceof Error ? error.message : String(error) };
}

// ============================================================================
// List Stage Actions
// ============================================================================

/**
 * List all stage actions for the tenant
 */
export async function listStageActionsAction(): Promise<ActionResult<StageAction[]>> {
  try {
    console.log('[listStageActionsAction] Fetching stage actions');

    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    if (!can(session.permissions, PERMISSIONS.SETTINGS_READ)) {
      return { success: false, error: 'Permission denied' };
    }

    const actions = await actionSettingsService.listActions(session.token);

    console.log('[listStageActionsAction] Successfully fetched stage actions:', actions.length);

    return { success: true, data: actions };
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('[listStageActionsAction] Failed:', error);
    return { success: false, ...formatError(error) };
  }
}

// ============================================================================
// List Role Capabilities
// ============================================================================

/**
 * List all role capabilities for the tenant
 */
export async function listRoleCapabilitiesAction(): Promise<ActionResult<RoleCapability[]>> {
  try {
    console.log('[listRoleCapabilitiesAction] Fetching role capabilities');

    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    if (!can(session.permissions, PERMISSIONS.SETTINGS_READ)) {
      return { success: false, error: 'Permission denied' };
    }

    const capabilities = await actionSettingsService.listCapabilities(session.token);

    console.log('[listRoleCapabilitiesAction] Successfully fetched capabilities:', capabilities.length);

    return { success: true, data: capabilities };
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('[listRoleCapabilitiesAction] Failed:', error);
    return { success: false, ...formatError(error) };
  }
}
