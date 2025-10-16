'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Command as CommandIcon, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchCommandProps {
  variant?: 'navbar' | 'standalone';
  placeholder?: string;
}

export default function SearchCommand({
  variant = 'navbar',
  placeholder = 'Search...'
}: SearchCommandProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }

      // Close on Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = useCallback((searchQuery: string) => {
    // TODO: Implement actual search functionality
    console.log('Searching for:', searchQuery);
    setIsOpen(false);
    setQuery('');

    // Navigate to search results page
    router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
  }, [router]);

  if (variant === 'navbar') {
    return (
      <>
        {/* Navbar Search Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="
            flex items-center gap-2 px-3 py-2 rounded-full
            transition-smooth focus-ring nav-link-hover
            text-gray-700 text-sm
          "
          aria-label="Search (Cmd+K)"
        >
          <Search className="w-4 h-4" />
          <span className="hidden md:inline text-xs text-gray-500">⌘K</span>
        </button>

        {/* Search Modal */}
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
            onClick={() => setIsOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Search Dialog */}
            <div
              className="
                relative w-full max-w-2xl glass-surface rounded-xl shadow-2xl
                border border-gray-200
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && query.trim()) {
                      handleSearch(query);
                    }
                  }}
                  placeholder="Search for jobs, candidates, team members..."
                  className="
                    flex-1 bg-transparent border-none outline-none
                    text-gray-900 placeholder-gray-400
                  "
                  autoFocus
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md hover:bg-gray-100 transition-smooth"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Quick Actions / Recent Searches */}
              <div className="p-4">
                <div className="text-xs font-medium text-gray-500 mb-3">Quick Actions</div>
                <div className="space-y-1">
                  <button
                    onClick={() => router.push('/dashboard/jobs/create')}
                    className="
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg
                      text-sm text-left hover:bg-gray-50 transition-smooth
                    "
                  >
                    <CommandIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">Create New Job</span>
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/team/invite')}
                    className="
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg
                      text-sm text-left hover:bg-gray-50 transition-smooth
                    "
                  >
                    <CommandIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">Invite Team Member</span>
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/interviews/schedule')}
                    className="
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg
                      text-sm text-left hover:bg-gray-50 transition-smooth
                    "
                  >
                    <CommandIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">Schedule Interview</span>
                  </button>
                </div>
              </div>

              {/* Footer Hint */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 font-mono">↵</kbd>
                    to search
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 font-mono">ESC</kbd>
                    to close
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
