'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import type { JobListResponse, JobListItem } from '@/domain/jobs/schemas';
import { getJobStatusBadge, getJobStatusColor, isJobActive } from '@/domain/jobs/schemas';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/components/auth/AuthProvider';
import { hasJobPermission, JOB_PERMISSIONS } from '@/domain/jobs/permissions';
import { DeleteJobModal } from '@/components/jobs/DeleteJobModal';

interface JobListClientProps {
  initialData: JobListResponse;
}

export function JobListClient({ initialData }: JobListClientProps) {
  const router = useRouter();
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check permissions
  const canCreate = session ? hasJobPermission(session.user.permissions, JOB_PERMISSIONS.CREATE) : false;
  const canEdit = session ? hasJobPermission(session.user.permissions, JOB_PERMISSIONS.UPDATE) : false;
  const canDelete = session ? hasJobPermission(session.user.permissions, JOB_PERMISSIONS.DELETE) : false;

  // Filter jobs based on search and filters
  const filteredJobs = useMemo(() => {
    let jobs = initialData.jobs || [];

    // Search by title
    if (searchQuery) {
      jobs = jobs.filter((job) =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by department
    if (departmentFilter) {
      jobs = jobs.filter((job) => job.department === departmentFilter);
    }

    // Filter by location
    if (locationFilter) {
      jobs = jobs.filter((job) => job.location === locationFilter);
    }

    return jobs;
  }, [initialData.jobs, searchQuery, departmentFilter, locationFilter]);

  // Get unique departments and locations for filters
  const departments = useMemo(() => {
    const depts = new Set(
      initialData.jobs?.map((job) => job.department).filter(Boolean) as string[]
    );
    return Array.from(depts).sort();
  }, [initialData.jobs]);

  const locations = useMemo(() => {
    const locs = new Set(
      initialData.jobs?.map((job) => job.location).filter(Boolean) as string[]
    );
    return Array.from(locs).sort();
  }, [initialData.jobs]);

  // Empty state
  if (!initialData.jobs || initialData.jobs.length === 0) {
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No jobs yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by creating your first job posting
          </p>
          {canCreate && (
            <Link
              href="/dashboard/jobs/create"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Job
            </Link>
          )}
        </div>
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
              placeholder="Search jobs by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filters and Actions */}
          <div className="flex items-center gap-3">
            {/* Department Filter */}
            {departments.length > 0 && (
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            )}

            {/* Location Filter */}
            {locations.length > 0 && (
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            )}

            {/* Create Button */}
            {canCreate && (
              <Link
                href="/dashboard/jobs/create"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Create Job
              </Link>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 text-sm text-gray-500">
          Showing {filteredJobs.length} of {initialData.jobs.length} jobs
          {(searchQuery || departmentFilter || locationFilter) && ' (filtered)'}
        </div>
      </div>

      {/* Job List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredJobs.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-gray-500">
              No jobs match your search criteria
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Individual job card component
 */
interface JobCardProps {
  job: JobListItem;
  canEdit: boolean;
  canDelete: boolean;
}

function JobCard({ job, canEdit, canDelete }: JobCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const active = isJobActive(job);
  const statusBadge = getJobStatusBadge(job);

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        {/* Job Info */}
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <Link
              href={`/dashboard/jobs/${job.id}`}
              className="flex-1"
            >
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                {job.title}
              </h3>
            </Link>

            {/* Status Badge */}
            <Badge variant={active ? 'success' : 'default'}>
              {statusBadge}
            </Badge>
          </div>

          {/* Metadata */}
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {job.department && (
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {job.department}
              </span>
            )}

            {job.location && (
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </span>
            )}

            <span>
              Posted {formatRelativeDate(job.createdAt)}
            </span>
          </div>

          {/* Publish/Expire Dates */}
          {(job.publishAt || job.expireAt) && (
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-400">
              {job.publishAt && (
                <span>
                  Publishes: {formatDate(job.publishAt)}
                </span>
              )}
              {job.expireAt && (
                <span>
                  Expires: {formatDate(job.expireAt)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions Menu */}
        {(canEdit || canDelete) && (
          <div className="relative ml-4">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-lg p-2 hover:bg-gray-100"
            >
              <MoreVertical className="h-5 w-5 text-gray-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                <div className="py-1">
                  <Link
                    href={`/dashboard/jobs/${job.id}`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Link>

                  {canEdit && (
                    <Link
                      href={`/dashboard/jobs/${job.id}/edit`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Job
                    </Link>
                  )}

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
                        Delete Job
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteJobModal
        job={job}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={() => {
          // Refresh the page to show updated list
          router.refresh();
        }}
      />
    </Card>
  );
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatDate(date: Date | null): string {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
