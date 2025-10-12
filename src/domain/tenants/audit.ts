import { audit } from '@/lib/audit/log';

/**
 * Audit logging for tenant operations
 *
 * These functions log important tenant-related events for compliance
 * and security monitoring.
 */

export function auditTenantCreate(
  userId: string,
  role: string,
  tenantId: string,
  metadata: {
    tenantName: string;
    domain: string;
    plan?: string;
  }
) {
  return audit('tenant.create', {
    actorId: userId,
    actorRole: role,
    targetId: tenantId,
    targetType: 'tenant',
    details: metadata,
  });
}

export function auditTenantUpdate(
  userId: string,
  role: string,
  tenantId: string,
  changes: Record<string, unknown>
) {
  return audit('tenant.update', {
    actorId: userId,
    actorRole: role,
    targetId: tenantId,
    targetType: 'tenant',
    changes,
  });
}

export function auditTenantDelete(
  userId: string,
  role: string,
  tenantId: string
) {
  return audit('tenant.delete', {
    actorId: userId,
    actorRole: role,
    targetId: tenantId,
    targetType: 'tenant',
  });
}

export function auditSubscriptionChange(
  userId: string,
  role: string,
  tenantId: string,
  action: 'activate' | 'suspend' | 'resume' | 'cancel',
  metadata?: Record<string, unknown>
) {
  // Map subscription actions to audit event types
  const actionMap = {
    activate: 'subscription.create',
    suspend: 'subscription.update',
    resume: 'subscription.renew',
    cancel: 'subscription.cancel',
  } as const;

  return audit(actionMap[action], {
    actorId: userId,
    actorRole: role,
    tenantId,
    targetId: tenantId,
    targetType: 'subscription',
    details: metadata,
  });
}
