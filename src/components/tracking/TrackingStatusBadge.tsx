'use client';

import {
  type TrackingStatus,
  getTrackingStatusStyle,
  getTrackingStatusLabel,
} from '@/domain/tracking/schemas';

interface TrackingStatusBadgeProps {
  status: TrackingStatus;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function TrackingStatusBadge({
  status,
  size = 'sm',
}: TrackingStatusBadgeProps) {
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
