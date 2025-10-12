'use server';

import { requireSuperadmin } from '@/lib/rbac/guard';
import { tenantService, TenantApiError } from '@/domain/tenants/service';
import type {
  CreateTenantRequest,
  CreateTenantResponse,
  TenantListResponse,
  TenantListParams,
  TenantStatusResponse,
  TenantDetail,
  UpdateTenantRequest,
  Subscription
} from '@/domain/tenants/schemas';

export type ActionResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      code?: string;
    };

/**
 * Format error for ActionResult
 * Extracts error message and code from various error types
 */
function formatError(error: unknown): { error: string; code?: string } {
  if (error instanceof TenantApiError) {
    return { error: error.message, code: error.code };
  }
  return { error: error instanceof Error ? error.message : String(error) };
}

/**
 * Server action to create a new tenant
 */
export async function createTenantAction(
  formData: CreateTenantRequest
): Promise<ActionResult<CreateTenantResponse>> {
  try {
    const session = await requireSuperadmin();
    const tenant = await tenantService.createTenant(session, session.token, formData);

    return {
      success: true,
      data: tenant
    };
  } catch (error) {
    console.error('Create tenant action failed:', error);
    return {
      success: false,
      ...formatError(error)
    };
  }
}

/**
 * Server action to list tenants
 */
export async function listTenantsAction(
  params: TenantListParams = { limit: 50 }
): Promise<ActionResult<TenantListResponse>> {
  try {
    console.log('🔄 Attempting to list tenants with params:', params);
    const session = await requireSuperadmin();
    const tenants = await tenantService.listTenants(session, session.token, params);

    console.log('✅ Successfully retrieved tenants:', { count: tenants.tenants?.length || 0 });
    return {
      success: true,
      data: tenants
    };
  } catch (error) {
    console.error('❌ List tenants action failed:', error);
    return {
      success: false,
      ...formatError(error)
    };
  }
}

/**
 * Server action to get tenant status
 */
export async function getTenantStatusAction(
  tenantId: string
): Promise<ActionResult<TenantStatusResponse>> {
  try {
    const session = await requireSuperadmin();
    const status = await tenantService.getTenantStatus(session, session.token, tenantId);

    return {
      success: true,
      data: status
    };
  } catch (error) {
    console.error('Get tenant status action failed:', error);
    return {
      success: false,
      ...formatError(error)
    };
  }
}

/**
 * Server action to get a single tenant
 */
export async function getTenantAction(
  tenantId: string
): Promise<ActionResult<TenantDetail>> {
  try {
    const session = await requireSuperadmin();
    const tenant = await tenantService.getTenant(session, session.token, tenantId);

    return {
      success: true,
      data: tenant
    };
  } catch (error) {
    console.error('Get tenant action failed:', error);
    return {
      success: false,
      ...formatError(error)
    };
  }
}

/**
 * Server action to update a tenant
 */
export async function updateTenantAction(
  tenantId: string,
  request: UpdateTenantRequest
): Promise<ActionResult<TenantDetail>> {
  try {
    const session = await requireSuperadmin();
    const tenant = await tenantService.updateTenant(session, session.token, tenantId, request);

    return {
      success: true,
      data: tenant
    };
  } catch (error) {
    console.error('Update tenant action failed:', error);
    return {
      success: false,
      ...formatError(error)
    };
  }
}

/**
 * Server action to delete a tenant
 */
export async function deleteTenantAction(
  tenantId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const session = await requireSuperadmin();
    const result = await tenantService.deleteTenant(session, session.token, tenantId);

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Delete tenant action failed:', error);
    return {
      success: false,
      ...formatError(error)
    };
  }
}

/**
 * Server action to retry tenant provisioning
 */
export async function retryTenantAction(
  tenantId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const session = await requireSuperadmin();
    const result = await tenantService.retryTenant(session, session.token, tenantId);

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Retry tenant action failed:', error);
    return {
      success: false,
      ...formatError(error)
    };
  }
}

// ==========================================================================
// Subscription Actions
// ==========================================================================

/**
 * Server action to get subscription details
 */
export async function getSubscriptionAction(
  tenantId: string
): Promise<ActionResult<Subscription>> {
  try {
    const session = await requireSuperadmin();
    const subscription = await tenantService.getSubscription(session, session.token, tenantId);

    return {
      success: true,
      data: subscription
    };
  } catch (error) {
    console.error('Get subscription action failed:', error);
    return {
      success: false,
      ...formatError(error)
    };
  }
}

/**
 * Server action to activate subscription
 */
export async function activateSubscriptionAction(
  tenantId: string
): Promise<ActionResult<Subscription>> {
  try {
    const session = await requireSuperadmin();
    const subscription = await tenantService.activateSubscription(session, session.token, tenantId);

    return {
      success: true,
      data: subscription
    };
  } catch (error) {
    console.error('Activate subscription action failed:', error);
    return {
      success: false,
      ...formatError(error)
    };
  }
}

/**
 * Server action to suspend subscription
 */
export async function suspendSubscriptionAction(
  tenantId: string
): Promise<ActionResult<Subscription>> {
  try {
    const session = await requireSuperadmin();
    const subscription = await tenantService.suspendSubscription(session, session.token, tenantId);

    return {
      success: true,
      data: subscription
    };
  } catch (error) {
    console.error('Suspend subscription action failed:', error);
    return {
      success: false,
      ...formatError(error)
    };
  }
}

/**
 * Server action to resume subscription
 */
export async function resumeSubscriptionAction(
  tenantId: string
): Promise<ActionResult<Subscription>> {
  try {
    const session = await requireSuperadmin();
    const subscription = await tenantService.resumeSubscription(session, session.token, tenantId);

    return {
      success: true,
      data: subscription
    };
  } catch (error) {
    console.error('Resume subscription action failed:', error);
    return {
      success: false,
      ...formatError(error)
    };
  }
}

/**
 * Server action to cancel subscription
 */
export async function cancelSubscriptionAction(
  tenantId: string
): Promise<ActionResult<Subscription>> {
  try {
    const session = await requireSuperadmin();
    const subscription = await tenantService.cancelSubscription(session, session.token, tenantId);

    return {
      success: true,
      data: subscription
    };
  } catch (error) {
    console.error('Cancel subscription action failed:', error);
    return {
      success: false,
      ...formatError(error)
    };
  }
}
