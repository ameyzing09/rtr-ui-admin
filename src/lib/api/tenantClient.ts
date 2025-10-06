import { env } from '@/config/env';
import { 
  createTenantRequestSchema, 
  createTenantResponseSchema,
  tenantListResponseSchema,
  tenantStatusResponseSchema,
  tenantDetailSchema,
  updateTenantRequestSchema,
  subscriptionSchema,
  type CreateTenantRequest,
  type CreateTenantResponse,
  type TenantListResponse,
  type TenantStatusResponse,
  type TenantListParams,
  type TenantDetail,
  type UpdateTenantRequest,
  type Subscription
} from '@/lib/schemas/tenant';

const API_BASE_URL = env.NEXT_PUBLIC_API_BASE_URL;

class TenantApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'TenantApiError';
  }
}

// Helper to generate UUID for idempotency key with fallback for older environments
function generateIdempotencyKey(): string {
  // Check if crypto.randomUUID is available (modern browsers and Node.js 14.17.0+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback implementation for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper to get auth token from localStorage or session
function getAuthToken(): string | null {
  console.log('In getAuthToken()');
  if (typeof window !== 'undefined') {
    // Try localStorage first (for persistent sessions)
    console.log('In localStorage check');
    const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
    if (token) {
      console.log('🔑 Found auth token in localStorage');
      return token;
    }
    
    // Try sessionStorage as fallback
    const sessionToken = sessionStorage.getItem('auth_token') || sessionStorage.getItem('authToken');
    if (sessionToken) {
      console.log('🔑 Found auth token in sessionStorage');
      return sessionToken;
    }
    
    console.warn('⚠️ No auth token found. User may need to log in.');
  }
  return null;
}

// Type guard for Zod-like schema objects
interface SafeParseResult<T> {
  success: boolean;
  data?: T;
  error?: unknown;
}

interface SchemaWithSafeParse {
  safeParse(data: unknown): SafeParseResult<unknown>;
}

// Type guard function to check if an object has a safeParse method
function hasValidSafeParse(schema: unknown): schema is SchemaWithSafeParse {
  return (
    typeof schema === 'object' &&
    schema !== null &&
    'safeParse' in schema &&
    typeof (schema as Record<string, unknown>).safeParse === 'function'
  );
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  schema?: SchemaWithSafeParse
): Promise<T> {
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  const token = getAuthToken();

  console.log(`Making API request to: ${url}`);
  console.log(`Using API base URL: ${API_BASE_URL}`);
  console.log(`Auth token present: ${!!token}`);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
    console.log(`Response status: ${response.status} for ${url}`);
  } catch (error) {
    console.error(`Network error for ${url}:`, error);
    
    // Handle network connectivity issues
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new TenantApiError(
        'Unable to connect to the server. Please check your internet connection and try again.',
        0, // Status 0 indicates network error
        'NETWORK_ERROR'
      );
    }
    
    // Handle other fetch-related errors
    throw new TenantApiError(
      error instanceof Error ? error.message : 'Network request failed',
      0,
      'FETCH_ERROR'
    );
  }

  if (!response.ok) {
    let errorMessage: string;
    let errorCode: string | undefined;
    
    try {
      const errorData = await response.json();
      console.log('Error response data:', errorData);
      
      // Use backend error message - supports multiple formats
      // Tenant format: { "error": "message" }
      // Control-plane format: { "code": "ERR_CODE", "message": "message" }
      // Standard format: { "message": "message", "details": {...} }
      if (errorData.error) {
        errorMessage = errorData.error;
        errorCode = errorData.code;
      } else if (errorData.message) {
        errorMessage = errorData.message;
        errorCode = errorData.code || errorData.error_code;
      } else if (errorData.detail) {
        // Django REST framework format
        errorMessage = errorData.detail;
      } else {
        errorMessage = JSON.stringify(errorData);
      }
    } catch (parseError) {
      // If response is not JSON, create appropriate error message
      console.log('Could not parse error response as JSON:', parseError);
      
      // Provide user-friendly messages for common HTTP status codes
      switch (response.status) {
        case 400:
          errorMessage = 'Invalid request. Please check your input and try again.';
          break;
        case 401:
          errorMessage = 'Authentication required. Please log in again.';
          errorCode = 'UNAUTHORIZED';
          break;
        case 403:
          errorMessage = 'Access denied. You don\'t have permission for this action.';
          errorCode = 'FORBIDDEN';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          errorCode = 'NOT_FOUND';
          break;
        case 409:
          errorMessage = 'Conflict with existing data. Please check for duplicates.';
          errorCode = 'CONFLICT';
          break;
        case 422:
          errorMessage = 'Validation failed. Please check the required fields.';
          errorCode = 'VALIDATION_ERROR';
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait a moment and try again.';
          errorCode = 'RATE_LIMIT';
          break;
        case 500:
          errorMessage = 'Internal server error. Our team has been notified.';
          errorCode = 'SERVER_ERROR';
          break;
        case 502:
        case 503:
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          errorCode = 'SERVICE_UNAVAILABLE';
          break;
        case 504:
          errorMessage = 'Request timeout. The server took too long to respond.';
          errorCode = 'TIMEOUT';
          break;
        default:
          errorMessage = response.statusText || `HTTP ${response.status} error`;
      }
    }
    
    console.error(`❌ API Error [${response.status}]:`, errorMessage);
    throw new TenantApiError(errorMessage, response.status, errorCode);
  }

  const data = await response.json();
  console.log('Raw API response data:', data);
  
  if (schema && hasValidSafeParse(schema)) {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      console.error('API response validation failed:', parsed.error);
      console.error('Raw data:', data);
      // Let the error bubble up with validation details instead of generic message
      const errorDetails = JSON.stringify(parsed.error);
      throw new TenantApiError(`Response validation failed: ${errorDetails}`, 500);
    }
    return parsed.data as T;
  }

  return data;
}

export async function createTenant(
  request: CreateTenantRequest
): Promise<CreateTenantResponse> {
  // Validate request data
  const validatedRequest = createTenantRequestSchema.parse(request);
  
  // According to API docs: POST /tenant/create with Idempotency-Key header
  return apiRequest<CreateTenantResponse>(
    '/tenant/create',
    {
      method: 'POST',
      body: JSON.stringify(validatedRequest),
      headers: {
        'Idempotency-Key': generateIdempotencyKey(),
      },
    },
    createTenantResponseSchema
  );
}



export async function listTenants(
  params?: TenantListParams
): Promise<TenantListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.limit) {
    searchParams.set('limit', params.limit.toString());
  }
  if (params?.status) {
    searchParams.set('status', params.status);
  }
  if (params?.plan) {
    searchParams.set('plan', params.plan);
  }
  if (params?.search) {
    searchParams.set('search', params.search);
  }

  const queryString = searchParams.toString();
  
  // According to API docs: GET /admin/tenants (control-plane route)
  const endpoint = `/admin/tenants${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest<TenantListResponse>(
    endpoint,
    { method: 'GET' },
    tenantListResponseSchema
  );
}



export async function getTenantStatus(
  tenantId: string
): Promise<TenantStatusResponse> {
  // According to API docs: GET /tenant/:id/status
  return await apiRequest<TenantStatusResponse>(
    `/tenant/${encodeURIComponent(tenantId)}/status`,
    { method: 'GET' },
    tenantStatusResponseSchema
  );
}

export async function getTenant(
  tenantId: string
): Promise<TenantDetail> {
  // According to API docs: GET /admin/tenant/:id
  return await apiRequest<TenantDetail>(
    `/admin/tenant/${encodeURIComponent(tenantId)}`,
    { method: 'GET' },
    tenantDetailSchema
  );
}

export async function updateTenant(
  tenantId: string,
  request: UpdateTenantRequest
): Promise<TenantDetail> {
  // Validate request data
  const validatedRequest = updateTenantRequestSchema.parse(request);
  
  // According to API docs: PUT /admin/tenant/:id with Idempotency-Key header
  return apiRequest<TenantDetail>(
    `/admin/tenant/${encodeURIComponent(tenantId)}`,
    {
      method: 'PUT',
      body: JSON.stringify(validatedRequest),
      headers: {
        'Idempotency-Key': generateIdempotencyKey(),
      },
    },
    tenantDetailSchema
  );
}

export async function deleteTenant(
  tenantId: string
): Promise<{ success: boolean }> {
  // According to API docs: DELETE /admin/tenant/:id
  return await apiRequest<{ success: boolean }>(
    `/admin/tenant/${encodeURIComponent(tenantId)}`,
    { method: 'DELETE' }
  );
}

export async function retryTenant(
  tenantId: string
): Promise<{ success: boolean }> {
  // According to API docs: POST /tenant/:id/retry
  return await apiRequest<{ success: boolean }>(
    `/tenant/${encodeURIComponent(tenantId)}/retry`,
    { method: 'POST' }
  );
}

// Subscription management functions
export async function getSubscription(
  tenantId: string
): Promise<Subscription> {
  // According to API docs: GET /admin/tenant/:id/subscription
  return await apiRequest<Subscription>(
    `/admin/tenant/${encodeURIComponent(tenantId)}/subscription`,
    { method: 'GET' },
    subscriptionSchema
  );
}

export async function activateSubscription(
  tenantId: string
): Promise<Subscription> {
  // According to API docs: POST /admin/tenant/:id/subscription/activate
  return await apiRequest<Subscription>(
    `/admin/tenant/${encodeURIComponent(tenantId)}/subscription/activate`,
    { method: 'POST' },
    subscriptionSchema
  );
}

export async function suspendSubscription(
  tenantId: string
): Promise<Subscription> {
  // According to API docs: POST /admin/tenant/:id/subscription/suspend
  return await apiRequest<Subscription>(
    `/admin/tenant/${encodeURIComponent(tenantId)}/subscription/suspend`,
    { method: 'POST' },
    subscriptionSchema
  );
}

export async function resumeSubscription(
  tenantId: string
): Promise<Subscription> {
  // According to API docs: POST /admin/tenant/:id/subscription/resume
  return await apiRequest<Subscription>(
    `/admin/tenant/${encodeURIComponent(tenantId)}/subscription/resume`,
    { method: 'POST' },
    subscriptionSchema
  );
}

export async function cancelSubscription(
  tenantId: string
): Promise<Subscription> {
  // According to API docs: POST /admin/tenant/:id/subscription/cancel
  return await apiRequest<Subscription>(
    `/admin/tenant/${encodeURIComponent(tenantId)}/subscription/cancel`,
    { method: 'POST' },
    subscriptionSchema
  );
}

// Export error class for handling
export { TenantApiError };

// Export convenience client object
export const tenantClient = {
  createTenant,
  listTenants,
  getTenantStatus,
  getTenant,
  updateTenant,
  deleteTenant,
  retryTenant,
  getSubscription,
  activateSubscription,
  suspendSubscription,
  resumeSubscription,
  cancelSubscription,
};
