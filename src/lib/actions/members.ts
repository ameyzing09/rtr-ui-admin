'use server';

import { memberService, MemberApiError } from '@/domain/members/service';
import {
  requireCanListMembers,
  requireCanCreateMember,
  requireCanUpdateMember,
  requireCanResetMemberPassword,
} from '@/domain/members/permissions.server';
import {
  createMemberRequestSchema,
  type MemberListResponse,
  type CreateMemberRequest,
  type CreateMemberResponse,
  type UpdateMemberResponse,
  type ResetMemberPasswordResponse,
} from '@/domain/members/schemas';
import { ZodError } from 'zod';
import type { ActionResult } from './types';

// ============================================================================
// Error Formatting
// ============================================================================

function formatError(error: unknown): {
  error: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
} {
  if (error instanceof MemberApiError) {
    // Map API error codes to user-friendly messages
    const code = error.code;
    let message = error.message;

    if (code === 'conflict') {
      message = 'A user with this email already exists';
    } else if (code === 'not_found') {
      message = 'Member not found';
    } else if (code === 'forbidden' || code === 'unauthorized') {
      message = "You don't have permission to manage members";
    }

    return { error: message, code };
  }
  return { error: error instanceof Error ? error.message : String(error) };
}

// ============================================================================
// List Members
// ============================================================================

export async function listMembersAction(): Promise<ActionResult<MemberListResponse>> {
  try {
    const session = await requireCanListMembers();
    const members = await memberService.listMembers(session, session.token);

    return { success: true, data: members };
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    return { success: false, ...formatError(error) };
  }
}

// ============================================================================
// Create Member
// ============================================================================

export async function createMemberAction(
  request: CreateMemberRequest
): Promise<ActionResult<CreateMemberResponse>> {
  try {
    const session = await requireCanCreateMember();

    // Validate request
    const validated = createMemberRequestSchema.parse(request);

    const result = await memberService.createMember(session, session.token, validated);

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        fieldErrors: Object.fromEntries(
          error.issues.map((err) => [err.path.join('.'), [err.message]])
        ),
      };
    }

    return { success: false, ...formatError(error) };
  }
}

// ============================================================================
// Update Member
// ============================================================================

export async function updateMemberAction(
  userId: string,
  request: { role?: string; is_active?: boolean }
): Promise<ActionResult<UpdateMemberResponse>> {
  try {
    const session = await requireCanUpdateMember();

    const result = await memberService.updateMember(session, session.token, userId, request);

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    return { success: false, ...formatError(error) };
  }
}

// ============================================================================
// Reset Member Password
// ============================================================================

export async function resetMemberPasswordAction(
  userId: string,
  request: { new_password?: string; force_change: boolean }
): Promise<ActionResult<ResetMemberPasswordResponse>> {
  try {
    const session = await requireCanResetMemberPassword();

    const result = await memberService.resetMemberPassword(
      session,
      session.token,
      userId,
      request
    );

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    return { success: false, ...formatError(error) };
  }
}
