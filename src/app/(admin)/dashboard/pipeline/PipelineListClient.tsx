'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Plus, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { PipelineListResponse } from '@/domain/pipelines/schemas';
import { getStageCount } from '@/domain/pipelines/schemas';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/components/auth/AuthProvider';
import { hasPipelinePermission, PIPELINE_PERMISSIONS } from '@/domain/pipelines/permissions';

interface PipelineListClientProps {
  initialData: PipelineListResponse;
}

export function PipelineListClient({ initialData }: PipelineListClientProps) {
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Check permissions
  const canCreate = session ? hasPipelinePermission(session.user.permissions, PIPELINE_PERMISSIONS.CREATE) : false;
  const canEdit = session ? hasPipelinePermission(session.user.permissions, PIPELINE_PERMISSIONS.UPDATE) : false;

  // Filter pipelines based on search
  const filteredPipelines = useMemo(() => {
    let pipelines = initialData || [];

    // Search by name
    if (searchQuery) {
      pipelines = pipelines.filter((pipeline) =>
        pipeline.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return pipelines;
  }, [initialData, searchQuery]);

  // Empty state
  if (!initialData || initialData.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No pipelines yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by creating your first interview pipeline
          </p>
          {canCreate && (
            <Link
              href="/dashboard/pipeline/create"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Pipeline
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Search and Actions */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search pipelines by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Create Button */}
          <div className="flex items-center gap-3">
            {canCreate && (
              <Link
                href="/dashboard/pipeline/create"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Create Pipeline
              </Link>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 text-sm text-gray-500">
          Showing {filteredPipelines.length} of {initialData.length} pipelines
          {searchQuery && ' (filtered)'}
        </div>
      </div>

      {/* Pipeline List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredPipelines.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-gray-500">
              No pipelines match your search criteria
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPipelines.map((pipeline) => (
              <PipelineCard
                key={pipeline.id}
                pipeline={pipeline}
                canEdit={canEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Individual pipeline card component
 */
interface PipelineCardProps {
  pipeline: PipelineListResponse[number];
  canEdit: boolean;
}

function PipelineCard({ pipeline, canEdit }: PipelineCardProps) {
  const stageCount = getStageCount(pipeline);

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        {/* Pipeline Info */}
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {pipeline.name}
              </h3>
            </div>

            {/* Status Badge */}
            {pipeline.is_active && (
              <Badge variant="success">Active</Badge>
            )}
          </div>

          {/* Description */}
          {pipeline.description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {pipeline.description}
            </p>
          )}

          {/* Metadata */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              {stageCount} {stageCount === 1 ? 'stage' : 'stages'}
            </span>

            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Updated {formatDistanceToNow(pipeline.updated_at, { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Edit Action */}
        {canEdit && (
          <div className="ml-4">
            <Link
              href={`/dashboard/pipeline/${pipeline.id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}
