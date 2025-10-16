# RBAC (Role-Based Access Control) System

## Overview

This directory contains the frontend RBAC system for the RTR Admin application. The system provides permission-based access control with multi-tenant isolation.

**Key Components:**
- `permissions.ts` - Permission definitions and role mappings
- `guard.ts` - Server-side permission and tenant context guards
- Backend must implement matching validation (see `/docs/BACKEND_SECURITY_REQUIREMENTS.md`)

---

## Architecture

### Two-Layer Security Model

1. **Permission Layer**: What can a user do?
   - Jobs: `job:list`, `job:create`, `job:read`, `job:update`, `job:delete`
   - Applications: `application:list`, `application:create`, etc.

2. **Tenant Context Layer**: Where can they do it?
   - Tenant users: Only within their own tenant
   - Superadmins: Across all tenants

### Defense-in-Depth

**Frontend (This App):**
- Route protection (middleware)
- UI filtering (navigation)
- Permission checks (guards)
- Tenant context validation (guards)

**Backend (API):**
- JWT validation
- Permission enforcement
- Tenant context validation
- Database query filtering

---

## Permission System

### Permission Types

**Platform Permissions** (Superadmin only):
```typescript
PERMISSIONS.TENANT_LIST           // View all tenants
PERMISSIONS.TENANT_CREATE         // Create new tenants
PERMISSIONS.TENANT_UPDATE         // Modify tenants
PERMISSIONS.SYS_USER_LIST         // Manage system users
PERMISSIONS.SETTINGS_GLOBAL       // Global configuration
```

**Tenant Permissions** (Tenant users):
```typescript
PERMISSIONS.JOB_LIST              // View jobs in their tenant
PERMISSIONS.APPLICATION_CREATE    // Create applications in their tenant
PERMISSIONS.MEMBER_UPDATE         // Manage team members in their tenant
```

### Role Definitions

**SUPERADMIN:**
- All platform permissions
- No tenant permissions by default
- Can access all tenants (bypasses tenant context checks)

**TENANT_ADMIN:**
- All tenant-scoped permissions
- Restricted to their own tenant only

**HR:**
- Subset of tenant permissions (jobs, applications, pipeline, members)
- Restricted to their own tenant

**INTERVIEWER:**
- Interviews and read-only application access
- Restricted to their own tenant

**VIEWER/CANDIDATE:**
- Minimal read permissions
- Restricted to their own tenant

---

## Using Guards

### When to Use Which Guard

#### Permission Guards (Always Use First)

```typescript
// ✅ Check permission before any operation
import { assertPermission } from '@/lib/rbac/guard';

async function getJob(session: UserSession, jobId: string) {
  // 1. Always check permission first
  assertPermission(session, PERMISSIONS.JOB_READ);

  // 2. Then fetch and validate tenant context...
}
```

**Available Permission Guards:**
- `assertPermission(session, permission)` - Throws if missing permission
- `assertPermissions(session, [...])` - Throws if missing any permission
- `requirePermission(permission)` - Gets session + checks permission
- `hasPermission(permission)` - Returns boolean (non-throwing)

#### Tenant Context Guards (Use After Permission Check)

```typescript
// ✅ Validate tenant context for tenant-scoped resources
import { assertTenantContext } from '@/lib/rbac/guard';

async function getJob(session: UserSession, jobId: string) {
  // 1. Permission check
  assertPermission(session, PERMISSIONS.JOB_READ);

  // 2. Fetch resource
  const job = await fetchJob(jobId);

  // 3. Tenant context validation
  assertTenantContext(session, job.tenantId);

  return job;
}
```

**Available Tenant Context Guards:**
- `assertTenantContext(session, resourceTenantId)` - Validate resource tenant
- `assertOwnTenant(session, tenantId)` - Validate tenant ID parameter
- `assertTenantResource(session, resource)` - Generic resource validation
- `canAccessTenant(session, tenantId)` - Returns boolean (non-throwing)

---

## Common Patterns

### Pattern 1: Get Single Resource

```typescript
import { assertPermission, assertTenantContext } from '@/lib/rbac/guard';

async function getJob(session: UserSession, jobId: string) {
  // Step 1: Permission check
  assertPermission(session, PERMISSIONS.JOB_READ);

  // Step 2: Fetch resource
  const job = await jobRepository.findById(jobId);

  if (!job) {
    throw new Error('Job not found');
  }

  // Step 3: Tenant context validation
  assertTenantContext(session, job.tenantId);

  return job;
}
```

### Pattern 2: List Resources

```typescript
async function listJobs(session: UserSession, params: ListParams) {
  // Step 1: Permission check
  assertPermission(session, PERMISSIONS.JOB_LIST);

  // Step 2: Determine tenant filter
  const tenantFilter = session.role === 'SUPERADMIN'
    ? {} // Superadmin sees all tenants
    : { tenantId: session.tenantId }; // Tenant user sees only their tenant

  // Step 3: Fetch with filter
  return await jobRepository.find({
    ...params,
    ...tenantFilter
  });
}
```

### Pattern 3: Create Resource

```typescript
async function createJob(session: UserSession, data: CreateJobRequest) {
  // Step 1: Permission check
  assertPermission(session, PERMISSIONS.JOB_CREATE);

  // Step 2: Determine tenant ID
  const tenantId = session.role === 'SUPERADMIN'
    ? data.tenantId  // Superadmin can create for any tenant (must specify)
    : session.tenantId; // Tenant user creates for their own tenant

  if (!tenantId) {
    throw new Error('Tenant ID is required');
  }

  // Step 3: Create resource with tenant ID
  return await jobRepository.create({
    ...data,
    tenantId,
    createdBy: session.userId
  });
}
```

### Pattern 4: Update Resource

```typescript
async function updateJob(
  session: UserSession,
  jobId: string,
  data: UpdateJobRequest
) {
  // Step 1: Permission check
  assertPermission(session, PERMISSIONS.JOB_UPDATE);

  // Step 2: Fetch existing resource
  const job = await jobRepository.findById(jobId);

  if (!job) {
    throw new Error('Job not found');
  }

  // Step 3: Tenant context validation (BEFORE updating)
  assertTenantContext(session, job.tenantId);

  // Step 4: Update resource
  return await jobRepository.update(jobId, data);
}
```

### Pattern 5: Delete Resource

```typescript
async function deleteJob(session: UserSession, jobId: string) {
  // Step 1: Permission check
  assertPermission(session, PERMISSIONS.JOB_DELETE);

  // Step 2: Fetch existing resource
  const job = await jobRepository.findById(jobId);

  if (!job) {
    throw new Error('Job not found');
  }

  // Step 3: Tenant context validation (BEFORE deleting)
  assertTenantContext(session, job.tenantId);

  // Step 4: Delete resource
  await jobRepository.delete(jobId);

  return { success: true };
}
```

### Pattern 6: Accessing Tenant Settings

```typescript
async function getTenantSettings(
  session: UserSession,
  tenantId: string
) {
  // Step 1: Validate tenant access (when tenant ID is in URL)
  assertOwnTenant(session, tenantId);

  // Step 2: Permission check
  assertPermission(session, PERMISSIONS.SETTINGS_READ);

  // Step 3: Fetch settings
  return await settingsRepository.findByTenantId(tenantId);
}
```

---

## Resource Classification

### Tenant-Scoped Resources (Need Tenant Context Validation)

These resources belong to a specific tenant:

| Resource | Permissions | Tenant Context Required |
|----------|------------|-------------------------|
| Jobs | `job:*` | ✅ Yes |
| Applications | `application:*` | ✅ Yes |
| Pipeline | `pipeline:*` | ✅ Yes |
| Members | `member:*` | ✅ Yes |
| Interviews | `interview:*` | ✅ Yes |
| Tenant Settings | `settings:read/update` | ✅ Yes |
| Billing | `billing:*` | ✅ Yes |
| Integrations | `integrations:*` | ✅ Yes |

### Platform-Scoped Resources (No Tenant Context)

These resources are not tenant-specific:

| Resource | Permissions | Tenant Context Required |
|----------|------------|-------------------------|
| Tenant Management | `tenant:*` | ❌ No (Superadmin only) |
| System Users | `sys:user:*` | ❌ No (Superadmin only) |
| System Health | `sys:health:*` | ❌ No (Superadmin only) |
| Global Settings | `settings:global/security/db` | ❌ No (Superadmin only) |
| Analytics | `analytics:read` | ❌ No (Superadmin only) |

---

## Error Handling

### Permission Errors

```typescript
try {
  assertPermission(session, PERMISSIONS.JOB_CREATE);
} catch (error) {
  if (error instanceof ForbiddenError) {
    // User lacks required permission
    return { error: 'Permission denied', code: 'FORBIDDEN' };
  }
}
```

### Tenant Context Errors

```typescript
try {
  assertTenantContext(session, job.tenantId);
} catch (error) {
  if (error instanceof TenantContextError) {
    // User tried to access other tenant's resource
    return { error: 'Access denied', code: 'TENANT_CONTEXT_VIOLATION' };
  }
}
```

---

## Testing

### Unit Tests

```typescript
import { assertPermission, assertTenantContext } from '@/lib/rbac/guard';

describe('Permission Guards', () => {
  it('should allow user with permission', () => {
    const session = {
      userId: '123',
      role: 'TENANT_ADMIN',
      permissions: [PERMISSIONS.JOB_READ],
      tenantId: 'tenant-a'
    };

    expect(() => {
      assertPermission(session, PERMISSIONS.JOB_READ);
    }).not.toThrow();
  });

  it('should deny user without permission', () => {
    const session = {
      userId: '123',
      role: 'VIEWER',
      permissions: [],
      tenantId: 'tenant-a'
    };

    expect(() => {
      assertPermission(session, PERMISSIONS.JOB_CREATE);
    }).toThrow(ForbiddenError);
  });
});

describe('Tenant Context Guards', () => {
  it('should allow access to own tenant resource', () => {
    const session = {
      userId: '123',
      role: 'TENANT_ADMIN',
      tenantId: 'tenant-a',
      permissions: []
    };

    expect(() => {
      assertTenantContext(session, 'tenant-a');
    }).not.toThrow();
  });

  it('should deny access to other tenant resource', () => {
    const session = {
      userId: '123',
      role: 'TENANT_ADMIN',
      tenantId: 'tenant-a',
      permissions: []
    };

    expect(() => {
      assertTenantContext(session, 'tenant-b');
    }).toThrow(TenantContextError);
  });

  it('should allow superadmin cross-tenant access', () => {
    const session = {
      userId: '123',
      role: 'SUPERADMIN',
      tenantId: undefined,
      permissions: []
    };

    expect(() => {
      assertTenantContext(session, 'tenant-a');
    }).not.toThrow();
  });
});
```

---

## Checklist for New Features

When implementing a new feature with tenant-scoped resources:

- [ ] Identify which permissions are needed
- [ ] Add permissions to `permissions.ts` if needed
- [ ] Use `assertPermission()` in all service functions
- [ ] Use `assertTenantContext()` for tenant-scoped resources
- [ ] Filter list queries by `session.tenantId` (except superadmin)
- [ ] Set `tenantId` from session on create operations
- [ ] Add unit tests for permission checks
- [ ] Add unit tests for tenant context validation
- [ ] Document in backend requirements if backend changes needed
- [ ] Add integration tests for cross-tenant access denial

---

## Security Best Practices

### ✅ DO

- Always check permissions first, then tenant context
- Extract `tenantId` from session, never from user input
- Use typed Permission constants, not strings
- Validate tenant context before returning sensitive data
- Filter list queries by tenant ID
- Log all permission and tenant context violations

### ❌ DON'T

- Don't bypass guards in development/testing
- Don't trust client-provided tenant IDs
- Don't check tenant context before permission
- Don't leak tenant information in error messages
- Don't assume superadmin has tenant ID
- Don't implement permission checks in UI only

---

## Related Documentation

- `/docs/BACKEND_SECURITY_REQUIREMENTS.md` - Backend implementation requirements
- `src/lib/rbac/permissions.ts` - Permission definitions
- `src/lib/rbac/guard.ts` - Guard function implementations
- `middleware.ts` - Route-level protection

---

## Questions?

If you're unsure which guards to use for your feature, ask yourself:

1. **Is this a tenant-scoped resource?**
   - Yes → Use both permission guards AND tenant context guards
   - No → Use only permission guards

2. **Does the resource have a `tenantId` property?**
   - Yes → Use `assertTenantContext(session, resource.tenantId)`
   - No → This is platform-scoped, check role/permission only

3. **Is tenant ID in the URL?**
   - Yes → Use `assertOwnTenant(session, tenantId)` first
   - No → Fetch resource then use `assertTenantContext()`

Still unsure? Refer to the usage examples in `guard.ts` or consult the security team.
