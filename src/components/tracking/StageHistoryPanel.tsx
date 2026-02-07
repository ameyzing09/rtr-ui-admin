'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  ArrowRight,
  CheckCircle,
  XCircle,
  LogOut,
  Pause,
  Play,
  Circle,
} from 'lucide-react';
import { getStageHistoryAction } from '@/lib/actions/tracking';
import type { StageHistory } from '@/domain/tracking/schemas';

interface StageHistoryPanelProps {
  applicationId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface StageHistoryContentProps {
  applicationId: string;
}

/**
 * Get icon component for history action
 */
function getActionIcon(action: string) {
  switch (action) {
    case 'MOVE':
    case 'COMPLETE':
      return <ArrowRight className="h-4 w-4 text-blue-500" />;
    case 'HIRE':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'REJECT':
    case 'FAIL':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'WITHDRAW':
      return <LogOut className="h-4 w-4 text-gray-500" />;
    case 'HOLD':
      return <Pause className="h-4 w-4 text-amber-500" />;
    case 'ACTIVATE':
      return <Play className="h-4 w-4 text-blue-500" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
  }
}

/**
 * Get human-readable action label
 */
function getActionLabel(action: string): string {
  switch (action) {
    case 'MOVE':
      return 'Moved';
    case 'COMPLETE':
      return 'Completed Stage';
    case 'HIRE':
      return 'Hired';
    case 'REJECT':
    case 'FAIL':
      return 'Rejected';
    case 'WITHDRAW':
      return 'Withdrawn';
    case 'HOLD':
      return 'Put on hold';
    case 'ACTIVATE':
      return 'Activated';
    default:
      // Title-case for unknown action codes
      return action
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
  }
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

/**
 * Embeddable history timeline content component.
 * Use this when you want to embed history in another component (e.g., tabs).
 */
export function StageHistoryContent({
  applicationId,
}: StageHistoryContentProps) {
  const [history, setHistory] = useState<StageHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const LIMIT = 20;

  useEffect(() => {
    loadHistory(0);
  }, [applicationId]);

  const loadHistory = async (newOffset: number) => {
    if (newOffset === 0) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const result = await getStageHistoryAction(applicationId, LIMIT, newOffset);

      if (result.success) {
        if (newOffset === 0) {
          setHistory(result.data.data);
        } else {
          setHistory((prev) => [...prev, ...result.data.data]);
        }
        setHasMore(result.data.pagination.hasMore);
        setOffset(newOffset + LIMIT);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    loadHistory(offset);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No history available
      </div>
    );
  }

  return (
    <div>
      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* History items */}
        <div className="space-y-6">
          {history.map((entry) => (
            <div key={entry.id} className="relative pl-10">
              {/* Timeline dot */}
              <div className="absolute left-0 top-0 flex items-center justify-center w-8 h-8 bg-white rounded-full border-2 border-gray-200">
                {getActionIcon(entry.action)}
              </div>

              {/* Content */}
              <div className="bg-gray-50 rounded-lg p-4">
                {/* Action */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-900">
                    {getActionLabel(entry.action)}
                  </span>
                  {(entry.action === 'MOVE' || entry.action === 'COMPLETE') && entry.fromStageName && entry.toStageName && (
                    <span className="text-sm text-gray-500">
                      from {entry.fromStageName} to {entry.toStageName}
                    </span>
                  )}
                </div>

                {/* Stages */}
                {(entry.action === 'MOVE' || entry.action === 'COMPLETE') && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                      {entry.fromStageName || 'Start'}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {entry.toStageName || 'Unknown'}
                    </span>
                  </div>
                )}

                {/* Reason */}
                {entry.reason && (
                  <p className="text-sm text-gray-600 mb-2 italic">
                    &ldquo;{entry.reason}&rdquo;
                  </p>
                )}

                {/* Timestamp */}
                <p className="text-xs text-gray-400">
                  {formatDate(entry.changedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg disabled:opacity-50"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Standalone panel for viewing stage history.
 * Opens as a drawer/panel overlay.
 */
export function StageHistoryPanel({
  applicationId,
  isOpen,
  onClose,
}: StageHistoryPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel - Slide in from right */}
      <div className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Stage History</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <StageHistoryContent applicationId={applicationId} />
        </div>
      </div>
    </>
  );
}
