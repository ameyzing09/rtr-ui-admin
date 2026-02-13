'use server';

import { getSession } from '@/lib/rbac/guard.server';
import { UnauthorizedError } from '@/lib/rbac/guard';
import type { UserSession } from '@/lib/rbac/guard';
import {
  hasInterviewPermission,
  INTERVIEW_PERMISSIONS,
} from './permissions';

/**
 * Require permission to list pending interviews
 * Throws UnauthorizedError if user lacks permission
 */
export async function requireCanListInterviews(): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    throw new UnauthorizedError('Authentication required to view interviews');
  }

  if (!hasInterviewPermission(session.permissions, INTERVIEW_PERMISSIONS.LIST)) {
    throw new UnauthorizedError('You do not have permission to view interviews');
  }

  return session;
}

/**
 * Require permission to view interview details
 * Throws UnauthorizedError if user lacks permission
 */
export async function requireCanViewInterview(): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    throw new UnauthorizedError('Authentication required to view interview details');
  }

  if (!hasInterviewPermission(session.permissions, INTERVIEW_PERMISSIONS.VIEW)) {
    throw new UnauthorizedError('You do not have permission to view interview details');
  }

  return session;
}

/**
 * Require permission to create an interview
 * Throws UnauthorizedError if user lacks permission
 */
export async function requireCanCreateInterview(): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    throw new UnauthorizedError('Authentication required to create interviews');
  }

  if (!hasInterviewPermission(session.permissions, INTERVIEW_PERMISSIONS.CREATE)) {
    throw new UnauthorizedError('You do not have permission to create interviews');
  }

  return session;
}

/**
 * Require permission to cancel an interview
 * Throws UnauthorizedError if user lacks permission
 */
export async function requireCanCancelInterview(): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    throw new UnauthorizedError('Authentication required to cancel interviews');
  }

  if (!hasInterviewPermission(session.permissions, INTERVIEW_PERMISSIONS.CANCEL)) {
    throw new UnauthorizedError('You do not have permission to cancel interviews');
  }

  return session;
}
