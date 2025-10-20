/**
 * JWT Token Utilities
 * Client-side JWT parsing for extracting claims without verification
 * (Verification happens server-side)
 */

export interface JwtPayload {
  tenantId?: string;
  tid?: string;
  sub?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

/**
 * Decode JWT token and extract payload
 * Does NOT verify signature (verification is server-side responsibility)
 * Safe for extracting non-sensitive claims like tenantId
 *
 * @param token - JWT token (format: header.payload.signature)
 * @returns Decoded payload or null if invalid
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode payload (second part)
    const payload = parts[1];
    if (!payload) {
      return null;
    }

    // Add padding if needed for base64url decoding
    const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const decodedStr = atob(paddedPayload);
    const decoded = JSON.parse(decodedStr) as JwtPayload;

    return decoded;
  } catch (error) {
    console.warn('Failed to decode JWT token:', error);
    return null;
  }
}

/**
 * Extract tenantId from JWT token
 * Looks for both 'tenantId' and 'tid' claims
 *
 * @param token - JWT token
 * @returns TenantId string or undefined if not found
 */
export function extractTenantIdFromToken(token: string): string | undefined {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return undefined;
  }

  // Try both tenantId and tid (some systems use tid as shorthand)
  return (payload.tenantId || payload.tid) as string | undefined;
}
