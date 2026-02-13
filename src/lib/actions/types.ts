/**
 * Shared ActionResult type for server actions
 *
 * Used by evaluation and interview actions for consistent return types.
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      code?: string;
      fieldErrors?: Record<string, string[]>;
    };
