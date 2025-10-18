# EPIC H — Observability & Security Extras

This document provides implementation details and usage examples for EPIC H: Observability & Security Extras.

## Table of Contents

- [H1. Audit Logging](#h1-audit-logging)
- [H2. Rate Limit UX](#h2-rate-limit-ux)
- [Usage Examples](#usage-examples)

---

## H1. Audit Logging

Log create/update/delete/publish/unpublish job; application create/update/delete.

### Files

- `src/lib/audit/log.ts` - Core audit logging infrastructure
- `src/domain/jobs/audit.ts` - Job-specific audit functions
- `src/domain/applications/audit.ts` - Application-specific audit functions

### Features

✅ Comprehensive audit trail for all critical operations
✅ Captures actor, tenant context, and resource details
✅ Supports success/failure status tracking
✅ Queued batch sending for performance
✅ Fire-and-forget pattern (never blocks user operations)
✅ Console logging in development for debugging

### Audit Events

#### Job Operations

- `job.create` - When a job is created
- `job.update` - When a job is updated
- `job.delete` - When a job is deleted
- `job.publish` - When a job is published (isPublic = true)
- `job.unpublish` - When a job is unpublished (isPublic = false)

#### Application Operations

- `application.create` - When an application is created
- `application.update` - When an application is updated
- `application.delete` - When an application is deleted
- `application.status_change` - When application status changes

### Usage

#### Audit Job Creation

```typescript
import { auditJobCreate } from '@/domain/jobs/audit';
import { getServerSession } from '@/lib/auth/session';

export async function createJobAction(data: CreateJobRequest) {
  const session = await getServerSession();

  try {
    // Create the job
    const job = await jobService.createJob(session, token, data);

    // Audit the creation
    await auditJobCreate(session, job, data);

    return { success: true, data: job };
  } catch (error) {
    // Audit the failure
    await auditJobError(session, 'create', error, { data });
    return { success: false, error: error.message };
  }
}
```

#### Audit Job Publish/Unpublish

```typescript
import { auditJobPublish, auditJobUnpublish } from '@/domain/jobs/audit';

// When publishing a job
async function publishJob(jobId: string) {
  const session = await getServerSession();
  const job = await jobService.getJob(session, token, jobId);

  // Update isPublic to true
  const updated = await jobService.updateJob(session, token, jobId, {
    isPublic: true,
  });

  // Audit the publish action
  await auditJobPublish(session, jobId, updated);

  return updated;
}

// When unpublishing a job
async function unpublishJob(jobId: string, reason?: string) {
  const session = await getServerSession();
  const job = await jobService.getJob(session, token, jobId);

  // Update isPublic to false
  const updated = await jobService.updateJob(session, token, jobId, {
    isPublic: false,
  });

  // Audit the unpublish action
  await auditJobUnpublish(session, jobId, updated, reason);

  return updated;
}
```

#### Audit Application Operations

```typescript
import {
  auditApplicationCreate,
  auditApplicationUpdate,
  auditApplicationStatusChange,
  auditApplicationDelete,
} from '@/domain/applications/audit';

// Create
async function createApplication(data: CreateApplicationRequest) {
  const session = await getServerSession();
  const application = await applicationService.create(session, token, data);

  await auditApplicationCreate(session, application, data);

  return application;
}

// Update
async function updateApplication(id: string, patch: UpdateApplicationRequest) {
  const session = await getServerSession();
  const previous = await applicationService.get(session, token, id);
  const updated = await applicationService.update(session, token, id, patch);

  await auditApplicationUpdate(session, id, patch, previous);

  return updated;
}

// Status Change (special audit)
async function changeApplicationStatus(id: string, newStatus: ApplicationStatus) {
  const session = await getServerSession();
  const application = await applicationService.get(session, token, id);
  const oldStatus = application.status;

  const updated = await applicationService.update(session, token, id, {
    status: newStatus,
  });

  // Special audit for status changes
  await auditApplicationStatusChange(session, updated, oldStatus, newStatus);

  return updated;
}

// Delete
async function deleteApplication(id: string) {
  const session = await getServerSession();
  const application = await applicationService.get(session, token, id);

  await applicationService.delete(session, token, id);
  await auditApplicationDelete(session, id, application);
}
```

### Audit Event Structure

Each audit event contains:

```typescript
{
  // Action performed
  action: 'job.create' | 'job.update' | 'job.delete' | 'job.publish' | 'job.unpublish' | ...,

  // Who performed the action
  actorId: string;
  actorEmail: string;
  actorRole: string;

  // Tenant context
  tenantId: string;

  // What was affected
  targetId: string; // Resource ID (job ID, application ID, etc.)
  targetType: 'job' | 'application' | 'tenant' | ...,

  // Status
  status: 'success' | 'failure' | 'partial';

  // When
  timestamp: string; // ISO 8601 format

  // Additional context
  details: {
    // Operation-specific details
    // For job.create: { title, department, location, isPublic, ... }
    // For application.status_change: { oldStatus, newStatus, ... }
  };
}
```

### Backend Integration

**⚠️ COMPLIANCE REQUIREMENT**

The current implementation queues audit events but **does not persist them**. For production use, you **must** implement backend persistence:

```typescript
// Required: POST /api/audit/events
// Body: AuditEvent
// Response: 201 Created

// Optional: POST /api/audit/events/batch (for better performance)
// Body: { events: AuditEvent[] }
// Response: 201 Created with { success: true, count: number }
```

See `src/lib/audit/log.ts` lines 210-303 for detailed implementation requirements.

### Development Mode

In development (`NODE_ENV=development`), audit events are logged to the console:

```
[AUDIT] {
  action: 'job.create',
  actorId: 'user_123',
  tenantId: 'tenant_456',
  status: 'success',
  targetId: 'job_789',
  details: { title: 'Software Engineer', department: 'Engineering', ... }
}
```

---

## H2. Rate Limit UX

Handle 429 on public submission with cooldown messaging.

### Files

- `src/lib/errors/errorMapper.ts` - Rate limit extraction and handling
- `src/components/shared/RateLimitNotice.tsx` - Rate limit UI components
- `src/lib/errors/useErrorHandler.ts` - Rate limit error handling

### Features

✅ Automatic detection of 429 rate limit errors
✅ Extract rate limit metadata from response headers
✅ Countdown timer showing time until retry allowed
✅ Visual progress bar for cooldown period
✅ Auto-enable retry button when cooldown expires
✅ User-friendly messaging

### Rate Limit Detection

The error mapper automatically detects 429 errors and extracts rate limit information:

```typescript
// Automatically extracts from response:
{
  retryAfter: 60,  // Seconds (from Retry-After header)
  limit: 100,      // From X-RateLimit-Limit header
  remaining: 0,    // From X-RateLimit-Remaining header
  resetAt: Date    // From X-RateLimit-Reset header (Unix timestamp)
}
```

### Supported Headers

The system supports multiple rate limit header formats:

- **Retry-After**: Seconds or HTTP-date
- **X-RateLimit-Limit**: Maximum requests allowed
- **X-RateLimit-Remaining**: Requests remaining
- **X-RateLimit-Reset**: Unix timestamp when limit resets

### Usage

#### Automatic Handling with useErrorHandler

```typescript
import { useErrorHandler } from '@/lib/errors/useErrorHandler';
import { RateLimitNotice } from '@/components/shared/RateLimitNotice';

function PublicApplicationForm() {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);

  const handleError = useErrorHandler({
    onRetry: () => submitForm(),
    onError: (error, mapped) => {
      // Check for rate limit
      if (mapped.rateLimit) {
        setRateLimitInfo(mapped.rateLimit);
        return false; // Prevent default toast
      }
    },
  });

  const submitForm = async () => {
    try {
      await createApplication(data);
      setRateLimitInfo(null);
    } catch (error) {
      handleError(error, 'Failed to submit application');
    }
  };

  if (rateLimitInfo) {
    return (
      <RateLimitNotice
        rateLimit={rateLimitInfo}
        onRetry={submitForm}
        onCooldownExpired={() => setRateLimitInfo(null)}
        message="You've submitted too many applications. Please wait before trying again."
      />
    );
  }

  return <form>{/* Form fields */}</form>;
}
```

#### Manual Rate Limit Handling

```typescript
import { mapApiError } from '@/lib/errors/errorMapper';
import { RateLimitNotice } from '@/components/shared/RateLimitNotice';

function MyComponent() {
  const [error, setError] = useState<MappedError | null>(null);

  const submitData = async () => {
    try {
      await apiCall();
    } catch (err) {
      const mapped = mapApiError(err);
      setError(mapped);
    }
  };

  if (error?.rateLimit) {
    return (
      <RateLimitNotice
        rateLimit={error.rateLimit}
        onRetry={submitData}
        onCooldownExpired={() => setError(null)}
      />
    );
  }

  return <button onClick={submitData}>Submit</button>;
}
```

#### Compact Rate Limit Notice (for inline use)

```typescript
import { CompactRateLimitNotice } from '@/components/shared/RateLimitNotice';

// In toast or inline warning
<CompactRateLimitNotice
  rateLimit={{ retryAfter: 60 }}
  onRetry={() => retryOperation()}
/>
```

### Component Variants

#### Card Variant (Default)

```typescript
<RateLimitNotice variant="card" rateLimit={rateLimitInfo} />
```

Full card with border, padding, and complete UI.

#### Banner Variant

```typescript
<RateLimitNotice variant="banner" rateLimit={rateLimitInfo} />
```

Highlighted banner with yellow border (for important warnings).

#### Inline Variant

```typescript
<RateLimitNotice variant="inline" rateLimit={rateLimitInfo} />
```

No card styling, just content.

### User Experience Flow

1. **User triggers rate limit** (e.g., submits form too many times)
2. **Backend returns 429** with Retry-After header
3. **Error mapper extracts** rate limit info automatically
4. **RateLimitNotice displays** with countdown timer
5. **Progress bar shows** visual feedback of cooldown
6. **Countdown expires**, retry button appears
7. **User clicks retry**, form submits again

### Example Messages

**During Cooldown:**
```
⚠️ Rate Limit Reached

You have made too many requests in a short period.
Please wait before trying again.

⏰ Time remaining: 1:30

Rate limit: 10 requests (resets at 2:45 PM)
```

**After Cooldown:**
```
✓ Ready to Continue

The cooldown period has expired. You can now retry your request.

[Try Again]
```

---

## Usage Examples

### Complete Job Action with Audit

```typescript
// src/lib/actions/job.ts
import { createJobAction } from '@/lib/actions/job';
import { auditJobCreate, auditJobError } from '@/domain/jobs/audit';
import { getServerSession } from '@/lib/auth/session';

export async function createJobAction(data: CreateJobRequest) {
  const session = await getServerSession();

  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Create the job
    const job = await jobService.createJob(session, token, data);

    // Audit successful creation
    await auditJobCreate(session, job, data);

    return { success: true, data: job };
  } catch (error) {
    // Audit the failure
    await auditJobError(session, 'create', error, {
      title: data.title,
      department: data.department,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create job',
    };
  }
}
```

### Public Application Form with Rate Limiting

```typescript
'use client';

import { useState } from 'react';
import { createPublicApplicationAction } from '@/lib/actions/application';
import { useErrorHandler } from '@/lib/errors/useErrorHandler';
import { RateLimitNotice } from '@/components/shared/RateLimitNotice';
import type { RateLimitInfo } from '@/components/shared/RateLimitNotice';

export function PublicApplicationForm({ jobId }: { jobId: string }) {
  const [formData, setFormData] = useState({
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
    resumeUrl: '',
    coverLetter: '',
  });

  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleError = useErrorHandler({
    onRetry: () => handleSubmit(),
    onError: (error, mapped) => {
      // Check for rate limit
      if (mapped.rateLimit) {
        setRateLimitInfo(mapped.rateLimit);
        return false; // Prevent default toast (we show RateLimitNotice instead)
      }
    },
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setRateLimitInfo(null);

    try {
      const result = await createPublicApplicationAction({
        jobId,
        ...formData,
      });

      if (result.success) {
        // Success! Show confirmation
        alert('Application submitted successfully!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      handleError(error, 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show rate limit notice if rate limited
  if (rateLimitInfo) {
    return (
      <RateLimitNotice
        variant="banner"
        rateLimit={rateLimitInfo}
        onRetry={handleSubmit}
        onCooldownExpired={() => setRateLimitInfo(null)}
        message="You've submitted too many applications recently. Please wait before trying again."
      />
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      {/* Form fields */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
}
```

---

## Best Practices

### ✅ DO

**Audit Logging:**
- Audit all create/update/delete operations
- Include actor, tenant, and resource context
- Log both successes and failures
- Use fire-and-forget pattern (never block user)
- Implement backend persistence for compliance

**Rate Limiting:**
- Show clear countdown timer
- Explain why the limit was hit
- Provide retry button when cooldown expires
- Use visual progress feedback
- Don't auto-dismiss rate limit errors

### ❌ DON'T

**Audit Logging:**
- Don't block operations waiting for audit log
- Don't log sensitive data (passwords, tokens)
- Don't skip failure audits
- Don't use audit logs for debugging (use console.log)

**Rate Limiting:**
- Don't hide the retry timer
- Don't allow retry before cooldown expires
- Don't use generic error messages
- Don't forget to clear rate limit state on success

---

## Security Considerations

### Audit Logging

1. **Data Privacy**: Don't log sensitive fields (passwords, credit cards, etc.)
2. **Tamper-Proof**: Audit logs should be append-only and immutable
3. **Access Control**: Only authorized personnel should access audit logs
4. **Retention**: Define and enforce audit log retention policies

### Rate Limiting

1. **Client-Side Enforcement**: Only for UX - always enforce on server
2. **Header Trust**: Don't trust rate limit headers from untrusted sources
3. **Bypass Prevention**: Server must enforce actual rate limits
4. **DoS Protection**: Rate limits protect against abuse and DoS attacks

---

## Backend Requirements

### Audit Log Storage

**Required Endpoints:**

```
POST /api/audit/events
Body: AuditEvent
Response: 201 Created

POST /api/audit/events/batch
Body: { events: AuditEvent[] }
Response: 201 Created with { success: true, count: number }
```

**Storage Requirements:**
- Persistent storage (database, log aggregation service)
- Indexed by: timestamp, actorId, tenantId, action
- Retention policy: Minimum 90 days (check compliance requirements)
- Immutable records (append-only)

### Rate Limiting

**Required Headers:**

```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1234567890
```

**Implementation:**
- Token bucket or sliding window algorithm
- Per-IP, per-user, or per-tenant limits
- Different limits for different endpoints
- Exponential backoff for repeated violations

---

## Testing

### Audit Logging Tests

```typescript
import { auditJobCreate } from '@/domain/jobs/audit';

// Mock audit function
jest.mock('@/lib/audit/log');

test('audits job creation', async () => {
  const session = createMockSession();
  const job = createMockJob();
  const request = createMockJobRequest();

  await auditJobCreate(session, job, request);

  expect(audit).toHaveBeenCalledWith('job.create', {
    actorId: session.user.id,
    targetId: job.id,
    targetType: 'job',
    status: 'success',
    // ...
  });
});
```

### Rate Limit Tests

```typescript
import { mapApiError } from '@/lib/errors/errorMapper';

test('extracts rate limit info from 429 error', () => {
  const error = new ApiException('Too Many Requests', 'RATE_LIMIT', {
    retryAfter: 60,
    'x-ratelimit-limit': 10,
  }, 429);

  const mapped = mapApiError(error);

  expect(mapped.rateLimit).toEqual({
    retryAfter: 60,
    limit: 10,
  });
  expect(mapped.description).toContain('wait 1 minute');
});
```

---

## Conclusion

EPIC H provides comprehensive observability and security features:

- **H1**: Complete audit trail for compliance and debugging
- **H2**: User-friendly rate limit handling with countdown timers

These features work together to provide transparency, security, and a professional user experience even when limits are hit.
