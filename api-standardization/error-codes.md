# Error Codes Catalog

## Overview

This document catalogs all standardized error codes used across the RTR platform. Each error code includes:
- Machine-readable code constant
- HTTP status code
- User-friendly message
- Usage context
- Example response

## Error Code Format

Error codes follow this pattern: `<CATEGORY>_<SPECIFIC_ERROR>`

Examples:
- `INVALID_CREDENTIALS`
- `RESOURCE_NOT_FOUND`
- `VALIDATION_ERROR`

## Authentication Errors (AUTH_*)

### INVALID_CREDENTIALS

**HTTP Status:** 401 Unauthorized
**User Message:** "Invalid email or password"
**Usage:** Login with wrong credentials
**Security Note:** Don't reveal whether email exists

```json
{
  "message": "Invalid email or password",
  "statusCode": 401,
  "error": "Unauthorized",
  "code": "INVALID_CREDENTIALS"
}
```

### INVALID_TOKEN

**HTTP Status:** 401 Unauthorized
**User Message:** "Your session has expired. Please log in again."
**Usage:** JWT token is invalid, expired, or malformed

```json
{
  "message": "Your session has expired. Please log in again.",
  "statusCode": 401,
  "error": "Unauthorized",
  "code": "INVALID_TOKEN"
}
```

### TOKEN_EXPIRED

**HTTP Status:** 401 Unauthorized
**User Message:** "Your session has expired. Please log in again."
**Usage:** JWT token is valid but expired

```json
{
  "message": "Your session has expired. Please log in again.",
  "statusCode": 401,
  "error": "Unauthorized",
  "code": "TOKEN_EXPIRED"
}
```

### UNAUTHORIZED

**HTTP Status:** 401 Unauthorized
**User Message:** "Authentication required. Please log in."
**Usage:** No authentication token provided

```json
{
  "message": "Authentication required. Please log in.",
  "statusCode": 401,
  "error": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

### PASSWORD_RESET_REQUIRED

**HTTP Status:** 403 Forbidden
**User Message:** "You must change your password before continuing."
**Usage:** User has ForcePasswordReset flag set

```json
{
  "message": "You must change your password before continuing.",
  "statusCode": 403,
  "error": "Forbidden",
  "code": "PASSWORD_RESET_REQUIRED",
  "details": {
    "redirectTo": "/change-password"
  }
}
```

## Authorization Errors (PERM_*)

### FORBIDDEN

**HTTP Status:** 403 Forbidden
**User Message:** "You don't have permission to perform this action."
**Usage:** User lacks required permission

```json
{
  "message": "You don't have permission to perform this action.",
  "statusCode": 403,
  "error": "Forbidden",
  "code": "FORBIDDEN"
}
```

### INSUFFICIENT_PERMISSIONS

**HTTP Status:** 403 Forbidden
**User Message:** "Insufficient permissions. This action requires <permission_name>."
**Usage:** Specific permission check failed

```json
{
  "message": "Insufficient permissions. This action requires admin access.",
  "statusCode": 403,
  "error": "Forbidden",
  "code": "INSUFFICIENT_PERMISSIONS",
  "details": {
    "required": "PERM_TENANT_DELETE",
    "userRole": "HR"
  }
}
```

## Resource Errors (RESOURCE_*)

### RESOURCE_NOT_FOUND

**HTTP Status:** 404 Not Found
**User Message:** "The requested resource was not found."
**Usage:** Generic resource not found

```json
{
  "message": "The requested resource was not found.",
  "statusCode": 404,
  "error": "Not Found",
  "code": "RESOURCE_NOT_FOUND"
}
```

### JOB_NOT_FOUND

**HTTP Status:** 404 Not Found
**User Message:** "Job not found or no longer available."
**Usage:** Specific to job resources

```json
{
  "message": "Job not found or no longer available.",
  "statusCode": 404,
  "error": "Not Found",
  "code": "JOB_NOT_FOUND",
  "details": {
    "jobId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### USER_NOT_FOUND

**HTTP Status:** 404 Not Found
**User Message:** "User not found."
**Usage:** User lookup failed

```json
{
  "message": "User not found.",
  "statusCode": 404,
  "error": "Not Found",
  "code": "USER_NOT_FOUND"
}
```

### TENANT_NOT_FOUND

**HTTP Status:** 404 Not Found
**User Message:** "Tenant not found."
**Usage:** Tenant lookup failed (often means missing X-Tenant-ID header)

```json
{
  "message": "Tenant not found.",
  "statusCode": 404,
  "error": "Not Found",
  "code": "TENANT_NOT_FOUND"
}
```

### APPLICATION_NOT_FOUND

**HTTP Status:** 404 Not Found
**User Message:** "Application not found."
**Usage:** Application resource not found

```json
{
  "message": "Application not found.",
  "statusCode": 404,
  "error": "Not Found",
  "code": "APPLICATION_NOT_FOUND"
}
```

## Validation Errors (VALIDATION_*)

### VALIDATION_ERROR

**HTTP Status:** 422 Unprocessable Entity
**User Message:** "Validation failed. Please check the required fields."
**Usage:** Generic validation failure

```json
{
  "message": "Validation failed. Please check the required fields.",
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "code": "VALIDATION_ERROR",
  "details": {
    "errors": [
      {"field": "email", "constraint": "Must be a valid email address"}
    ]
  }
}
```

### INVALID_EMAIL

**HTTP Status:** 422 Unprocessable Entity
**User Message:** "Please enter a valid email address."
**Usage:** Email format validation failed

```json
{
  "message": "Please enter a valid email address.",
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "code": "INVALID_EMAIL"
}
```

### WEAK_PASSWORD

**HTTP Status:** 422 Unprocessable Entity
**User Message:** "Password must be at least 8 characters and include uppercase, lowercase, and numbers."
**Usage:** Password doesn't meet requirements

```json
{
  "message": "Password must be at least 8 characters and include uppercase, lowercase, and numbers.",
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "code": "WEAK_PASSWORD"
}
```

### REQUIRED_FIELD_MISSING

**HTTP Status:** 422 Unprocessable Entity
**User Message:** "Required field is missing: <field_name>"
**Usage:** Required field not provided

```json
{
  "message": "Required field is missing: email",
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "code": "REQUIRED_FIELD_MISSING",
  "details": {
    "field": "email"
  }
}
```

## Conflict Errors (CONFLICT_*)

### DUPLICATE_RESOURCE

**HTTP Status:** 409 Conflict
**User Message:** "A resource with this identifier already exists."
**Usage:** Unique constraint violation

```json
{
  "message": "A resource with this identifier already exists.",
  "statusCode": 409,
  "error": "Conflict",
  "code": "DUPLICATE_RESOURCE"
}
```

### EMAIL_ALREADY_EXISTS

**HTTP Status:** 409 Conflict
**User Message:** "This email is already registered. Please use a different email or try logging in."
**Usage:** User registration with existing email

```json
{
  "message": "This email is already registered. Please use a different email or try logging in.",
  "statusCode": 409,
  "error": "Conflict",
  "code": "EMAIL_ALREADY_EXISTS"
}
```

### TENANT_ALREADY_EXISTS

**HTTP Status:** 409 Conflict
**User Message:** "A tenant with this domain already exists."
**Usage:** Tenant creation with duplicate domain

```json
{
  "message": "A tenant with this domain already exists.",
  "statusCode": 409,
  "error": "Conflict",
  "code": "TENANT_ALREADY_EXISTS",
  "details": {
    "domain": "example.com"
  }
}
```

## Rate Limiting Errors (RATE_*)

### RATE_LIMIT_EXCEEDED

**HTTP Status:** 429 Too Many Requests
**User Message:** "Too many requests. Please try again in <N> seconds."
**Usage:** User exceeded rate limit

```json
{
  "message": "Too many requests. Please try again in 60 seconds.",
  "statusCode": 429,
  "error": "Too Many Requests",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "retryAfter": 60,
    "limit": 100,
    "window": "1 minute"
  }
}
```

## Network Errors (NETWORK_*)

### NETWORK_ERROR

**HTTP Status:** 0 (No response)
**User Message:** "Unable to connect to the server. Please check your connection."
**Usage:** Network request failed (CORS, timeout, etc.)

```json
{
  "message": "Unable to connect to the server. Please check your connection.",
  "statusCode": 0,
  "error": "Network Error",
  "code": "NETWORK_ERROR"
}
```

### TIMEOUT

**HTTP Status:** 408 Request Timeout
**User Message:** "Request timed out. Please try again."
**Usage:** Request exceeded timeout threshold

```json
{
  "message": "Request timed out. Please try again.",
  "statusCode": 408,
  "error": "Request Timeout",
  "code": "TIMEOUT"
}
```

## Server Errors (SERVER_*)

### INTERNAL_ERROR

**HTTP Status:** 500 Internal Server Error
**User Message:** "An unexpected error occurred. Our team has been notified."
**Usage:** Unhandled server exception

```json
{
  "message": "An unexpected error occurred. Our team has been notified.",
  "statusCode": 500,
  "error": "Internal Server Error",
  "code": "INTERNAL_ERROR",
  "correlationId": "req-20251021-abc123"
}
```

### SERVICE_UNAVAILABLE

**HTTP Status:** 503 Service Unavailable
**User Message:** "Service is temporarily unavailable. Please try again later."
**Usage:** Service is down for maintenance

```json
{
  "message": "Service is temporarily unavailable. Please try again later.",
  "statusCode": 503,
  "error": "Service Unavailable",
  "code": "SERVICE_UNAVAILABLE"
}
```

### DATABASE_ERROR

**HTTP Status:** 500 Internal Server Error
**User Message:** "A database error occurred. Please try again."
**Usage:** Database operation failed
**Note:** Don't expose database details to users

```json
{
  "message": "A database error occurred. Please try again.",
  "statusCode": 500,
  "error": "Internal Server Error",
  "code": "DATABASE_ERROR",
  "correlationId": "req-20251021-xyz789"
}
```

## HTTP Status Code Quick Reference

| Status Code | Category | Common Codes |
|-------------|----------|--------------|
| 400 | Bad Request | VALIDATION_ERROR |
| 401 | Unauthorized | INVALID_CREDENTIALS, INVALID_TOKEN, UNAUTHORIZED |
| 403 | Forbidden | FORBIDDEN, INSUFFICIENT_PERMISSIONS |
| 404 | Not Found | RESOURCE_NOT_FOUND, JOB_NOT_FOUND, USER_NOT_FOUND |
| 409 | Conflict | DUPLICATE_RESOURCE, EMAIL_ALREADY_EXISTS |
| 422 | Unprocessable | VALIDATION_ERROR, INVALID_EMAIL, WEAK_PASSWORD |
| 429 | Too Many Requests | RATE_LIMIT_EXCEEDED |
| 500 | Internal Error | INTERNAL_ERROR, DATABASE_ERROR |
| 503 | Unavailable | SERVICE_UNAVAILABLE |

## Usage Guidelines

### When to Create New Error Codes

Create a new error code when:
1. The error requires different user messaging
2. Frontend needs to handle it differently (e.g., show different UI)
3. It represents a distinct business rule violation

### When to Reuse Existing Codes

Reuse existing codes when:
1. The user-facing message is similar
2. Frontend handling would be the same
3. It's the same category of error

### Error Message Best Practices

1. **Be Specific but Not Technical**
   - ✅ "Invalid email or password"
   - ❌ "User authentication failed: bcrypt hash mismatch"

2. **Provide Actionable Guidance**
   - ✅ "Email is already registered. Please use a different email or try logging in."
   - ❌ "Duplicate key violation"

3. **Don't Expose Security Information**
   - ✅ "Invalid email or password"
   - ❌ "User with this email does not exist"

4. **Use Friendly Language**
   - ✅ "Unable to connect to the server"
   - ❌ "Network request failed: ERR_CONNECTION_REFUSED"

---

**Next Steps:**
- Implement these codes in your backend service
- See [Backend Implementation Guide](./backend-implementation-guide.md) for code samples
- Check [Frontend Integration Guide](./frontend-integration.md) for error handling patterns
