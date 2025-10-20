# EPIC F — Error Handling & UX

This document provides implementation details and usage examples for EPIC F: Error Handling & UX improvements.

## Table of Contents

- [F1. Unified Error Mapper](#f1-unified-error-mapper)
- [F2. Loading/Skeletons/Empty States](#f2-loadingskeletonsempty-states)
- [F3. Date Handling](#f3-date-handling)
- [Usage Examples](#usage-examples)

---

## F1. Unified Error Mapper

Maps API error format `{ statusCode, message, error }` to UI toasts + field errors.

### Files

- `src/lib/errors/errorMapper.ts` - Core error mapping logic
- `src/lib/errors/useErrorHandler.ts` - React hook for error handling

### Features

✅ Maps HTTP status codes to user-friendly messages
✅ Extracts field errors for form validation
✅ Determines if errors are retryable
✅ Handles multiple backend error formats
✅ Provides authentication error detection

### Usage

#### Basic Error Handling

```typescript
import { useErrorHandler } from '@/lib/errors/useErrorHandler';

function MyComponent() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const handleError = useErrorHandler({
    onFieldErrors: setFieldErrors,
    redirectOnAuthError: true,
  });

  const submitForm = async (data) => {
    try {
      await createJob(data);
      toast({ title: 'Success!', variant: 'success' });
    } catch (error) {
      handleError(error, 'Failed to create job');
    }
  };
}
```

#### With Retry Action

```typescript
const handleError = useErrorHandler({
  onFieldErrors: setFieldErrors,
  onRetry: () => submitForm(),
});

try {
  await updateJob(id, data);
} catch (error) {
  // Shows toast with "Retry" button for transient errors
  handleError(error);
}
```

#### Using the Error Mapper Directly

```typescript
import { mapApiError } from '@/lib/errors/errorMapper';

try {
  await someOperation();
} catch (error) {
  const mapped = mapApiError(error);

  // mapped.title - Error title
  // mapped.description - Error description
  // mapped.fieldErrors - Form field errors
  // mapped.retryable - Whether error is retryable
  // mapped.variant - Toast variant (error/warning/info)
}
```

### Error Code Messages

The error mapper provides user-friendly messages for common error codes:

```typescript
INVALID_CREDENTIALS → "Invalid email or password"
TOKEN_EXPIRED → "Your session has expired. Please sign in again."
UNAUTHORIZED → "You are not authorized to perform this action"
JOB_NOT_FOUND → "The requested job could not be found"
// ... and more
```

---

## F2. Loading/Skeletons/Empty States

Lists, details, and forms have skeletons; retry CTA on transient failures.

### Files

- `src/components/shared/LoadingStates.tsx` - Skeleton components
- `src/components/shared/ErrorState.tsx` - Error state components
- `src/components/ui/Skeleton.tsx` - Base skeleton component

### Skeleton Components

#### Job List Skeleton

```typescript
import { JobListSkeleton } from '@/components/shared/LoadingStates';

function JobListPage() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <JobListSkeleton count={5} />;
  }

  return <JobList />;
}
```

#### Job Detail Skeleton

```typescript
import { JobDetailSkeleton } from '@/components/shared/LoadingStates';

if (loading) return <JobDetailSkeleton />;
```

#### Form Wizard Skeleton

```typescript
import { FormWizardSkeleton } from '@/components/shared/LoadingStates';

if (loading) return <FormWizardSkeleton />;
```

#### Application Table Skeleton

```typescript
import { ApplicationTableSkeleton } from '@/components/shared/LoadingStates';

if (loading) return <ApplicationTableSkeleton rows={10} />;
```

#### Dashboard Skeleton

```typescript
import { DashboardSkeleton } from '@/components/shared/LoadingStates';

if (loading) return <DashboardSkeleton />;
```

### Error State Components

#### Generic Error with Retry

```typescript
import { ErrorState } from '@/components/shared/ErrorState';

<ErrorState
  title="Failed to load data"
  description="An error occurred while loading the data."
  onRetry={() => refetch()}
  variant="card"
/>
```

#### Network Error

```typescript
import { NetworkErrorState } from '@/components/shared/ErrorState';

<NetworkErrorState onRetry={() => refetch()} />
```

#### Not Found

```typescript
import { NotFoundState } from '@/components/shared/ErrorState';

<NotFoundState
  resourceName="Job"
  onGoBack={() => router.push('/dashboard/jobs')}
/>
```

#### Permission Denied

```typescript
import { PermissionDeniedState } from '@/components/shared/ErrorState';

<PermissionDeniedState action="edit this job" />
```

### Empty State

```typescript
import { EmptyState } from '@/components/shared/ErrorState';
import { Briefcase } from 'lucide-react';

<EmptyState
  title="No jobs yet"
  description="Get started by creating your first job posting"
  icon={Briefcase}
  action={{
    label: 'Create Job',
    onClick: () => router.push('/dashboard/jobs/create'),
  }}
  variant="card"
/>
```

---

## F3. Date Handling

Display ISO with locale formatting; ensure `expireAt > publishAt` client check mirrors server.

### Files

- `src/lib/utils/dateHelpers.ts` - Date formatting and validation utilities

### Features

✅ Locale-aware date formatting
✅ Relative date formatting ("2 hours ago", "in 3 days")
✅ Date range formatting
✅ datetime-local input conversion
✅ Client-side validation that mirrors server logic

### Usage

#### Format Dates for Display

```typescript
import { formatDate } from '@/lib/utils/dateHelpers';

// Full format: "January 15, 2024 at 10:30 AM"
formatDate(job.createdAt, 'full');

// Long format: "January 15, 2024"
formatDate(job.publishAt, 'long');

// Medium format: "Jan 15, 2024" (default)
formatDate(job.expireAt, 'medium');

// Short format: "1/15/24"
formatDate(job.createdAt, 'short');

// Time only: "10:30 AM"
formatDate(new Date(), 'time');

// Date and time: "Jan 15, 2024, 10:30 AM"
formatDate(job.createdAt, 'datetime');

// Relative: "2 hours ago", "in 3 days"
formatDate(job.createdAt, 'relative');

// ISO: "2024-01-15T10:30:00.000Z"
formatDate(job.createdAt, 'iso');
```

#### Relative Dates

```typescript
import { formatRelativeDate } from '@/lib/utils/dateHelpers';

// "just now", "2 hours ago", "in 3 days", "yesterday", etc.
const relativeTime = formatRelativeDate(job.createdAt);
```

#### Date Range Formatting

```typescript
import { formatDateRange } from '@/lib/utils/dateHelpers';

// "Jan 1 - Jan 15, 2024"
formatDateRange(job.publishAt, job.expireAt, 'medium');
```

#### datetime-local Input Handling

```typescript
import { toDateTimeLocalString, fromDateTimeLocalString } from '@/lib/utils/dateHelpers';

// For input value: "2024-01-15T10:30"
const inputValue = toDateTimeLocalString(job.publishAt);

// Parse input value to Date
const handleChange = (e) => {
  const date = fromDateTimeLocalString(e.target.value);
  setPublishAt(date);
};
```

#### Validate Publish/Expire Dates

**Mirrors server-side validation:**

```typescript
import { validatePublishExpireDates } from '@/lib/utils/dateHelpers';

const validation = validatePublishExpireDates(publishAt, expireAt);

if (!validation.isValid) {
  setFieldError('expireAt', validation.error);
}
```

#### Date Utilities

```typescript
import { isPast, isFuture, isToday, addDays } from '@/lib/utils/dateHelpers';

// Check if date is in the past
if (isPast(job.expireAt)) {
  console.log('Job has expired');
}

// Check if date is in the future
if (isFuture(job.publishAt)) {
  console.log('Job is scheduled');
}

// Check if date is today
if (isToday(job.createdAt)) {
  console.log('Job was created today');
}

// Add days to a date
const nextWeek = addDays(new Date(), 7);
```

---

## Usage Examples

### Complete Form with Error Handling

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createJobAction } from '@/lib/actions/job';
import { useErrorHandler } from '@/lib/errors/useErrorHandler';
import { toast } from '@/components/ui/ToastProvider';
import { validatePublishExpireDates, toDateTimeLocalString } from '@/lib/utils/dateHelpers';
import { FormWizardSkeleton } from '@/components/shared/LoadingStates';
import { ErrorState } from '@/components/shared/ErrorState';

export function CreateJobForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleError = useErrorHandler({
    onFieldErrors: setFieldErrors,
    onRetry: () => handleSubmit(),
  });

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      // Client-side validation
      const validation = validatePublishExpireDates(formData.publishAt, formData.expireAt);
      if (!validation.isValid) {
        setFieldErrors({ expireAt: validation.error! });
        return;
      }

      // Submit
      const result = await createJobAction(formData);

      if (result.success) {
        toast({
          title: 'Job created successfully!',
          description: `${result.data.title} has been created.`,
          variant: 'success',
        });
        router.push(`/dashboard/jobs/${result.data.id}`);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err as Error);
      handleError(err, 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <FormWizardSkeleton />;
  if (error) return <ErrorState title="Error" description={error.message} onRetry={handleSubmit} />;

  return <form>{/* Form fields */}</form>;
}
```

### List with Loading and Empty States

```typescript
import { useState, useEffect } from 'react';
import { listJobsAction } from '@/lib/actions/job';
import { JobListSkeleton } from '@/components/shared/LoadingStates';
import { EmptyState, NetworkErrorState } from '@/components/shared/ErrorState';
import { Briefcase } from 'lucide-react';
import { formatDate } from '@/lib/utils/dateHelpers';

export function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await listJobsAction();
      if (result.success) {
        setJobs(result.data.jobs);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  if (loading) return <JobListSkeleton count={5} />;
  if (error) return <NetworkErrorState onRetry={fetchJobs} />;
  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No jobs yet"
        description="Get started by creating your first job posting"
        icon={Briefcase}
        action={{
          label: 'Create Job',
          onClick: () => router.push('/dashboard/jobs/create'),
        }}
      />
    );
  }

  return (
    <div>
      {jobs.map((job) => (
        <div key={job.id}>
          <h3>{job.title}</h3>
          <p>Created {formatDate(job.createdAt, 'relative')}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Validation Consistency

The client-side validation in `validatePublishExpireDates` **mirrors the server-side validation** to ensure consistency:

**Client (src/lib/utils/dateHelpers.ts:210-228)**
```typescript
if (expireAt <= publishAt) {
  return { isValid: false, error: 'Expiration date must be after publish date' };
}
```

**Server (from API documentation)**
```
expireAt must be after publishAt when both are set
```

This ensures users get immediate feedback without waiting for server response, while the server provides final validation.

---

## Error Flow

1. **API Error** → `ApiException` thrown by fetcher
2. **Error Mapper** → Converts to `MappedError` with:
   - User-friendly title/description
   - Field errors for forms
   - Retry flag for transient errors
3. **Toast Notification** → Shows error to user
4. **Field Errors** → Applied to form inputs
5. **Retry Action** → Optionally shows retry button

---

## Best Practices

### ✅ DO

- Use `useErrorHandler` for consistent error handling
- Show loading skeletons during data fetching
- Validate dates client-side before submission
- Provide retry actions for network/transient errors
- Use relative dates for recent timestamps
- Format dates consistently across the app

### ❌ DON'T

- Don't show raw error messages to users
- Don't ignore field errors from API
- Don't skip loading states for async operations
- Don't format dates inconsistently
- Don't forget to mirror server validation logic

---

## Testing

### Error Mapper
```typescript
import { mapApiError, isAuthError } from '@/lib/errors/errorMapper';

// Test API exception mapping
const error = new ApiException('Invalid request', 'VALIDATION_ERROR', { fields: {...} }, 400);
const mapped = mapApiError(error);
expect(mapped.title).toBe('Invalid Request');
expect(mapped.fieldErrors).toBeDefined();

// Test auth error detection
expect(isAuthError({ status: 401 })).toBe(true);
```

### Date Utilities
```typescript
import { validatePublishExpireDates, formatDate } from '@/lib/utils/dateHelpers';

// Test validation
const result = validatePublishExpireDates(
  new Date('2024-01-15'),
  new Date('2024-01-10')
);
expect(result.isValid).toBe(false);

// Test formatting
expect(formatDate(new Date('2024-01-15T10:30:00'), 'full')).toContain('January');
```

---

## Migration Guide

### Existing Code → New Error Handling

**Before:**
```typescript
try {
  await createJob(data);
} catch (error) {
  console.error(error);
  alert('Error creating job');
}
```

**After:**
```typescript
const handleError = useErrorHandler({ onFieldErrors: setFieldErrors });

try {
  await createJob(data);
} catch (error) {
  handleError(error, 'Failed to create job');
}
```

### Existing Loading → Skeletons

**Before:**
```typescript
if (loading) return <div>Loading...</div>;
```

**After:**
```typescript
import { JobListSkeleton } from '@/components/shared/LoadingStates';

if (loading) return <JobListSkeleton />;
```

---

## Conclusion

EPIC F provides a comprehensive error handling and UX improvement system:

- **F1**: Unified error mapping for consistent error handling
- **F2**: Loading skeletons and error states for better UX
- **F3**: Date utilities for consistent formatting and validation

All components work together to provide a polished, professional user experience with proper error handling, loading states, and date display.
