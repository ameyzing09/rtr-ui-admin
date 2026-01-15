'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Mail, Clock } from 'lucide-react';
import { TrackingStatusBadge } from './TrackingStatusBadge';
import type { BoardApplication } from '@/domain/tracking/schemas';
import { isTerminalStatus } from '@/domain/tracking/schemas';

interface ApplicationCardProps {
  application: BoardApplication;
  stageIndex: number;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * Format relative time from ISO string
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes}m ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export function ApplicationCard({
  application,
  stageIndex,
  onClick,
  disabled = false,
}: ApplicationCardProps) {
  const isTerminal = isTerminalStatus(application.status);
  const isDraggable = !disabled && !isTerminal;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: application.applicationId,
    data: {
      type: 'application',
      application,
      stageIndex,
    },
    disabled: !isDraggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white rounded-lg border border-gray-200 p-3 cursor-pointer
        hover:shadow-md hover:border-gray-300 transition-all
        ${isDragging ? 'opacity-50 shadow-lg scale-105' : ''}
        ${isTerminal ? 'opacity-60' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        {/* Drag Handle */}
        {isDraggable && (
          <button
            className="flex-shrink-0 p-1 -ml-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

        {/* Card Content */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <h4 className="font-medium text-gray-900 truncate">
            {application.applicantName}
          </h4>

          {/* Email */}
          <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
            <Mail className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{application.applicantEmail}</span>
          </div>

          {/* Status & Time */}
          <div className="flex items-center justify-between mt-2">
            <TrackingStatusBadge status={application.status} size="sm" />
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              <span>{formatRelativeTime(application.enteredStageAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
