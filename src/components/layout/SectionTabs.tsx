'use client';

import Link from 'next/link';
import { useClientPathnameWithFallback } from '@/hooks/useClientPathname';
import type { SectionTab } from '@/config/sectionTabs';

interface SectionTabsProps {
  tabs: SectionTab[];
}

export default function SectionTabs({ tabs }: SectionTabsProps) {
  const pathname = useClientPathnameWithFallback('/dashboard');

  if (tabs.length === 0) {
    return null;
  }

  const isTabActive = (tab: SectionTab): boolean => {
    if (tab.match === 'exact') {
      return pathname === tab.href || pathname === tab.href.split('?')[0];
    }
    return pathname.startsWith(tab.href.split('?')[0]);
  };

  return (
    <div className="flex items-center gap-1">
      {tabs.map((tab) => {
        const isActive = isTabActive(tab);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium
              transition-smooth focus-ring
              ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
