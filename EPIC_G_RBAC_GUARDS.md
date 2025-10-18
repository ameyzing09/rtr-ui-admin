# EPIC G — RBAC & Guards

This document provides implementation details and usage examples for EPIC G: Role-Based Access Control (RBAC) and Guards.

## Table of Contents

- [G1. Permission Keys](#g1-permission-keys)
- [G2. Guards](#g2-guards)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

---

## G1. Permission Keys

Define and manage a permission-based system with tenant-side permissions and role requirements.

### Files

- `src/lib/rbac/permissions.ts` - Core permission definitions and validators
- `src/domain/jobs/permissions.ts` - Job-specific permissions
- `src/domain/applications/permissions.ts` - Application-specific permissions
- `src/lib/rbac/guard.ts` - Server-side permission guards

### Permission Structure

Permissions use a namespace hierarchy: `resource:action`

**Tenant-Side Permissions:**
```typescript
// Jobs
job:list        // List jobs
job:create      // Create new job
job:read        // Read job details
job:update      // Update job
job:delete      // Delete job
job:publish     // Publish job (ADMIN/HR only)
job:unpublish   // Unpublish job (ADMIN/HR only)

// Applications
application:list        // List applications
application:create      // Create application
application:read        // Read application details
application:update      // Update application
application:delete      // Delete application

// Pipeline
pipeline:*      // All pipeline operations

// Members
member:*        // All member operations

// Interviews
interview:*     // All interview operations

// Analytics
analytics:read  // View analytics

// Settings
settings:read   // Read settings
settings:update // Update settings

// Billing
billing:read    // Read billing
billing:update  // Update billing

// Integrations
integrations:read    // Read integrations
integrations:update  // Update integrations
```

### Role Definitions

```typescript
// ADMIN - Full tenant access
TENANT_ADMIN: [
  job:*,
  application:*,
  pipeline:*,
  member:*,
  interview:*,
  settings:*,
  billing:*,
  integrations:*,
  analytics:read
]

// HR - Recruiting team
HR: [
  job:list, job:create, job:read, job:update, job:delete,
  job:publish, job:unpublish,  // Can publish/unpublish
  application:list, application:create, application:read,
  application:update, application:delete,
  pipeline:list, pipeline:create, pipeline:read,
  pipeline:update, pipeline:delete,
  member:list, member:create, member:read,
  member:update, member:delete
]

// INTERVIEWER - Interview focused
INTERVIEWER: [
  interview:list, interview:create, interview:read,
  interview:update, interview:delete,
  application:read
]

// VIEWER - Read-only access
VIEWER: [
  analytics:read,
  application:read
]
```

### Wildcard Permissions

The system supports wildcard permissions for convenience:

```typescript
// These are equivalent:
can(permissions, 'job:create')    // Exact match
can(permissions, 'job:create')    // Wildcard match if user has 'job:*'

// If user has 'job:*', they have ALL job permissions:
can(['job:*'], 'job:create')      // true
can(['job:*'], 'job:delete')      // true
can(['job:*'], 'job:publish')     // true
```

### Permission Checking

**Core Functions:**

```typescript
import { can, canAll, canAny } from '@/lib/rbac/permissions';

// Check single permission
can(userPermissions, 'job:create');  // true or false

// Check all permissions
canAll(userPermissions, ['job:create', 'job:delete']);  // true if has both

// Check any permission
canAny(userPermissions, ['job:create', 'job:publish']);  // true if has either

// Get permissions for role
getPermissionsForRole('HR');  // Returns HR_PERMISSIONS array
```

**Job-Specific Functions:**

```typescript
import {
  JOB_PERMISSIONS,
  hasJobPermission,
  requireCanListJobs,
  requireCanCreateJobs,
  requireCanPublishJobs,
  requireCanManageJobPublishing,
} from '@/domain/jobs/permissions';

// Client-side check (non-throwing)
hasJobPermission(session.user.permissions, JOB_PERMISSIONS.DELETE);

// Server-side enforcement (throws/redirects)
const session = await requireCanCreateJobs();
```

### Publish/Unpublish Permissions

**Special Requirements (per API specification):**

- ✅ `job:publish` - Requires ADMIN or HR role
- ✅ `job:unpublish` - Requires ADMIN or HR role
- Included in both TENANT_ADMIN and HR roles
- Only these roles can change job visibility

```typescript
// Trigger when making a job public
if (isPublic === true && previousIsPublic === false) {
  // MUST check job:publish permission
  await requireCanPublishJobs();
  await auditJobPublish(session, jobId, job);
}

// Trigger when making a job private
if (isPublic === false && previousIsPublic === true) {
  // MUST check job:unpublish permission
  await requireCanUnpublishJobs();
  await auditJobUnpublish(session, jobId, job);
}
```

---

## G2. Guards

Implement middleware gates for tenant routes and page-level permission enforcement.

### Files

- `src/lib/rbac/guard.ts` - Server-side permission guards
- `src/components/shared/PermissionGuard.tsx` - UI permission components

### Server-Side Guards

#### Route Protection

```typescript
import { protectTenantRoute, protectSuperadminRoute } from '@/lib/rbac/guard';
import { PERMISSIONS } from '@/lib/rbac/permissions';

// Protect tenant route - requires specific permission
export async function GET(request: Request) {
  // Redirects to /unauthorized if permission denied
  const session = await protectTenantRoute(PERMISSIONS.JOB_LIST);

  // Now safe to access tenant data
  return listJobs(session);
}

// Protect superadmin route
export async function GET(request: Request) {
  // Redirects to /unauthorized if not SUPERADMIN
  const session = await protectSuperadminRoute();

  return manageTenants(session);
}
```

#### Permission Assertions

```typescript
import {
  assertPermission,
  assertTenantContext,
  assertTenantResource,
} from '@/lib/rbac/guard';

export async function deleteJob(session: UserSession, jobId: string) {
  // Check permission - throws ForbiddenError if denied
  assertPermission(session, PERMISSIONS.JOB_DELETE);

  // Fetch job
  const job = await getJobFromDB(jobId);

  // Validate tenant context - throws TenantContextError if cross-tenant
  assertTenantContext(session, job.tenantId);

  // Now safe to delete
  await deleteJobFromDB(jobId);
}

// Generic tenant resource check
async function updateApplication(session: UserSession, appId: string, patch: any) {
  assertPermission(session, PERMISSIONS.APPLICATION_UPDATE);

  const application = await getApplicationFromDB(appId);

  // Works with any resource that has tenantId property
  assertTenantResource(session, application);

  return updateApplicationInDB(appId, patch);
}
```

### Page-Level Permission Enforcement

**Server Component Example:**

```typescript
import { protectTenantRoute } from '@/lib/rbac/guard';
import { PERMISSIONS } from '@/lib/rbac/permissions';

// app/(admin)/dashboard/jobs/page.tsx
export default async function JobsPage() {
  // Enforce permission - redirects if denied
  const session = await protectTenantRoute(PERMISSIONS.JOB_LIST);

  // Fetch data
  const jobs = await listJobs(session);

  return <JobListClient initialData={jobs} />;
}
```

**Server Action with Permission Check:**

```typescript
import { requireCanPublishJobs } from '@/domain/jobs/permissions';
import { auditJobPublish } from '@/domain/jobs/audit';

export async function publishJobAction(jobId: string) {
  // Enforce permission - throws error if denied
  const session = await requireCanPublishJobs();

  // Get and validate job
  const job = await getJob(session, jobId);
  assertTenantContext(session, job.tenantId);

  // Update job
  const updated = await updateJob(session, jobId, { isPublic: true });

  // Audit
  await auditJobPublish(session, jobId, updated);

  return updated;
}
```

### UI Permission Components

#### PermissionGate - Simple conditional rendering

```typescript
import { PermissionGate } from '@/components/shared/PermissionGuard';
import { JOB_PERMISSIONS } from '@/domain/jobs/permissions';

function JobActions() {
  const { session } = useAuth();

  return (
    <PermissionGate
      permissions={session.user.permissions}
      required={JOB_PERMISSIONS.DELETE}
      fallback={<span className="text-gray-400">Delete not available</span>}
    >
      <button onClick={handleDelete}>Delete Job</button>
    </PermissionGate>
  );
}
```

#### ProtectedButton - Auto-disables and shows tooltip

```typescript
import { ProtectedButton } from '@/components/shared/PermissionGuard';
import { JOB_PERMISSIONS } from '@/domain/jobs/permissions';

function JobCard() {
  const { session } = useAuth();

  return (
    <ProtectedButton
      permissions={session.user.permissions}
      required={[JOB_PERMISSIONS.PUBLISH, JOB_PERMISSIONS.UNPUBLISH]}
      onClick={handleTogglePublish}
      deniedTitle="Cannot publish - Admin or HR role required"
      deniedDescription="Only admins and HR staff can publish jobs"
    >
      Publish Job
    </ProtectedButton>
  );
}
```

#### RestrictedSection - Shows permission denied banner

```typescript
import { RestrictedSection } from '@/components/shared/PermissionGuard';
import { PERMISSIONS } from '@/lib/rbac/permissions';

function BillingPage() {
  const { session } = useAuth();

  return (
    <RestrictedSection
      permissions={session.user.permissions}
      required={PERMISSIONS.BILLING_READ}
      title="Billing Information"
    >
      <BillingContent />
    </RestrictedSection>
  );
}
```

#### PermissionCheck - Render prop pattern

```typescript
import { PermissionCheck } from '@/components/shared/PermissionGuard';
import { JOB_PERMISSIONS } from '@/domain/jobs/permissions';

function JobMenu() {
  const { session } = useAuth();

  return (
    <PermissionCheck
      permissions={session.user.permissions}
      permission={JOB_PERMISSIONS.UPDATE}
      render={(canUpdate) => (
        <button disabled={!canUpdate} className={canUpdate ? '' : 'opacity-50'}>
          {canUpdate ? 'Edit' : 'View Only'}
        </button>
      )}
    />
  );
}
```

---

## Usage Examples

### Example 1: Job Create with Permission Enforcement

**Server Component:**

```typescript
// app/(admin)/dashboard/jobs/create/page.tsx
import { protectTenantRoute } from '@/lib/rbac/guard';
import { PERMISSIONS } from '@/lib/rbac/permissions';

export default async function CreateJobPage() {
  // Enforce permission - redirects if denied
  await protectTenantRoute(PERMISSIONS.JOB_CREATE);

  return <CreateJobWizard />;
}
```

**Server Action:**

```typescript
// lib/actions/job.ts
import { requireCanCreateJobs } from '@/domain/jobs/permissions';
import { auditJobCreate } from '@/domain/jobs/audit';

export async function createJobAction(data: CreateJobRequest) {
  // 1. Check permission
  const session = await requireCanCreateJobs();

  // 2. Create job
  const job = await jobService.createJob(session, session.token, data);

  // 3. Audit
  await auditJobCreate(session, job, data);

  return { success: true, data: job };
}
```

### Example 2: Job Publish with ADMIN/HR Requirement

**Server Action:**

```typescript
export async function publishJobAction(jobId: string) {
  // Requires job:publish permission (ADMIN/HR only)
  const session = await requireCanPublishJobs();

  // Get and validate job
  const job = await jobService.getJob(session, session.token, jobId);
  assertTenantContext(session, job.tenantId);

  // Check if already public
  if (job.isPublic) {
    throw new Error('Job is already public');
  }

  // Update to public
  const updated = await jobService.updateJob(session, session.token, jobId, {
    isPublic: true
  });

  // Audit
  await auditJobPublish(session, jobId, updated);

  return { success: true, data: updated };
}
```

**UI Component:**

```typescript
// components/JobCard.tsx
'use client';

import { ProtectedButton } from '@/components/shared/PermissionGuard';
import { JOB_PERMISSIONS } from '@/domain/jobs/permissions';

export function JobCard({ job, session }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      const result = await publishJobAction(job.id);
      if (result.success) {
        toast({
          title: 'Job published',
          variant: 'success'
        });
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="job-card">
      <h3>{job.title}</h3>

      {job.isPublic ? (
        <span className="badge-green">Published</span>
      ) : (
        <ProtectedButton
          permissions={session.user.permissions}
          required={[JOB_PERMISSIONS.PUBLISH, JOB_PERMISSIONS.UNPUBLISH]}
          onClick={handlePublish}
          disabled={isLoading}
          deniedTitle="Cannot publish - Admin or HR role required"
          className="btn btn-primary"
        >
          {isLoading ? 'Publishing...' : 'Publish'}
        </ProtectedButton>
      )}
    </div>
  );
}
```

### Example 3: Application Status Update with Permission Gate

**Server Action:**

```typescript
import { requireCanUpdateApplications } from '@/domain/applications/permissions';
import { auditApplicationStatusChange } from '@/domain/applications/audit';

export async function updateApplicationStatusAction(
  appId: string,
  newStatus: ApplicationStatus
) {
  const session = await requireCanUpdateApplications();

  const application = await applicationService.get(session, session.token, appId);
  assertTenantResource(session, application);

  const updated = await applicationService.update(session, session.token, appId, {
    status: newStatus
  });

  await auditApplicationStatusChange(session, updated, application.status, newStatus);

  return { success: true, data: updated };
}
```

**UI Component:**

```typescript
import { PermissionGate } from '@/components/shared/PermissionGuard';
import { APPLICATION_PERMISSIONS } from '@/domain/applications/permissions';

function ApplicationStatusMenu({ application, session }) {
  const handleStatusChange = (status) => {
    updateApplicationStatusAction(application.id, status);
  };

  return (
    <PermissionGate
      permissions={session.user.permissions}
      required={APPLICATION_PERMISSIONS.UPDATE}
      fallback={<p className="text-gray-400">Cannot modify status</p>}
    >
      <select
        value={application.status}
        onChange={(e) => handleStatusChange(e.target.value)}
      >
        <option value="PENDING">Pending</option>
        <option value="REVIEWED">Reviewed</option>
        <option value="REJECTED">Rejected</option>
        <option value="HIRED">Hired</option>
      </select>
    </PermissionGate>
  );
}
```

---

## Best Practices

### ✅ DO

**Server-Side:**
- Always enforce permissions on the server (never trust client)
- Check permissions BEFORE fetching data
- Validate tenant context for multi-tenant isolation
- Log permission denials for security audits
- Use `assertPermission()` for critical operations

**Client-Side:**
- Use permission guards for UX (hide/disable UI)
- Always have server-side checks as primary defense
- Show helpful error messages when permissions denied
- Gracefully degrade UI for restricted users

**Publish/Unpublish:**
- Always check `job:publish` when making job public
- Always check `job:unpublish` when making job private
- Log who published/unpublished and when
- Restrict to ADMIN and HR roles only

### ❌ DON'T

**Security Mistakes:**
- Don't trust client-side permission checks alone
- Don't show sensitive data in fallback UI
- Don't hardcode role names in components
- Don't skip tenant context validation
- Don't allow other roles to publish/unpublish jobs

**Code Quality:**
- Don't repeat permission checks - use guard functions
- Don't mix permission logic with business logic
- Don't create custom permission logic - use centralized system
- Don't comment out permission checks for testing

---

## Tenant Context Validation

**Critical for Multi-Tenant Security:**

```typescript
// ❌ WRONG - Missing tenant context check
async function getJob(jobId: string) {
  const job = await db.jobs.findById(jobId);
  return job; // Could leak other tenant's data!
}

// ✅ CORRECT - Validates tenant context
async function getJob(session: UserSession, jobId: string) {
  // 1. Check permission
  assertPermission(session, PERMISSIONS.JOB_READ);

  // 2. Fetch resource
  const job = await db.jobs.findById(jobId);

  // 3. Validate tenant context
  assertTenantContext(session, job.tenantId);

  return job;
}
```

---

## Permission Hierarchy

```
SUPERADMIN (Platform)
├── platform:*
├── tenant:*
├── sys:*
└── Can impersonate any tenant

TENANT_ADMIN
├── job:*
├── application:*
├── pipeline:*
├── member:*
├── interview:*
├── settings:*
├── billing:*
├── integrations:*
└── analytics:read

HR
├── job:* (including publish/unpublish)
├── application:*
├── pipeline:*
└── member:*

INTERVIEWER
├── interview:*
└── application:read

VIEWER
├── analytics:read
└── application:read
```

---

## Troubleshooting

**User can't perform action:**
1. Check their role: `session.user.role`
2. Check their permissions: `session.user.permissions`
3. Check permission requirements: `JOB_PERMISSIONS.*`
4. Verify server-side check is in place
5. Check audit logs for denied attempts

**Permission gate not working:**
1. Verify permissions are passed correctly: `session.user.permissions`
2. Check exact permission names match: `'job:create'` not `'JOB_CREATE'`
3. Ensure server-side enforces same permissions
4. Test wildcard matching: `'job:*'` grants all job permissions

---

## Conclusion

EPIC G provides a comprehensive RBAC system with:

- **G1**: Permission keys with clear hierarchy and role bundles
- **G2**: Server-side guards for enforcement and UI components for UX

Combined with proper audit logging (EPIC H) and error handling (EPIC F), this creates a secure, professional access control system.
