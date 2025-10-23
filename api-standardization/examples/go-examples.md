# Go Implementation Examples (User-Auth Service)

## Complete Working Examples

### File Structure

```
user-auth-service/
├── domain/
│   └── errors.go          # Error types and helpers
├── handlers/
│   ├── auth.go            # Authentication handlers
│   ├── tenant.go          # Tenant handlers
│   └── user.go            # User handlers
├── middleware/
│   └── auth.go            # Auth middleware
└── main.go                # Application setup
```

---

## domain/errors.go

```go
package domain

import "net/http"

// ErrorResponse represents a standardized error response
type ErrorResponse struct {
	Message       string                 `json:"message"`
	StatusCode    int                    `json:"statusCode"`
	Error         string                 `json:"error"`
	Code          string                 `json:"code"`
	Details       map[string]interface{} `json:"details,omitempty"`
	CorrelationID string                 `json:"correlationId,omitempty"`
}

// ErrorCode represents standard error codes
type ErrorCode string

// Authentication errors
const (
	ErrInvalidCredentials ErrorCode = "INVALID_CREDENTIALS"
	ErrInvalidToken       ErrorCode = "INVALID_TOKEN"
	ErrUnauthorized       ErrorCode = "UNAUTHORIZED"
	ErrTokenExpired       ErrorCode = "TOKEN_EXPIRED"
)

// Authorization errors
const (
	ErrForbidden              ErrorCode = "FORBIDDEN"
	ErrInsufficientPermissions ErrorCode = "INSUFFICIENT_PERMISSIONS"
)

// Resource errors
const (
	ErrResourceNotFound     ErrorCode = "RESOURCE_NOT_FOUND"
	ErrUserNotFound         ErrorCode = "USER_NOT_FOUND"
	ErrTenantNotFound       ErrorCode = "TENANT_NOT_FOUND"
	ErrApplicationNotFound  ErrorCode = "APPLICATION_NOT_FOUND"
)

// Validation errors
const (
	ErrValidationError ErrorCode = "VALIDATION_ERROR"
	ErrInvalidEmail    ErrorCode = "INVALID_EMAIL"
	ErrWeakPassword    ErrorCode = "WEAK_PASSWORD"
)

// Conflict errors
const (
	ErrDuplicateResource  ErrorCode = "DUPLICATE_RESOURCE"
	ErrEmailAlreadyExists ErrorCode = "EMAIL_ALREADY_EXISTS"
)

// Server errors
const (
	ErrInternalError      ErrorCode = "INTERNAL_ERROR"
	ErrServiceUnavailable ErrorCode = "SERVICE_UNAVAILABLE"
	ErrDatabaseError      ErrorCode = "DATABASE_ERROR"
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

// Common error response helpers

func ErrInvalidCredentialsResponse() ErrorResponse {
	return NewErrorResponse(
		http.StatusUnauthorized,
		"Unauthorized",
		ErrInvalidCredentials,
		"Invalid email or password",
	)
}

func ErrInvalidTokenResponse() ErrorResponse {
	return NewErrorResponse(
		http.StatusUnauthorized,
		"Unauthorized",
		ErrInvalidToken,
		"Your session has expired. Please log in again.",
	)
}

func ErrUnauthorizedResponse() ErrorResponse {
	return NewErrorResponse(
		http.StatusUnauthorized,
		"Unauthorized",
		ErrUnauthorized,
		"Authentication required. Please log in.",
	)
}

func ErrForbiddenResponse() ErrorResponse {
	return NewErrorResponse(
		http.StatusForbidden,
		"Forbidden",
		ErrForbidden,
		"You don't have permission to perform this action.",
	)
}

func ErrTenantNotFoundResponse() ErrorResponse {
	return NewErrorResponse(
		http.StatusNotFound,
		"Not Found",
		ErrTenantNotFound,
		"Tenant not found",
	)
}

func ErrUserNotFoundResponse() ErrorResponse {
	return NewErrorResponse(
		http.StatusNotFound,
		"Not Found",
		ErrUserNotFound,
		"User not found",
	)
}

func ErrEmailExistsResponse(email string) ErrorResponse {
	return NewErrorResponseWithDetails(
		http.StatusConflict,
		"Conflict",
		ErrEmailAlreadyExists,
		"This email is already registered. Please use a different email or try logging in.",
		map[string]interface{}{"email": email},
	)
}

func ErrValidationResponse(message string) ErrorResponse {
	return NewErrorResponse(
		http.StatusUnprocessableEntity,
		"Unprocessable Entity",
		ErrValidationError,
		message,
	)
}

func ErrInternalServerError(correlationID string) ErrorResponse {
	return ErrorResponse{
		Message:       "An unexpected error occurred. Our team has been notified.",
		StatusCode:    http.StatusInternalServerError,
		Error:         "Internal Server Error",
		Code:          string(ErrInternalError),
		CorrelationID: correlationID,
	}
}
```

---

## handlers/auth.go

```go
package handlers

import (
	"net/http"
	"user-auth-service/domain"
	"user-auth-service/services"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token     string      `json:"Token"`
	ExpiresAt string      `json:"ExpiresAt"`
	User      domain.User `json:"User"`
}

// Login handles tenant user login
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest

	// Validate request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.ErrValidationResponse(
			"Invalid request format",
		))
		return
	}

	// Get tenant ID from header
	tenantID := c.GetHeader("X-Tenant-ID")
	if tenantID == "" {
		c.JSON(http.StatusNotFound, domain.ErrTenantNotFoundResponse())
		return
	}

	// Validate credentials
	user, token, expiresAt, err := h.authService.ValidateCredentials(tenantID, req.Email, req.Password)
	if err != nil {
		// Log the actual error for debugging
		c.Error(err)

		// Return user-friendly error
		c.JSON(http.StatusUnauthorized, domain.ErrInvalidCredentialsResponse())
		return
	}

	// Return success response
	c.JSON(http.StatusOK, LoginResponse{
		Token:     token,
		ExpiresAt: expiresAt,
		User:      user,
	})
}

// AdminLogin handles platform superadmin login
func (h *AuthHandler) AdminLogin(c *gin.Context) {
	var req LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.ErrValidationResponse(
			"Invalid request format",
		))
		return
	}

	// Validate admin credentials
	user, token, expiresAt, err := h.authService.ValidateAdminCredentials(req.Email, req.Password)
	if err != nil {
		c.Error(err)
		c.JSON(http.StatusUnauthorized, domain.ErrInvalidCredentialsResponse())
		return
	}

	c.JSON(http.StatusOK, LoginResponse{
		Token:     token,
		ExpiresAt: expiresAt,
		User:      user,
	})
}

// Logout handles user logout
func (h *AuthHandler) Logout(c *gin.Context) {
	// Get token from header
	token := c.GetHeader("Authorization")
	if token == "" {
		c.JSON(http.StatusUnauthorized, domain.ErrUnauthorizedResponse())
		return
	}

	// Invalidate token (add to blacklist, etc.)
	if err := h.authService.InvalidateToken(token); err != nil {
		c.Error(err)
		c.JSON(http.StatusInternalServerError, domain.ErrInternalServerError(""))
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Logged out successfully",
	})
}
```

---

## handlers/user.go

```go
package handlers

import (
	"net/http"
	"user-auth-service/domain"
	"user-auth-service/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UserHandler struct {
	userService *services.UserService
}

func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// GetUser retrieves a user by ID
func (h *UserHandler) GetUser(c *gin.Context) {
	userID := c.Param("id")

	user, err := h.userService.FindByID(userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, domain.ErrUserNotFoundResponse())
			return
		}

		c.Error(err)
		c.JSON(http.StatusInternalServerError, domain.ErrInternalServerError(""))
		return
	}

	c.JSON(http.StatusOK, user)
}

type CreateUserRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Name     string `json:"name" binding:"required"`
	Password string `json:"password" binding:"required,min=8"`
	Role     string `json:"role" binding:"required"`
}

// CreateUser creates a new user
func (h *UserHandler) CreateUser(c *gin.Context) {
	var req CreateUserRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusUnprocessableEntity, domain.ErrValidationResponse(
			"Validation failed. Please check the required fields.",
		))
		return
	}

	// Get tenant ID from context (set by auth middleware)
	tenantID, exists := c.Get("tenantID")
	if !exists {
		c.JSON(http.StatusBadRequest, domain.ErrValidationResponse(
			"Tenant ID is required",
		))
		return
	}

	// Check if email already exists
	existing, _ := h.userService.FindByEmail(req.Email)
	if existing != nil {
		c.JSON(http.StatusConflict, domain.ErrEmailExistsResponse(req.Email))
		return
	}

	// Create user
	user, err := h.userService.CreateUser(
		tenantID.(string),
		req.Email,
		req.Name,
		req.Password,
		req.Role,
	)
	if err != nil {
		c.Error(err)
		c.JSON(http.StatusInternalServerError, domain.ErrInternalServerError(""))
		return
	}

	c.JSON(http.StatusCreated, user)
}
```

---

## middleware/auth.go

```go
package middleware

import (
	"net/http"
	"strings"
	"user-auth-service/domain"
	"user-auth-service/services"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtService *services.JWTService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, domain.ErrUnauthorizedResponse())
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, domain.ErrInvalidTokenResponse())
			c.Abort()
			return
		}

		token := parts[1]

		// Validate token
		claims, err := jwtService.ValidateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, domain.ErrInvalidTokenResponse())
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("userID", claims.UserID)
		c.Set("tenantID", claims.TenantID)
		c.Set("role", claims.Role)

		c.Next()
	}
}

func ErrorRecoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				correlationID := generateCorrelationID()

				// Log the error with correlation ID
				log.Printf("[PANIC] %v, CorrelationID: %s", err, correlationID)

				c.JSON(http.StatusInternalServerError, domain.ErrInternalServerError(correlationID))
			}
		}()
		c.Next()
	}
}

func generateCorrelationID() string {
	// Implementation to generate unique correlation ID
	return "req-" + uuid.New().String()
}
```

---

## main.go

```go
package main

import (
	"user-auth-service/handlers"
	"user-auth-service/middleware"
	"user-auth-service/services"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Global middleware
	r.Use(middleware.ErrorRecoveryMiddleware())

	// Initialize services
	authService := services.NewAuthService()
	userService := services.NewUserService()
	jwtService := services.NewJWTService()

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	userHandler := handlers.NewUserHandler(userService)

	// Public routes (no auth required)
	r.POST("/login", authHandler.Login)
	r.POST("/admin/login", authHandler.AdminLogin)

	// Protected routes (auth required)
	authorized := r.Group("")
	authorized.Use(middleware.AuthMiddleware(jwtService))
	{
		authorized.POST("/logout", authHandler.Logout)
		authorized.GET("/users/:id", userHandler.GetUser)
		authorized.POST("/users", userHandler.CreateUser)
	}

	r.Run(":8082")
}
```

---

## Testing Example

```go
package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"user-auth-service/domain"
	"user-auth-service/handlers"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestLoginInvalidCredentials(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := setupTestRouter()

	// Create request
	reqBody := map[string]string{
		"email":    "wrong@example.com",
		"password": "wrongpass",
	}
	body, _ := json.Marshal(reqBody)

	req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Tenant-ID", "test-tenant-id")

	// Execute
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusUnauthorized, w.Code)

	var response domain.ErrorResponse
	json.Unmarshal(w.Body.Bytes(), &response)

	assert.Equal(t, "Invalid email or password", response.Message)
	assert.Equal(t, 401, response.StatusCode)
	assert.Equal(t, "Unauthorized", response.Error)
	assert.Equal(t, "INVALID_CREDENTIALS", response.Code)
}

func TestLoginMissingTenantID(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := setupTestRouter()

	reqBody := map[string]string{
		"email":    "test@example.com",
		"password": "password",
	}
	body, _ := json.Marshal(reqBody)

	req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	// Note: X-Tenant-ID header NOT set

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)

	var response domain.ErrorResponse
	json.Unmarshal(w.Body.Bytes(), &response)

	assert.Equal(t, "Tenant not found", response.Message)
	assert.Equal(t, "TENANT_NOT_FOUND", response.Code)
}
```

---

## Summary

This implementation provides:
- ✅ Standardized error responses across all endpoints
- ✅ User-friendly error messages
- ✅ Consistent error codes
- ✅ Proper HTTP status codes
- ✅ Error recovery middleware
- ✅ Detailed error context when needed
- ✅ Testable error handling

All responses follow the standardized format expected by the frontend.
