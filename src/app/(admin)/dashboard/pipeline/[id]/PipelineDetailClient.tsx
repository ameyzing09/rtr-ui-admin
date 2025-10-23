'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Briefcase, ArrowLeft, CheckCircle } from 'lucide-react';
import type { Pipeline } from '@/domain/pipelines/schemas';
import { parsePipelineStages } from '@/domain/pipelines/schemas';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { useAuth } from '@/components/auth/AuthProvider';
import { hasPipelinePermission, PIPELINE_PERMISSIONS } from '@/domain/pipelines/permissions';
import { StagePreviewStrip } from '../create/StagePreviewStrip';

interface PipelineDetailClientProps {
  pipeline: Pipeline;
}

/**
 * Pipeline Detail Client Component
 * Displays pipeline details with "Assign to Jobs" CTA
 */
export function PipelineDetailClient({ pipeline }: PipelineDetailClientProps) {
  const { session } = useAuth();
  const canEdit = session
    ? hasPipelinePermission(session.user.permissions, PIPELINE_PERMISSIONS.UPDATE)
    : false;

  // Parse stages
  const pipelineWithStages = parsePipelineStages(pipeline);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/pipeline"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pipelines
          </Link>
        </div>
        <div className="mt-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{pipeline.name}</h1>
              {pipeline.is_active && (
                <Badge variant="success">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Active
                </Badge>
              )}
            </div>
            {pipeline.description && (
              <p className="mt-2 text-sm text-gray-600">{pipeline.description}</p>
            )}
          </div>

          {/* Edit Button */}
          {canEdit && (
            <Link
              href={`/dashboard/pipeline/${pipeline.id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Big CTA: Assign to Jobs */}
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Ready to assign this pipeline?
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Connect this pipeline to job postings to streamline your interview process
                    </p>
                  </div>
                </div>
              </div>
              <Link
                href={`/dashboard/jobs?action=assign&pipelineId=${pipeline.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-blue-700"
              >
                <Briefcase className="h-5 w-5" />
                Assign to Jobs
              </Link>
            </div>
          </Card>

          {/* Interview Stages */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Interview Stages ({pipelineWithStages.stages.length})
            </h2>

            {/* Stage Preview Strip - Read Only */}
            <div className="mb-4">
              <StagePreviewStrip
                stages={pipelineWithStages.stages.map(s => ({ name: s.stage }))}
                interactive={false}
                variant="compact"
              />
            </div>

            <div className="space-y-3">
              {pipelineWithStages.stages.map((stage, index) => (
                <Card key={index} className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Stage Number */}
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-base font-semibold text-blue-700">
                      {index + 1}
                    </div>

                    {/* Stage Details */}
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-900">
                        {stage.stage}
                      </h4>

                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Type:</span>
                          <Badge variant="default" className="text-xs">
                            {stage.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Conducted by:</span>
                          <Badge variant="default" className="text-xs">
                            {stage.conducted_by}
                          </Badge>
                        </div>
                      </div>

                      {/* Metadata */}
                      {stage.metadata && Object.keys(stage.metadata).length > 0 && (
                        <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <h5 className="mb-2 text-xs font-semibold text-gray-700">
                            Metadata
                          </h5>
                          <dl className="grid grid-cols-2 gap-2">
                            {Object.entries(stage.metadata).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <dt className="font-medium text-gray-500">{key}:</dt>
                                <dd className="text-gray-900">{String(value)}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Pipeline Metadata */}
          <Card className="p-6">
            <h3 className="mb-4 text-base font-semibold text-gray-900">
              Pipeline Information
            </h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDistanceToNow(pipeline.created_at, { addSuffix: true })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDistanceToNow(pipeline.updated_at, { addSuffix: true })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Pipeline ID</dt>
                <dd className="mt-1 text-xs font-mono text-gray-900">{pipeline.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Stages</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {pipelineWithStages.stages.length}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
