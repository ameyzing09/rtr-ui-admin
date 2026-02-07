import { createAuthenticatedFetcher } from '@/lib/api/fetcher';
import { env } from '@/config/env';
import {
  stageActionListResponseSchema,
  roleCapabilityListResponseSchema,
  type StageAction,
  type RoleCapability,
} from './schemas';

// ============================================================================
// Error Classes
// ============================================================================

export class ActionSettingsApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ActionSettingsApiError';
  }
}

// ============================================================================
// Action Settings Service
// ============================================================================

/**
 * Service for reading tenant action/capability configuration
 */
class ActionSettingsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.NEXT_PUBLIC_TRACKING_API_BASE_URL || env.NEXT_PUBLIC_JOB_API_BASE_URL || '';
    console.log('[ActionSettingsService] Initialized with baseUrl:', this.baseUrl);
  }

  /**
   * List all stage actions for the tenant
   */
  async listActions(token: string): Promise<StageAction[]> {
    const url = '/settings/actions';
    console.log('[ActionSettingsService] listActions:', { baseUrl: this.baseUrl, url });

    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const response = await authFetcher.get(url, stageActionListResponseSchema);
      console.log('[ActionSettingsService] listActions success:', { count: response.data.length });
      return response.data;
    } catch (error) {
      console.error('[ActionSettingsService] listActions error:', error);
      throw this.handleError(error, 'Failed to fetch stage actions');
    }
  }

  /**
   * List all role capabilities for the tenant
   */
  async listCapabilities(token: string): Promise<RoleCapability[]> {
    const url = '/settings/capabilities';
    console.log('[ActionSettingsService] listCapabilities:', { baseUrl: this.baseUrl, url });

    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const response = await authFetcher.get(url, roleCapabilityListResponseSchema);
      console.log('[ActionSettingsService] listCapabilities success:', { count: response.data.length });
      return response.data;
    } catch (error) {
      console.error('[ActionSettingsService] listCapabilities error:', error);
      throw this.handleError(error, 'Failed to fetch role capabilities');
    }
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: unknown, defaultMessage: string): ActionSettingsApiError {
    if (error instanceof ActionSettingsApiError) {
      return error;
    }

    if (error && typeof error === 'object' && 'code' in error) {
      const apiError = error as { message?: string; code?: string; status?: number };
      return new ActionSettingsApiError(
        apiError.message || defaultMessage,
        apiError.status || 500,
        apiError.code
      );
    }

    if (error instanceof Error) {
      return new ActionSettingsApiError(error.message, 500, 'ACTION_SETTINGS_ERROR');
    }

    return new ActionSettingsApiError(defaultMessage, 500, 'ACTION_SETTINGS_ERROR');
  }
}

export const actionSettingsService = new ActionSettingsService();
