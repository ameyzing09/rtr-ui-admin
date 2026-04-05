'use server';

import {
  applicationDetailService,
  ApplicationDetailApiError,
} from '@/domain/application-detail/service';
import { requireCanListApplications } from '@/domain/applications/permissions.server';
import type { ApplicationDetailData } from '@/domain/application-detail/schemas';
import type { ActionResult } from './types';

function formatError(error: unknown): {
  error: string;
  code?: string;
} {
  if (error instanceof ApplicationDetailApiError) {
    return {
      error: error.message,
      code: error.code,
    };
  }
  return { error: error instanceof Error ? error.message : String(error) };
}

export async function getApplicationDetailAction(
  applicationId: string
): Promise<ActionResult<ApplicationDetailData>> {
  try {
    const session = await requireCanListApplications();

    const data = await applicationDetailService.getApplicationDetail(
      session,
      session.token,
      applicationId
    );

    return { success: true, data };
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    return { success: false, ...formatError(error) };
  }
}
