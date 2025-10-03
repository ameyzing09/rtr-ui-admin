/**
 * Environment Configuration Tests
 * 
 * Tests the environment variable validation and parsing
 */

describe('Environment Configuration', () => {
  const originalEnv = { ...process.env };
  const envReplacements: Array<{ key: string; value: string | undefined }> = [];

  beforeEach(() => {
    // Clear any previous replacements
    envReplacements.forEach(({ key, value }) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
    envReplacements.length = 0;
  });

  afterEach(() => {
    // Restore original environment
    Object.keys(process.env).forEach(key => {
      if (!(key in originalEnv)) {
        delete process.env[key];
      }
    });
    Object.assign(process.env, originalEnv);
  });

  const mockEnvVar = (key: string, value: string | undefined) => {
    envReplacements.push({ key, value });
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  };

  it('should load with default values', async () => {
    // Clear environment variables to test defaults
    mockEnvVar('NODE_ENV', undefined);
    mockEnvVar('NEXT_PUBLIC_APP_NAME', undefined);
    mockEnvVar('NEXT_PUBLIC_MAINTENANCE_MODE', undefined);
    
    // Re-import the module to get fresh environment parsing
    jest.resetModules();
    const { env } = await import('@/config/env');
    
    expect(env.NODE_ENV).toBe('development');
    expect(env.NEXT_PUBLIC_APP_NAME).toBe('RTR Admin');
    expect(env.NEXT_PUBLIC_MAINTENANCE_MODE).toBe(false);
  });

  it('should parse boolean environment variables correctly', async () => {
    mockEnvVar('NEXT_PUBLIC_MAINTENANCE_MODE', 'true');
    mockEnvVar('NEXT_PUBLIC_MULTI_TENANT_MODE', 'true');
    
    jest.resetModules();
    const { env } = await import('@/config/env');
    
    expect(env.NEXT_PUBLIC_MAINTENANCE_MODE).toBe(true);
    expect(env.NEXT_PUBLIC_MULTI_TENANT_MODE).toBe(true);
  });

  it('should validate URL format for API URLs', async () => {
    mockEnvVar('NEXT_PUBLIC_API_BASE_URL', 'not-a-url');
    
    // This should throw an error due to invalid URL format
    await expect(async () => {
      jest.resetModules();
      await import('@/config/env');
    }).rejects.toThrow('Invalid environment variables');
  });

  it('should provide helper functions', async () => {
    mockEnvVar('NODE_ENV', 'development');
    mockEnvVar('NEXT_PUBLIC_API_BASE_URL', 'http://localhost:8082');
    
    jest.resetModules();
    const { isDevelopment, isProduction } = await import('@/config/env');
    
    expect(isDevelopment).toBe(true);
    expect(isProduction).toBe(false);
  });

  it('should handle production environment correctly', async () => {
    mockEnvVar('NODE_ENV', 'production');
    mockEnvVar('NEXT_PUBLIC_API_BASE_URL', 'https://api.example.com');
    
    jest.resetModules();
    const { isDevelopment, isProduction, isTest } = await import('@/config/env');
    
    expect(isDevelopment).toBe(false);
    expect(isProduction).toBe(true);
    expect(isTest).toBe(false);
  });

  it('should handle test environment correctly', async () => {
    mockEnvVar('NODE_ENV', 'test');
    mockEnvVar('NEXT_PUBLIC_API_BASE_URL', 'http://localhost:8082');
    
    jest.resetModules();
    const { isDevelopment, isProduction, isTest } = await import('@/config/env');
    
    expect(isDevelopment).toBe(false);
    expect(isProduction).toBe(false);
    expect(isTest).toBe(true);
  });

  it('should parse feature flags correctly', async () => {
    mockEnvVar('NEXT_PUBLIC_ENABLE_ANALYTICS', 'true');
    mockEnvVar('NEXT_PUBLIC_ENABLE_BILLING', 'false');
    mockEnvVar('NEXT_PUBLIC_DEBUG_MODE', 'true');
    mockEnvVar('NEXT_PUBLIC_API_BASE_URL', 'http://localhost:8082');
    
    jest.resetModules();
    const { env, isAnalyticsEnabled } = await import('@/config/env');
    
    expect(env.NEXT_PUBLIC_ENABLE_ANALYTICS).toBe(true);
    expect(env.NEXT_PUBLIC_ENABLE_BILLING).toBe(false);
    expect(env.NEXT_PUBLIC_DEBUG_MODE).toBe(true);
    expect(isAnalyticsEnabled).toBe(true);
  });

  it('should handle optional environment variables', async () => {
    mockEnvVar('NEXT_PUBLIC_APP_URL', undefined);
    mockEnvVar('AUTH_API_BASE', undefined);
    mockEnvVar('API_SECRET_KEY', undefined);
    mockEnvVar('NEXT_PUBLIC_API_BASE_URL', 'http://localhost:8082');
    
    jest.resetModules();
    const { env } = await import('@/config/env');
    
    expect(env.NEXT_PUBLIC_APP_URL).toBeUndefined();
    expect(env.AUTH_API_BASE).toBeUndefined();
    expect(env.API_SECRET_KEY).toBeUndefined();
  });
});

