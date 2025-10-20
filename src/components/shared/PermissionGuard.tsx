/**
 * Permission Guard Components (G2)
 *
 * React components for client-side permission enforcement
 * - Hide/disable UI elements based on user permissions
 * - Show fallback UI for unauthorized access
 * - Never rely on these alone - always enforce on server
 */

'use client';

import { ReactNode } from 'react';
import { AlertCircle, Lock } from 'lucide-react';
import type { Permission } from '@/lib/rbac/permissions';
import { can } from '@/lib/rbac/permissions';

export interface PermissionGuardProps {
  /**
   * User's permissions array
   */
  permissions: Permission[];

  /**
   * Required permission(s)
   */
  required: Permission | Permission[];

  /**
   * What to render if user has permission
   */
  children: ReactNode;

  /**
   * What to render if user doesn't have permission
   * If not provided, nothing is rendered (hidden)
   */
  fallback?: ReactNode;

  /**
   * Check type: 'any' (at least one) or 'all' (all of them)
   * @default 'all'
   */
  checkType?: 'any' | 'all';
}

/**
 * Gate component - shows children only if user has permission(s)
 *
 * @example
 * ```tsx
 * <PermissionGate
 *   permissions={user.permissions}
 *   required={JOB_PERMISSIONS.DELETE}
 * >
 *   <button>Delete Job</button>
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  permissions,
  required,
  children,
  fallback,
  checkType = 'all',
}: PermissionGuardProps) {
  const requiredArray = Array.isArray(required) ? required : [required];

  const hasPermission =
    checkType === 'any'
      ? requiredArray.some((perm) => can(permissions, perm))
      : requiredArray.every((perm) => can(permissions, perm));

  if (hasPermission) {
    return children;
  }

  return fallback ?? null;
}

export interface ProtectedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * User's permissions
   */
  permissions: Permission[];

  /**
   * Required permission(s)
   */
  required: Permission | Permission[];

  /**
   * Button label
   */
  children: ReactNode;

  /**
   * Tooltip message when permission denied
   */
  deniedTitle?: string;

  /**
   * Detailed message shown on hover
   */
  deniedDescription?: string;

  /**
   * Check type: 'any' or 'all'
   */
  checkType?: 'any' | 'all';
}

/**
 * Protected button - disables and shows tooltip if user lacks permission
 *
 * @example
 * ```tsx
 * <ProtectedButton
 *   permissions={user.permissions}
 *   required={JOB_PERMISSIONS.DELETE}
 *   onClick={handleDelete}
 * >
 *   Delete
 * </ProtectedButton>
 * ```
 */
export function ProtectedButton({
  permissions,
  required,
  children,
  deniedTitle = 'Permission Denied',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  deniedDescription, // Reserved for future use in tooltip/popover enhancements
  checkType = 'all',
  disabled,
  title,
  className,
  ...props
}: ProtectedButtonProps) {
  const requiredArray = Array.isArray(required) ? required : [required];

  const hasPermission =
    checkType === 'any'
      ? requiredArray.some((perm) => can(permissions, perm))
      : requiredArray.every((perm) => can(permissions, perm));

  const isDisabled = disabled || !hasPermission;
  const tooltipText = !hasPermission ? deniedTitle : title;

  return (
    <button
      {...props}
      disabled={isDisabled}
      title={tooltipText}
      className={`
        ${className || ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </button>
  );
}

export interface ProtectedIconProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * User's permissions
   */
  permissions: Permission[];

  /**
   * Required permission(s)
   */
  required: Permission | Permission[];

  /**
   * Icon to show when denied
   * @default <Lock /> icon
   */
  deniedIcon?: ReactNode;

  /**
   * Check type: 'any' or 'all'
   */
  checkType?: 'any' | 'all';

  /**
   * Children (the element to conditionally render)
   */
  children: ReactNode;
}

/**
 * Shows an icon overlay when permission is denied
 * Useful for action menus, buttons, etc.
 *
 * @example
 * ```tsx
 * <ProtectedIcon
 *   permissions={user.permissions}
 *   required={JOB_PERMISSIONS.UPDATE}
 * >
 *   <EditIcon />
 * </ProtectedIcon>
 * ```
 */
export function ProtectedIcon({
  permissions,
  required,
  deniedIcon = <Lock className="h-4 w-4 text-red-500" />,
  checkType = 'all',
  children,
  className,
  ...props
}: ProtectedIconProps) {
  const requiredArray = Array.isArray(required) ? required : [required];

  const hasPermission =
    checkType === 'any'
      ? requiredArray.some((perm) => can(permissions, perm))
      : requiredArray.every((perm) => can(permissions, perm));

  if (hasPermission) {
    return <div className={className} {...props}>{children}</div>;
  }

  return (
    <div className={`relative ${className}`} {...props}>
      {children}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
        {deniedIcon}
      </div>
    </div>
  );
}

export interface RestrictedSectionProps {
  /**
   * User's permissions
   */
  permissions: Permission[];

  /**
   * Required permission(s)
   */
  required: Permission | Permission[];

  /**
   * Content to show if permitted
   */
  children: ReactNode;

  /**
   * Title of the section
   */
  title?: string;

  /**
   * Check type: 'any' or 'all'
   */
  checkType?: 'any' | 'all';
}

/**
 * Restricted section - shows permission denied banner if no access
 *
 * @example
 * ```tsx
 * <RestrictedSection
 *   permissions={user.permissions}
 *   required={PERMISSIONS.BILLING_READ}
 *   title="Billing Information"
 * >
 *   <BillingContent />
 * </RestrictedSection>
 * ```
 */
export function RestrictedSection({
  permissions,
  required,
  children,
  title,
  checkType = 'all',
}: RestrictedSectionProps) {
  const requiredArray = Array.isArray(required) ? required : [required];

  const hasPermission =
    checkType === 'any'
      ? requiredArray.some((perm) => can(permissions, perm))
      : requiredArray.every((perm) => can(permissions, perm));

  if (hasPermission) {
    return children;
  }

  return (
    <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-yellow-900">
            {title ? `${title} - Permission Denied` : 'Permission Denied'}
          </h3>
          <p className="mt-1 text-sm text-yellow-800">
            You don&apos;t have permission to view this content. Contact your administrator if you
            believe this is an error.
          </p>
        </div>
      </div>
    </div>
  );
}

export interface PermissionCheckProps {
  /**
   * User's permissions
   */
  permissions: Permission[];

  /**
   * Permission(s) to check
   */
  permission: Permission | Permission[];

  /**
   * What to render based on permission
   */
  render: (hasPermission: boolean) => ReactNode;

  /**
   * Check type: 'any' or 'all'
   */
  checkType?: 'any' | 'all';
}

/**
 * Render prop component for conditional rendering based on permissions
 *
 * @example
 * ```tsx
 * <PermissionCheck
 *   permissions={user.permissions}
 *   permission={JOB_PERMISSIONS.DELETE}
 *   render={(canDelete) => (
 *     <button disabled={!canDelete}>Delete</button>
 *   )}
 * />
 * ```
 */
export function PermissionCheck({
  permissions,
  permission,
  render,
  checkType = 'all',
}: PermissionCheckProps) {
  const permissionArray = Array.isArray(permission) ? permission : [permission];

  const hasPermission =
    checkType === 'any'
      ? permissionArray.some((perm) => can(permissions, perm))
      : permissionArray.every((perm) => can(permissions, perm));

  return render(hasPermission);
}
