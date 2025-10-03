import { env } from '@/config/env';
import { 
  createTenantRequestSchema, 
  createTenantResponseSchema,
  tenantListResponseSchema,
  tenantStatusResponseSchema,
  type CreateTenantRequest,
  type CreateTenantResponse,
  type TenantListResponse,
  type TenantStatusResponse,
  type TenantListParams
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

  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log(`Response status: ${response.status} for ${url}`);

  if (!response.ok) {
    let errorMessage: string;
    let errorCode: string | undefined;
    
    try {
      const errorData = await response.json();
      console.log('Error response data:', errorData);
      
      // Use backend error message - supports both formats
      // Tenant format: { "error": "message" }
      // Control-plane format: { "code": "ERR_CODE", "message": "message" }
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
        errorCode = errorData.code;
      } else {
        errorMessage = JSON.stringify(errorData);
      }
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || `HTTP ${response.status}`;
      console.log('Could not parse error response as JSON');
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

// Export error class for handling
export { TenantApiError };

// Export convenience client object
export const tenantClient = {
  createTenant,
  listTenants,
  getTenantStatus,
};
