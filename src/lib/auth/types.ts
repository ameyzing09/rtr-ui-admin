export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'HR' | 'INTERVIEWER' | 'CANDIDATE';

export interface AuthUser {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  mustChangePassword: boolean;
}

export interface AuthSession {
  token: string;
  expiresAt: Date;
  user: AuthUser;
}

export interface StoredAuthSession extends Omit<AuthSession, 'expiresAt'> {
  expiresAt: string;
}

export type LoginAudience = 'tenant' | 'platform';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  audience?: LoginAudience;
}

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
