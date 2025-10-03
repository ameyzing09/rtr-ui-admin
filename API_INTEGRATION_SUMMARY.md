# API Integration Summary

## Base URL
- **Development**: `http://localhost:8082`
- **Production**: `https://auth.<env>.recrutr.in`

## Updated API Endpoints

### Control-Plane (SUPERADMIN) Routes

| Function | Old Endpoint | New Endpoint | Method | Headers |
|----------|--------------|--------------|--------|---------|
| **Login (Platform)** | N/A | `/admin/login` | POST | - |
| **Logout (Platform)** | N/A | `/admin/logout` | POST | `Authorization: Bearer <token>` |
| **List All Tenants** | `/tenant/list` | `/admin/tenants` | GET | `Authorization: Bearer <token>` |
| **Create Tenant** | `/tenant/create` | `/tenant/create` | POST | `Authorization: Bearer <token>`, `Idempotency-Key: <uuid>` |
| **Get Tenant Details** | N/A | `/tenant/:id` | GET | `Authorization: Bearer <token>` |
| **Get Tenant Status** | `/tenant/status?id=:id` | `/tenant/:id/status` | GET | `Authorization: Bearer <token>` |
| **Retry Provisioning** | N/A | `/tenant/:id/retry` | POST | `Authorization: Bearer <token>` |

### Tenant-Scoped Routes

| Function | Endpoint | Method | Headers |
|----------|----------|--------|---------|
| **Login (Tenant)** | `/login` | POST | - |
| **Logout (Tenant)** | `/logout` | POST | `Authorization: Bearer <token>`, `X-Tenant-ID: <tenant-id>` |
| **Get Current User** | `/me` | GET | `Authorization: Bearer <token>`, `X-Tenant-ID: <tenant-id>` |
| **Change Password** | `/me/change-password` | POST | `Authorization: Bearer <token>`, `X-Tenant-ID: <tenant-id>` |
| **List Users** | `/users` | GET | `Authorization: Bearer <token>`, `X-Tenant-ID: <tenant-id>` |
| **Create User** | `/users` | POST | `Authorization: Bearer <token>`, `X-Tenant-ID: <tenant-id>` |
| **Get Tenant Settings** | `/tenant/settings` | GET | `Authorization: Bearer <token>`, `X-Tenant-ID: <tenant-id>` |
| **Update Tenant Settings** | `/tenant/settings` | PUT | `Authorization: Bearer <token>`, `X-Tenant-ID: <tenant-id>` |

## Response Structure Changes

### List Tenants Response
```json
{
  "tenants": [
    {
      "id": "tnt-xxx",
      "name": "Company Name",
      "domain": "domain.com",
      "slug": "company-name",
      "plan": "STARTER",
      "status": "ACTIVE",
      "created_by": "u-superadmin-xxx",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "failed_reason": null
    }
  ]
}
```

### Tenant Status Response
```json
{
  "status": "ACTIVE",
  "steps": [
    "Tenant created",
    "Admin user provisioned",
    "Infrastructure provisioned",
    "Branding configured",
    "Tenant activated"
  ]
}
```

### Create Tenant Response
```json
{
  "tenant": {
    "id": "tnt-xxx",
    "name": "Company Name",
    "domain": "domain.com",
    "slug": "company-name"
  },
  "admin_user_id": "u-admin-xxx",
  "temp_password": "Start1234!",
  "status": "PENDING"
}
```

## Status Values

Updated tenant status enum to include all possible values:
- `PENDING` - Tenant created, awaiting provisioning
- `PROVISIONING` - Infrastructure being set up
- `AWAITING_BRANDING` - Waiting for branding configuration
- `ACTIVE` - Fully operational
- `FAILED` - Provisioning or operation failed
- `SUSPENDED` - Temporarily disabled
- `TERMINATED` - Permanently removed

## Authentication Flow

### For Platform Admin (SUPERADMIN)
1. POST `/admin/login` with credentials
2. Receive JWT token in response
3. Store token in `localStorage` as `auth_token`
4. Include token in `Authorization: Bearer <token>` header for all requests

### For Tenant Users
1. POST `/login` with credentials
2. Receive JWT token and `X-Tenant-ID` in response
3. Store both token and tenant ID
4. Include both in subsequent requests

## Error Response Format

### Tenant Errors
```json
{
  "error": "Human-readable error message"
}
```

### Control-Plane Errors
```json
{
  "code": "ERR_CODE",
  "message": "Human-readable message",
  "suggestions": ["Optional array of suggestions"]
}
```

## Files Updated

1. **src/lib/api/tenantClient.ts**
   - Updated `listTenants()` to use `/admin/tenants`
   - Updated `getTenantStatus()` to use `/tenant/:id/status`
   - Added proper comments referencing API docs

2. **src/lib/schemas/tenant.ts**
   - Added `FAILED` status to enum
   - Updated status response schema to match API structure
   - Made `admin_email` optional in list response
   - Added `failed_reason` field to tenant list items

3. **src/app/sa/tenants/page.tsx**
   - Added `FAILED` status to filter options
   - Added styling for `FAILED` status

4. **src/lib/api/authClient.ts**
   - Already using correct endpoints (`/admin/login`, `/login`)
   - No changes needed

## Development Mode

For testing without authentication:
- Set `NEXT_PUBLIC_DEV_BYPASS_AUTH=true` in `.env.local`
- This will use a mock token for API requests

## Testing

To test the integration:
1. Ensure API server is running on `http://localhost:8082`
2. Login at `/login` or `/sa/login`
3. Navigate to `/sa/tenants` to see tenant list
4. Use browser dev tools to inspect API calls and responses

## References

- API Documentation: `user-auth-api-docs/api-overview.md`
- Mock Responses: `user-auth-api-docs/mocks/admin/`
- Permissions: `user-auth-api-docs/permissions.md`
