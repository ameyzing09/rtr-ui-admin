# Claude Development Guidelines

## Core Principles (Read This First)

### Correctness > Convenience

Never propose shortcuts that break architecture boundaries.

"It works locally" is not an argument.

### Explicit over implicit

Every API contract, token flow, and tenant boundary must be explicitly stated.

No hidden assumptions.

### Public ≠ Tenant-free

Public routes are unauthenticated, not unscoped.

Tenant resolution rules must be intentional and documented.

### Token authority beats headers

If a route accepts a public token, that token must be sufficient to resolve all required context.

Headers (Host, X-Tenant-ID) are secondary and optional unless explicitly required.

---

## Architecture Rules

### 1. Tenant Resolution

Claude must follow this hierarchy strictly:

**Public token (candidate_access_token)**
- If present, it is the source of truth.
- Must resolve tenant internally.
- Must NOT require Host or X-Tenant-ID.

**Subdomain (tenant.recrutr.in)**
- Used for public browsing (e.g. /careers, /jobs).
- Not required for token-based lookups.

**X-Tenant-ID header**
- Allowed only as a local-dev fallback.
- Must never be the only supported mechanism in production.

⚠️ **Invalid Design Pattern:**
If Claude proposes a design where token-based APIs require tenant headers → that proposal is invalid.

### 2. Public API Rules

**Public APIs:**
- Must never leak internal IDs, tenant slugs, hostnames, or infrastructure details.
- Must return candidate-facing language only.

**Errors:**
- 404 → "Application not found"
- Never expose "tenant not found", hostnames, or DB errors.

**Zod schemas:**
- Must match API responses exactly.
- If a backend field exists but is stripped by Zod, Claude must flag it.

---

## UI Rules (Next.js)

### Server Components by default

Client components only for interactivity or error boundaries.

### Public pages

- Must work without authentication.
- Must not depend on admin-only APIs.

### Status pages

`/careers/application/[token]` must:
- Work with token alone
- Not require tenant headers
- Not fetch unrelated tenant data

### Error handling

- 404 → inline "Application not found"
- Network/500 → error.tsx boundary only

---

## Cypress / E2E Testing Rules

### 1. Test Scope Separation (MANDATORY)

Claude must never mix these in a single spec:

**A. Tenant/Admin-dependent tests**

Examples:
- Job creation
- Publishing jobs
- Applying to jobs

These require:
- Admin auth
- Tenant context
- Setup/teardown

**B. Token-only public tests**

Examples:
- Application status lookup
- Invalid token handling

These must:
- Avoid admin login
- Avoid job creation
- Use pre-generated or API-created tokens

⚠️ **Test Smell:**
If Claude writes a test that logs in as admin to test a token lookup → that is a test smell and must be refactored.

### 2. Cypress Rules

- `before()` hooks must be minimal
- No global state leakage between tests
- Tokens may be:
  - Stored in `Cypress.env`
  - Returned via API helper
- Tests must fail for the right reason, not because setup broke

---

## API Client Rules

- URL construction must never override base paths unintentionally.
- `new URL()` usage must preserve base paths.
- Claude must double-check URL resolution logic when touching API clients.

---

## Backward Compatibility Rules

### This project is not live

Claude must default to:
- Removing deprecated endpoints
- Cleaning contracts
- Single clear entry points

Backward compatibility is only preserved if explicitly requested.

---

## What Claude Must NOT Do

- ❌ Do not invent infra constraints ("this won't work on prod") without proof.
- ❌ Do not keep broken abstractions "for now".
- ❌ Do not over-generalize future needs.
- ❌ Do not merge UI, backend, and test logic into one step.

---

## Decision-Making Rule

If Claude is unsure between multiple valid approaches:

1. List options briefly
2. Pick one
3. Justify it based on:
   - Architecture
   - Future maintainability
   - Testability

No endless option lists. No indecision.

---

## Final Rule (Most Important)

If something feels confusing:

**It is probably an architecture boundary violation**

Claude must identify the boundary and fix the design, not patch around it.
## UI–Backend Contract Rules (Strict)

## 🚫 Rule: Client Components MUST NOT call Server Actions directly

**Forbidden:**

Client components (`'use client'`) must never:

- Import from `@/lib/actions/*`
- Call server actions like:
  - `getAvailableActionsAction`
  - `executeActionAction`
  - `getMyPendingInterviewsAction`
- Call any function defined with `'use server'`
- Rely on implicit cookie/session forwarding via server actions
- Use server-only logic inside drag handlers, event handlers, or effects

**Incorrect pattern:**

```js
// ❌ WRONG — inside 'use client'
import { getAvailableActionsAction } from '@/lib/actions/tracking';
const result = await getAvailableActionsAction(applicationId);
```

**Required pattern:**

Client components must call HTTP services only, never server actions.

All client-side API calls must go through:

- Domain services (e.g. `trackingService`, `interviewService`, `evaluationService`)
- Or authenticated fetch wrapper (`createAuthenticatedFetcher`)
- Or a typed client API layer

```js
// ✅ CORRECT — inside 'use client'
import { trackingService } from '@/domain/tracking/service';
const result = await trackingService.getAvailableActions(applicationId);
```

### Why This Rule Exists

**1️⃣ Architectural Separation**

- Server Actions = SSR / RSC boundary
- Client Components = browser runtime
- Mixing them couples drag handlers to server RPC, breaks testability, breaks edge/runtime separation, and causes hidden auth/session issues

**2️⃣ Performance**

- Server actions introduce unnecessary RSC boundary hops, latency during UI events, and hard-to-debug hydration inconsistencies
- Client UI events must use direct HTTP calls

**3️⃣ Testability**

- Cypress can intercept HTTP requests, but not reliably intercept server action RPC calls
- Using HTTP services ensures deterministic tests, clean mocking, and proper API visibility

### Enforcement Rule

If a file contains:

```js
'use client'
```

Then it must **NOT** import anything from:

```js
@/lib/actions/*
```

This is a strict architectural boundary.

#### Allowed Usage of Server Actions

Server actions are allowed only in:

- Server Components
- Route handlers
- Forms using `action={someServerAction}`
- SSR data loading in `page.tsx`

Never in:

- Drag handlers
- onClick
- onDrop
- useEffect
- useCallback
- Any interactive client logic

### 1. Zero Assumptions Rule
UI code MUST NOT assume:
- API endpoints
- request/response shapes
- field names
- enums / status values
- pagination formats
- error shapes

If the data contract is not explicitly found in the repo, it is considered **unknown**.

---

### 2. Mandatory Repo Search First
Before writing UI logic that depends on backend data, you MUST search the repo for:
- API route handlers (e.g. `/api`, `server actions`, `handlers`)
- Service/domain files
- Existing types or schemas
- Cypress tests or fixtures
- README / ADR / comments

If nothing authoritative is found:
→ STOP UI implementation
→ Ask explicitly for the API contract

---

### 3. Explicit Contract Request Protocol
When a contract is missing or ambiguous, ask **only concrete questions**, for example:

- What is the exact endpoint?
- HTTP method?
- Request body?
- Response JSON shape?
- Required vs optional fields?
- Possible error responses?
- Auth required or token-based?
- Tenant resolution method?

Never “guess and adjust later”.

---

### 4. No Fake Types
UI MUST NOT:
- invent TypeScript interfaces
- hardcode enums
- infer status values
- mock shapes that don’t exist

If backend types are missing:
- request them
- or derive them directly from backend schemas

---

### 5. Read-Only First Principle
For new UI screens:
- Start with **read-only rendering**
- No optimistic updates
- No inferred transitions

Mutations are added only after the exact action contract is verified.

---

### 6. Token vs Tenant Awareness
UI must explicitly respect authority boundaries:

- Tenant-authoritative pages:
  - Admin dashboards
  - Careers listing
  - Job details
- Token-authoritative pages:
  - Candidate application status

Never mix these contexts implicitly.

---

### 7. Error Handling Discipline
UI error states must:
- Reflect real backend error cases
- Not invent copy or logic
- Handle:
  - 404 (not found)
  - 400 (invalid token/input)
  - 500 (unexpected failure)

If backend error behavior is unclear → ask.

---

### 8. Cypress Alignment Rule
If a UI flow is covered by Cypress:
- UI logic must align with test assumptions
- Tests are treated as a **contract**
- UI changes that break tests require explicit justification

---

### 9. No Silent Fallbacks
UI must NOT:
- silently hide missing fields
- fallback to defaults without backend confirmation
- “best guess” status/stage names

Missing data must surface clearly (loading / empty / error state).

---

### 10. If Unsure — Ask, Don’t Build
When in doubt:
- Do NOT implement partial UI
- Do NOT stub fake APIs
- Ask for clarification with repo evidence

Correctness > speed.

#### Future Guardrail (Optional)

Add ESLint rule:

```json
{
  "no-restricted-imports": [
    "error",
    {
      "patterns": [
        {
          "group": ["@/lib/actions/*"],
          "message": "Server actions cannot be imported inside client components."
        }
      ]
    }
  ]
}
```

This prevents accidental violations.

**🔥 Architectural Principle**

Server Actions are for server orchestration.
Client Components talk to APIs.
Never cross that boundary.

These rules apply to **all UI work** (pages, components, hooks, server actions, tests).

