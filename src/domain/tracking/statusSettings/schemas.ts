import { z } from 'zod';

// ============================================================================
// Tenant Status Schemas
// ============================================================================

/**
 * TenantStatus response type (camelCase from API)
 */
export const tenantStatusSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().optional(), // Backend may not return this
  statusCode: z.string(),
  displayName: z.string(),
  colorHex: z.string(),
  isTerminal: z.boolean(),
  sortOrder: z.number(),
  actionCode: z.string().optional(),
  createdAt: z.string().optional(), // Backend may not return this
  updatedAt: z.string().optional(), // Backend may not return this
});
export type TenantStatus = z.infer<typeof tenantStatusSchema>;

/**
 * List response schema
 */
export const tenantStatusListResponseSchema = z.object({
  data: z.array(tenantStatusSchema),
});
export type TenantStatusListResponse = z.infer<typeof tenantStatusListResponseSchema>;

/**
 * Single status response schema (with data envelope)
 */
export const tenantStatusResponseSchema = z.object({
  data: tenantStatusSchema,
}).transform((res) => res.data);

// ============================================================================
// Request DTOs (snake_case for API)
// ============================================================================

/**
 * Create tenant status request
 */
export const createTenantStatusRequestSchema = z.object({
  status_code: z.string().min(1, 'Status code is required').max(50),
  display_name: z.string().min(1, 'Display name is required').max(100),
  color_hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  is_terminal: z.boolean(),
  sort_order: z.number().int().min(0),
});
export type CreateTenantStatusRequest = z.infer<typeof createTenantStatusRequestSchema>;

/**
 * Update tenant status request
 */
export const updateTenantStatusRequestSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  color_hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  is_terminal: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
});
export type UpdateTenantStatusRequest = z.infer<typeof updateTenantStatusRequestSchema>;

// ============================================================================
// UI Helpers
// ============================================================================

/**
 * Get inline style object for dynamic hex colors
 * Used when TenantStatus has a custom colorHex
 */
export function getTenantStatusInlineStyle(colorHex: string): {
  backgroundColor: string;
  color: string;
  borderColor: string;
} {
  // Normalize color to include # prefix
  const normalizedColor = colorHex.startsWith('#') ? colorHex : `#${colorHex}`;

  // Parse color components
  const hex = normalizedColor.slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Create a slightly darker shade for border
  const darken = (value: number) => Math.max(0, Math.floor(value * 0.85));
  const borderColor = `#${darken(r).toString(16).padStart(2, '0')}${darken(g).toString(16).padStart(2, '0')}${darken(b).toString(16).padStart(2, '0')}`;

  // Use a lighter tint for background (20% opacity effect)
  const lighten = (value: number) => Math.min(255, Math.floor(value + (255 - value) * 0.8));
  const backgroundColor = `#${lighten(r).toString(16).padStart(2, '0')}${lighten(g).toString(16).padStart(2, '0')}${lighten(b).toString(16).padStart(2, '0')}`;

  return {
    backgroundColor,
    color: normalizedColor, // Use original color for text
    borderColor,
  };
}

/**
 * Normalize color hex to always include # prefix
 */
export function normalizeColorHex(color: string): string {
  return color.startsWith('#') ? color : `#${color}`;
}
