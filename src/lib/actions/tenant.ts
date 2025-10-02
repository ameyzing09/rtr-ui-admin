import { 
  createTenant as createTenantApi, 
  listTenants as listTenantsApi, 
  getTenantStatus as getTenantStatusApi,
  TenantApiError
} from '@/lib/api/tenantClient';
import {
  type CreateTenantRequest,
  type CreateTenantResponse,
  type TenantListResponse,
  type TenantListParams,
  type TenantStatusResponse
} from '@/lib/schemas/tenant';

export type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

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