# Backend Implementation Guide

## Overview

This guide provides practical implementation examples for both backend services to follow the standardized API response format.

## Table of Contents

- [Go Implementation (User-Auth Service)](#go-implementation-user-auth-service)
- [NestJS Implementation (Job-Application Service)](#nestjs-implementation-job-application-service)
- [Common Patterns](#common-patterns)
- [Testing](#testing)

---

## Go Implementation (User-Auth Service)

### Current State

**Current Error Response:**
```go
c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
```

**Required Format:**
```go
c.JSON(http.StatusUnauthorized, ErrorResponse{
    Message:    "Invalid email or password",
    StatusCode: 401,
    Error:      "Unauthorized",
    Code:       "INVALID_CREDENTIALS",
})
```

### Step 1: Create Error Response Struct

Create a file `domain/errors.go`:

```go
package domain

// ErrorResponse represents a standardized error response
type ErrorResponse struct {
    Message      string                 `json:"message"`
    StatusCode   int                    `json:"statusCode"`
    Error        string                 `json:"error"`
    Code         string                 `json:"code"`
    Details      map[string]interface{} `json:"details,omitempty"`
    CorrelationID string                `json:"correlationId,omitempty"`
}

// ErrorCode represents standard error codes
type ErrorCode string

const (
    ErrInvalidCredentials     ErrorCode = "INVALID_CREDENTIALS"
    ErrInvalidToken          ErrorCode = "INVALID_TOKEN"
    ErrUnauthorized          ErrorCode = "UNAUTHORIZED"
    ErrForbidden             ErrorCode = "FORBIDDEN"
    ErrResourceNotFound      ErrorCode = "RESOURCE_NOT_FOUND"
    ErrUserNotFound          ErrorCode = "USER_NOT_FOUND"
    ErrTenantNotFound        ErrorCode = "TENANT_NOT_FOUND"
    ErrValidationError       ErrorCode = "VALIDATION_ERROR"
    ErrEmailAlreadyExists    ErrorCode = "EMAIL_ALREADY_EXISTS"
    ErrInternalError         ErrorCode = "INTERNAL_ERROR"
)

// NewErrorResponse creates a standardized error response
func NewErrorResponse(statusCode int, errorType string, code ErrorCode, message string) ErrorResponse {
    return ErrorResponse{
        Message:    message,
        StatusCode: statusCode,
        Error:      errorType,
        Code:       string(code),
    }
}

// NewErrorResponseWithDetails creates an error response with additional details
func NewErrorResponseWithDetails(statusCode int, errorType string, code ErrorCode, message string, details map[string]interface{}) ErrorResponse {
    return ErrorResponse{
        Message:    message,
        StatusCode: statusCode,
        Error:      errorType,
        Code:       string(code),
        Details:    details,
    }
}
```

### Step 2: Create Helper Functions

Add to `domain/errors.go`:

```go
// Common error responses
func ErrInvalidCredentialsResponse() ErrorResponse {
    return NewErrorResponse(
        401,
        "Unauthorized",
        ErrInvalidCredentials,
        "Invalid email or password",
    )
}

func ErrInvalidTokenResponse() ErrorResponse {
    return NewErrorResponse(
        401,
        "Unauthorized",
        ErrInvalidToken,
        "Your session has expired. Please log in again.",
    )
}

func ErrTenantNotFoundResponse() ErrorResponse {
    return NewErrorResponse(
        404,
        "Not Found",
        ErrTenantNotFound,
        "Tenant not found",
    )
}

func ErrUserNotFoundResponse() ErrorResponse {
    return NewErrorResponse(
        404,
        "Not Found",
        ErrUserNotFound,
        "User not found",
    )
}

func ErrEmailExistsResponse(email string) ErrorResponse {
    return NewErrorResponseWithDetails(
        409,
        "Conflict",
        ErrEmailAlreadyExists,
        "This email is already registered. Please use a different email or try logging in.",
        map[string]interface{}{"email": email},
    )
}

func ErrInternalServerError(correlationID string) ErrorResponse {
    return ErrorResponse{
        Message:       "An unexpected error occurred. Our team has been notified.",
        StatusCode:    500,
        Error:         "Internal Server Error",
        Code:          string(ErrInternalError),
        CorrelationID: correlationID,
    }
}
```

### Step 3: Update Handler Functions

**Before:**
```go
func (h *AuthHandler) Login(c *gin.Context) {
    var req LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
        return
    }

    user, err := h.authService.ValidateCredentials(req.Email, req.Password)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
        return
    }

    // ... rest of login logic
}
```

**After:**
```go
func (h *AuthHandler) Login(c *gin.Context) {
    var req LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, domain.NewErrorResponse(
            400,
            "Bad Request",
            domain.ErrValidationError,
            "Invalid request format",
        ))
        return
    }

    user, err := h.authService.ValidateCredentials(req.Email, req.Password)
    if err != nil {
        c.JSON(http.StatusUnauthorized, domain.ErrInvalidCredentialsResponse())
        return
    }

    // ... rest of login logic
}
```

### Step 4: Update Middleware

**Before:**
```go
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if token == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
            c.Abort()
            return
        }

        claims, err := ValidateToken(token)
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }

        c.Set("user", claims)
        c.Next()
    }
}
```

**After:**
```go
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if token == "" {
            c.JSON(http.StatusUnauthorized, domain.NewErrorResponse(
                401,
                "Unauthorized",
                domain.ErrUnauthorized,
                "Authentication required. Please log in.",
            ))
            c.Abort()
            return
        }

        claims, err := ValidateToken(token)
        if err != nil {
            c.JSON(http.StatusUnauthorized, domain.ErrInvalidTokenResponse())
            c.Abort()
            return
        }

        c.Set("user", claims)
        c.Next()
    }
}
```

### Step 5: Global Error Handler

Add middleware for catching panics:

```go
func ErrorRecoveryMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        defer func() {
            if err := recover(); err != nil {
                correlationID := uuid.New().String()

                // Log the error with correlation ID
                log.Printf("[ERROR] Panic recovered: %v, CorrelationID: %s", err, correlationID)

                c.JSON(http.StatusInternalServerError, domain.ErrInternalServerError(correlationID))
            }
        }()
        c.Next()
    }
}
```

### Complete Example: User-Auth Service

See [examples/go-examples.md](./examples/go-examples.md) for complete working examples.

---

## NestJS Implementation (Job-Application Service)

### Current State

NestJS already returns a good format:

```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

**Only need to add:** `code` field

### Step 1: Create Exception Filter

Create `src/common/filters/http-exception.filter.ts`:

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

export interface ErrorResponse {
  message: string;
  statusCode: number;
  error: string;
  code: string;
  details?: any;
  correlationId?: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extract message and error from exception
    const message = typeof exceptionResponse === 'string'
      ? exceptionResponse
      : (exceptionResponse as any).message || exception.message;

    const error = typeof exceptionResponse === 'string'
      ? HttpStatus[status]
      : (exceptionResponse as any).error || HttpStatus[status];

    // Determine error code
    const code = this.getErrorCode(status, message);

    const errorResponse: ErrorResponse = {
      message: Array.isArray(message) ? message.join(', ') : message,
      statusCode: status,
      error,
      code,
    };

    // Add details if present
    if (typeof exceptionResponse === 'object' && (exceptionResponse as any).details) {
      errorResponse.details = (exceptionResponse as any).details;
    }

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number, message: string | string[]): string {
    const msg = Array.isArray(message) ? message[0] : message;
    const lowerMsg = msg.toLowerCase();

    // Map common patterns to error codes
    if (status === 401) {
      if (lowerMsg.includes('token')) return 'INVALID_TOKEN';
      if (lowerMsg.includes('credentials') || lowerMsg.includes('password')) {
        return 'INVALID_CREDENTIALS';
      }
      return 'UNAUTHORIZED';
    }

    if (status === 403) return 'FORBIDDEN';
    if (status === 404) return 'RESOURCE_NOT_FOUND';
    if (status === 409) return 'DUPLICATE_RESOURCE';
    if (status === 422) return 'VALIDATION_ERROR';
    if (status === 429) return 'RATE_LIMIT_EXCEEDED';
    if (status >= 500) return 'INTERNAL_ERROR';

    return 'UNKNOWN_ERROR';
  }
}
```

### Step 2: Register Filter Globally

Update `src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Register global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(8080);
}
bootstrap();
```

### Step 3: Create Custom Exceptions

Create `src/common/exceptions/`:

```typescript
// src/common/exceptions/custom.exceptions.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(
    message: string,
    status: number,
    code: string,
    details?: any
  ) {
    super(
      {
        message,
        error: HttpStatus[status],
        code,
        details,
      },
      status
    );
  }
}

export class InvalidCredentialsException extends CustomHttpException {
  constructor() {
    super(
      'Invalid email or password',
      HttpStatus.UNAUTHORIZED,
      'INVALID_CREDENTIALS'
    );
  }
}

export class ResourceNotFoundException extends CustomHttpException {
  constructor(resource: string, id?: string) {
    super(
      `${resource} not found`,
      HttpStatus.NOT_FOUND,
      `${resource.toUpperCase()}_NOT_FOUND`,
      id ? { id } : undefined
    );
  }
}

export class EmailAlreadyExistsException extends CustomHttpException {
  constructor(email: string) {
    super(
      'This email is already registered. Please use a different email or try logging in.',
      HttpStatus.CONFLICT,
      'EMAIL_ALREADY_EXISTS',
      { email }
    );
  }
}
```

### Step 4: Use Custom Exceptions

```typescript
// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { InvalidCredentialsException } from '../common/exceptions/custom.exceptions';

@Injectable()
export class AuthService {
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new InvalidCredentialsException();
    }

    return user;
  }
}
```

### Complete Example: Job-Application Service

See [examples/nestjs-examples.md](./examples/nestjs-examples.md) for complete working examples.

---

## Common Patterns

### Pattern 1: Not Found Errors

**Go:**
```go
func (h *JobHandler) GetJob(c *gin.Context) {
    id := c.Param("id")
    job, err := h.jobService.FindByID(id)

    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            c.JSON(http.StatusNotFound, domain.NewErrorResponse(
                404,
                "Not Found",
                domain.ErrResourceNotFound,
                "Job not found or no longer available",
            ))
            return
        }
        // Handle other errors
    }

    c.JSON(http.StatusOK, job)
}
```

**NestJS:**
```typescript
async getJob(id: string) {
  const job = await this.jobRepository.findOne(id);

  if (!job) {
    throw new ResourceNotFoundException('Job', id);
  }

  return job;
}
```

### Pattern 2: Validation Errors

**Go:**
```go
func (h *UserHandler) CreateUser(c *gin.Context) {
    var req CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusUnprocessableEntity, domain.NewErrorResponse(
            422,
            "Unprocessable Entity",
            domain.ErrValidationError,
            "Validation failed. Please check the required fields.",
        ))
        return
    }

    // Validate email format
    if !isValidEmail(req.Email) {
        c.JSON(http.StatusUnprocessableEntity, domain.NewErrorResponse(
            422,
            "Unprocessable Entity",
            "INVALID_EMAIL",
            "Please enter a valid email address.",
        ))
        return
    }

    // ... create user
}
```

**NestJS:**
```typescript
// Automatic with class-validator
import { IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}
```

### Pattern 3: Internal Errors

**Go:**
```go
func (h *Handler) SomeOperation(c *gin.Context) {
    result, err := h.service.DoSomething()
    if err != nil {
        correlationID := uuid.New().String()
        log.Printf("[ERROR] Operation failed: %v, CorrelationID: %s", err, correlationID)

        c.JSON(http.StatusInternalServerError, domain.ErrInternalServerError(correlationID))
        return
    }

    c.JSON(http.StatusOK, result)
}
```

**NestJS:**
```typescript
async someOperation() {
  try {
    return await this.externalService.call();
  } catch (error) {
    const correlationId = uuidv4();
    this.logger.error(`Operation failed: ${error.message}`, { correlationId });

    throw new CustomHttpException(
      'An unexpected error occurred. Our team has been notified.',
      500,
      'INTERNAL_ERROR',
      { correlationId }
    );
  }
}
```

---

## Testing

### Testing Error Responses (Go)

```go
func TestLoginInvalidCredentials(t *testing.T) {
    router := setupRouter()

    w := httptest.NewRecorder()
    req, _ := http.NewRequest("POST", "/login", strings.NewReader(`{
        "email": "wrong@example.com",
        "password": "wrongpass"
    }`))

    router.ServeHTTP(w, req)

    assert.Equal(t, 401, w.Code)

    var response domain.ErrorResponse
    json.Unmarshal(w.Body.Bytes(), &response)

    assert.Equal(t, "Invalid email or password", response.Message)
    assert.Equal(t, "INVALID_CREDENTIALS", response.Code)
}
```

### Testing Error Responses (NestJS)

```typescript
describe('AuthController', () => {
  it('should return standardized error for invalid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/login')
      .send({ email: 'wrong@example.com', password: 'wrongpass' })
      .expect(401);

    expect(response.body).toEqual({
      message: 'Invalid email or password',
      statusCode: 401,
      error: 'Unauthorized',
      code: 'INVALID_CREDENTIALS',
    });
  });
});
```

---

**Next Steps:**
- Review [Go Examples](./examples/go-examples.md) for complete implementations
- Review [NestJS Examples](./examples/nestjs-examples.md) for complete implementations
- Follow [Migration Checklist](./migration-checklist.md) for step-by-step updates
