'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useClientPathnameWithFallback } from '@/hooks/useClientPathname';
import { Settings, HelpCircle, X, User } from 'lucide-react';
import type { NavItem } from './Navbar';

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
}

export default function MobileDrawer({ isOpen, onClose, navItems }: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const pathname = useClientPathnameWithFallback('/');

  // Focus trap and ESC handling
  useEffect(() => {
    if (!isOpen) return;

    // Focus the first focusable element when drawer opens
    setTimeout(() => {
      firstFocusableRef.current?.focus();
    }, 100);

    // Handle ESC key
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    // Handle focus trap
    function handleTabKey(event: KeyboardEvent) {
      if (event.key !== 'Tab') return;

      const drawer = drawerRef.current;
      if (!drawer) return;

      const focusableElements = drawer.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }

    document.addEventListener('keydown', handleEscKey);
    document.addEventListener('keydown', handleTabKey);

    // Prevent body scroll when drawer is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('keydown', handleTabKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Check if link is active
  const isLinkActive = (item: NavItem): boolean => {
    if (item.match === 'exact') {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        id="mobile-menu"
        className="
          fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50
          glass-surface border-l border-gray-200
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          md:hidden
        "
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="
              p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100
              transition-smooth focus-ring
            "
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-4">
            {navItems.map((item) => {
              const isActive = isLinkActive(item);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                    transition-smooth focus-ring
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section - User Actions */}
        <div className="border-t border-gray-200 p-4 space-y-1">
          <div className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600">
            <User className="w-5 h-5" />
            <span>Account</span>
          </div>
          
          <Link
            href="/settings"
            onClick={onClose}
            className="
              flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
              text-gray-700 hover:bg-gray-50 transition-smooth focus-ring
            "
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          
          <Link
            href="/help"
            onClick={onClose}
            className="
              flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
              text-gray-700 hover:bg-gray-50 transition-smooth focus-ring
            "
          >
            <HelpCircle className="w-5 h-5" />
            Help & Support
          </Link>
          
          <button
            onClick={() => {
              onClose();
              // TODO: Implement logout logic
              console.log('Logout clicked');
            }}
            className="
              w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
              text-red-600 hover:bg-red-50 transition-smooth focus-ring text-left
            "
          >
            <X className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
