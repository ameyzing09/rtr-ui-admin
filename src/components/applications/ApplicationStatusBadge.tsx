import { Badge } from '@/components/ui/Badge';
import { getApplicationStatusColor, getApplicationStatusLabel, type ApplicationStatus } from '@/domain/applications/schemas';

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

/**
 * Application Status Badge Component
 * Displays application status with appropriate color
 */
export function ApplicationStatusBadge({ status, className }: ApplicationStatusBadgeProps) {
  const colorClass = getApplicationStatusColor(status);
  const label = getApplicationStatusLabel(status);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClass} ${className || ''}`}
    >
      {label}
    </span>
  );
}
