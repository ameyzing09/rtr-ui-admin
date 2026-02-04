'use client';

import {
  type TrackingStatus,
  getTrackingStatusStyle,
  getTrackingStatusLabel,
} from '@/domain/tracking/schemas';
import {
  type TenantStatus,
  getTenantStatusInlineStyle,
} from '@/domain/tracking/statusSettings/schemas';

interface TrackingStatusBadgeProps {
  status: TrackingStatus;
  size?: 'sm' | 'md' | 'lg';
  /** Optional dynamic status config from API with custom colors */
  statusConfig?: TenantStatus;
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function TrackingStatusBadge({
  status,
  size = 'sm',
  statusConfig,
}: TrackingStatusBadgeProps) {
  // Use dynamic config if provided and has colorHex
  if (statusConfig?.colorHex) {
    const inlineStyle = getTenantStatusInlineStyle(statusConfig.colorHex);
    const displayName = statusConfig.displayName || getTrackingStatusLabel(status);

    return (
      <span
        className={`inline-flex items-center rounded-full font-medium border ${sizeClasses[size]}`}
        style={{
          backgroundColor: inlineStyle.backgroundColor,
          color: inlineStyle.color,
          borderColor: inlineStyle.borderColor,
        }}
      >
        {displayName}
      </span>
    );
  }

  // Fallback to hardcoded styles for backward compatibility
  const style = getTrackingStatusStyle(status);
  const label = getTrackingStatusLabel(status);

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium border
        ${style.bg} ${style.text} ${style.border}
        ${sizeClasses[size]}
      `}
    >
      {label}
    </span>
  );
}
