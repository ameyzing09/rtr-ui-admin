'use server';

import { getSession } from '@/lib/rbac/guard.server';
import { UnauthorizedError } from '@/lib/rbac/guard';
import type { UserSession } from '@/lib/rbac/guard';
import {
  hasEvaluationPermission,
  hasSignalPermission,
  EVALUATION_PERMISSIONS,
  SIGNAL_PERMISSIONS,
} from './permissions';

/**
 * Require permission to list/view pending evaluations
 * Throws UnauthorizedError if user lacks permission
 */
export async function requireCanListEvaluations(): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    throw new UnauthorizedError('Authentication required to view evaluations');
  }

  if (!hasEvaluationPermission(session.permissions, EVALUATION_PERMISSIONS.LIST)) {
    throw new UnauthorizedError('You do not have permission to view evaluations');
  }

  return session;
}

/**
 * Require permission to view evaluation details
 * Throws UnauthorizedError if user lacks permission
 */
export async function requireCanViewEvaluations(): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    throw new UnauthorizedError('Authentication required to view evaluation details');
  }

  if (!hasEvaluationPermission(session.permissions, EVALUATION_PERMISSIONS.VIEW)) {
    throw new UnauthorizedError('You do not have permission to view evaluation details');
  }

  return session;
}

/**
 * Require permission to respond to evaluations
 * Throws UnauthorizedError if user lacks permission
 */
export async function requireCanRespondToEvaluation(): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    throw new UnauthorizedError('Authentication required to submit evaluation responses');
  }

  if (!hasEvaluationPermission(session.permissions, EVALUATION_PERMISSIONS.RESPOND)) {
    throw new UnauthorizedError('You do not have permission to submit evaluation responses');
  }

  return session;
}

/**
 * Require permission to view application signals
 * Throws UnauthorizedError if user lacks permission
 */
export async function requireCanViewSignals(): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    throw new UnauthorizedError('Authentication required to view signals');
  }

  if (!hasSignalPermission(session.permissions, SIGNAL_PERMISSIONS.VIEW)) {
    throw new UnauthorizedError('You do not have permission to view signals');
  }

  return session;
}

/**
 * Require permission to set manual signals
 * Throws UnauthorizedError if user lacks permission
 */
export async function requireCanSetManualSignal(): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    throw new UnauthorizedError('Authentication required to set manual signals');
  }

  if (!hasSignalPermission(session.permissions, SIGNAL_PERMISSIONS.SET_MANUAL)) {
    throw new UnauthorizedError('You do not have permission to set manual signals');
  }

  return session;
}
