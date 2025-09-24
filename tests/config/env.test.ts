/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Environment Configuration Tests
 * 
 * Tests the environment variable validation and parsing
 */

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should load with default values', () => {
    // Clear environment variables
    delete process.env.NODE_ENV;
    delete process.env.NEXT_PUBLIC_APP_NAME;
    
    const { env } = require('@/config/env');
    
    expect(env.NODE_ENV).toBe('development');
    expect(env.NEXT_PUBLIC_APP_NAME).toBe('RTR Admin');
    expect(env.NEXT_PUBLIC_MAINTENANCE_MODE).toBe(false);
  });

  it('should parse boolean environment variables correctly', () => {
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE = 'true';
    process.env.NEXT_PUBLIC_MULTI_TENANT_MODE = 'true';
    
    const { env } = require('@/config/env');
    
    expect(env.NEXT_PUBLIC_MAINTENANCE_MODE).toBe(true);
    expect(env.NEXT_PUBLIC_MULTI_TENANT_MODE).toBe(true);
  });

  it('should validate URL format for API URLs', () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'not-a-url';
    
    // This should throw an error due to invalid URL format
    expect(() => {
      require('@/config/env');
    }).toThrow();
  });

  it('should provide helper functions', () => {
    process.env.NODE_ENV = 'development';
    
    const { isDevelopment, isProduction } = require('@/config/env');
    
    expect(isDevelopment).toBe(true);
    expect(isProduction).toBe(false);
  });
});

