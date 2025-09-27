import type { LoginResponse, UserRole } from './types';

const MOCK_LOGIN_RESPONSES: Record<UserRole, LoginResponse> = {
  SUPERADMIN: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.signature',
    expiresAt: '2025-12-01T15:04:05Z',
    user: {
      id: 'a1b2c3d4-1111-2222-3333-ffffffffffff',
      tenantId: 'tnt-0000-1111-2222-333344445555',
      name: 'Alice Johnson',
      email: 'alice@acme.com',
      role: 'SUPERADMIN',
      mustChangePassword: false,
    },
  },
  ADMIN: {
    token: 'eyJhbGciOiJIUdhfgaiusth87325zbfXVCJ9.example.signature',
    expiresAt: '2025-12-01T15:04:05Z',
    user: {
      id: 'a1b2c3d4-634324-222322-3333-dafsdfadsf',
      tenantId: 'tnt-0000-1111-2222-333344445555',
      name: 'Hippo Johnson',
      email: 'hippo@acme.com',
      role: 'ADMIN',
      mustChangePassword: false,
    },
  },
};

export function getMockLoginResponse(role: UserRole = 'SUPERADMIN'): LoginResponse {
  return MOCK_LOGIN_RESPONSES[role];
}

