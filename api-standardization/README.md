# RTR Platform API Standardization

> **Version:** 1.0
> **Last Updated:** October 2025
> **Status:** Active

## Overview

This document defines the standardized API request/response format for all RTR platform backend services. Following this standard ensures consistency, better error handling, and improved developer experience across the entire platform.

## Affected Services

- **User-Auth Service** (Go, Port 8082) - Authentication, Tenants, Users
- **Job-Application Service** (NestJS, Port 8080) - Jobs, Applications, Public APIs

## Quick Reference

### Standard Error Response

```json
{
  "message": "User-friendly error message for display",
  "statusCode": 401,
  "error": "Unauthorized",
  "code": "INVALID_CREDENTIALS",
  "details": {}  // Optional, for validation errors
}
```

### Standard Success Response (With Data)

```json
{
  "Token": "eyJhbGc...",
  "ExpiresAt": "2025-10-21T10:00:00Z",
  "User": {
    "ID": "uuid",
    "Email": "user@example.com"
  }
}
```

### Standard Success Response (No Data)

```json
{
  "success": true,
  "message": "Operation completed successfully"
}
```

## Key Principles

1. **Always include `message` field** - User-friendly message suitable for direct display
2. **Include `statusCode`** - HTTP status code for consistency
3. **Include `error` field** - Error type/category
4. **Include `code` field** - Machine-readable error code for frontend logic
5. **Use consistent field naming** - PascalCase for data fields, camelCase for metadata

## Documentation Structure

- **[Response Format Specification](./response-format.md)** - Detailed format specs
- **[Error Codes Catalog](./error-codes.md)** - All error codes and messages
- **[Backend Implementation Guide](./backend-implementation-guide.md)** - Code samples for Go and NestJS
- **[Frontend Integration Guide](./frontend-integration.md)** - How to consume standardized APIs
- **[Migration Checklist](./migration-checklist.md)** - Step-by-step migration guide

## Examples

### Go Examples (User-Auth Service)
- [Go Error Handling Examples](./examples/go-examples.md)

### NestJS Examples (Job-Application Service)
- [NestJS Error Handling Examples](./examples/nestjs-examples.md)

## Current State

### User-Auth Service (Go)
**Status:** ⚠️ Needs Updates

**Current Error Format:**
```json
{"error": "invalid credentials"}
```

**Required Format:**
```json
{
  "message": "Invalid email or password",
  "statusCode": 401,
  "error": "Unauthorized",
  "code": "INVALID_CREDENTIALS"
}
```

### Job-Application Service (NestJS)
**Status:** ✅ Mostly Compliant

**Current Error Format:**
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

**Needs:** Add `code` field for consistency
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized",
  "code": "INVALID_TOKEN"
}
```

## Benefits

### For Backend Developers
- Clear guidelines for error handling
- Consistent patterns across services
- Reduced debugging time

### For Frontend Developers
- Single error handling pattern
- Better user experience with friendly messages
- Easier error categorization

### For Users
- Clear, actionable error messages
- Better understanding of what went wrong
- Reduced support requests

## Next Steps

1. ✅ Read this overview
2. 📖 Review [Response Format Specification](./response-format.md)
3. 📖 Check [Error Codes Catalog](./error-codes.md)
4. 🔧 Follow [Backend Implementation Guide](./backend-implementation-guide.md)
5. ✅ Complete [Migration Checklist](./migration-checklist.md)

## Support

For questions or clarifications:
- Review the detailed documentation in this directory
- Check the examples for your backend framework
- Refer to the migration checklist for step-by-step guidance

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Oct 2025 | Initial standardization specification |

---

**Remember:** Consistency is key. Following this standard improves the entire platform's reliability and user experience.
