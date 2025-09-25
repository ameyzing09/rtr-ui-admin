'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, X, ChevronDown } from 'lucide-react';
import NavigationItemComponent from './NavigationItem';
import type { SidebarProps, NavigationItem, NavigationSection, NavigationLink } from './types';
import Image from 'next/image';

export default function Sidebar({
  sections,
  header,
  footer,
  isCollapsible = true,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  defaultCollapsed = false,
  variant = 'default',
  theme,
  width = 'w-64',
  collapsedWidth = 'w-16',
  isMobile = false,
  hideOnMobile = false,
  overlayOnMobile = false,
  className = '',
  headerClassName = '',
  contentClassName = '',
  footerClassName = '',
  onItemClick,
  onSectionToggle,
  enableSearch = false,
  searchPlaceholder = 'Search...',
  onSearch,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSections, setFilteredSections] = useState(sections);
  const [openState, setOpenState] = useState<Record<string, boolean>>({});

  const PERSIST_KEY = 'rtr:sidebar:open';

  // Load persisted section open state
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(PERSIST_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, boolean>;
        setOpenState(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Determine if sidebar is collapsed
  const isCollapsed = controlledCollapsed !== undefined 
    ? controlledCollapsed 
    : internalCollapsed;

  // Handle collapse toggle
  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    if (onToggleCollapse) {
      onToggleCollapse(newCollapsed);
    } else {
      setInternalCollapsed(newCollapsed);
    }
  };

  // Filter sections based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSections(sections);
      return;
    }

    const filterItems = (items: NavigationItem[]): NavigationItem[] => {
      return items.filter(item => {
        if (item.type === 'link' || item.type === 'button') {
          return item.label.toLowerCase().includes(searchQuery.toLowerCase());
        }
        if (item.type === 'collapsible') {
          const hasMatchingChildren = filterItems(item.children).length > 0;
          const labelMatches = item.label.toLowerCase().includes(searchQuery.toLowerCase());
          return labelMatches || hasMatchingChildren;
        }
        return false;
      }).map(item => {
        if (item.type === 'collapsible') {
          return {
            ...item,
            children: filterItems(item.children),
            defaultOpen: true, // Auto-expand when searching
          };
        }
        return item;
      });
    };

    const filtered = sections.map(section => ({
      ...section,
      items: filterItems(section.items),
    })).filter(section => section.items.length > 0);

    setFilteredSections(filtered);
    onSearch?.(searchQuery);
  }, [searchQuery, sections, onSearch]);

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return {
          sidebar: 'bg-[var(--card)] border-r border-[var(--border)]',
          header: 'border-b border-[var(--border)] p-3',
          content: 'p-2',
          footer: 'border-t border-[var(--border)] p-3',
        };
      case 'compact':
        return {
          sidebar: 'bg-[var(--card)] border-r border-[var(--border)]',
          header: 'border-b border-[var(--border)] p-2',
          content: 'p-1',
          footer: 'border-t border-[var(--border)] p-2',
        };
      case 'detailed':
        return {
          sidebar: 'bg-[var(--card)] border-r border-[var(--border)] shadow-sm',
          header: 'border-b border-[var(--border)] p-4',
          content: 'p-4',
          footer: 'border-t border-[var(--border)] p-4',
        };
      default:
        return {
          sidebar: 'bg-[var(--card)] border-r border-[var(--border)]',
          header: 'border-b border-[var(--border)] p-4',
          content: 'p-3',
          footer: 'border-t border-[var(--border)] p-3',
        };
    }
  };

  const styles = getVariantStyles();

  // Apply custom theme
  const themeStyles = theme ? {
    backgroundColor: theme.background,
    borderColor: theme.border,
    color: theme.text,
  } : {};

  // Mobile handling
  if (hideOnMobile && isMobile) {
    return null;
  }

  const sidebarClasses = `
    flex flex-col h-screen transition-all duration-300 ease-in-out
    ${isCollapsed ? collapsedWidth : width}
    ${styles.sidebar}
    ${isMobile && overlayOnMobile ? 'fixed inset-y-0 left-0 z-50' : ''}
    ${className}
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && overlayOnMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={handleToggleCollapse}
        />
      )}

      <aside className={sidebarClasses} style={themeStyles}>
        {/* Header */}
        {header && (
          <div className={`${styles.header} ${headerClassName}`}>
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  {/* Logo */}
                  {header.logo && (
                    <div className="flex items-center gap-3 mb-2">
                      {header.logo.src && (
                        <Image
                          src={header.logo.src}
                          alt={header.logo.alt || 'Logo'}
                          className="h-8 w-8 rounded-md object-cover"
                        />
                      )}
                      {header.logo.component && <header.logo.component />}
                    </div>
                  )}
                  
                  {/* Title and Subtitle */}
                  {header.title && (
                    <div>
                      <h1 className="font-semibold text-gray-900 truncate">
                        {header.title}
                      </h1>
                      {header.subtitle && (
                        <p className="text-sm text-gray-600 truncate">
                          {header.subtitle}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Collapse Toggle */}
              {isCollapsible && (
                <button
                  onClick={handleToggleCollapse}
                  className={`
                    p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100
                    transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${isCollapsed ? 'mx-auto' : ''}
                  `}
                  aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  <ChevronLeft
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isCollapsed ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              )}
            </div>

            {/* Header Actions */}
            {!isCollapsed && header.actions && header.actions.length > 0 && (
              <div className="mt-3 space-y-1">
                {header.actions.map((action) => (
                  <NavigationItemComponent
                    key={action.id}
                    item={action}
                    isCollapsed={false}
                    onItemClick={onItemClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search */}
        {enableSearch && !isCollapsed && (
          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  bg-white placeholder-gray-400
                "
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className={`flex-1 overflow-y-auto ${styles.content} ${contentClassName}`}>
          {filteredSections.map((section) => (
            <NavigationSection
              key={section.id}
              section={{
                ...section,
                defaultOpen:
                  openState[section.id] !== undefined
                    ? openState[section.id]
                    : section.defaultOpen ?? true,
              }}
              isCollapsed={isCollapsed}
              onItemClick={onItemClick}
              onSectionToggle={(id, isOpen) => {
                // persist open state per section
                setOpenState((prev) => {
                  const next = { ...prev, [id]: isOpen };
                  try {
                    window.localStorage.setItem(PERSIST_KEY, JSON.stringify(next));
                  } catch {
                    // ignore
                  }
                  return next;
                });
                onSectionToggle?.(id, isOpen);
              }}
            />
          ))}

          {/* No search results */}
          {searchQuery && filteredSections.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No items found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {footer && (
          <div className={`${styles.footer} ${footerClassName}`}>
            {/* User Info */}
            {!isCollapsed && footer.user && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    {footer.user.avatar ? (
                      <Image
                        src={footer.user.avatar}
                        alt={footer.user.name}
                        className='w-8 h-8 rounded-full object-cover'
                        />
                      // <img
                      //   src={footer.user.avatar}
                      //   alt={footer.user.name}
                      //   className="w-8 h-8 rounded-full object-cover"
                      // />
                    ) : (
                      <span className="text-sm font-medium text-blue-600">
                        {footer.user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {footer.user.name}
                    </p>
                    {footer.user.email && (
                      <p className="text-sm text-gray-500 truncate">
                        {footer.user.email}
                      </p>
                    )}
                    {footer.user.role && (
                      <p className="text-xs text-gray-400 truncate">
                        {footer.user.role}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Footer Items */}
            {footer.items && footer.items.length > 0 && (
              <div className="space-y-1">
                {footer.items.map((item) => (
                  <NavigationItemComponent
                    key={item.id}
                    item={item}
                    isCollapsed={isCollapsed}
                    onItemClick={onItemClick}
                  />
                ))}
              </div>
            )}

            {/* Footer Actions */}
            {footer.actions && footer.actions.length > 0 && (
              <div className="mt-3 space-y-1">
                {footer.actions.map((action) => (
                  <NavigationItemComponent
                    key={action.id}
                    item={action}
                    isCollapsed={isCollapsed}
                    onItemClick={onItemClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}

// Navigation Section Component
interface NavigationSectionProps {
  section: NavigationSection;
  isCollapsed: boolean;
  onItemClick?: (item: NavigationItem) => void;
  onSectionToggle?: (sectionId: string, isOpen: boolean) => void;
}

import { useRouter } from 'next/navigation';

function isLink(item: NavigationItem): item is NavigationLink { return item.type === 'link'; }

function NavigationSection({
  section,
  isCollapsed,
  onItemClick,
  onSectionToggle,
}: NavigationSectionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(section.defaultOpen ?? true);

  const sectionHasActive = section.items.some((it) => isLink(it) && !!it.isActive);

  // Keep section open if one of its children is active
  useEffect(() => {
    if (sectionHasActive) setOpen(true);
  }, [sectionHasActive]);
  // Don't render if not visible
  if (section.isVisible === false) return null;

  return (
    <div className={`mb-6 ${section.className || ''}`}>
      {/* Collapsible Section Header */}
      {section.title && !isCollapsed && (
        <button
          type="button"
          className="w-full px-3 py-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-gray-800"
          onClick={() => {
            const next = !open;
            setOpen(next);
            onSectionToggle?.(section.id, next);
            if (next) {
              // Navigate to first link when expanding
              const firstLink = section.items.find((it: NavigationItem) => it.type === 'link');
              if (firstLink) {
                router.push(firstLink.href);
              }
            }
          }}
          aria-expanded={open}
        >
          {section.icon && (
            <section.icon className="w-4 h-4 text-[var(--muted-foreground)]" />
          )}
          <span className="flex-1 text-left">{section.title}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? '' : '-rotate-90'}`} />
        </button>
      )}

      {/* Section Items */}
      <div className="space-y-1">
        {(open || isCollapsed) &&
          section.items.map((item) => (
            <NavigationItemComponent
              key={item.id}
              item={item}
              isCollapsed={isCollapsed}
              onItemClick={onItemClick}
            />
          ))}
      </div>
    </div>
  );
}




