// API Testing Utilities for User-Auth service (localhost:8082)

import { env } from '@/config/env';

export const API_ENDPOINTS = {
  // Authentication
  ADMIN_LOGIN: '/admin/login',
  TENANT_LOGIN: '/login',
  ADMIN_LOGOUT: '/admin/logout',
  TENANT_LOGOUT: '/logout',

  // Tenant Management
  TENANT_CREATE: '/tenant/create',
  TENANT_LIST: '/tenant/list',
  TENANT_STATUS: '/tenant/status',

  // Health Check
  HEALTH: '/health',
} as const;

// Use User-Auth service for testing
// Falls back to deprecated env vars for backward compatibility
export const BASE_URL = process.env.NEXT_PUBLIC_USER_AUTH_API_BASE_URL ||
                        process.env.USER_AUTH_API_BASE_URL ||
                        process.env.AUTH_API_BASE ||
                        env.NEXT_PUBLIC_API_BASE_URL ||
                        'http://localhost:8082';

/**
 * Test if the API server is reachable
 */
export async function testApiConnection(): Promise<{
  success: boolean;
  message: string;
  status?: number;
}> {
  try {
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.HEALTH}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return {
      success: response.ok,
      message: response.ok 
        ? 'API server is reachable' 
        : `API server returned ${response.status}`,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to connect to API server: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Test superadmin login with provided credentials
 */
export async function testSuperadminLogin(
  email: string = 'superadmin@recrutr.in',
  password: string = 'admin123'
): Promise<{
  success: boolean;
  message: string;
  data?: {
    Token: string;
    ExpiresAt: string;
    User: {
      ID: string;
      TenantID: string;
      Name: string;
      Email: string;
      Role: string;
      MustChangePassword: boolean;
    };
  };
  error?: string;
}> {
  try {
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.ADMIN_LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: 'Superadmin login successful',
        data,
      };
    } else {
      return {
        success: false,
        message: 'Superadmin login failed',
        error: data.message || `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Superadmin login failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test tenant list endpoint (requires authentication)
 */
export async function testTenantList(
  authToken: string,
  params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}
): Promise<{
  success: boolean;
  message: string;
  data?: {
    tenants: unknown[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}> {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.status) queryParams.set('status', params.status);
    if (params.search) queryParams.set('search', params.search);

    const endpoint = `${API_ENDPOINTS.TENANT_LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: 'Tenant list retrieved successfully',
        data,
      };
    } else {
      return {
        success: false,
        message: 'Failed to retrieve tenant list',
        error: data.message || `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to retrieve tenant list',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Complete API integration test sequence
 */
export async function runFullApiTest(): Promise<{
  overall: boolean;
  results: Array<{
    test: string;
    success: boolean;
    message: string;
    data?: unknown;
    error?: string;
  }>;
}> {
  const results = [];
  let overall = true;

  // Test 1: Connection
  console.log('🔍 Testing API connection...');
  const connectionTest = await testApiConnection();
  results.push({
    test: 'API Connection',
    success: connectionTest.success,
    message: connectionTest.message,
  });
  if (!connectionTest.success) overall = false;

  // Test 2: Superadmin Login
  console.log('🔐 Testing superadmin login...');
  const loginTest = await testSuperadminLogin();
  results.push({
    test: 'Superadmin Login',
    success: loginTest.success,
    message: loginTest.message,
    data: loginTest.data,
    error: loginTest.error,
  });
  if (!loginTest.success) overall = false;

  // Test 3: Tenant List (if login successful)
  if (loginTest.success && loginTest.data?.Token) {
    console.log('📋 Testing tenant list...');
    const tenantListTest = await testTenantList(loginTest.data.Token);
    results.push({
      test: 'Tenant List',
      success: tenantListTest.success,
      message: tenantListTest.message,
      data: tenantListTest.data,
      error: tenantListTest.error,
    });
    if (!tenantListTest.success) overall = false;
  } else {
    results.push({
      test: 'Tenant List',
      success: false,
      message: 'Skipped due to login failure',
    });
    overall = false;
  }

  return { overall, results };
}

/**
 * Development helper to log API configuration
 */
export function logApiConfiguration() {
  console.group('🔧 API Configuration');
  console.log('Base URL:', BASE_URL);
  console.log('Endpoints:', API_ENDPOINTS);
  console.log('Environment:', env.NODE_ENV);
  console.log('Debug mode:', env.NEXT_PUBLIC_DEBUG_MODE);
  console.log('Mock data:', env.NEXT_PUBLIC_USE_MOCK_DATA);
  console.groupEnd();
}

// Export configuration for external use
export const API_CONFIG = {
  BASE_URL,
  ENDPOINTS: API_ENDPOINTS,
  ENV: {
    NODE_ENV: env.NODE_ENV,
    DEBUG_MODE: env.NEXT_PUBLIC_DEBUG_MODE,
    USE_MOCK_DATA: env.NEXT_PUBLIC_USE_MOCK_DATA,
  },
} as const;