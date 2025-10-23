# API Response Format Specification

## Table of Contents
- [Error Responses](#error-responses)
- [Success Responses](#success-responses)
- [Pagination](#pagination)
- [Validation Errors](#validation-errors)
- [Field Naming Conventions](#field-naming-conventions)

## Error Responses

### Standard Error Format

**ALL error responses** must include these fields:

```typescript
{
  message: string;      // REQUIRED: User-friendly error message
  statusCode: number;   // REQUIRED: HTTP status code
  error: string;        // REQUIRED: Error type/category
  code: string;         // REQUIRED: Machine-readable error code
  details?: object;     // OPTIONAL: Additional error context
  correlationId?: string; // OPTIONAL: Request tracking ID
}
```

### Example: Authentication Error

```json
{
  "message": "Invalid email or password",
  "statusCode": 401,
  "error": "Unauthorized",
  "code": "INVALID_CREDENTIALS"
}
```

### Example: Not Found Error

```json
{
  "message": "The requested resource was not found",
  "statusCode": 404,
  "error": "Not Found",
  "code": "RESOURCE_NOT_FOUND",
  "details": {
    "resource": "Job",
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Example: Server Error

```json
{
  "message": "An unexpected error occurred. Our team has been notified.",
  "statusCode": 500,
  "error": "Internal Server Error",
  "code": "INTERNAL_ERROR",
  "correlationId": "req-abc123-xyz789"
}
```

### Example: Network/Timeout Error

```json
{
  "message": "Unable to connect to the server. Please check your connection.",
  "statusCode": 0,
  "error": "Network Error",
  "code": "NETWORK_ERROR"
}
```

## Success Responses

### Success with Data Return

For endpoints that return data, use the natural data structure:

```json
{
  "Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "ExpiresAt": "2025-10-21T10:00:00Z",
  "User": {
    "ID": "550e8400-e29b-41d4-a716-446655440000",
    "Email": "user@example.com",
    "Name": "John Doe",
    "Role": "ADMIN"
  }
}
```

### Success with List/Array

```json
{
  "jobs": [
    {
      "id": "job-123",
      "title": "Senior Developer",
      "department": "Engineering"
    }
  ],
  "total": 1
}
```

### Success without Data (Operations)

For operations that don't return data (e.g., DELETE):

```json
{
  "success": true,
  "message": "Resource deleted successfully"
}
```

Or with additional info:

```json
{
  "success": true,
  "message": "Job deleted successfully",
  "cascade_info": {
    "applications_deleted": 5,
    "interviews_cancelled": 2
  }
}
```

## Pagination

### Paginated List Response

```json
{
  "data": [
    { "id": "1", "name": "Item 1" },
    { "id": "2", "name": "Item 2" }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Alternative Pagination Format

```json
{
  "tenants": [
    { "id": "tnt-1", "name": "Tenant 1" },
    { "id": "tnt-2", "name": "Tenant 2" }
  ],
  "total": 2,
  "page": 1,
  "pageSize": 10
}
```

## Validation Errors

### Single Field Validation Error

```json
{
  "message": "Validation failed. Please check the required fields.",
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "email",
    "constraint": "Must be a valid email address"
  }
}
```

### Multiple Field Validation Errors

```json
{
  "message": "Validation failed on multiple fields",
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "code": "VALIDATION_ERROR",
  "details": {
    "errors": [
      {
        "field": "email",
        "constraint": "Must be a valid email address",
        "value": "invalid-email"
      },
      {
        "field": "password",
        "constraint": "Must be at least 8 characters",
        "value": null
      }
    ]
  }
}
```

### NestJS Validation Error Format

NestJS may return validation errors as an array in the `message` field:

```json
{
  "message": [
    "email must be a valid email",
    "password must be at least 8 characters"
  ],
  "statusCode": 400,
  "error": "Bad Request"
}
```

**Frontend handling:** Join array messages with commas or display as list.

## Field Naming Conventions

### Response Data Fields

Use **PascalCase** for entity/data fields returned from backend:

```json
{
  "Token": "...",
  "User": {
    "ID": "...",
    "Email": "...",
    "TenantID": "...",
    "ForcePasswordReset": false
  }
}
```

**Rationale:** Matches backend Go struct naming and database conventions.

### Metadata Fields

Use **camelCase** for metadata/envelope fields:

```json
{
  "message": "Error message",
  "statusCode": 400,
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "details": {}
}
```

**Rationale:** Follows JavaScript/TypeScript conventions for framework-level fields.

### Array/List Fields

Use **camelCase** with plural form:

```json
{
  "jobs": [...],
  "tenants": [...],
  "users": [...]
}
```

## HTTP Status Codes

### 2xx Success

- **200 OK** - Successful GET, PUT, PATCH
- **201 Created** - Successful POST creating a resource
- **204 No Content** - Successful DELETE (no response body)

### 4xx Client Errors

- **400 Bad Request** - Invalid request format
- **401 Unauthorized** - Authentication required or invalid token
- **403 Forbidden** - Authenticated but lacks permission
- **404 Not Found** - Resource doesn't exist
- **409 Conflict** - Duplicate resource or constraint violation
- **422 Unprocessable Entity** - Validation failed
- **429 Too Many Requests** - Rate limit exceeded

### 5xx Server Errors

- **500 Internal Server Error** - Unexpected server error
- **502 Bad Gateway** - Upstream service error
- **503 Service Unavailable** - Service temporarily unavailable
- **504 Gateway Timeout** - Upstream service timeout

## Special Cases

### Empty Results

For list endpoints with no results:

```json
{
  "jobs": [],
  "total": 0
}
```

NOT:
```json
{
  "jobs": null
}
```

### Null vs Undefined

- Use `null` for explicitly empty optional fields
- Omit fields that don't apply (don't include with `undefined`)

### Dates and Times

- Use ISO 8601 format: `2025-10-21T10:00:00Z`
- Always include timezone (UTC preferred)

## Anti-Patterns to Avoid

### ❌ Inconsistent Error Format

```json
// DON'T DO THIS
{"error": "something went wrong"}
```

### ❌ Missing Status Code in Error

```json
// DON'T DO THIS
{"message": "Error occurred"}
```

### ❌ Non-Descriptive Messages

```json
// DON'T DO THIS
{"message": "Error", "statusCode": 500}
```

### ❌ Exposing Internal Details

```json
// DON'T DO THIS
{
  "message": "Database query failed: SELECT * FROM users WHERE id = 'abc'",
  "stack": "Error at line 123..."
}
```

## Best Practices

### ✅ User-Friendly Messages

```json
{
  "message": "Invalid email or password",
  "statusCode": 401
}
```

NOT:
```json
{
  "message": "User authentication failed: invalid credentials provided",
  "statusCode": 401
}
```

### ✅ Actionable Error Messages

```json
{
  "message": "Email is already registered. Please use a different email or try logging in.",
  "code": "EMAIL_ALREADY_EXISTS"
}
```

### ✅ Consistent Casing

Use the same casing for the same type of data across all endpoints.

### ✅ Include Correlation IDs

For debugging and support:

```json
{
  "message": "An error occurred",
  "correlationId": "req-20251021-abc123"
}
```

---

**Next Steps:**
- Review [Error Codes Catalog](./error-codes.md) for all standard error codes
- Check [Backend Implementation Guide](./backend-implementation-guide.md) for code samples
- See [Frontend Integration Guide](./frontend-integration.md) for consumption patterns
