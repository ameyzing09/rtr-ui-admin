'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PublicJobsResponse } from '@/domain/public/schemas';
import { formatPublishDate, calculateTotalPages } from '@/domain/public/schemas';
import Card from '@/components/ui/Card';

interface PublicJobsListClientProps {
  initialData: PublicJobsResponse;
  searchQuery: string;
  departmentFilter: string;
  locationFilter: string;
  currentPage: number;
  pageSize: number;
}

export function PublicJobsListClient({
  initialData,
  searchQuery: initialSearch,
  departmentFilter: initialDepartment,
  locationFilter: initialLocation,
  currentPage,
  pageSize,
}: PublicJobsListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [departmentFilter, setDepartmentFilter] = useState(initialDepartment);
  const [locationFilter, setLocationFilter] = useState(initialLocation);

  const totalPages = calculateTotalPages(initialData.total, pageSize);

  // Extract unique departments and locations
  const departments = Array.from(
    new Set(initialData.data.map((job) => job.department).filter(Boolean) as string[])
  ).sort();

  const locations = Array.from(
    new Set(initialData.data.map((job) => job.location).filter(Boolean) as string[])
  ).sort();

  /**
   * Apply filters by updating URL params
   */
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (departmentFilter) params.set('department', departmentFilter);
    if (locationFilter) params.set('location', locationFilter);
    params.set('page', '1'); // Reset to first page

    router.push(`/careers?${params.toString()}`);
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('');
    setLocationFilter('');
    router.push('/careers');
  };

  /**
   * Navigate to page
   */
  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/careers?${params.toString()}`);
  };

  const hasFilters = searchQuery || departmentFilter || locationFilter;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Join Our Team
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Explore {initialData.total} open position{initialData.total !== 1 ? 's' : ''} and find your next opportunity
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8 p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Department Filter */}
            {departments.length > 0 && (
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            )}

            {/* Apply/Clear Buttons */}
            <button
              onClick={applyFilters}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Apply Filters
            </button>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Results */}
      {initialData.data.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No jobs found
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {hasFilters
              ? 'Try adjusting your filters to see more results'
              : 'Check back soon for new opportunities'}
          </p>
        </Card>
      ) : (
        <>
          {/* Job Cards */}
          <div className="space-y-4">
            {initialData.data.map((job) => (
              <Link key={job.id} href={`/careers/${job.id}`}>
                <Card className="p-6 transition-shadow hover:shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                        {job.title}
                      </h3>

                      {/* Metadata */}
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        {job.department && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {job.department}
                          </span>
                        )}
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                        )}
                        <span className="text-gray-400">
                          Posted {formatPublishDate(job.publish_at)}
                        </span>
                      </div>

                      {/* Description Excerpt */}
                      {job.description_excerpt && (
                        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                          {job.description_excerpt}
                        </p>
                      )}
                    </div>

                    {/* Apply Arrow */}
                    <div className="ml-4">
                      <ChevronRight className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 7) {
                    page = i + 1;
                  } else if (currentPage <= 4) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 6 + i;
                  } else {
                    page = currentPage - 3 + i;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
