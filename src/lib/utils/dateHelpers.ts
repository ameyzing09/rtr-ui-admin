/**
 * Date Handling Utilities (F3)
 *
 * Provides consistent date formatting and validation across the application
 * - Locale-aware formatting
 * - ISO date handling
 * - Validation that mirrors server-side logic
 */

/**
 * Format options for different date display contexts
 */
export type DateFormat =
  | 'full' // "January 15, 2024 at 10:30 AM"
  | 'long' // "January 15, 2024"
  | 'medium' // "Jan 15, 2024"
  | 'short' // "1/15/24"
  | 'time' // "10:30 AM"
  | 'datetime' // "Jan 15, 2024, 10:30 AM"
  | 'relative' // "2 hours ago", "in 3 days"
  | 'iso'; // "2024-01-15T10:30:00.000Z"

/**
 * Format a date with locale-aware formatting
 *
 * @param date - Date to format (Date object, ISO string, or null)
 * @param format - Display format
 * @param locale - Locale for formatting (defaults to user's browser locale)
 * @returns Formatted date string or fallback
 */
export function formatDate(
  date: Date | string | null | undefined,
  format: DateFormat = 'medium',
  locale: string = 'en-US'
): string {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check for invalid date
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatDate:', date);
    return 'Invalid Date';
  }

  switch (format) {
    case 'full':
      return new Intl.DateTimeFormat(locale, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(dateObj);

    case 'long':
      return new Intl.DateTimeFormat(locale, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(dateObj);

    case 'medium':
      return new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(dateObj);

    case 'short':
      return new Intl.DateTimeFormat(locale, {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
      }).format(dateObj);

    case 'time':
      return new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(dateObj);

    case 'datetime':
      return new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(dateObj);

    case 'relative':
      return formatRelativeDate(dateObj);

    case 'iso':
      return dateObj.toISOString();

    default:
      return dateObj.toLocaleDateString(locale);
  }
}

/**
 * Format a date relative to now (e.g., "2 hours ago", "in 3 days")
 *
 * @param date - Date to format
 * @param now - Reference date (defaults to current time)
 * @returns Relative date string
 */
export function formatRelativeDate(date: Date | string, now: Date = new Date()): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const diffMs = now.getTime() - dateObj.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  // Future dates
  if (diffMs < 0) {
    const absDiffSeconds = Math.abs(diffSeconds);
    const absDiffMinutes = Math.abs(diffMinutes);
    const absDiffHours = Math.abs(diffHours);
    const absDiffDays = Math.abs(diffDays);
    const absDiffWeeks = Math.abs(diffWeeks);
    const absDiffMonths = Math.abs(diffMonths);
    const absDiffYears = Math.abs(diffYears);

    if (absDiffSeconds < 60) return 'in a few seconds';
    if (absDiffMinutes < 60) return `in ${absDiffMinutes} ${absDiffMinutes === 1 ? 'minute' : 'minutes'}`;
    if (absDiffHours < 24) return `in ${absDiffHours} ${absDiffHours === 1 ? 'hour' : 'hours'}`;
    if (absDiffDays < 7) return `in ${absDiffDays} ${absDiffDays === 1 ? 'day' : 'days'}`;
    if (absDiffWeeks < 4) return `in ${absDiffWeeks} ${absDiffWeeks === 1 ? 'week' : 'weeks'}`;
    if (absDiffMonths < 12) return `in ${absDiffMonths} ${absDiffMonths === 1 ? 'month' : 'months'}`;
    return `in ${absDiffYears} ${absDiffYears === 1 ? 'year' : 'years'}`;
  }

  // Past dates
  if (diffSeconds < 60) return 'just now';
  if (diffMinutes === 1) return '1 minute ago';
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return '1 week ago';
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  if (diffMonths === 1) return '1 month ago';
  if (diffMonths < 12) return `${diffMonths} months ago`;
  if (diffYears === 1) return '1 year ago';
  return `${diffYears} years ago`;
}

/**
 * Convert a Date object to datetime-local input format
 * Format: YYYY-MM-DDTHH:MM
 *
 * @param date - Date to convert
 * @returns Formatted string for datetime-local input
 */
export function toDateTimeLocalString(date: Date | null | undefined): string {
  if (!date) return '';

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Parse datetime-local input value to Date object
 *
 * @param value - Input value from datetime-local input
 * @returns Date object or null
 */
export function fromDateTimeLocalString(value: string): Date | null {
  if (!value || value.trim() === '') return null;

  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Validation: Ensure expireAt > publishAt
 * Mirrors server-side validation logic
 *
 * @param publishAt - Publish date
 * @param expireAt - Expiration date
 * @returns Object with isValid flag and error message
 */
export function validatePublishExpireDates(
  publishAt: Date | null | undefined,
  expireAt: Date | null | undefined
): { isValid: boolean; error?: string } {
  // If either date is not set, validation passes
  // (individual field requirements handled elsewhere)
  if (!publishAt || !expireAt) {
    return { isValid: true };
  }

  // Both dates must be valid
  if (isNaN(publishAt.getTime()) || isNaN(expireAt.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  // Expiration must be after publish
  if (expireAt <= publishAt) {
    return { isValid: false, error: 'Expiration date must be after publish date' };
  }

  return { isValid: true };
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date | string | null | undefined): boolean {
  if (!date) return false;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return false;

  return dateObj.getTime() < Date.now();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date | string | null | undefined): boolean {
  if (!date) return false;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return false;

  return dateObj.getTime() > Date.now();
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Get the start of day (00:00:00) for a given date
 */
export function startOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

/**
 * Get the end of day (23:59:59) for a given date
 */
export function endOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
}

/**
 * Add/subtract days from a date
 */
export function addDays(date: Date, days: number): Date {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

/**
 * Format date range for display
 *
 * @param start - Start date
 * @param end - End date
 * @param format - Display format
 * @returns Formatted range string (e.g., "Jan 1 - Jan 15, 2024")
 */
export function formatDateRange(
  start: Date | string | null,
  end: Date | string | null,
  format: DateFormat = 'medium'
): string {
  if (!start && !end) return 'N/A';
  if (!start) return `Until ${formatDate(end, format)}`;
  if (!end) return `From ${formatDate(start, format)}`;

  const startObj = typeof start === 'string' ? new Date(start) : start;
  const endObj = typeof end === 'string' ? new Date(end) : end;

  // Same year optimization
  if (startObj.getFullYear() === endObj.getFullYear()) {
    // Same month optimization
    if (startObj.getMonth() === endObj.getMonth()) {
      const startDay = startObj.getDate();
      const endDay = endObj.getDate();
      const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(startObj);
      const year = startObj.getFullYear();
      return `${month} ${startDay}-${endDay}, ${year}`;
    }

    const startMonth = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(startObj);
    const endMonth = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(endObj);
    const year = startObj.getFullYear();
    return `${startMonth} - ${endMonth}, ${year}`;
  }

  // Different years
  return `${formatDate(start, format)} - ${formatDate(end, format)}`;
}
