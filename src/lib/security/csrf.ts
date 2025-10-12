/**
 * CSRF (Cross-Site Request Forgery) Protection
 *
 * Implements the double-submit cookie pattern:
 * 1. Server generates a random token and sets it as a cookie
 * 2. Client reads the cookie and includes the token in request headers
 * 3. Server validates that cookie value matches header value
 *
 * This protects against CSRF attacks where malicious sites try to
 * perform state-changing operations on behalf of authenticated users.
 */

// ============================================================================
// Constants
// ============================================================================

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

// ============================================================================
// Token Generation
// ============================================================================

/**
 * Generate a cryptographically secure random token
 *
 * @returns A random hex string of specified length
 */
export function generateCsrfToken(): string {
  if (typeof window !== 'undefined' && window.crypto) {
    // Browser environment
    const array = new Uint8Array(TOKEN_LENGTH);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Node environment - use Node's crypto module
    // Note: This is synchronous and only runs server-side
    // Using require here is acceptable for Node-only code paths
    // Alternative: Make this function async and use await import('crypto')
    try {
      // Use dynamic require for server-side crypto (Node.js only)
      const crypto: typeof import('crypto') = eval('require')('crypto');
      return crypto.randomBytes(TOKEN_LENGTH).toString('hex');
    } catch (error) {
      throw new Error('Failed to generate CSRF token: crypto module not available');
    }
  }
}

// ============================================================================
// Cookie Management (Browser)
// ============================================================================

/**
 * Get CSRF token from cookie
 *
 * @returns The CSRF token or null if not found
 */
export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CSRF_COOKIE_NAME) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

/**
 * Set CSRF token in cookie
 *
 * @param token - The CSRF token to set
 * @param maxAge - Max age in seconds (default: 1 hour)
 */
export function setCsrfTokenCookie(token: string, maxAge = 3600): void {
  if (typeof document === 'undefined') {
    return;
  }

  const secure = window.location.protocol === 'https:';
  document.cookie = `${CSRF_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Strict${secure ? '; Secure' : ''}`;
}

/**
 * Remove CSRF token cookie
 */
export function removeCsrfTokenCookie(): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${CSRF_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

// ============================================================================
// Request Helpers
// ============================================================================

/**
 * Get or create CSRF token
 * If token doesn't exist, generates a new one and sets it in cookie
 *
 * @returns The CSRF token
 */
export function getOrCreateCsrfToken(): string {
  let token = getCsrfTokenFromCookie();

  if (!token) {
    token = generateCsrfToken();
    setCsrfTokenCookie(token);
  }

  return token;
}

/**
 * Get headers with CSRF token included
 * Use this when making state-changing requests (POST/PUT/DELETE)
 *
 * @param additionalHeaders - Additional headers to include
 * @returns Headers object with CSRF token
 */
export function getCsrfHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getOrCreateCsrfToken();

  return {
    ...additionalHeaders,
    [CSRF_HEADER_NAME]: token,
  };
}

/**
 * Validate CSRF token in request
 * Server-side validation function
 *
 * @param cookieToken - Token from cookie
 * @param headerToken - Token from header
 * @returns true if tokens match and are valid
 */
export function validateCsrfToken(cookieToken: string | null, headerToken: string | null): boolean {
  if (!cookieToken || !headerToken) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  if (cookieToken.length !== headerToken.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    result |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i);
  }

  return result === 0;
}

// ============================================================================
// Fetch Wrapper with CSRF Protection
// ============================================================================

/**
 * Wrapper around fetch that automatically includes CSRF token for mutations
 *
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Promise with response
 */
export async function csrfFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = options.method?.toUpperCase() || 'GET';

  // Only add CSRF token for state-changing methods
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const token = getOrCreateCsrfToken();
    options.headers = {
      ...options.headers,
      [CSRF_HEADER_NAME]: token,
    };
  }

  return fetch(url, options);
}

// ============================================================================
// Next.js API Route Helpers
// ============================================================================

/**
 * Middleware for Next.js API routes to validate CSRF token
 * Use this in your API routes that modify state
 *
 * @param req - Next.js API request
 * @returns true if CSRF token is valid, false otherwise
 */
export function validateApiRouteCsrf(req: Request): boolean {
  const method = req.method?.toUpperCase();

  // Fail securely if method is undefined (malformed request)
  if (!method) {
    return false;
  }

  // Only validate for state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return true;
  }

  // Get token from cookie
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = decodeURIComponent(value);
    return acc;
  }, {} as Record<string, string>);
  const cookieToken = cookies[CSRF_COOKIE_NAME];

  // Get token from header
  const headerToken = req.headers.get(CSRF_HEADER_NAME);

  return validateCsrfToken(cookieToken, headerToken);
}

// ============================================================================
// React Hook
// ============================================================================

/**
 * React hook to get CSRF token
 * Ensures token is initialized when component mounts
 *
 * @returns The CSRF token
 */
export function useCsrfToken(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  return getOrCreateCsrfToken();
}

// ============================================================================
// Constants Export
// ============================================================================

export const CSRF_CONFIG = {
  COOKIE_NAME: CSRF_COOKIE_NAME,
  HEADER_NAME: CSRF_HEADER_NAME,
  TOKEN_LENGTH,
} as const;
