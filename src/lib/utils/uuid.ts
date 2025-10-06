/**
 * Generates a UUID v4 with fallback for older environments
 * 
 * Uses crypto.randomUUID when available (modern browsers and Node.js 14.17.0+),
 * otherwise falls back to a polyfill implementation.
 * 
 * @returns A valid UUID v4 string
 */
export function generateUUID(): string {
  // Check if crypto.randomUUID is available (modern browsers and Node.js 14.17.0+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback implementation for older environments
  // Uses Math.random() with proper UUID v4 format
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

