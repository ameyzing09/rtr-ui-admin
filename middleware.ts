/**
 * Next.js Middleware for Server-Side Route Protection
 *
 * This middleware runs on every request and provides server-side validation
 * of authentication and authorization before allowing access to protected routes.
 *
 * IMPORTANT: This is the primary security boundary. Client-side checks are only
 * for UX - they can be bypassed. This middleware ensures server-side enforcement.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PLATFORM_PERMISSIONS, ROLE_PERMISSIONS, can } from './src/lib/rbac/permissions';
import type { Permission } from './src/lib/rbac/permissions';

// ============================================================================
// Types
// ============================================================================

interface SessionData {
  user: {
    id: string;
    tenantId?: string;
    role: string;
    email: string;
    name: string;
    permissions?: Permission[];  // Permissions from backend JWT
  };
  token: string;
  expiresAt: string;
  permissions?: Permission[];  // Backward compatibility
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Routes that require authentication but no specific permissions
 */
const PROTECTED_ROUTES = [
  '/dashboard',
  '/sa',
];

/**
 * Routes that are publicly accessible
 */
const PUBLIC_ROUTES = [
  '/login',
  '/unauthorized',
  '/',
  '/_next',
  '/api',
  '/favicon.ico',
  '/careers',
];

/**
 * Route-specific permission requirements for superadmin routes
 */
const SUPERADMIN_ROUTE_PERMISSIONS: Record<string, Permission> = {
  '/sa/tenants': PLATFORM_PERMISSIONS.TENANT_LIST,
  '/sa/tenants/create': PLATFORM_PERMISSIONS.TENANT_CREATE,
  '/sa/tenants/onboarding': PLATFORM_PERMISSIONS.TENANT_STATUS,
  '/sa/users': PLATFORM_PERMISSIONS.SYS_USER_LIST,
  '/sa/health': PLATFORM_PERMISSIONS.SYS_HEALTH_READ,
  '/sa/analytics': PLATFORM_PERMISSIONS.ANALYTICS_READ,
  '/sa/settings': PLATFORM_PERMISSIONS.SETTINGS_GLOBAL,
  '/sa/security': PLATFORM_PERMISSIONS.SETTINGS_SECURITY,
  '/sa/database': PLATFORM_PERMISSIONS.SETTINGS_DB,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a path matches any of the given patterns
 */
function matchesPath(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    if (pattern.endsWith('*')) {
      return pathname.startsWith(pattern.slice(0, -1));
    }
    return pathname === pattern || pathname.startsWith(`${pattern}/`);
  });
}

/**
 * Get session from request cookies
 */
function getSession(request: NextRequest): SessionData | null {
  try {
    const sessionCookie = request.cookies.get('rtr-admin-session');
    if (!sessionCookie) {
      return null;
    }

    // TODO: CRITICAL SECURITY - Implement JWT validation
    // Current implementation directly parses JSON without cryptographic verification.
    // This allows clients to tamper with session data (role, permissions, userId).
    //
    // REQUIRED IMPLEMENTATION:
    // 1. Install JWT library: `npm install jsonwebtoken @types/jsonwebtoken`
    // 2. Get JWT secret from env: process.env.JWT_SECRET (must be set in production)
    // 3. Verify and decode JWT:
    //    ```typescript
    //    import jwt from 'jsonwebtoken';
    //    const secret = process.env.JWT_SECRET;
    //    if (!secret) throw new Error('JWT_SECRET not configured');
    //    const sessionData = jwt.verify(sessionCookie.value, secret) as SessionData;
    //    ```
    // 4. Handle verification errors (expired, invalid signature, etc.)
    //
    // Until implemented, this is a CRITICAL security vulnerability.
    const sessionData = JSON.parse(sessionCookie.value) as SessionData;

    // Validate session has required fields
    if (!sessionData.user || !sessionData.user.role || !sessionData.expiresAt) {
      return null;
    }

    // Check if session is expired
    const expiresAt = new Date(sessionData.expiresAt);
    if (expiresAt.getTime() <= Date.now()) {
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error('Failed to parse session cookie:', error);
    return null;
  }
}

/**
 * Get user permissions from session or derive from role
 */
function getUserPermissions(session: SessionData): Permission[] {
  // Check top-level permissions first (backward compatibility)
  if (session.permissions && session.permissions.length > 0) {
    return session.permissions;
  }

  // Check permissions inside user object (where backend JWT stores them)
  if (session.user?.permissions && session.user.permissions.length > 0) {
    return session.user.permissions;
  }

  // Fall back to role-based permissions
  return ROLE_PERMISSIONS[session.user.role] || [];
}

/**
 * Get required permission for a specific route
 */
function getRequiredPermission(pathname: string): Permission | null {
  // Check exact matches first
  if (SUPERADMIN_ROUTE_PERMISSIONS[pathname]) {
    return SUPERADMIN_ROUTE_PERMISSIONS[pathname];
  }

  // Check if path starts with any registered route
  for (const [route, permission] of Object.entries(SUPERADMIN_ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route + '/')) {
      return permission;
    }
  }

  return null;
}

// ============================================================================
// Middleware Function
// ============================================================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (matchesPath(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  // Get session from cookie
  const session = getSession(request);

  // Redirect to login if not authenticated and accessing protected route
  if (!session && matchesPath(pathname, PROTECTED_ROUTES)) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // If accessing superadmin routes
  if (pathname.startsWith('/sa')) {
    if (!session) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Check if user is SUPERADMIN
    if (session.user.role !== 'SUPERADMIN') {
      const url = new URL('/unauthorized', request.url);
      url.searchParams.set('reason', 'role');
      return NextResponse.redirect(url);
    }

    // Check specific permission for the route
    const requiredPermission = getRequiredPermission(pathname);
    if (requiredPermission) {
      const userPermissions = getUserPermissions(session);
      if (!can(userPermissions, requiredPermission)) {
        const url = new URL('/unauthorized', request.url);
        url.searchParams.set('reason', 'permission');
        url.searchParams.set('required', requiredPermission);
        return NextResponse.redirect(url);
      }
    }
  }

  // Add permissions to request headers for server components to access
  if (session) {
    const userPermissions = getUserPermissions(session);
    const response = NextResponse.next();
    response.headers.set('x-user-id', session.user.id);
    response.headers.set('x-user-role', session.user.role);
    response.headers.set('x-user-permissions', JSON.stringify(userPermissions));
    if (session.user.tenantId) {
      response.headers.set('x-tenant-id', session.user.tenantId);
    }
    return response;
  }

  return NextResponse.next();
}

// ============================================================================
// Middleware Configuration
// ============================================================================

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - public folder files
   */
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next/ (Next.js internals)
     * 2. /api/ (API routes - handle auth separately)
     * 3. Static files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
