# Frontend Integration Guide

## Overview

This guide shows how to integrate with the standardized API responses in the frontend React/Next.js application.

## Table of Contents

- [Fetcher Updates](#fetcher-updates)
- [Error Handling](#error-handling)
- [Error Message Mapping](#error-message-mapping)
- [UI Components](#ui-components)
- [TypeScript Types](#typescript-types)

---

## Fetcher Updates

### Update src/lib/api/fetcher.ts

**Current Issue:** Line 157-179 only checks for `message` field

**Fix:** Check for both `error` and `message` fields

```typescript
// src/lib/api/fetcher.ts (lines 144-191)

if (!response.ok) {
  let errorData: unknown;
  try {
    errorData = await response.json();
  } catch {
    errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
  }

  // Extract error message - check multiple fields
  let errorMessage: string;
  let errorCode: string | undefined;
  let errorDetails: Record<string, unknown> | undefined;

  if (typeof errorData === 'object' && errorData !== null) {
    // Priority: message > error > detail
    const data = errorData as any;

    if ('message' in data) {
      // Handle both string and array messages
      if (Array.isArray(data.message)) {
        errorMessage = data.message.join(', ');
        errorDetails = { message: data.message };
      } else {
        errorMessage = data.message;
      }
    } else if ('error' in data) {
      // Go backend returns {"error": "..."}
      errorMessage = data.error;
    } else if ('detail' in data) {
      errorMessage = data.detail;
    } else {
      errorMessage = `HTTP ${response.status}`;
    }

    // Extract error code
    errorCode = data.code;

    // Extract details if not already set
    if (!errorDetails && data.details) {
      errorDetails = data.details;
    }
  } else {
    errorMessage = `HTTP ${response.status}`;
  }

  // Map to user-friendly message if needed
  errorMessage = mapErrorMessage(errorMessage, response.status, errorCode);

  throw new ApiException(
    errorMessage,
    errorCode,
    errorDetails,
    response.status
  );
}
```

---

## Error Handling

### Error Message Mapping Utility

Create `src/lib/errors/messageMapper.ts`:

```typescript
/**
 * Maps technical error messages to user-friendly messages
 */
export function mapErrorMessage(
  message: string,
  statusCode: number,
  code?: string
): string {
  // If message is already user-friendly, return as-is
  if (isUserFriendly(message)) {
    return message;
  }

  // Map by error code first
  if (code) {
    const mappedByCode = mapByCode(code);
    if (mappedByCode) return mappedByCode;
  }

  // Map by status code
  return mapByStatusCode(statusCode, message);
}

/**
 * Check if message is already user-friendly
 */
function isUserFriendly(message: string): boolean {
  const lowerMsg = message.toLowerCase();

  // These indicate user-friendly messages
  const friendlyIndicators = [
    'please',
    'your',
    'you',
    'try again',
    'invalid email or password',
    'not found',
  ];

  return friendlyIndicators.some(indicator => lowerMsg.includes(indicator));
}

/**
 * Map error codes to user-friendly messages
 */
function mapByCode(code: string): string | null {
  const codeMap: Record<string, string> = {
    INVALID_CREDENTIALS: 'Invalid email or password',
    INVALID_TOKEN: 'Your session has expired. Please log in again.',
    UNAUTHORIZED: 'Authentication required. Please log in.',
    FORBIDDEN: "You don't have permission to perform this action.",
    RESOURCE_NOT_FOUND: 'The requested resource was not found.',
    JOB_NOT_FOUND: 'Job not found or no longer available.',
    USER_NOT_FOUND: 'User not found.',
    TENANT_NOT_FOUND: 'Tenant not found.',
    APPLICATION_NOT_FOUND: 'Application not found.',
    VALIDATION_ERROR: 'Validation failed. Please check the required fields.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    WEAK_PASSWORD: 'Password must be at least 8 characters and include uppercase, lowercase, and numbers.',
    EMAIL_ALREADY_EXISTS: 'This email is already registered. Please use a different email or try logging in.',
    DUPLICATE_RESOURCE: 'A resource with this identifier already exists.',
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
    NETWORK_ERROR: 'Unable to connect to the server. Please check your connection.',
    TIMEOUT: 'Request timed out. Please try again.',
    INTERNAL_ERROR: 'An unexpected error occurred. Our team has been notified.',
    SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again later.',
  };

  return codeMap[code] || null;
}

/**
 * Map HTTP status codes to user-friendly messages
 */
function mapByStatusCode(statusCode: number, fallback: string): string {
  const statusMap: Record<number, string> = {
    0: 'Unable to connect to the server. Please check your connection.',
    400: 'Invalid request. Please check your input and try again.',
    401: 'Authentication required. Please log in again.',
    403: "You don't have permission to perform this action.",
    404: 'The requested resource was not found.',
    408: 'Request timed out. Please try again.',
    409: 'Conflict with existing data. Please check for duplicates.',
    422: 'Validation failed. Please check the required fields.',
    429: 'Too many requests. Please try again later.',
    500: 'An unexpected error occurred. Our team has been notified.',
    502: 'Service temporarily unavailable. Please try again.',
    503: 'Service is temporarily unavailable. Please try again later.',
    504: 'Service timeout. Please try again.',
  };

  return statusMap[statusCode] || fallback || 'An error occurred. Please try again.';
}
```

### Update Fetcher to Use Message Mapper

```typescript
import { mapErrorMessage } from '../errors/messageMapper';

// In the error handling section:
errorMessage = mapErrorMessage(errorMessage, response.status, errorCode);
```

---

## UI Components

### Error Display Component

Create `src/components/common/ErrorMessage.tsx`:

```typescript
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ message, onRetry, className = '' }: ErrorMessageProps) {
  return (
    <div
      className={`rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-red-200">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-300 hover:text-red-100 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Usage in Login Page

Update `src/app/login/page.tsx`:

```typescript
import { ErrorMessage } from '@/components/common/ErrorMessage';

export default function LoginPage() {
  const { login, error } = useAuth();
  const [formError, setFormError] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    try {
      await login({ email, password, rememberMe, audience });
    } catch (err) {
      // Error is already mapped to user-friendly message
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... form fields ... */}

      {formError && (
        <ErrorMessage
          message={formError}
          onRetry={() => setFormError(null)}
        />
      )}

      {/* ... submit button ... */}
    </form>
  );
}
```

---

## TypeScript Types

### Standard Error Response Type

Create or update `src/lib/api/types.ts`:

```typescript
/**
 * Standard error response from all backend services
 */
export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error: string;
  code: string;
  details?: Record<string, unknown>;
  correlationId?: string;
}

/**
 * Error codes used across the platform
 */
export enum ErrorCode {
  // Authentication
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Authorization
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Resources
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  JOB_NOT_FOUND = 'JOB_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  TENANT_NOT_FOUND = 'TENANT_NOT_FOUND',
  APPLICATION_NOT_FOUND = 'APPLICATION_NOT_FOUND',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_EMAIL = 'INVALID_EMAIL',
  WEAK_PASSWORD = 'WEAK_PASSWORD',

  // Conflicts
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Network
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

/**
 * Type guard for API error responses
 */
export function isApiErrorResponse(obj: unknown): obj is ApiErrorResponse {
  if (typeof obj !== 'object' || obj === null) return false;

  const error = obj as Record<string, unknown>;

  return (
    typeof error.message === 'string' &&
    typeof error.statusCode === 'number' &&
    typeof error.error === 'string' &&
    typeof error.code === 'string'
  );
}
```

### Using Type Guards

```typescript
import { isApiErrorResponse, ErrorCode } from '@/lib/api/types';

async function handleApiCall() {
  try {
    await api.someOperation();
  } catch (error) {
    if (isApiErrorResponse(error)) {
      // TypeScript knows the shape now
      if (error.code === ErrorCode.INVALID_TOKEN) {
        // Redirect to login
        router.push('/login');
      } else if (error.code === ErrorCode.FORBIDDEN) {
        // Show permission denied message
        showToast(error.message);
      }
    }
  }
}
```

---

## Error Handling Patterns

### Pattern 1: Form Errors

```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

try {
  await createUser(data);
} catch (error) {
  if (error.code === 'VALIDATION_ERROR' && error.details?.errors) {
    // Map validation errors to form fields
    const fieldErrors: Record<string, string> = {};
    error.details.errors.forEach((err: any) => {
      fieldErrors[err.field] = err.constraint;
    });
    setErrors(fieldErrors);
  } else {
    setGeneralError(error.message);
  }
}
```

### Pattern 2: Global Error Handler

```typescript
// src/lib/errors/globalHandler.ts

export function handleGlobalError(error: unknown) {
  if (isApiErrorResponse(error)) {
    // Log for debugging
    if (error.correlationId) {
      console.error(`[Error ${error.code}]`, {
        message: error.message,
        correlationId: error.correlationId,
        details: error.details,
      });
    }

    // Handle specific errors globally
    switch (error.code) {
      case ErrorCode.INVALID_TOKEN:
      case ErrorCode.TOKEN_EXPIRED:
        // Redirect to login
        window.location.href = '/login';
        break;

      case ErrorCode.SERVICE_UNAVAILABLE:
        // Show maintenance page
        window.location.href = '/maintenance';
        break;

      default:
        // Show toast notification
        toast.error(error.message);
    }
  } else {
    // Unknown error
    console.error('Unknown error:', error);
    toast.error('An unexpected error occurred.');
  }
}
```

### Pattern 3: React Query Error Handling

```typescript
import { useQuery } from '@tanstack/react-query';

function JobsList() {
  const { data, error, isError } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (isApiErrorResponse(error)) {
        if ([ErrorCode.INVALID_TOKEN, ErrorCode.UNAUTHORIZED].includes(error.code)) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });

  if (isError && isApiErrorResponse(error)) {
    return <ErrorMessage message={error.message} />;
  }

  return <div>{/* render jobs */}</div>;
}
```

---

## Testing

### Testing Error Handling

```typescript
// src/lib/errors/__tests__/messageMapper.test.ts

import { mapErrorMessage } from '../messageMapper';

describe('mapErrorMessage', () => {
  it('should map error codes to user-friendly messages', () => {
    const result = mapErrorMessage('technical error', 401, 'INVALID_CREDENTIALS');
    expect(result).toBe('Invalid email or password');
  });

  it('should preserve user-friendly messages', () => {
    const userMessage = 'Please enter a valid email address';
    const result = mapErrorMessage(userMessage, 422, 'INVALID_EMAIL');
    expect(result).toBe(userMessage);
  });

  it('should map status codes when no code provided', () => {
    const result = mapErrorMessage('generic error', 404);
    expect(result).toBe('The requested resource was not found.');
  });

  it('should handle network errors', () => {
    const result = mapErrorMessage('fetch failed', 0, 'NETWORK_ERROR');
    expect(result).toBe('Unable to connect to the server. Please check your connection.');
  });
});
```

---

## Migration Checklist

- [ ] Update `src/lib/api/fetcher.ts` to check both `error` and `message` fields
- [ ] Create `src/lib/errors/messageMapper.ts` with error message mapping
- [ ] Create `src/lib/api/types.ts` with TypeScript types
- [ ] Update `src/components/common/ErrorMessage.tsx` component
- [ ] Update all pages/components using error handling
- [ ] Add tests for error message mapping
- [ ] Test with both backend services (Go and NestJS)

---

**Next Steps:**
- Implement the Fetcher updates
- Add error message mapping utility
- Update UI components to use new error handling
- Test with real backend responses
