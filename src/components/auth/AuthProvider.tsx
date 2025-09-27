'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getMockLoginResponse } from '@/lib/auth/mockAuth';
import { rolePermissions, type Permission } from '@/lib/auth/permissions';
import type { LoginResponse, UserRole } from '@/lib/auth/types';

interface AuthContextValue {
  login: LoginResponse;
  role: UserRole;
  permissions: Permission[];
  setRole: (role: UserRole) => void;
  availableRoles: UserRole[];
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AVAILABLE_ROLES: UserRole[] = ['SUPERADMIN', 'ADMIN'];

interface AuthProviderProps {
  children: ReactNode;
  defaultRole?: UserRole;
}

export function AuthProvider({ children, defaultRole = 'SUPERADMIN' }: AuthProviderProps) {
  const [role, setRole] = useState<UserRole>(defaultRole);

  const login = useMemo(() => getMockLoginResponse(role), [role]);
  const permissions = useMemo(() => rolePermissions[role], [role]);

  const value = useMemo<AuthContextValue>(
    () => ({
      login,
      role,
      permissions,
      setRole,
      availableRoles: AVAILABLE_ROLES,
    }),
    [login, permissions, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

