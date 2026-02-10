import { createAuthenticatedFetcher, ApiException } from '@/lib/api/fetcher';
import type { UserSession } from '@/lib/rbac/guard';
import {
  memberListResponseSchema,
  createMemberResponseSchema,
  updateMemberResponseSchema,
  resetMemberPasswordResponseSchema,
  type MemberListResponse,
  type CreateMemberRequest,
  type CreateMemberResponse,
  type UpdateMemberRequest,
  type UpdateMemberResponse,
  type ResetMemberPasswordRequest,
  type ResetMemberPasswordResponse,
} from './schemas';

// ============================================================================
// Error Classes
// ============================================================================

export class MemberApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'MemberApiError';
  }
}

// ============================================================================
// Member Service
// ============================================================================

class MemberService {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_USER_AUTH_API_BASE_URL ||
      process.env.USER_AUTH_API_BASE_URL ||
      'http://localhost:8082';
  }

  /**
   * List all tenant members
   */
  async listMembers(
    session: UserSession,
    token: string
  ): Promise<MemberListResponse> {
    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      return await authFetcher.get('/users', memberListResponseSchema);
    } catch (error) {
      throw this.mapError(error, 'Failed to list members');
    }
  }

  /**
   * Create a new tenant member
   */
  async createMember(
    session: UserSession,
    token: string,
    request: CreateMemberRequest
  ): Promise<CreateMemberResponse> {
    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      return await authFetcher.post('/users', request, createMemberResponseSchema);
    } catch (error) {
      throw this.mapError(error, 'Failed to create member');
    }
  }

  /**
   * Update a member's role or active status
   */
  async updateMember(
    session: UserSession,
    token: string,
    userId: string,
    request: UpdateMemberRequest
  ): Promise<UpdateMemberResponse> {
    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      return await authFetcher.patch(`/users/${userId}`, request, updateMemberResponseSchema);
    } catch (error) {
      throw this.mapError(error, 'Failed to update member');
    }
  }

  /**
   * Reset a member's password
   */
  async resetMemberPassword(
    session: UserSession,
    token: string,
    userId: string,
    request: ResetMemberPasswordRequest
  ): Promise<ResetMemberPasswordResponse> {
    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      return await authFetcher.post(
        `/users/${userId}/reset-password`,
        request,
        resetMemberPasswordResponseSchema
      );
    } catch (error) {
      throw this.mapError(error, 'Failed to reset member password');
    }
  }

  /**
   * Map API/fetch errors to MemberApiError
   */
  private mapError(error: unknown, fallbackMessage: string): MemberApiError {
    if (error instanceof ApiException) {
      return new MemberApiError(
        error.message,
        error.status || 500,
        error.code
      );
    }
    if (error instanceof Error) {
      return new MemberApiError(error.message, 500);
    }
    return new MemberApiError(fallbackMessage, 500);
  }
}

// Export singleton instance
export const memberService = new MemberService();

// Export class for testing
export { MemberService };
