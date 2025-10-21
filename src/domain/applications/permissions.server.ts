'use server';

/**
 * Server-Only Application Permissions
 *
 * This file contains server-side application permission checks that require authentication.
 * It should only be imported in server components and server actions.
 *
 * For client-side permission checking, use permissions.ts instead.
 */

import { getSession } from '@/lib/rbac/guard.server';
import { UnauthorizedError } from '@/lib/rbac/guard';
import type { UserSession } from '@/lib/rbac/guard';
import { hasApplicationPermission, APPLICATION_PERMISSIONS } from './permissions';

/**
 * Require permission to list applications
 * Throws UnauthorizedError if user lacks permission
 */
export async function requireCanListApplications(): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    throw new UnauthorizedError('Authentication required to view applications');
  }

  if (!hasApplicationPermission(session.permissions, APPLICATION_PERMISSIONS.LIST)) {
    throw new UnauthorizedError('You do not have permission to view applications');
  }

  return session;
}

/**
 * Require permission to create applications
 * Throws UnauthorizedError if user lacks permission
 */
export async function requireCanCreateApplications(): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    throw new UnauthorizedError('Authentication required to create applications');
  }

  if (!hasApplicationPermission(session.permissions, APPLICATION_PERMISSIONS.CREATE)) {
    throw new UnauthorizedError('You do not have permission to create applications');
  }

  return session;
}

/**
 * Require permission to update applications
 * Throws UnauthorizedError if user lacks permission
 */
export async function requireCanUpdateApplications(): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    throw new UnauthorizedError('Authentication required to update applications');
  }

  if (!hasApplicationPermission(session.permissions, APPLICATION_PERMISSIONS.UPDATE)) {
    throw new UnauthorizedError('You do not have permission to update applications');
  }

  return session;
}

/**
 * Require permission to delete applications
 * Throws UnauthorizedError if user lacks permission
 */
export async function requireCanDeleteApplications(): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    throw new UnauthorizedError('Authentication required to delete applications');
  }

  if (!hasApplicationPermission(session.permissions, APPLICATION_PERMISSIONS.DELETE)) {
    throw new UnauthorizedError('You do not have permission to delete applications');
  }

  return session;
}
