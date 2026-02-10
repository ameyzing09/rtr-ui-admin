'use server';

import { getSession } from '@/lib/rbac/guard.server';
import { UnauthorizedError } from '@/lib/rbac/guard';
import type { UserSession } from '@/lib/rbac/guard';
import {
  canListMembers,
  canCreateMember,
  canUpdateMember,
  canResetMemberPassword,
} from './permissions';

/**
 * Require permission to list members
 */
export async function requireCanListMembers(): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    throw new UnauthorizedError('Authentication required to view members');
  }

  if (!canListMembers(session.permissions)) {
    throw new UnauthorizedError('You do not have permission to view members');
  }

  return session;
}

/**
 * Require permission to create members
 */
export async function requireCanCreateMember(): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    throw new UnauthorizedError('Authentication required to create members');
  }

  if (!canCreateMember(session.permissions)) {
    throw new UnauthorizedError('You do not have permission to create members');
  }

  return session;
}

/**
 * Require permission to update members
 */
export async function requireCanUpdateMember(): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    throw new UnauthorizedError('Authentication required to update members');
  }

  if (!canUpdateMember(session.permissions)) {
    throw new UnauthorizedError('You do not have permission to update members');
  }

  return session;
}

/**
 * Require permission to reset member passwords
 */
export async function requireCanResetMemberPassword(): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    throw new UnauthorizedError('Authentication required to reset member passwords');
  }

  if (!canResetMemberPassword(session.permissions)) {
    throw new UnauthorizedError('You do not have permission to reset member passwords');
  }

  return session;
}
