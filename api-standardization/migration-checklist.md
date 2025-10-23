# API Standardization Migration Checklist

## Overview

This checklist provides step-by-step instructions for migrating both backend services and the frontend to use the standardized API response format.

---

## Phase 1: Backend - User-Auth Service (Go)

### Prerequisites
- [ ] Review [Response Format Specification](./response-format.md)
- [ ] Review [Error Codes Catalog](./error-codes.md)
- [ ] Review [Go Examples](./examples/go-examples.md)

### Step 1: Create Error Response Structures

- [ ] Create `domain/errors.go`
  - [ ] Define `ErrorResponse` struct
  - [ ] Define `ErrorCode` type
  - [ ] Define all error code constants
  - [ ] Create `NewErrorResponse()` helper
  - [ ] Create `NewErrorResponseWithDetails()` helper

### Step 2: Create Common Error Response Helpers

- [ ] Add `ErrInvalidCredentialsResponse()` function
- [ ] Add `ErrInvalidTokenResponse()` function
- [ ] Add `ErrUnauthorizedResponse()` function
- [ ] Add `ErrForbiddenResponse()` function
- [ ] Add `ErrTenantNotFoundResponse()` function
- [ ] Add `ErrUserNotFoundResponse()` function
- [ ] Add `ErrEmailExistsResponse()` function
- [ ] Add `ErrValidationResponse()` function
- [ ] Add `ErrInternalServerError()` function

### Step 3: Update Authentication Handlers

- [ ] Update `handlers/auth.go`
  - [ ] Update `Login()` endpoint to use standardized errors
  - [ ] Update `AdminLogin()` endpoint
  - [ ] Update `Logout()` endpoint
  - [ ] Replace all `gin.H{"error": "..."}` with error response helpers

### Step 4: Update User Handlers

- [ ] Update `handlers/user.go`
  - [ ] Update `GetUser()` endpoint
  - [ ] Update `CreateUser()` endpoint
  - [ ] Update `ListUsers()` endpoint
  - [ ] Handle validation errors properly
  - [ ] Handle duplicate email errors

### Step 5: Update Tenant Handlers

- [ ] Update `handlers/tenant.go`
  - [ ] Update `CreateTenant()` endpoint
  - [ ] Update `GetTenant()` endpoint
  - [ ] Update `ListTenants()` endpoint
  - [ ] Update `DeleteTenant()` endpoint

### Step 6: Update Middleware

- [ ] Update `middleware/auth.go`
  - [ ] Update `AuthMiddleware()` to use standardized errors
  - [ ] Replace all `gin.H{"error": "..."}` responses
- [ ] Create `middleware/recovery.go`
  - [ ] Add `ErrorRecoveryMiddleware()`
  - [ ] Generate correlation IDs for panics
  - [ ] Log errors with correlation IDs

### Step 7: Update Main Application

- [ ] Update `main.go`
  - [ ] Register `ErrorRecoveryMiddleware` globally
  - [ ] Ensure all routes use updated handlers

### Step 8: Testing

- [ ] Write tests for error responses
  - [ ] Test `Login` with invalid credentials
  - [ ] Test `Login` with missing tenant ID
  - [ ] Test authenticated endpoints with invalid token
  - [ ] Test validation errors
  - [ ] Test not found errors
- [ ] Run all existing tests
- [ ] Test with frontend application

### Step 9: Deployment

- [ ] Review all changes
- [ ] Create feature branch
- [ ] Commit changes with descriptive message
- [ ] Create pull request
- [ ] Deploy to development environment
- [ ] Verify with frontend

**Completion Criteria:**
- ✅ All error responses include `message`, `statusCode`, `error`, and `code` fields
- ✅ Error messages are user-friendly
- ✅ All tests pass
- ✅ Frontend can consume responses without errors

---

## Phase 2: Backend - Job-Application Service (NestJS)

### Prerequisites
- [ ] Review [Response Format Specification](./response-format.md)
- [ ] Review [Error Codes Catalog](./error-codes.md)
- [ ] Review [NestJS Examples](./examples/nestjs-examples.md)

### Step 1: Create Exception Filter

- [ ] Create `src/common/filters/http-exception.filter.ts`
  - [ ] Define `ErrorResponse` interface
  - [ ] Implement `@Catch(HttpException)` decorator
  - [ ] Extract message from exception
  - [ ] Extract or generate error code
  - [ ] Handle array messages (validation errors)
  - [ ] Generate correlation IDs for 500 errors
  - [ ] Add error logging

### Step 2: Create Custom Exceptions

- [ ] Create `src/common/exceptions/custom.exceptions.ts`
  - [ ] Create `CustomHttpException` base class
  - [ ] Create authentication exceptions:
    - [ ] `InvalidCredentialsException`
    - [ ] `InvalidTokenException`
    - [ ] `UnauthorizedException`
  - [ ] Create authorization exceptions:
    - [ ] `ForbiddenException`
    - [ ] `InsufficientPermissionsException`
  - [ ] Create resource exceptions:
    - [ ] `ResourceNotFoundException`
    - [ ] `JobNotFoundException`
    - [ ] `ApplicationNotFoundException`
  - [ ] Create validation exceptions:
    - [ ] `ValidationException`
    - [ ] `InvalidEmailException`
    - [ ] `WeakPasswordException`
  - [ ] Create conflict exceptions:
    - [ ] `DuplicateResourceException`
    - [ ] `EmailAlreadyExistsException`
  - [ ] Create server exceptions:
    - [ ] `InternalServerErrorException`
    - [ ] `ServiceUnavailableException`

### Step 3: Register Global Filter

- [ ] Update `src/main.ts`
  - [ ] Import `HttpExceptionFilter`
  - [ ] Register with `app.useGlobalFilters()`

### Step 4: Update Services

- [ ] Update `src/auth/auth.service.ts`
  - [ ] Replace generic exceptions with custom ones
  - [ ] Use `InvalidCredentialsException` for auth failures
  - [ ] Use `InvalidTokenException` for token errors

- [ ] Update `src/jobs/jobs.service.ts`
  - [ ] Use `JobNotFoundException` for not found errors
  - [ ] Use `ValidationException` for validation errors
  - [ ] Use custom exceptions throughout

- [ ] Update `src/applications/applications.service.ts`
  - [ ] Use `ApplicationNotFoundException`
  - [ ] Use appropriate custom exceptions

### Step 5: Update Guards

- [ ] Update `src/auth/guards/jwt.guard.ts`
  - [ ] Use `UnauthorizedException` custom exception
  - [ ] Handle auth failures with standardized errors

### Step 6: Update Controllers (Optional)

Most controllers won't need changes as services throw the exceptions,
but verify error handling is consistent:

- [ ] Review `src/auth/auth.controller.ts`
- [ ] Review `src/jobs/jobs.controller.ts`
- [ ] Review `src/applications/applications.controller.ts`

### Step 7: Testing

- [ ] Write tests for exception filter
  - [ ] Test error code generation
  - [ ] Test message extraction
  - [ ] Test correlation ID generation
- [ ] Update e2e tests
  - [ ] Test authentication errors
  - [ ] Test authorization errors
  - [ ] Test not found errors
  - [ ] Test validation errors
- [ ] Run all existing tests
- [ ] Test with frontend application

### Step 8: Deployment

- [ ] Review all changes
- [ ] Create feature branch
- [ ] Commit changes with descriptive message
- [ ] Create pull request
- [ ] Deploy to development environment
- [ ] Verify with frontend

**Completion Criteria:**
- ✅ All error responses include `message`, `statusCode`, `error`, and `code` fields
- ✅ Error messages are user-friendly
- ✅ All tests pass
- ✅ Frontend can consume responses without errors

---

## Phase 3: Frontend Integration

### Prerequisites
- [ ] Ensure both backend services are updated
- [ ] Review [Frontend Integration Guide](./frontend-integration.md)
- [ ] Review [Response Format Specification](./response-format.md)

### Step 1: Create Error Message Mapper

- [ ] Create `src/lib/errors/messageMapper.ts`
  - [ ] Implement `mapErrorMessage()` function
  - [ ] Implement `isUserFriendly()` function
  - [ ] Implement `mapByCode()` function
  - [ ] Implement `mapByStatusCode()` function
  - [ ] Add all error code mappings from catalog

### Step 2: Create TypeScript Types

- [ ] Create or update `src/lib/api/types.ts`
  - [ ] Define `ApiErrorResponse` interface
  - [ ] Define `ErrorCode` enum
  - [ ] Create `isApiErrorResponse()` type guard

### Step 3: Update Fetcher

- [ ] Update `src/lib/api/fetcher.ts`
  - [ ] Import `mapErrorMessage` from messageMapper
  - [ ] Update error extraction logic (lines 157-179)
  - [ ] Check for both `error` and `message` fields
  - [ ] Handle array messages (NestJS validation)
  - [ ] Extract `code` field
  - [ ] Extract `details` field
  - [ ] Call `mapErrorMessage()` to get user-friendly message
  - [ ] Update `ApiException` to include all fields

### Step 4: Create Error Display Component

- [ ] Create `src/components/common/ErrorMessage.tsx`
  - [ ] Accept `message`, `onRetry`, `className` props
  - [ ] Display error icon
  - [ ] Display error message
  - [ ] Optional retry button
  - [ ] Proper styling with Tailwind

### Step 5: Update Login Page

- [ ] Update `src/app/login/page.tsx`
  - [ ] Import `ErrorMessage` component
  - [ ] Update error handling in `handleSubmit()`
  - [ ] Use `ErrorMessage` component to display errors
  - [ ] Remove generic "HTTP 401" error display
  - [ ] Test with wrong credentials
  - [ ] Test with network errors

### Step 6: Update Auth Provider

- [ ] Update `src/components/auth/AuthProvider.tsx`
  - [ ] Ensure errors are properly propagated
  - [ ] Don't override user-friendly messages
  - [ ] Remove any error message overrides

### Step 7: Create Global Error Handler (Optional)

- [ ] Create `src/lib/errors/globalHandler.ts`
  - [ ] Implement `handleGlobalError()` function
  - [ ] Handle auth errors (redirect to login)
  - [ ] Handle permission errors
  - [ ] Handle maintenance mode
  - [ ] Log errors with correlation IDs

### Step 8: Update Other Components

- [ ] Update all forms to use `ErrorMessage` component
- [ ] Update all API calls to handle standardized errors
- [ ] Update React Query error handling if used
- [ ] Update error boundaries if used

### Step 9: Testing

- [ ] Test error display with various error codes
  - [ ] Test `INVALID_CREDENTIALS`
  - [ ] Test `INVALID_TOKEN`
  - [ ] Test `VALIDATION_ERROR`
  - [ ] Test `FORBIDDEN`
  - [ ] Test `RESOURCE_NOT_FOUND`
  - [ ] Test `NETWORK_ERROR`
- [ ] Test with both backend services
  - [ ] Test with User-Auth service (Go)
  - [ ] Test with Job-Application service (NestJS)
- [ ] Verify user-friendly messages are displayed
- [ ] Verify no "HTTP 401" messages appear

### Step 10: Deployment

- [ ] Review all changes
- [ ] Create feature branch
- [ ] Commit changes with descriptive message
- [ ] Create pull request
- [ ] Deploy to development environment
- [ ] Verify error handling works end-to-end

**Completion Criteria:**
- ✅ All errors show user-friendly messages
- ✅ No "HTTP 401" or technical errors displayed to users
- ✅ Error codes work correctly for both Go and NestJS backends
- ✅ Error messages can be mapped to user-friendly text
- ✅ All tests pass

---

## Phase 4: Documentation and Cleanup

### Documentation

- [ ] Update API documentation
  - [ ] Document standard error response format
  - [ ] Document all error codes
  - [ ] Provide examples
- [ ] Update README files
  - [ ] Backend service READMEs
  - [ ] Frontend README
- [ ] Create migration notes
  - [ ] Breaking changes (if any)
  - [ ] Migration guide for other developers

### Code Cleanup

- [ ] Remove deprecated error handling code
- [ ] Remove any remaining `gin.H{"error": "..."}` in Go
- [ ] Remove generic exception throws in NestJS
- [ ] Update comments and documentation
- [ ] Run linters and formatters
- [ ] Remove unused imports

### Testing

- [ ] Run full test suite on all services
- [ ] Manual testing of critical paths
- [ ] Cross-browser testing (frontend)
- [ ] Performance testing (ensure no regressions)

### Final Review

- [ ] Code review by team members
- [ ] Security review of error messages
  - [ ] Ensure no sensitive data exposed
  - [ ] Verify security-safe error messages
- [ ] UX review of error messages
  - [ ] Ensure messages are clear
  - [ ] Ensure messages are actionable

---

## Rollback Plan

If issues are encountered during migration:

### Immediate Rollback (Critical Issues)

1. Revert backend changes to previous version
2. Revert frontend changes to previous version
3. Redeploy stable versions
4. Document issues encountered
5. Fix issues in development environment
6. Retry migration

### Partial Rollback (Minor Issues)

1. Keep standardization in place
2. Fix specific issues
3. Deploy hotfix
4. Continue with migration

---

## Success Metrics

After migration is complete, verify:

- ✅ **User Experience**
  - Users see friendly, actionable error messages
  - No technical jargon or stack traces visible
  - Error messages guide users to solutions

- ✅ **Developer Experience**
  - Consistent error handling across all services
  - Easy to add new error types
  - Clear error codes for debugging
  - Good test coverage

- ✅ **Technical Quality**
  - All tests passing
  - No regressions in functionality
  - Error handling is comprehensive
  - Logs include correlation IDs

- ✅ **Documentation**
  - API documentation updated
  - Error codes documented
  - Examples provided
  - Team trained on new patterns

---

## Timeline Estimate

| Phase | Estimated Time | Priority |
|-------|---------------|----------|
| Phase 1: User-Auth Service (Go) | 2-3 days | High |
| Phase 2: Job-Application Service (NestJS) | 2-3 days | High |
| Phase 3: Frontend Integration | 2-3 days | High |
| Phase 4: Documentation & Cleanup | 1-2 days | Medium |
| **Total** | **7-11 days** | |

**Note:** Timeline assumes 1 developer working on migration. Can be parallelized with multiple developers.

---

## Support

For questions or issues during migration:

1. Review the [Backend Implementation Guide](./backend-implementation-guide.md)
2. Check the [Frontend Integration Guide](./frontend-integration.md)
3. Refer to complete examples in `examples/` directory
4. Consult the [Error Codes Catalog](./error-codes.md)

---

**Ready to start?** Begin with Phase 1 (Backend - User-Auth Service)!
