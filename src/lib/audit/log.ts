/**
 * Audit Logging System
 *
 * Tracks important user actions for security, compliance, and debugging.
 * All audit events should be sent to the backend for persistent storage.
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Audit event types
 */
export type AuditEventType =
  // Authentication
  | 'auth.login'
  | 'auth.logout'
  | 'auth.failed_login'
  | 'auth.password_change'
  | 'auth.password_reset'

  // Tenant Management (Superadmin)
  | 'tenant.create'
  | 'tenant.read'
  | 'tenant.update'
  | 'tenant.delete'
  | 'tenant.suspend'
  | 'tenant.resume'
  | 'tenant.terminate'
  | 'tenant.status_retry'
  | 'tenant.impersonate_start'
  | 'tenant.impersonate_stop'

  // System Management (Superadmin)
  | 'sys.user.create'
  | 'sys.user.update'
  | 'sys.user.delete'
  | 'sys.health.view'
  | 'sys.analytics.view'

  // Settings (Superadmin)
  | 'settings.global.update'
  | 'settings.security.update'
  | 'settings.db.update'

  // Tenant Settings
  | 'settings.tenant.update'
  | 'settings.billing.update'
  | 'settings.integrations.update'

  // Team Management
  | 'member.invite'
  | 'member.remove'
  | 'member.role_change'

  // Job Management
  | 'job.create'
  | 'job.update'
  | 'job.delete'
  | 'job.publish'
  | 'job.unpublish'

  // Application Management
  | 'application.create'
  | 'application.update'
  | 'application.delete'
  | 'application.status_change'

  // Pipeline Management
  | 'pipeline.create'
  | 'pipeline.update'
  | 'pipeline.delete'
  | 'pipeline.stage_change'
  | 'pipeline.assign'
  | 'pipeline.list'
  | 'pipeline.view'

  // Interview Management
  | 'interview.schedule'
  | 'interview.reschedule'
  | 'interview.cancel'
  | 'interview.feedback_submit'

  // Subscription Management
  | 'subscription.create'
  | 'subscription.update'
  | 'subscription.cancel'
  | 'subscription.renew'

  // Data Access
  | 'data.export'
  | 'data.import'
  | 'data.delete';

/**
 * Audit event metadata
 */
export interface AuditEventMetadata {
  // Actor information
  actorId: string;
  actorEmail?: string;
  actorRole: string;

  // Tenant context (if applicable)
  tenantId?: string;

  // Target resource
  targetId?: string;
  targetType?: string;

  // Action details
  action: AuditEventType;
  status: 'success' | 'failure' | 'partial';

  // Request context
  ip?: string;
  userAgent?: string;
  requestId?: string;

  // Additional data
  details?: Record<string, unknown>;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };

  // Timestamps
  timestamp: string;
}

/**
 * Audit event for backend API
 */
export interface AuditEvent extends AuditEventMetadata {
  id?: string;
  correlationId?: string;
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Whether audit logging is enabled
 */
const AUDIT_ENABLED = process.env.NEXT_PUBLIC_AUDIT_ENABLED !== 'false';

/**
 * Backend endpoint for audit logs
 */
const AUDIT_ENDPOINT = '/api/audit/events';

/**
 * Whether to log audit events to console (for debugging)
 */
const LOG_TO_CONSOLE = process.env.NODE_ENV === 'development';

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Create an audit event
 *
 * @param action - The action being audited
 * @param metadata - Additional metadata about the event
 * @returns The audit event object
 */
export function createAuditEvent(
  action: AuditEventType,
  metadata: Partial<AuditEventMetadata>
): AuditEvent {
  return {
    action,
    timestamp: new Date().toISOString(),
    status: 'success',
    ...metadata,
  } as AuditEvent;
}

/**
 * Log an audit event
 * Sends the event to the backend for persistent storage
 *
 * @param action - The action being audited
 * @param metadata - Additional metadata about the event
 */
export async function audit(
  action: AuditEventType,
  metadata: Partial<Omit<AuditEventMetadata, 'action' | 'timestamp'>>
): Promise<void> {
  if (!AUDIT_ENABLED) {
    return;
  }

  const event = createAuditEvent(action, metadata);

  // Log to console in development
  if (LOG_TO_CONSOLE) {
    console.log('[AUDIT]', {
      action: event.action,
      actorId: event.actorId,
      tenantId: event.tenantId,
      status: event.status,
      targetId: event.targetId,
      details: event.details,
    });
  }

  // Send to backend (fire and forget - don't block on audit logging)
  try {
    // TODO: COMPLIANCE REQUIREMENT - Implement audit event persistence
    //
    // Current implementation queues events in memory but never persists them.
    // This violates audit logging requirements for security and compliance.
    //
    // REQUIRED BACKEND IMPLEMENTATION:
    // 1. Create audit logging API endpoint (POST /api/audit/events)
    // 2. Endpoint should accept AuditEvent payload
    // 3. Store events in persistent storage (database, log aggregation service)
    // 4. Return 201 Created on success, 500 on failure
    //
    // FRONTEND IMPLEMENTATION:
    // Uncomment and configure the fetch call below:
    //
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${AUDIT_ENDPOINT}`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${authToken}`, // Get from session
    //   },
    //   body: JSON.stringify(event),
    // });
    //
    // if (!response.ok) {
    //   throw new Error(`Audit API error: ${response.status}`);
    // }
    //
    // ALTERNATIVE: Use batch endpoint for better performance
    // - See flushAuditQueue() below for batch implementation
    //
    // Until implemented, audit events are lost on page refresh/navigation.

    // For now, just queue it (you can implement a queue/batch system)
    queueAuditEvent(event);
  } catch (error) {
    // Don't throw - audit logging should never break the app
    console.error('Failed to send audit event:', error);
  }
}

/**
 * Queue audit events for batch sending
 * Prevents too many individual requests
 */
const auditQueue: AuditEvent[] = [];
let flushTimer: NodeJS.Timeout | null = null;

function queueAuditEvent(event: AuditEvent): void {
  auditQueue.push(event);

  // Flush queue after 5 seconds or when it reaches 10 events
  if (auditQueue.length >= 10) {
    flushAuditQueue();
  } else if (!flushTimer) {
    flushTimer = setTimeout(flushAuditQueue, 5000);
  }
}

async function flushAuditQueue(): Promise<void> {
  if (auditQueue.length === 0) {
    return;
  }

  const events = auditQueue.splice(0);
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  try {
    // TODO: COMPLIANCE REQUIREMENT - Implement batch audit event persistence
    //
    // BACKEND ENDPOINT: POST /api/audit/events/batch
    // Request body: { events: AuditEvent[] }
    // Response: 201 Created with { success: true, count: number }
    //
    // IMPLEMENTATION:
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${AUDIT_ENDPOINT}/batch`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${authToken}`, // Get from session
    //   },
    //   body: JSON.stringify({ events }),
    // });
    //
    // if (!response.ok) {
    //   throw new Error(`Audit batch API error: ${response.status}`);
    // }
    //
    // RETRY STRATEGY:
    // - On failure, events are put back in queue (already implemented below)
    // - Consider exponential backoff for retry attempts
    // - Consider maximum retry limit to prevent memory issues

    if (LOG_TO_CONSOLE) {
      console.log(`[AUDIT] Flushed ${events.length} events`);
    }
  } catch (error) {
    console.error('Failed to flush audit queue:', error);
    // Put events back in queue to retry
    auditQueue.unshift(...events);
  }
}

// ============================================================================
// Convenience Functions for Common Actions
// ============================================================================

/**
 * Audit a tenant creation
 */
export function auditTenantCreate(
  actorId: string,
  actorRole: string,
  tenantId: string,
  details?: Record<string, unknown>
): Promise<void> {
  return audit('tenant.create', {
    actorId,
    actorRole,
    targetId: tenantId,
    targetType: 'tenant',
    details,
  });
}

/**
 * Audit a tenant update
 */
export function auditTenantUpdate(
  actorId: string,
  actorRole: string,
  tenantId: string,
  changes?: { before?: Record<string, unknown>; after?: Record<string, unknown> }
): Promise<void> {
  return audit('tenant.update', {
    actorId,
    actorRole,
    targetId: tenantId,
    targetType: 'tenant',
    changes,
  });
}

/**
 * Audit tenant impersonation
 */
export function auditTenantImpersonate(
  actorId: string,
  actorRole: string,
  tenantId: string,
  targetUserId: string
): Promise<void> {
  return audit('tenant.impersonate_start', {
    actorId,
    actorRole,
    tenantId,
    targetId: targetUserId,
    targetType: 'user',
  });
}

/**
 * Audit settings change
 */
export function auditSettingsChange(
  actorId: string,
  actorRole: string,
  settingsType: 'global' | 'security' | 'db' | 'tenant' | 'billing',
  tenantId?: string,
  changes?: { before?: Record<string, unknown>; after?: Record<string, unknown> }
): Promise<void> {
  // Type-safe mapping without type assertion
  const actionMap: Record<typeof settingsType, AuditEventType> = {
    'global': 'settings.global.update',
    'security': 'settings.security.update',
    'db': 'settings.db.update',
    'tenant': 'settings.tenant.update',
    'billing': 'settings.billing.update',
  };

  const action = actionMap[settingsType];

  return audit(action, {
    actorId,
    actorRole,
    tenantId,
    changes,
  });
}

/**
 * Audit member invite
 */
export function auditMemberInvite(
  actorId: string,
  actorRole: string,
  tenantId: string,
  invitedEmail: string,
  invitedRole: string
): Promise<void> {
  return audit('member.invite', {
    actorId,
    actorRole,
    tenantId,
    details: {
      invitedEmail,
      invitedRole,
    },
  });
}

/**
 * Audit failed action
 */
export function auditFailure(
  action: AuditEventType,
  actorId: string,
  actorRole: string,
  error: string,
  tenantId?: string
): Promise<void> {
  return audit(action, {
    actorId,
    actorRole,
    tenantId,
    status: 'failure',
    details: { error },
  });
}

// Export types and constants
export { AUDIT_ENABLED, AUDIT_ENDPOINT, LOG_TO_CONSOLE };
