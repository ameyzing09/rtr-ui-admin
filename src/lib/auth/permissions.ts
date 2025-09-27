import type { UserRole } from './types';

export type Permission =
  | 'platform:overview:view'
  | 'platform:tenants:manage'
  | 'platform:users:manage'
  | 'platform:billing:manage'
  | 'platform:catalog:manage'
  | 'platform:integrations:manage'
  | 'platform:health:view'
  | 'platform:observability:view'
  | 'platform:experiments:view'
  | 'platform:ops:view'
  | 'platform:settings:manage';

export const rolePermissions: Record<UserRole, Permission[]> = {
  SUPERADMIN: [
    'platform:overview:view',
    'platform:tenants:manage',
    'platform:users:manage',
    'platform:billing:manage',
    'platform:catalog:manage',
    'platform:integrations:manage',
    'platform:health:view',
    'platform:observability:view',
    'platform:experiments:view',
    'platform:ops:view',
    'platform:settings:manage',
  ],
  ADMIN: [
    'platform:overview:view',
    'platform:users:manage',
    'platform:ops:view',
    'platform:settings:manage',
  ],
};

