import { createAuthenticatedFetcher } from '@/lib/api/fetcher';
import type { UserSession } from '@/lib/rbac/guard';
import {
  applicationDetailResponseSchema,
  type ApplicationDetailData,
} from './schemas';

// ============================================================================
// Error Classes
// ============================================================================

export class ApplicationDetailApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApplicationDetailApiError';
  }
}

// ============================================================================
// Application Detail Service
// ============================================================================

export class ApplicationDetailService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APPLICATION_DETAIL_API_BASE_URL || '';
  }

  async getApplicationDetail(
    session: UserSession,
    token: string,
    applicationId: string
  ): Promise<ApplicationDetailData> {
    if (!this.baseUrl) {
      throw new ApplicationDetailApiError(
        'NEXT_PUBLIC_APPLICATION_DETAIL_API_BASE_URL is not configured',
        500,
        'CONFIG_ERROR'
      );
    }

    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const data = await authFetcher.get(
        `/applications/${applicationId}`,
        applicationDetailResponseSchema
      );
      return data;
    } catch (error) {
      if (error instanceof ApplicationDetailApiError) {
        throw error;
      }
      if (error instanceof Error) {
        const status = 'status' in error ? (error as { status: number }).status : undefined;
        if (status === 404 || error.message.includes('not found')) {
          throw new ApplicationDetailApiError(
            `Application not found: ${applicationId}`,
            404,
            'APPLICATION_DETAIL_NOT_FOUND'
          );
        }
        if (status === 403 || error.message.includes('forbidden') || error.message.includes('not authorized')) {
          throw new ApplicationDetailApiError(
            'You do not have access to this application',
            403,
            'APPLICATION_DETAIL_FORBIDDEN'
          );
        }
        throw new ApplicationDetailApiError(
          error.message,
          status ?? 500,
          'APPLICATION_DETAIL_ERROR'
        );
      }
      throw error;
    }
  }
}

// Export singleton instance
export const applicationDetailService = new ApplicationDetailService();
