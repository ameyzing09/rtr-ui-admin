/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  MoreVertical,
  Trash2,
  Copy,
  Archive,
  Eye,
  Users,
  Activity as ActivityIcon,
  Settings as SettingsIcon,
  GitBranch,
  Plus,
} from 'lucide-react';
import type { Job } from '@/domain/jobs/schemas';
import { getJobStatusBadge, isJobActive } from '@/domain/jobs/schemas';
import type { ApplicationListResponse, Application } from '@/domain/applications/schemas';
import type { Pipeline } from '@/domain/pipelines/schemas';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { useAuth } from '@/components/auth/AuthProvider';
import { hasJobPermission, JOB_PERMISSIONS } from '@/domain/jobs/permissions';
import { hasApplicationPermission, APPLICATION_PERMISSIONS } from '@/domain/applications/permissions';
import { DeleteJobModal } from '@/components/jobs/DeleteJobModal';
import { CreateApplicationModal } from '@/components/applications/CreateApplicationModal';
import { UpdateApplicationModal } from '@/components/applications/UpdateApplicationModal';
import { DeleteApplicationModal } from '@/components/applications/DeleteApplicationModal';
import { ApplicationStatusBadge } from '@/components/applications/ApplicationStatusBadge';

interface JobDetailClientProps {
  job: Job;
  applications: ApplicationListResponse;
  pipeline: Pipeline | null;
}

type TabType = 'overview' | 'pipeline' | 'applicants' | 'activity' | 'settings';

export function JobDetailClient({ job, applications, pipeline }: JobDetailClientProps) {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Check permissions
  const canEdit = session ? hasJobPermission(session.user.permissions, JOB_PERMISSIONS.UPDATE) : false;
  const canDelete = session ? hasJobPermission(session.user.permissions, JOB_PERMISSIONS.DELETE) : false;

  const active = isJobActive(job);
  const statusBadge = getJobStatusBadge(job);

  // Tab configuration
  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
    { id: 'applicants', label: 'Applicants', icon: Users },
    { id: 'activity', label: 'Activity', icon: ActivityIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link
            href="/dashboard/jobs"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
        </div>

        {/* Title and Actions */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <Badge variant={active ? 'success' : 'default'}>{statusBadge}</Badge>
            </div>

            {/* Metadata */}
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {job.department && (
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  {job.department}
                </span>
              )}

              {job.location && (
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {job.location}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {canEdit && (
              <Link
                href={`/dashboard/jobs/${job.id}/edit`}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Link>
            )}

            {/* More Actions Menu */}
            {(canEdit || canDelete) && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          // TODO: Implement duplicate
                          alert('Duplicate functionality coming soon');
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Copy className="h-4 w-4" />
                        Duplicate
                      </button>

                      <button
                        onClick={() => {
                          // TODO: Implement archive
                          alert('Archive functionality coming soon');
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Archive className="h-4 w-4" />
                        Archive
                      </button>

                      {canDelete && (
                        <>
                          <div className="my-1 border-t border-gray-200" />
                          <button
                            onClick={() => {
                              setShowMenu(false);
                              setShowDeleteModal(true);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-6 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {activeTab === 'overview' && <OverviewTab job={job} />}
        {activeTab === 'pipeline' && <PipelineTab job={job} pipeline={pipeline} />}
        {activeTab === 'applicants' && <ApplicantsTab job={job} applications={applications} />}
        {activeTab === 'activity' && <ActivityTab job={job} />}
        {activeTab === 'settings' && <SettingsTab job={job} onDelete={() => setShowDeleteModal(true)} />}
      </div>

      {/* Delete Modal */}
      <DeleteJobModal
        job={job}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

// ============================================================================
// Tab Components
// ============================================================================

function OverviewTab({ job }: { job: Job }) {
  return (
    <div className="space-y-6">
      {/* Job Information Card */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Job Information</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-500">Title</label>
            <p className="mt-1 text-sm text-gray-900">{job.title}</p>
          </div>

          {job.department && (
            <div>
              <label className="text-sm font-medium text-gray-500">Department</label>
              <p className="mt-1 text-sm text-gray-900">{job.department}</p>
            </div>
          )}

          {job.location && (
            <div>
              <label className="text-sm font-medium text-gray-500">Location</label>
              <p className="mt-1 text-sm text-gray-900">{job.location}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-500">Visibility</label>
            <p className="mt-1 text-sm text-gray-900">{job.isPublic ? 'Public' : 'Private'}</p>
          </div>

          {job.publishAt && (
            <div>
              <label className="text-sm font-medium text-gray-500">Publish Date</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(job.publishAt)}</p>
            </div>
          )}

          {job.expireAt && (
            <div>
              <label className="text-sm font-medium text-gray-500">Expiration Date</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(job.expireAt)}</p>
            </div>
          )}

          {job.externalApplyUrl && (
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-500">External Apply URL</label>
              <p className="mt-1 text-sm text-blue-600 hover:underline">
                <a href={job.externalApplyUrl} target="_blank" rel="noopener noreferrer">
                  {job.externalApplyUrl}
                </a>
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Description Card */}
      {job.description && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Description</h2>
          <div
            className="mt-4 prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </Card>
      )}
    </div>
  );
}

function PipelineTab({ job, pipeline }: { job: Job; pipeline: Pipeline | null }) {
  if (!pipeline) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Pipeline</h2>
        <p className="mt-2 text-sm text-gray-600">
          No pipeline assigned to this job yet.
        </p>
        <div className="mt-4">
          <Link
            href={`/dashboard/pipeline?job=${job.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <GitBranch className="h-4 w-4" />
            Assign Pipeline
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{pipeline.name}</h2>
            <p className="mt-1 text-sm text-gray-600">{pipeline.description}</p>
          </div>
          <Badge variant={pipeline.is_active ? 'success' : 'default'}>
            {pipeline.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </Card>

      {/* Pipeline Stages */}
      <Card className="p-6">
        <h3 className="text-md font-semibold text-gray-900 mb-4">
          Pipeline Stages ({pipeline.stages.length})
        </h3>

        {/* Horizontal Stage Flow */}
        <div className="relative">
          <div className="flex items-center overflow-x-auto pb-4">
            {pipeline.stages.map((stage, index) => (
              <div key={index} className="flex items-center">
                {/* Stage Card */}
                <div className="flex-shrink-0 w-48 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {stage.stage}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Type:</span>
                      <span className="capitalize">{stage.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">By:</span>
                      <span>{stage.conducted_by}</span>
                    </div>
                  </div>
                </div>

                {/* Arrow between stages */}
                {index < pipeline.stages.length - 1 && (
                  <div className="flex-shrink-0 mx-2 text-gray-300">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* View Full Pipeline Link */}
      <div className="flex justify-end">
        <Link
          href={`/dashboard/pipeline/${pipeline.id}`}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <GitBranch className="h-4 w-4" />
          View Full Pipeline Details
        </Link>
      </div>
    </div>
  );
}

function ApplicantsTab({ job, applications }: { job: Job; applications: ApplicationListResponse }) {
  const router = useRouter();
  const { session } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedApplicationForEdit, setSelectedApplicationForEdit] = useState<Application | null>(null);
  const [selectedApplicationForDelete, setSelectedApplicationForDelete] = useState<Application | null>(null);

  // Check permissions
  const canCreate = session ? hasApplicationPermission(session.user.permissions, APPLICATION_PERMISSIONS.CREATE) : false;
  const canUpdate = session ? hasApplicationPermission(session.user.permissions, APPLICATION_PERMISSIONS.UPDATE) : false;
  const canDelete = session ? hasApplicationPermission(session.user.permissions, APPLICATION_PERMISSIONS.DELETE) : false;

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Applicants</h2>
            <p className="mt-1 text-sm text-gray-600">
              {applications.length} applicant{applications.length !== 1 ? 's' : ''} for this position
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canCreate && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Applicant
              </button>
            )}
            <Link
              href={`/dashboard/applications?job=${job.id}`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Users className="h-4 w-4" />
              View All
            </Link>
          </div>
        </div>

        {/* Applications Table */}
        {applications.length === 0 ? (
          <div className="mt-6 text-center py-12">
            <p className="text-sm text-gray-500">No applicants yet</p>
            {canCreate && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add First Applicant
              </button>
            )}
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Applied
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {applications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-medium text-gray-900">{application.applicantName}</div>
                      <div className="text-sm text-gray-500">{application.applicantEmail}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {application.applicantPhone}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <ApplicationStatusBadge status={application.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(application.createdAt)}
                    </td>
                    <td className="relative whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      {(canUpdate || canDelete) && (
                        <div className="flex items-center justify-end gap-2">
                          {canUpdate && (
                            <button
                              onClick={() => setSelectedApplicationForEdit(application)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setSelectedApplicationForDelete(application)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modals */}
      {canCreate && (
        <CreateApplicationModal
          jobs={[job]}
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => router.refresh()}
          preselectedJobId={job.id}
        />
      )}

      {canUpdate && selectedApplicationForEdit && (
        <UpdateApplicationModal
          application={selectedApplicationForEdit}
          isOpen={!!selectedApplicationForEdit}
          onClose={() => setSelectedApplicationForEdit(null)}
          onSuccess={() => router.refresh()}
        />
      )}

      {canDelete && selectedApplicationForDelete && (
        <DeleteApplicationModal
          application={selectedApplicationForDelete}
          isOpen={!!selectedApplicationForDelete}
          onClose={() => setSelectedApplicationForDelete(null)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}

function ActivityTab({ job }: { job: Job }) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900">Activity Feed</h2>
      <p className="mt-2 text-sm text-gray-600">Recent activity and changes for this job.</p>
      <div className="mt-6 text-center text-sm text-gray-500">
        Activity feed coming soon...
      </div>
    </Card>
  );
}

function SettingsTab({ job, onDelete }: { job: Job; onDelete: () => void }) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
      <p className="mt-2 text-sm text-gray-600">Manage job settings and actions.</p>

      <div className="mt-6 space-y-4">
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Archive Job</h3>
          <p className="mt-1 text-sm text-gray-600">
            Remove this job from active listings without deleting it.
          </p>
          <button className="mt-3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Archive
          </button>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-900">Delete Job</h3>
          <p className="mt-1 text-sm text-red-700">
            Permanently delete this job and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={onDelete}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Delete Job
          </button>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatDate(date: Date | null): string {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
