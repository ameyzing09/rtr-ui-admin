'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Plus, MoreVertical, Edit, Trash2, FileText } from 'lucide-react';
import type { Application, ApplicationListResponse } from '@/domain/applications/schemas';
import type { JobListItem } from '@/domain/jobs/schemas';
import { ApplicationStatusBadge } from '@/components/applications/ApplicationStatusBadge';
import { CreateApplicationModal } from '@/components/applications/CreateApplicationModal';
import { UpdateApplicationModal } from '@/components/applications/UpdateApplicationModal';
import { DeleteApplicationModal } from '@/components/applications/DeleteApplicationModal';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/components/auth/AuthProvider';
import { hasApplicationPermission, APPLICATION_PERMISSIONS } from '@/domain/applications/permissions';

interface ApplicationListClientProps {
  initialApplications: ApplicationListResponse;
  jobs: JobListItem[];
}

export function ApplicationListClient({
  initialApplications,
  jobs,
}: ApplicationListClientProps) {
  const router = useRouter();
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedApplicationForEdit, setSelectedApplicationForEdit] = useState<Application | null>(null);
  const [selectedApplicationForDelete, setSelectedApplicationForDelete] = useState<Application | null>(null);

  // Check permissions
  const canCreate = session ? hasApplicationPermission(session.user.permissions, APPLICATION_PERMISSIONS.CREATE) : false;
  const canUpdate = session ? hasApplicationPermission(session.user.permissions, APPLICATION_PERMISSIONS.UPDATE) : false;
  const canDelete = session ? hasApplicationPermission(session.user.permissions, APPLICATION_PERMISSIONS.DELETE) : false;

  // Filter applications
  const filteredApplications = useMemo(() => {
    let apps = initialApplications || [];

    // Search by applicant name or email
    if (searchQuery) {
      apps = apps.filter(
        (app) =>
          app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.applicantEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter) {
      apps = apps.filter((app) => app.status === statusFilter);
    }

    // Filter by job
    if (jobFilter) {
      apps = apps.filter((app) => app.jobId === jobFilter);
    }

    return apps;
  }, [initialApplications, searchQuery, statusFilter, jobFilter]);

  // Get job title for an application
  const getJobTitle = (jobId: string): string => {
    const job = jobs.find((j) => j.id === jobId);
    return job ? job.title : 'Unknown Job';
  };

  // Empty state
  if (!initialApplications || initialApplications.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No applications yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by creating your first application
          </p>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Application
            </button>
          )}
        </div>
        {canCreate && (
          <CreateApplicationModal
            jobs={jobs}
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => router.refresh()}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Search and Filters */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filters and Actions */}
          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="REJECTED">Rejected</option>
              <option value="HIRED">Hired</option>
            </select>

            {/* Job Filter */}
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Jobs</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>

            {/* Create Button */}
            {canCreate && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Create Application
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 text-sm text-gray-500">
          Showing {filteredApplications.length} of {initialApplications.length} applications
          {(searchQuery || statusFilter || jobFilter) && ' (filtered)'}
        </div>
      </div>

      {/* Applications Table */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredApplications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-gray-500">
              No applications match your search criteria
            </p>
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Job
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
                  {filteredApplications.map((application) => (
                    <ApplicationRow
                      key={application.id}
                      application={application}
                      jobTitle={getJobTitle(application.jobId)}
                      canUpdate={canUpdate}
                      canDelete={canDelete}
                      onEdit={() => setSelectedApplicationForEdit(application)}
                      onDelete={() => setSelectedApplicationForDelete(application)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Modals */}
      {canCreate && (
        <CreateApplicationModal
          jobs={jobs}
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => router.refresh()}
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

/**
 * Individual application row component
 */
interface ApplicationRowProps {
  application: Application;
  jobTitle: string;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function ApplicationRow({
  application,
  jobTitle,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: ApplicationRowProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <tr className="hover:bg-gray-50">
      {/* Applicant */}
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex items-center">
          <div>
            <div className="font-medium text-gray-900">{application.applicantName}</div>
            <div className="text-sm text-gray-500">{application.applicantEmail}</div>
          </div>
        </div>
      </td>

      {/* Job */}
      <td className="whitespace-nowrap px-6 py-4">
        <div className="text-sm text-gray-900">{jobTitle}</div>
      </td>

      {/* Contact */}
      <td className="whitespace-nowrap px-6 py-4">
        <div className="text-sm text-gray-500">{application.applicantPhone}</div>
      </td>

      {/* Status */}
      <td className="whitespace-nowrap px-6 py-4">
        <ApplicationStatusBadge status={application.status} />
      </td>

      {/* Applied Date */}
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
        {formatDate(application.createdAt)}
      </td>

      {/* Actions */}
      <td className="relative whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
        {(canUpdate || canDelete) && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-lg p-1 hover:bg-gray-100"
            >
              <MoreVertical className="h-5 w-5 text-gray-400" />
            </button>

            {showMenu && (
              <>
                {/* Backdrop to close menu */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                  <div className="py-1">
                    {application.resumeUrl && (
                      <a
                        href={application.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FileText className="h-4 w-4" />
                        View Resume
                      </a>
                    )}

                    {canUpdate && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onEdit();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Application
                      </button>
                    )}

                    {canDelete && (
                      <>
                        <div className="my-1 border-t border-gray-200" />
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            onDelete();
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Application
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
