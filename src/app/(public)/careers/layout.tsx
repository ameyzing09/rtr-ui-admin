import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export const metadata = {
  title: 'Careers | Job Openings',
  description: 'Explore our current job openings and apply to join our team',
};

/**
 * Public Careers Site Layout
 * Tenant-branded public-facing career site
 */
export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In production, tenant branding would be fetched based on subdomain
  const tenantName = process.env.NEXT_PUBLIC_TENANT_NAME || 'Company';
  const tenantLogo = process.env.NEXT_PUBLIC_TENANT_LOGO;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/careers" className="flex items-center gap-2">
              {tenantLogo ? (
                <img
                  src={tenantLogo}
                  alt={tenantName}
                  className="h-8 w-auto"
                />
              ) : (
                <>
                  <Briefcase className="h-6 w-6 text-blue-600" />
                  <span className="text-xl font-bold text-gray-900">
                    {tenantName}
                  </span>
                </>
              )}
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              <Link
                href="/careers"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                All Jobs
              </Link>
              <a
                href={process.env.NEXT_PUBLIC_COMPANY_WEBSITE || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Company Website
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} {tenantName}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
