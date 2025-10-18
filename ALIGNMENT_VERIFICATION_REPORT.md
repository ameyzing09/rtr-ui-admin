# Backend-Frontend API Alignment Verification Report
**Generated:** 2025-10-18
**Backend API Version:** 1.0

---

## Executive Summary

🔴 **CRITICAL MISALIGNMENTS FOUND** - Immediate action required

The frontend schemas and API integration have **critical mismatches** with the backend API documentation for both Jobs and Applications domains.

### Issues Summary:
- **Jobs Domain (Private API)**: ❌ Request/Response field naming mismatch (snake_case vs camelCase)
- **Applications Domain (Private API)**: ❌ Response field naming mismatch
- **Public APIs**: ✅ Correctly aligned

---

## 1. Jobs Domain (Private API) - `/job`

### ❌ CRITICAL ISSUE: Request Payload Mismatch

**Backend Expects (Per API Documentation):**
```json
{
  "title": "string",
  "description": "string",
  "location": "string",
  "department": "string",
  "isPublic": boolean,
  "publishAt": "ISO 8601",
  "expireAt": "ISO 8601",
  "externalApplyUrl": "URL",
  "extra": {}
}
```

**Frontend Sends (Current Implementation):**
```json
{
  "title": "string",
  "description": "string",
  "location": "string",
  "department": "string",
  "is_public": boolean,          // ❌ Should be isPublic
  "publish_at": "ISO 8601",      // ❌ Should be publishAt
  "expire_at": "ISO 8601",       // ❌ Should be expireAt
  "external_apply_url": "URL",   // ❌ Should be externalApplyUrl
  "extra": {}
}
```

**Source Files:**
- `src/domain/jobs/schemas.ts` (lines 93-96)
- `src/domain/jobs/service.ts` (lines 117-123)

### ❌ CRITICAL ISSUE: Response Payload Mismatch

**Backend Returns (Per API Documentation):**
```json
{
  "id": "UUID",
  "tenantId": "UUID",
  "title": "string",
  "isPublic": boolean,
  "publishAt": "ISO 8601",
  "expireAt": "ISO 8601",
  "externalApplyUrl": "URL",
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

**Frontend Expects (Current Schema):**
```typescript
{
  id: string,
  tenant_id: string,              // ❌ Backend returns tenantId
  is_public: boolean,             // ❌ Backend returns isPublic
  publish_at: Date,               // ❌ Backend returns publishAt
  expire_at: Date,                // ❌ Backend returns expireAt
  external_apply_url: string,     // ❌ Backend returns externalApplyUrl
  created_at: Date,               // ❌ Backend returns createdAt
  updated_at: Date                // ❌ Backend returns updatedAt
}
```

**Source Files:**
- `src/domain/jobs/schemas.ts` (lines 31-63)

### 🔧 Required Fixes for Jobs Domain

**File: `src/domain/jobs/schemas.ts`**

1. Update `jobSchema` to expect camelCase from backend:
```typescript
export const jobSchema = z.object({
  id: z.string(),
  tenantId: z.string(),  // Changed from tenant_id
  title: z.string(),
  department: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  requirements: z.string().nullable().optional(),
  attachments: z.array(z.string()).optional(),
  isPublic: z.boolean().default(true),  // Changed from is_public
  publishAt: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),  // Changed from publish_at
  expireAt: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),  // Changed from expire_at
  externalApplyUrl: z.string().url().nullable().optional(),  // Changed from external_apply_url
  status: jobStatusSchema,
  created_by: z.string().optional(),
  createdAt: z.string().transform((val) => new Date(val)),  // Changed from created_at
  updatedAt: z.string().transform((val) => new Date(val)),  // Changed from updated_at
  extra: z.record(z.string(), z.unknown()).optional(),
  application_count: z.number().int().optional(),  // Backend specific, keep as is
});
```

2. Update `createJobRequestSchema` to send camelCase to backend:
```typescript
export const createJobRequestSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(200),
  department: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  isPublic: z.boolean().default(true),  // Changed from is_public
  publishAt: z.date().nullable().optional(),  // Changed from publish_at
  expireAt: z.date().nullable().optional(),  // Changed from expire_at
  externalApplyUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),  // Changed from external_apply_url
  extra: z.record(z.string(), z.unknown()).optional(),
});
```

**File: `src/domain/jobs/service.ts`**

3. Update date transformation to use camelCase:
```typescript
async createJob(session: AuthSession, token: string, payload: CreateJobRequest): Promise<Job> {
  try {
    const apiPayload = {
      ...payload,
      publishAt: payload.publishAt ? payload.publishAt.toISOString() : null,  // Changed from publish_at
      expireAt: payload.expireAt ? payload.expireAt.toISOString() : null,  // Changed from expire_at
      openings: undefined,
    };

    const response = await fetcher.post(this.baseUrl, apiPayload, jobSchema);
    return response;
  } catch (error) {
    return this.handleError(error);
  }
}
```

---

## 2. Applications Domain (Private API) - `/applications`

### ✅ Request Payload: CORRECT

**Backend Expects:** camelCase (`jobId`, `applicantName`, `applicantEmail`, `applicantPhone`, `resumeUrl`, `coverLetter`)
**Frontend Sends:** camelCase ✅

**Source:** `src/domain/applications/schemas.ts` (lines 75-83)

### ❌ CRITICAL ISSUE: Response Payload Mismatch

**Backend Returns (Per API Documentation):**
```json
{
  "id": "UUID",
  "tenantId": "UUID",
  "jobId": "UUID",
  "applicantName": "string",
  "applicantEmail": "string",
  "applicantPhone": "string",
  "resumeUrl": "URL",
  "coverLetter": "string",
  "status": "PENDING",
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

**Frontend Expects (Current Schema):**
```typescript
{
  id: string,
  tenantId: string,           // ✅ Correct
  job_id: string,             // ❌ Backend returns jobId
  applicant_name: string,     // ❌ Backend returns applicantName
  applicant_email: string,    // ❌ Backend returns applicantEmail
  applicant_phone: string,    // ❌ Backend returns applicantPhone
  resume_url: string,         // ❌ Backend returns resumeUrl
  cover_letter: string,       // ❌ Backend returns coverLetter
  status: string,             // ✅ Correct
  created_at: Date,           // ❌ Backend returns createdAt
  updated_at: Date            // ❌ Backend returns updatedAt
}
```

**Source Files:**
- `src/domain/applications/schemas.ts` (lines 28-40)

### 🔧 Required Fixes for Applications Domain

**File: `src/domain/applications/schemas.ts`**

1. Update `applicationApiResponseSchema` to expect camelCase from backend:
```typescript
const applicationApiResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  jobId: z.string().uuid(),  // Changed from job_id
  applicantName: z.string(),  // Changed from applicant_name
  applicantEmail: z.string().email(),  // Changed from applicant_email
  applicantPhone: z.string(),  // Changed from applicant_phone
  resumeUrl: z.string().url(),  // Changed from resume_url
  coverLetter: z.string().nullable(),  // Changed from cover_letter
  status: applicationStatusSchema,
  createdAt: z.coerce.date(),  // Changed from created_at
  updatedAt: z.coerce.date(),  // Changed from updated_at
});
```

2. Update transformation (no longer needed since both are camelCase):
```typescript
export const applicationSchema = applicationApiResponseSchema.transform((data) => ({
  id: data.id,
  tenantId: data.tenantId,
  jobId: data.jobId,  // No transformation needed
  applicantName: data.applicantName,  // No transformation needed
  applicantEmail: data.applicantEmail,  // No transformation needed
  applicantPhone: data.applicantPhone,  // No transformation needed
  resumeUrl: data.resumeUrl,  // No transformation needed
  coverLetter: data.coverLetter,  // No transformation needed
  status: data.status,
  createdAt: data.createdAt,  // No transformation needed
  updatedAt: data.updatedAt,  // No transformation needed
}));

// Or simply:
export const applicationSchema = applicationApiResponseSchema;
export type Application = z.infer<typeof applicationSchema>;
```

---

## 3. Public Job APIs - `/public/jobs`

### ✅ CORRECT IMPLEMENTATION

**Backend Returns (Per API Documentation):**
```json
{
  "id": "UUID",
  "title": "string",
  "department": "string",
  "location": "string",
  "description_excerpt": "string",
  "publish_at": "ISO 8601",
  "updated_at": "ISO 8601",
  "extra": {}
}
```

**Frontend Expects:**
```typescript
{
  id: string,
  title: string,
  department: string,
  location: string,
  description_excerpt: string,  // ✅ Correct snake_case
  publish_at: Date,              // ✅ Correct snake_case
  updated_at: Date,              // ✅ Correct snake_case
  extra: Record<string, unknown>
}
```

**Source:** `src/domain/public/schemas.ts` ✅ No changes needed

---

## 4. Public Application API - `/public/applications`

### ✅ CORRECT IMPLEMENTATION

**Backend Expects (Per API Documentation):**
```json
{
  "job_id": "UUID",
  "applicant_name": "string",
  "applicant_email": "string",
  "applicant_phone": "string",
  "resume_url": "URL",
  "cover_letter": "string",
  "captcha_token": "string"
}
```

**Frontend Sends:**
```typescript
{
  job_id: string,           // ✅ Correct snake_case
  applicant_name: string,   // ✅ Correct snake_case
  applicant_email: string,  // ✅ Correct snake_case
  applicant_phone: string,  // ✅ Correct snake_case
  resume_url: string,       // ✅ Correct snake_case
  cover_letter: string,     // ✅ Correct snake_case
  captcha_token: string     // ✅ Correct snake_case
}
```

**Source:** `src/domain/public/schemas.ts` ✅ No changes needed

---

## 5. Additional Findings

### ⚠️ Missing Fields

**Jobs Domain:**
- Backend API documentation shows `status` field in response (lines 353, 358)
- Frontend schema includes `status` ✅

**Applications Domain:**
- Frontend includes `tenantId` in response schema
- Backend API documentation shows `tenantId` in response ✅

### ⚠️ Client-Side Only Fields

**Jobs Domain:**
- `openings`: Frontend-only field (not sent to backend) ✅ Handled correctly in service
- `requirements`: Frontend includes this but API doc doesn't mention it ⚠️
- `attachments`: Frontend includes this but API doc doesn't mention it ⚠️
- `created_by`: Frontend includes this but API doc doesn't mention it ⚠️

---

## 6. Validation Rules Alignment

### Jobs Domain

| Rule | Backend | Frontend | Status |
|------|---------|----------|--------|
| `title` required | ✅ | ✅ | ✅ Aligned |
| `expireAt` > `publishAt` | ✅ | ✅ | ✅ Aligned (line 100-112) |
| `externalApplyUrl` valid URL | ✅ | ✅ | ✅ Aligned |
| `extra` validated by tenant schema | ✅ | Deferred to backend | ✅ Aligned (EPIC E) |

### Applications Domain

| Rule | Backend | Frontend | Status |
|------|---------|----------|--------|
| `jobId` UUID | ✅ | ✅ | ✅ Aligned |
| `applicantName` required | ✅ | ✅ | ✅ Aligned |
| `applicantEmail` email format | ✅ | ✅ | ✅ Aligned |
| `applicantPhone` required | ✅ | ✅ | ✅ Aligned |
| `resumeUrl` required (private) | ✅ | ✅ | ✅ Aligned |
| `resumeUrl` optional (public) | ✅ | ✅ | ✅ Aligned |

---

## 7. Error Handling Alignment

### ✅ Error Response Format

**Backend Returns:**
```json
{
  "statusCode": 400,
  "message": ["error1", "error2"] or "single error",
  "error": "Bad Request"
}
```

**Frontend Handles:**
- Single error messages ✅
- Array error messages ✅ (EPIC E implementation)
- Field-level error parsing ✅ (parseValidationErrors in job.ts)

---

## 8. Status Enums Alignment

### Jobs - Status Enum

| Backend | Frontend | Status |
|---------|----------|--------|
| Not specified in API doc | DRAFT, PUBLISHED, EXPIRED, ARCHIVED, CLOSED | ⚠️ Frontend defined, backend not documented |

### Applications - Status Enum

| Backend | Frontend | Status |
|---------|----------|--------|
| PENDING | PENDING | ✅ |
| REVIEWED | REVIEWED | ✅ |
| REJECTED | REJECTED | ✅ |
| HIRED | HIRED | ✅ |

---

## 9. Summary of Required Changes

### Priority 1: CRITICAL (Breaking Issues)

1. **Jobs Request Schema** (`src/domain/jobs/schemas.ts`)
   - Change `is_public` → `isPublic`
   - Change `publish_at` → `publishAt`
   - Change `expire_at` → `expireAt`
   - Change `external_apply_url` → `externalApplyUrl`

2. **Jobs Response Schema** (`src/domain/jobs/schemas.ts`)
   - Change all snake_case fields to camelCase to match backend response

3. **Jobs Service** (`src/domain/jobs/service.ts`)
   - Update date field names in createJob and updateJob methods

4. **Applications Response Schema** (`src/domain/applications/schemas.ts`)
   - Change all snake_case fields to camelCase to match backend response

### Priority 2: Verification Needed

1. Verify if backend actually supports `requirements`, `attachments`, `created_by` fields for jobs
2. Verify if `status` field is returned for all job endpoints
3. Verify job status enum values with backend team

---

## 10. Testing Recommendations

After implementing fixes:

1. **Jobs Domain Tests:**
   - Test job creation with all fields
   - Test job update with partial fields
   - Test date field serialization (publishAt, expireAt)
   - Test custom fields (extra) validation errors
   - Test job list filtering and pagination

2. **Applications Domain Tests:**
   - Test application creation (private endpoint)
   - Test application update (status changes)
   - Test public application submission
   - Test application list filtering by jobId

3. **Integration Tests:**
   - End-to-end job creation and publishing flow
   - End-to-end application submission flow
   - Error handling for validation failures
   - CAPTCHA integration testing

---

## 11. Backward Compatibility Notes

⚠️ **BREAKING CHANGES WARNING**

The required changes to align with backend API will be **breaking changes** if:
- The frontend is already deployed and communicating with the backend
- The backend is actually using different field names than documented

**Recommended Approach:**
1. Verify actual backend API behavior with real API calls
2. If backend differs from documentation, update documentation first
3. Create migration strategy if needed
4. Deploy frontend and backend changes simultaneously

---

## Conclusion

The frontend implementation has **critical misalignments** with the backend API documentation for private endpoints (Jobs and Applications domains). The public endpoints are correctly aligned.

**Action Required:**
1. ✅ Verify backend actually returns camelCase (not snake_case) for private endpoints
2. ⚠️ If backend matches documentation → Fix frontend schemas immediately
3. ⚠️ If backend differs from documentation → Update API documentation first

The misalignments will cause **runtime failures** when:
- Creating or updating jobs (request field names don't match)
- Parsing job responses (response field names don't match)
- Parsing application responses (response field names don't match)
