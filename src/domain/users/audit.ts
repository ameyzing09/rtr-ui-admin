import { audit } from '@/lib/audit/log';

/**
 * User Management Audit Logging
 *
 * Logs all user management operations for security and compliance.
 * Uses existing audit event types from the centralized audit system.
 */

export async function auditPasswordReset(params: {
  actorId: string;
  actorRole: string;
  targetUserId: string;
  targetUserEmail: string;
  targetUserName: string;
  targetTenantId: string;
  tempPasswordGenerated: boolean;
  forceChangeRequired: boolean;
}) {
  return audit('auth.password_reset', {
    actorId: params.actorId,
    actorRole: params.actorRole,
    targetId: params.targetUserId,
    tenantId: params.targetTenantId,
    status: 'success',
    details: {
      targetUserEmail: params.targetUserEmail,
      targetUserName: params.targetUserName,
      tempPasswordGenerated: params.tempPasswordGenerated,
      forceChangeRequired: params.forceChangeRequired,
    },
  });
}

export async function auditPasswordResetFailed(params: {
  actorId: string;
  actorRole: string;
  targetUserId: string;
  targetTenantId?: string;
  reason: string;
}) {
  return audit('auth.password_reset', {
    actorId: params.actorId,
    actorRole: params.actorRole,
    targetId: params.targetUserId,
    tenantId: params.targetTenantId,
    status: 'failure',
    details: {
      failureReason: params.reason,
    },
  });
}

export async function auditPasswordChanged(params: {
  actorId: string;
  actorRole: string;
  tenantId?: string;
  reason?: 'forced_change' | 'user_requested' | 'superadmin_reset';
}) {
  return audit('auth.password_change', {
    actorId: params.actorId,
    actorRole: params.actorRole,
    tenantId: params.tenantId,
    status: 'success',
    details: {
      changeReason: params.reason || 'user_requested',
    },
  });
}

export async function auditPasswordChangeFailed(params: {
  actorId: string;
  actorRole: string;
  tenantId?: string;
  reason: string;
}) {
  return audit('auth.password_change', {
    actorId: params.actorId,
    actorRole: params.actorRole,
    tenantId: params.tenantId,
    status: 'failure',
    details: {
      failureReason: params.reason,
    },
  });
}

export async function auditUserUpdated(params: {
  actorId: string;
  actorRole: string;
  targetUserId: string;
  targetUserEmail: string;
  targetTenantId: string;
  changes: Record<string, unknown>;
}) {
  return audit('sys.user.update', {
    actorId: params.actorId,
    actorRole: params.actorRole,
    targetId: params.targetUserId,
    tenantId: params.targetTenantId,
    status: 'success',
    details: {
      targetUserEmail: params.targetUserEmail,
      changes: params.changes,
    },
  });
}
