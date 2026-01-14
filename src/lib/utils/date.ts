/**
 * Date formatting utilities
 * Handles relative time formatting and proper timezone handling
 */

/**
 * Validate if a string could be a valid date format
 * Checks for ISO 8601 format or common date patterns
 *
 * NOTE: This performs format validation only (pattern matching).
 * It does NOT validate date ranges (e.g., will match "2023-13-45").
 * Invalid date ranges are caught by Date constructor in normalizeDate().
 * This two-layer approach:
 * 1. Fast regex rejects malformed strings (prevents Date constructor abuse)
 * 2. Date constructor + isNaN() validates actual date values
 */
function isValidDateString(dateStr: string): boolean {
  // Check for empty or whitespace-only strings
  if (!dateStr || dateStr.trim().length === 0) {
    return false;
  }

  // ISO 8601 format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss (also accepts PostgreSQL format with space separator)
  // Note: Matches format only, not value ranges (month 1-12, day 1-31, etc.)
  // Accepts: 2024-01-15, 2024-01-15T10:30:00, 2024-01-15 10:30:00+00, 2024-01-15T10:30:00.123Z
  const iso8601Pattern = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}(:\d{2})?)?)?$/;

  // Common timestamp formats
  const timestampPattern = /^\d+$/; // Unix timestamp

  // RFC 2822 / RFC 1123: "Mon, 25 Dec 1995 13:30:00 GMT"
  const rfcPattern = /^[A-Z][a-z]{2},\s\d{1,2}\s[A-Z][a-z]{2}\s\d{4}\s\d{2}:\d{2}:\d{2}\s[A-Z]{3}$/;

  const trimmed = dateStr.trim();

  return (
    iso8601Pattern.test(trimmed) ||
    timestampPattern.test(trimmed) ||
    rfcPattern.test(trimmed)
  );
}

/**
 * Normalize date string to ensure proper parsing
 *
 * TWO-LAYER VALIDATION APPROACH:
 * 1. isValidDateString() - Fast format check (prevents malformed strings)
 * 2. Date constructor + isNaN() - Validates actual date values
 *
 * Example: "2023-13-45" passes regex but fails Date validation
 * This is intentional - regex validation is for security/performance,
 * Date validation is for correctness.
 */
function normalizeDate(date: Date | string): Date {
  if (date instanceof Date) {
    return date;
  }

  const dateStr = String(date).trim();

  // Layer 1: Fast format validation (security/performance)
  if (!isValidDateString(dateStr)) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  // Layer 2: Date constructor validates actual ranges
  const parsed = new Date(dateStr);

  // Check if date is valid (catches "2023-13-45", etc.)
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date value: ${dateStr}`);
  }

  return parsed;
}

/**
 * Format a date as relative time (e.g., "2 minutes ago", "3 hours ago")
 * Falls back to absolute date for dates older than 7 days
 */
export function formatRelativeTime(date: Date | string): string {
  try {
    const dateObj = normalizeDate(date);

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date in formatRelativeTime:', date);
      return 'Invalid date';
    }

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Less than 1 minute
    if (diffSeconds < 60) {
      return 'Just now';
    }

    // Less than 1 hour
    if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    // Less than 24 hours
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    }

    // Less than 7 days
    if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }

    // Older than 7 days - show absolute date
    return formatAbsoluteDate(dateObj);
  } catch (error) {
    console.error('Error formatting relative time:', error, date);
    return 'Invalid date';
  }
}

/**
 * Format a date as absolute date and time
 */
export function formatAbsoluteDate(date: Date | string): string {
  try {
    const dateObj = normalizeDate(date);

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting absolute date:', error, date);
    return 'Invalid date';
  }
}

/**
 * Format a date as long format (e.g., "Monday, January 1, 2024, 10:00 AM")
 */
export function formatLongDate(date: Date | string): string {
  try {
    const dateObj = normalizeDate(date);

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting long date:', error, date);
    return 'Invalid date';
  }
}

/**
 * Format a date as short date only (no time)
 */
export function formatShortDate(date: Date | string): string {
  try {
    const dateObj = normalizeDate(date);

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting short date:', error, date);
    return 'Invalid date';
  }
}
