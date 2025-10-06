import { 
  createTenant as createTenantApi, 
  listTenants as listTenantsApi, 
  getTenantStatus as getTenantStatusApi,
  getTenant as getTenantApi,
  updateTenant as updateTenantApi,
  deleteTenant as deleteTenantApi,
  retryTenant as retryTenantApi,
  getSubscription as getSubscriptionApi,
  activateSubscription as activateSubscriptionApi,
  suspendSubscription as suspendSubscriptionApi,
  resumeSubscription as resumeSubscriptionApi,
  cancelSubscription as cancelSubscriptionApi,
  TenantApiError
} from '@/lib/api/tenantClient';
import { createUserError, formatUserErrorMessage, getErrorRedirectPath } from '@/lib/utils/errorHandling';
import {
  type CreateTenantRequest,
  type CreateTenantResponse,
  type TenantListResponse,
  type TenantListParams,
  type TenantStatusResponse,
  type TenantDetail,
  type UpdateTenantRequest,
  type Subscription
} from '@/lib/schemas/tenant';

export type ActionResult<T> = 
  | { success: true; data: T }
  | { 
      success: false; 
      error: string; 
      code?: string;
      userError?: {
        title: string;
        message: string;
        action?: string;
        type: 'network' | 'server' | 'validation' | 'auth' | 'notfound' | 'unknown';
      };
      redirectPath?: string;
    };

/**
 * Server action to create a new tenant
 */
export async function createTenantAction(
  formData: CreateTenantRequest
): Promise<ActionResult<CreateTenantResponse>> {
  try {
    const tenant = await createTenantApi(formData);
    
    return {
      success: true,
      data: tenant
    };
  } catch (error) {
    console.error('Create tenant action failed:', error);
    
    const userError = createUserError(error);
    const redirectPath = getErrorRedirectPath(error);
    
    return {
      success: false,
      error: formatUserErrorMessage(error),
      code: error instanceof TenantApiError ? error.code : undefined,
      userError,
      redirectPath: redirectPath || undefined
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
    const tenants = await listTenantsApi(params);

    console.log('✅ Successfully retrieved tenants:', { count: tenants.tenants?.length || 0 });
    return {
      success: true,
      data: tenants
    };
  } catch (error) {
    console.error('❌ List tenants action failed:', error);
    
    // Always use the backend error message
    if (error instanceof TenantApiError) {
      return {
        success: false,
        error: error.message,
        code: error.status.toString()
      };
    }
    
    // Return the actual error message from backend
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
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
    const status = await getTenantStatusApi(tenantId);
    
    return {
      success: true,
      data: status
    };
  } catch (error) {
    console.error('Get tenant status action failed:', error);
    
    if (error instanceof TenantApiError) {
      return {
        success: false,
        error: error.message,
        code: error.status.toString()
      };
    }
    
    // Return the actual error message from backend
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
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
    const tenant = await getTenantApi(tenantId);
    
    return {
      success: true,
      data: tenant
    };
  } catch (error) {
    console.error('Get tenant action failed:', error);
    
    const userError = createUserError(error);
    const redirectPath = getErrorRedirectPath(error);
    
    return {
      success: false,
      error: formatUserErrorMessage(error),
      code: error instanceof TenantApiError ? error.code : undefined,
      userError,
      redirectPath: redirectPath || undefined
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
    const tenant = await updateTenantApi(tenantId, request);
    
    return {
      success: true,
      data: tenant
    };
  } catch (error) {
    console.error('Update tenant action failed:', error);
    
    const userError = createUserError(error);
    const redirectPath = getErrorRedirectPath(error);
    
    return {
      success: false,
      error: formatUserErrorMessage(error),
      code: error instanceof TenantApiError ? error.code : undefined,
      userError,
      redirectPath: redirectPath || undefined
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
    const result = await deleteTenantApi(tenantId);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Delete tenant action failed:', error);
    
    const userError = createUserError(error);
    const redirectPath = getErrorRedirectPath(error);
    
    return {
      success: false,
      error: formatUserErrorMessage(error),
      code: error instanceof TenantApiError ? error.code : undefined,
      userError,
      redirectPath: redirectPath || undefined
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
    const result = await retryTenantApi(tenantId);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Retry tenant action failed:', error);
    
    const userError = createUserError(error);
    const redirectPath = getErrorRedirectPath(error);
    
    return {
      success: false,
      error: formatUserErrorMessage(error),
      code: error instanceof TenantApiError ? error.code : undefined,
      userError,
      redirectPath: redirectPath || undefined
    };
  }
}

// Subscription actions
/**
 * Server action to get subscription details
 */
export async function getSubscriptionAction(
  tenantId: string
): Promise<ActionResult<Subscription>> {
  try {
    const subscription = await getSubscriptionApi(tenantId);
    
    return {
      success: true,
      data: subscription
    };
  } catch (error) {
    console.error('Get subscription action failed:', error);
    
    const userError = createUserError(error);
    const redirectPath = getErrorRedirectPath(error);
    
    return {
      success: false,
      error: formatUserErrorMessage(error),
      code: error instanceof TenantApiError ? error.code : undefined,
      userError,
      redirectPath: redirectPath || undefined
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
    const subscription = await activateSubscriptionApi(tenantId);
    
    return {
      success: true,
      data: subscription
    };
  } catch (error) {
    console.error('Activate subscription action failed:', error);
    
    const userError = createUserError(error);
    const redirectPath = getErrorRedirectPath(error);
    
    return {
      success: false,
      error: formatUserErrorMessage(error),
      code: error instanceof TenantApiError ? error.code : undefined,
      userError,
      redirectPath: redirectPath || undefined
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
    const subscription = await suspendSubscriptionApi(tenantId);
    
    return {
      success: true,
      data: subscription
    };
  } catch (error) {
    console.error('Suspend subscription action failed:', error);
    
    const userError = createUserError(error);
    const redirectPath = getErrorRedirectPath(error);
    
    return {
      success: false,
      error: formatUserErrorMessage(error),
      code: error instanceof TenantApiError ? error.code : undefined,
      userError,
      redirectPath: redirectPath || undefined
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
    const subscription = await resumeSubscriptionApi(tenantId);
    
    return {
      success: true,
      data: subscription
    };
  } catch (error) {
    console.error('Resume subscription action failed:', error);
    
    const userError = createUserError(error);
    const redirectPath = getErrorRedirectPath(error);
    
    return {
      success: false,
      error: formatUserErrorMessage(error),
      code: error instanceof TenantApiError ? error.code : undefined,
      userError,
      redirectPath: redirectPath || undefined
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
    const subscription = await cancelSubscriptionApi(tenantId);
    
    return {
      success: true,
      data: subscription
    };
  } catch (error) {
    console.error('Cancel subscription action failed:', error);
    
    const userError = createUserError(error);
    const redirectPath = getErrorRedirectPath(error);
    
    return {
      success: false,
      error: formatUserErrorMessage(error),
      code: error instanceof TenantApiError ? error.code : undefined,
      userError,
      redirectPath: redirectPath || undefined
    };
  }
}