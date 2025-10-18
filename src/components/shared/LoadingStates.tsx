/**
 * Loading States (F2)
 *
 * Specialized skeleton components for different parts of the application
 * - Job list skeleton
 * - Job detail skeleton
 * - Application list skeleton
 * - Form skeleton
 */

import Skeleton, { SkeletonText } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';

/**
 * Skeleton for job list card
 */
export function JobCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          {/* Title and badge */}
          <div className="flex items-center gap-3">
            <Skeleton width="40%" height="1.5rem" />
            <Skeleton width="80px" height="1.5rem" className="rounded-full" />
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4">
            <Skeleton width="120px" height="1rem" />
            <Skeleton width="150px" height="1rem" />
            <Skeleton width="100px" height="1rem" />
          </div>

          {/* Dates */}
          <div className="flex gap-4">
            <Skeleton width="150px" height="0.875rem" />
            <Skeleton width="130px" height="0.875rem" />
          </div>
        </div>

        {/* Actions */}
        <Skeleton width="40px" height="40px" />
      </div>
    </Card>
  );
}

/**
 * Skeleton for job list (multiple cards)
 */
export function JobListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for job detail page
 */
export function JobDetailSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        {/* Breadcrumb */}
        <Skeleton width="120px" height="1rem" className="mb-4" />

        {/* Title and actions */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton width="300px" height="2rem" />
              <Skeleton width="80px" height="1.5rem" className="rounded-full" />
            </div>
            <div className="flex gap-4">
              <Skeleton width="100px" height="1rem" />
              <Skeleton width="120px" height="1rem" />
              <Skeleton width="100px" height="1rem" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton width="80px" height="40px" />
            <Skeleton width="40px" height="40px" />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-6">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} width="80px" height="1.5rem" />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div className="space-y-6">
          {Array.from({ length: 3 }, (_, i) => (
            <Card key={i} className="p-6">
              <Skeleton width="200px" height="1.5rem" className="mb-4" />
              <SkeletonText lines={4} />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for application list table
 */
export function ApplicationTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: 5 }, (_, i) => (
              <th key={i} className="px-6 py-3">
                <Skeleton width="100%" height="1rem" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {Array.from({ length: rows }, (_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: 5 }, (_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <Skeleton width="100%" height="1rem" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Skeleton for form wizard
 */
export function FormWizardSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Wizard header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <Skeleton width="250px" height="1.5rem" className="mb-2" />
        <Skeleton width="350px" height="1rem" />

        {/* Steps */}
        <div className="mt-6 flex gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-1 items-center gap-2">
              <Skeleton width="32px" height="32px" className="rounded-full" />
              <Skeleton width="100%" height="1rem" />
            </div>
          ))}
        </div>
      </div>

      {/* Form content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <Card className="p-6">
          <div className="space-y-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton width="120px" height="1rem" />
                <Skeleton width="100%" height="40px" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Footer buttons */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="flex justify-between">
          <Skeleton width="80px" height="40px" />
          <div className="flex gap-3">
            <Skeleton width="80px" height="40px" />
            <Skeleton width="80px" height="40px" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for detail section (generic)
 */
export function DetailSectionSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton width="200px" height="1.5rem" className="mb-4" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton width="80px" height="0.875rem" />
            <Skeleton width="150px" height="1rem" />
          </div>
        ))}
      </div>
    </Card>
  );
}

/**
 * Skeleton for stats/metrics cards
 */
export function StatsCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton width="120px" height="0.875rem" />
          <Skeleton width="80px" height="2rem" />
          <Skeleton width="100px" height="0.875rem" />
        </div>
        <Skeleton width="48px" height="48px" className="rounded-lg" />
      </div>
    </Card>
  );
}

/**
 * Skeleton for dashboard overview
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts/Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <Card key={i} className="p-6">
            <Skeleton width="180px" height="1.5rem" className="mb-4" />
            <Skeleton width="100%" height="300px" />
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="p-6">
        <Skeleton width="200px" height="1.5rem" className="mb-4" />
        <ApplicationTableSkeleton rows={5} />
      </Card>
    </div>
  );
}
