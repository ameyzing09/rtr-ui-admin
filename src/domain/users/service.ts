import { createAuthenticatedFetcher } from '@/lib/api/fetcher';
import type { UserSession } from '@/lib/rbac/guard';
import {
  userListResponseSchema,
  userDetailResponseSchema,
  resetPasswordResponseSchema,
  changePasswordRequestSchema,
  listUsersParamsSchema,
  type UserListResponse,
  type UserDetailResponse,
  type ResetPasswordResponse,
  type ListUsersParams,
  type ChangePasswordRequest,
  type ResetPasswordRequest,
} from './schemas';

/**
 * User Service
 *
 * Handles all user-related API calls for superadmin user management
 * and user authentication operations like password changes.
 */
class UserService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_USER_AUTH_API_BASE_URL ||
                   process.env.USER_AUTH_API_BASE_URL ||
                   'http://localhost:8082';
  }

  /**
   * List all users (superadmin only)
   *
   * @param session - User session for authentication context
   * @param token - Authentication token
   * @param params - Query parameters for filtering
   * @returns List of users with pagination
   */
  async listUsers(session: UserSession, token: string, params: ListUsersParams): Promise<UserListResponse> {
    const validated = listUsersParamsSchema.parse(params);

    const queryParams = new URLSearchParams();
    if (validated.tenant_id) queryParams.append('tenant_id', validated.tenant_id);
    if (validated.role) queryParams.append('role', validated.role);
    if (validated.search) queryParams.append('search', validated.search);
    queryParams.append('page', String(validated.page));
    queryParams.append('limit', String(validated.limit));

    // Create authenticated fetcher with token and correct baseUrl
    const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
    return authFetcher.get(
      `/admin/users?${queryParams.toString()}`,
      userListResponseSchema
    );
  }

  /**
   * Get a specific user by ID (superadmin only)
   *
   * @param session - User session for authentication context
   * @param token - Authentication token
   * @param userId - User ID to fetch
   * @returns User details
   */
  async getUserById(session: UserSession, token: string, userId: string): Promise<UserDetailResponse> {
    // Create authenticated fetcher with token and correct baseUrl
    const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
    return authFetcher.get(
      `/admin/users/${userId}`,
      userDetailResponseSchema
    );
  }

  /**
   * Reset a user's password (superadmin only)
   *
   * This endpoint allows superadmins to reset any user's password.
   * If no new_password is provided, the backend generates a temporary password.
   *
   * @param session - User session for authentication context
   * @param token - Authentication token
   * @param userId - User ID whose password to reset
   * @param request - Reset password request (optional new_password and force_change flag)
   * @returns Reset password response with temp password
   */
  async resetPassword(
    session: UserSession,
    token: string,
    userId: string,
    request: ResetPasswordRequest = { force_change: true }
  ): Promise<ResetPasswordResponse> {
    // Create authenticated fetcher with token and correct baseUrl
    const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
    return authFetcher.post(
      `/admin/users/${userId}/reset-password`,
      request,
      resetPasswordResponseSchema
    );
  }

  /**
   * Change current user's password
   *
   * This is called by the user themselves, typically after login when
   * mustChangePassword flag is set to true.
   *
   * @param session - User session for authentication context
   * @param token - Authentication token
   * @param request - Current and new password
   * @returns Success response
   */
  async changePassword(session: UserSession, token: string, request: ChangePasswordRequest): Promise<{ success: boolean; message?: string }> {
    const validated = changePasswordRequestSchema.parse(request);

    // Create authenticated fetcher with token and correct baseUrl
    const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
    return authFetcher.post(`/me/change-password`, {
      current_password: validated.current_password,
      new_password: validated.new_password,
    });
  }
}

// Export singleton instance
export const userService = new UserService();

// Export class for testing or custom instantiation
export { UserService };
