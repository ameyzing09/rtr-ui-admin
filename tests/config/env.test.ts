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
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should load with default values', () => {
    // Mock process.env with empty values
    const mockEnv = {};
    jest.doMock('process', () => ({
      env: mockEnv,
    }));
    
    jest.resetModules();
    const { env } = require('@/config/env');
    
    expect(env.NODE_ENV).toBe('development');
    expect(env.NEXT_PUBLIC_APP_NAME).toBe('RTR Admin');
    expect(env.NEXT_PUBLIC_MAINTENANCE_MODE).toBe(false);
  });

  it('should parse boolean environment variables correctly', () => {
    // Mock process.env with boolean environment variables
    const mockEnv = {
      NEXT_PUBLIC_MAINTENANCE_MODE: 'true',
      NEXT_PUBLIC_MULTI_TENANT_MODE: 'true',
    };
    jest.doMock('process', () => ({
      env: mockEnv,
    }));
    
    jest.resetModules();
    const { env } = require('@/config/env');
    
    expect(env.NEXT_PUBLIC_MAINTENANCE_MODE).toBe(true);
    expect(env.NEXT_PUBLIC_MULTI_TENANT_MODE).toBe(true);
  });

  it('should validate URL format for API URLs', () => {
    // Mock process.env with invalid URL
    const mockEnv = {
      NEXT_PUBLIC_API_BASE_URL: 'not-a-url',
    };
    jest.doMock('process', () => ({
      env: mockEnv,
    }));
    
    // This should throw an error due to invalid URL format
    expect(() => {
      jest.resetModules();
      require('@/config/env');
    }).toThrow();
  });

  it('should provide helper functions', () => {
    // Mock process.env with development environment
    const mockEnv = { NODE_ENV: 'development' };
    jest.doMock('process', () => ({
      env: mockEnv,
    }));
    
    jest.resetModules();
    const { isDevelopment, isProduction } = require('@/config/env');
    
    expect(isDevelopment).toBe(true);
    expect(isProduction).toBe(false);
  });
});

