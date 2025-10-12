'use server';

import { cookies } from 'next/headers';
import type { StoredAuthSession } from '@/lib/auth/types';

export type ActionResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      code?: string;
    };

/**
 * Server action to set the session cookie after successful login
 * Replaces POST /api/auth/session
 */
export async function setSessionCookieAction(
  session: StoredAuthSession
): Promise<ActionResult<{ success: boolean }>> {
  try {
    if (!session || !session.token || !session.user || !session.expiresAt) {
      return {
        success: false,
        error: 'Invalid session data',
        code: 'INVALID_SESSION',
      };
    }

    // Set the session cookie with httpOnly for security
    // httpOnly: true prevents XSS attacks by making cookie inaccessible to JavaScript
    const cookieStore = await cookies();
    cookieStore.set('rtr-admin-session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(session.expiresAt),
      path: '/',
    });

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error('Failed to set session cookie:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set session cookie',
      code: 'COOKIE_ERROR',
    };
  }
}

/**
 * Server action to clear the session cookie on logout
 * Replaces DELETE /api/auth/session
 */
export async function clearSessionCookieAction(): Promise<ActionResult<{ success: boolean }>> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('rtr-admin-session');

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error('Failed to delete session cookie:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete session cookie',
      code: 'COOKIE_ERROR',
    };
  }
}
