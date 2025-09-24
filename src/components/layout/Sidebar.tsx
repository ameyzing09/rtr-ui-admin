'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClientPathnameWithFallback } from '@/hooks/useClientPathname';
import { ChevronLeft, Settings, HelpCircle, User } from 'lucide-react';

export type SideGroup = {
  title?: string;
  items: Array<{
    label: string;
    href: string;
    icon?: React.ElementType;
    match?: 'exact' | 'startsWith';
  }>;
};

export interface SidebarProps {
  groups: SideGroup[];
  tenantName?: string;
  tenantLogo?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  className?: string;
}

export default function Sidebar({
  groups,
  tenantName = 'Your SaaS',
  tenantLogo,
  isCollapsed = false,
  onToggleCollapse,
  className = '',
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const pathname = useClientPathnameWithFallback('/');
  
  // Use controlled or uncontrolled collapse state
  const collapsed = onToggleCollapse ? isCollapsed : internalCollapsed;
  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse(!collapsed);
    } else {
      setInternalCollapsed(!collapsed);
    }
  };

  // Check if link is active
  const isLinkActive = (item: { href: string; match?: 'exact' | 'startsWith' }): boolean => {
    if (item.match === 'exact') {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <aside
      className={`
        hidden lg:flex flex-col h-screen bg-white border-r border-gray-200
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-3">
            {tenantLogo ? (
              <img
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
            <span className="font-semibold text-gray-900 truncate">{tenantName}</span>
          </div>
        )}
        
        <button
          onClick={handleToggle}
          className={`
            p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100
            transition-smooth focus-ring
            ${collapsed ? 'mx-auto' : ''}
          `}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            className={`w-5 h-5 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-6">
          {groups.map((group, groupIndex) => (
            <div key={groupIndex} className="px-3">
              {/* Group Title */}
              {group.title && !collapsed && (
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {group.title}
                </h3>
              )}
              
              {/* Group Items */}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = isLinkActive(item);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                        transition-smooth focus-ring group
                        ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                      title={collapsed ? item.label : undefined}
                    >
                      {Icon && (
                        <Icon
                          className={`
                            w-5 h-5 flex-shrink-0
                            ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                          `}
                        />
                      )}
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 p-3 flex-shrink-0">
        <div className="space-y-1">
          {/* User Info (when expanded) */}
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600">
              <User className="w-5 h-5 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">John Doe</p>
                <p className="text-gray-500 truncate">john@example.com</p>
              </div>
            </div>
          )}
          
          {/* Settings Link */}
          <Link
            href="/settings"
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
              text-gray-700 hover:bg-gray-50 transition-smooth focus-ring
            `}
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings className="w-5 h-5 text-gray-400" />
            {!collapsed && <span>Settings</span>}
          </Link>
          
          {/* Help Link */}
          <Link
            href="/help"
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
              text-gray-700 hover:bg-gray-50 transition-smooth focus-ring
            `}
            title={collapsed ? 'Help & Support' : undefined}
          >
            <HelpCircle className="w-5 h-5 text-gray-400" />
            {!collapsed && <span>Help & Support</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}
