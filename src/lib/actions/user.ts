'use server';

import { userService } from '@/domain/users/service';
import {
  type ListUsersParams,
  type ResetPasswordRequest,
  type ChangePasswordRequest,
  type UserListResponse,
  type UserDetailResponse,
  type ResetPasswordResponse,
} from '@/domain/users/schemas';
import { requireSuperadmin, requireAuth } from '@/lib/rbac/guard.server';
import { audit } from '@/lib/audit/log';
import { classifyError, getContextualErrorMessage } from '@/lib/errors/errorHandler';

export type ActionResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      userMessage: string;
      code?: string;
    };

/**
 * List all users across tenants (superadmin only)
 */
export async function listUsersAction(
  params: ListUsersParams
): Promise<ActionResult<UserListResponse>> {
  console.log('[Server Action listUsersAction] Received params:', JSON.stringify(params));
  console.log('[Server Action listUsersAction] params.tenant_id:', params.tenant_id, typeof params.tenant_id);
  console.log('[Server Action listUsersAction] params.search:', params.search, typeof params.search);

  try {
    // Require superadmin role
    const session = await requireSuperadmin();

    // Audit log
    audit('sys.user.update', {
      actorId: session.userId,
      actorRole: session.role,
      status: 'success',
      details: { action: 'list_users', params },
    }).catch((error) => console.error('Failed to audit user list:', error));

    const result = await userService.listUsers(session, session.token, params);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    // Re-throw Next.js redirect errors to allow framework-level handling
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    const classifiedError = classifyError(error);
    const userMessage = getContextualErrorMessage(classifiedError, 'list');

    console.error('[listUsersAction] Failed:', {
      technicalError: classifiedError.technicalDetails,
      category: classifiedError.category,
    });

    return {
      success: false,
      error: classifiedError.technicalDetails || 'Failed to list users',
      userMessage,
      code: 'LIST_USERS_ERROR',
    };
  }
}

/**
 * Get a specific user by ID (superadmin only)
 */
export async function getUserAction(userId: string): Promise<ActionResult<UserDetailResponse>> {
  try {
    const session = await requireSuperadmin();

    audit('sys.user.update', {
      actorId: session.userId,
      actorRole: session.role,
      targetId: userId,
      status: 'success',
      details: { action: 'view_user' },
    }).catch((error) => console.error('Failed to audit user get:', error));

    const result = await userService.getUserById(session, session.token, userId);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    // Re-throw Next.js redirect errors to allow framework-level handling
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    const classifiedError = classifyError(error);
    const userMessage = getContextualErrorMessage(classifiedError, 'view');

    console.error('[getUserAction] Failed:', {
      technicalError: classifiedError.technicalDetails,
      category: classifiedError.category,
    });

    return {
      success: false,
      error: classifiedError.technicalDetails || 'Failed to get user',
      userMessage,
      code: 'GET_USER_ERROR',
    };
  }
}

/**
 * Reset a user's password (superadmin only)
 *
 * This allows superadmins to reset any user's password and optionally
 * force them to change it on next login.
 */
export async function resetPasswordAction(
  userId: string,
  request: ResetPasswordRequest = { force_change: true }
): Promise<ActionResult<ResetPasswordResponse>> {
  console.log('[Server Action resetPasswordAction] userId:', userId);
  console.log('[Server Action resetPasswordAction] request:', JSON.stringify(request));
  console.log('[Server Action resetPasswordAction] request.new_password:', request.new_password, typeof request.new_password);

  try {
    const session = await requireSuperadmin();

    // Reset password via API
    const result = await userService.resetPassword(session, session.token, userId, request);

    // Audit log - password reset is a sensitive operation
    audit('auth.password_reset', {
      actorId: session.userId,
      actorRole: session.role,
      targetId: userId,
      status: 'success',
      details: {
        forceChange: request.force_change,
        providedPassword: !!request.new_password,
      },
    }).catch((error) => console.error('Failed to audit password reset:', error));

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    // Re-throw Next.js redirect errors to allow framework-level handling
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    const classifiedError = classifyError(error);
    const userMessage = getContextualErrorMessage(classifiedError, 'reset_password');

    console.error('[resetPasswordAction] Failed:', {
      technicalError: classifiedError.technicalDetails,
      category: classifiedError.category,
    });

    // Audit log - failure
    try {
      const session = await requireSuperadmin().catch(() => null);
      if (session) {
        audit('auth.password_reset', {
          actorId: session.userId,
          actorRole: session.role,
          targetId: userId,
          status: 'failure',
          details: { error: classifiedError.technicalDetails || 'Unknown error' },
        }).catch(() => {});
      }
    } catch {
      // Ignore audit errors on failure
    }

    return {
      success: false,
      error: classifiedError.technicalDetails || 'Failed to reset password',
      userMessage,
      code: 'RESET_PASSWORD_ERROR',
    };
  }
}

/**
 * Change current user's password
 *
 * Used when a user logs in with mustChangePassword flag set to true,
 * or when a user wants to change their own password.
 */
export async function changePasswordAction(
  request: ChangePasswordRequest
): Promise<ActionResult<{ success: boolean; message?: string }>> {
  try {
    // Require authentication
    const session = await requireAuth();

    // Call the change password endpoint
    const result = await userService.changePassword(session, session.token, request);

    // Audit log
    audit('auth.password_change', {
      actorId: session.userId,
      actorRole: session.role,
      tenantId: session.tenantId,
      status: 'success',
    }).catch((error) => console.error('Failed to audit password change:', error));

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    // Re-throw Next.js redirect errors to allow framework-level handling
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    const classifiedError = classifyError(error);
    const userMessage = getContextualErrorMessage(classifiedError, 'change_password');

    console.error('[changePasswordAction] Failed:', {
      technicalError: classifiedError.technicalDetails,
      category: classifiedError.category,
    });

    // Audit log - failure
    try {
      const session = await requireAuth().catch(() => null);
      if (session) {
        audit('auth.password_change', {
          actorId: session.userId,
          actorRole: session.role,
          tenantId: session.tenantId,
          status: 'failure',
          details: { error: classifiedError.technicalDetails || 'Unknown error' },
        }).catch(() => {});
      }
    } catch {
      // Ignore audit errors on failure
    }

    return {
      success: false,
      error: classifiedError.technicalDetails || 'Failed to change password',
      userMessage,
      code: 'CHANGE_PASSWORD_ERROR',
    };
  }
}
