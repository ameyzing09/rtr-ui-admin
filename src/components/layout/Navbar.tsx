'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useClientPathnameWithFallback } from '@/hooks/useClientPathname';
import { Menu, X, Settings, HelpCircle, User } from 'lucide-react';
import { ThemeToggle } from '@/components/theme';
import MobileDrawer from './MobileDrawer';
import Image from 'next/image';

export type NavItem = {
  label: string;
  href: string;
  icon?: React.ElementType;
  match?: 'exact' | 'startsWith';
};

export interface NavbarProps {
  navItems: NavItem[];
  tenantName?: string;
  tenantLogo?: string;
  environment?: 'dev' | 'staging' | 'prod';
  onMobileMenuToggle?: (isOpen: boolean) => void;
}

export default function Navbar({
  navItems,
  tenantName = 'Your SaaS',
  tenantLogo,
  environment,
  onMobileMenuToggle,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = useClientPathnameWithFallback('/');
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isUserMenuOpen]);

  // Handle mobile menu toggle
  const handleMobileMenuToggle = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    onMobileMenuToggle?.(newState);
  };

  // Check if link is active
  const isLinkActive = (item: NavItem): boolean => {
    if (item.match === 'exact') {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  // Environment badge colors
  const getEnvBadgeStyles = (env?: string) => {
    switch (env) {
      case 'dev':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'staging':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'prod':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'hidden';
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full">
        {/* Desktop Navbar - Centered Glass Pill */}
        <div className="hidden lg:flex justify-center p-4">
          <div className="glass-pill px-6 py-3 flex items-center justify-between max-w-6xl w-full">
            {/* Left: Tenant Logo/Brand */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {tenantLogo ? (
                <Image
                  src={tenantLogo}
                  alt={`${tenantName} logo`}
                  className="h-8 w-8 rounded-md object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {tenantName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="font-semibold text-gray-900 hidden lg:block">
                {tenantName}
              </span>
            </div>

            {/* Center: Navigation Links */}
            <div className="flex items-center justify-center gap-1 flex-1 max-w-md">
              {navItems.map((item) => {
                const isActive = isLinkActive(item);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                      transition-smooth focus-ring nav-link-hover
                      ${isActive ? 'nav-link-active' : 'text-gray-700'}
                    `}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span className="hidden sm:block">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right: Theme Toggle + Environment Badge + User Menu */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <ThemeToggle variant="pill" />
              {/* Environment Badge */}
              {environment && (
                <span
                  className={`
                    px-2 py-1 text-xs font-medium rounded-full border
                    ${getEnvBadgeStyles(environment)}
                  `}
                >
                  {environment.toUpperCase()}
                </span>
              )}

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="
                    flex items-center gap-2 p-2 rounded-full
                    transition-smooth focus-ring nav-link-hover
                    text-gray-700
                  "
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <User className="w-5 h-5" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="
                    absolute right-0 top-full mt-2 w-48 py-1
                    glass-surface rounded-lg shadow-lg border
                    focus:outline-none
                  ">
                    <Link
                      href="/settings"
                      className="
                        flex items-center gap-2 px-4 py-2 text-sm text-gray-700
                        hover:bg-gray-50 transition-smooth
                      "
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <Link
                      href="/help"
                      className="
                        flex items-center gap-2 px-4 py-2 text-sm text-gray-700
                        hover:bg-gray-50 transition-smooth
                      "
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <HelpCircle className="w-4 h-4" />
                      Help
                    </Link>
                    <hr className="my-1 border-gray-200" />
                    <button
                      className="
                        w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600
                        hover:bg-red-50 transition-smooth text-left
                      "
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        // TODO: Implement logout logic
                        console.log('Logout clicked');
                      }}
                    >
                      <X className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navbar - Standard Top Bar */}
        <div className="lg:hidden bg-[var(--card)]/95 supports-[backdrop-filter]:bg-[var(--card)]/70 backdrop-blur-md border-b border-[var(--border)]">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left: Brand */}
            <div className="flex items-center gap-2">
              {tenantLogo ? (
                <Image
                  src={tenantLogo}
                  alt={`${tenantName} logo`}
                  className="h-8 w-8 rounded-md object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {tenantName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="font-semibold text-gray-900">{tenantName}</span>
            </div>

            {/* Right: Theme Toggle + Environment Badge + Hamburger */}
            <div className="flex items-center gap-2">
              <ThemeToggle variant="pill" className="lg:hidden" />
              {environment && (
                <span
                  className={`
                    px-2 py-1 text-xs font-medium rounded-full border
                    ${getEnvBadgeStyles(environment)}
                  `}
                >
                  {environment.toUpperCase()}
                </span>
              )}

              <button
                onClick={handleMobileMenuToggle}
                className="
                  p-2 rounded-lg text-gray-700
                  transition-smooth focus-ring nav-link-hover
                "
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => handleMobileMenuToggle()}
        navItems={navItems}
      />
    </>
  );
}








