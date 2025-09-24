# Generic Sidebar System Guide

A completely modular, flexible, and powerful sidebar system that can handle any navigation structure for complex UIs. This system supports nested navigation, permissions, search, theming, and much more.

## 🎯 Overview

The Generic Sidebar is designed for super complex UIs where everything needs to be clean and modular. It supports:

- **Any Menu Structure**: Links, buttons, collapsible sections, headers, dividers
- **Nested Navigation**: Unlimited depth with proper indentation
- **Permission-based Display**: Show/hide items based on user permissions
- **Search Functionality**: Built-in search with filtering
- **Multiple Variants**: Different styles for different use cases
- **Theme Support**: Fully customizable appearance
- **Mobile Responsive**: Overlay and collapse modes
- **TypeScript First**: Fully typed with no `any` types

## 📦 Installation & Import

```typescript
import { 
  GenericSidebar,
  createNavigationLink,
  createNavigationButton,
  createNavigationCollapsible,
  type SidebarProps,
  type NavigationSection 
} from '@/components/ui';
```

## 🏗️ Basic Structure

### Navigation Item Types

The sidebar supports 5 different types of navigation items:

1. **Link** - Navigation to different pages
2. **Button** - Actions with onClick handlers
3. **Collapsible** - Expandable sections with children
4. **Header** - Section titles and organization
5. **Divider** - Visual separators

### Basic Example

```typescript
import { GenericSidebar, createNavigationLink, createNavigationButton } from '@/components/ui';
import { Home, Settings, Users } from 'lucide-react';

const sidebarConfig: SidebarProps = {
  sections: [
    {
      id: 'main',
      title: 'Navigation',
      items: [
        createNavigationLink({
          id: 'home',
          label: 'Home',
          href: '/',
          icon: Home,
        }),
        createNavigationLink({
          id: 'users',
          label: 'Users',
          href: '/users',
          icon: Users,
          badge: { text: '5', variant: 'primary' },
        }),
        createNavigationButton({
          id: 'logout',
          label: 'Logout',
          icon: Settings,
          onClick: () => handleLogout(),
          variant: 'danger',
        }),
      ],
    },
  ],
};

<GenericSidebar {...sidebarConfig} />
```

## 🔧 Navigation Item Types

### 1. Navigation Link

For navigation between pages:

```typescript
createNavigationLink({
  id: 'dashboard',
  label: 'Dashboard',
  href: '/dashboard',
  icon: LayoutDashboard,
  exactMatch: true, // Use exact path matching
  badge: { text: 'NEW', variant: 'success' },
  description: 'Main dashboard view',
  shortcut: '⌘D',
  target: '_blank', // Open in new tab
  isDisabled: false,
  permissions: ['admin'], // Only show to admins
})
```

### 2. Navigation Button

For actions and interactions:

```typescript
createNavigationButton({
  id: 'create-user',
  label: 'Create User',
  icon: UserPlus,
  onClick: () => openUserModal(),
  variant: 'primary', // primary, secondary, danger, ghost
  isLoading: false,
  isDisabled: false,
  description: 'Add new team member',
  shortcut: '⌘N',
})
```

### 3. Collapsible Section

For nested navigation with children:

```typescript
createNavigationCollapsible({
  id: 'user-management',
  label: 'User Management',
  icon: Users,
  defaultOpen: false,
  badge: { text: '3', variant: 'warning' },
  children: [
    createNavigationLink({
      id: 'all-users',
      label: 'All Users',
      href: '/users',
      icon: Users,
    }),
    createNavigationLink({
      id: 'user-roles',
      label: 'Roles & Permissions',
      href: '/users/roles',
      icon: Shield,
      permissions: ['admin'],
    }),
    createNavigationButton({
      id: 'invite-user',
      label: 'Invite User',
      icon: UserPlus,
      onClick: () => openInviteModal(),
    }),
    // Nested collapsible (unlimited depth)
    createNavigationCollapsible({
      id: 'user-settings',
      label: 'User Settings',
      icon: Settings,
      children: [
        createNavigationLink({
          id: 'profile-settings',
          label: 'Profile Settings',
          href: '/users/profile',
        }),
        createNavigationLink({
          id: 'security-settings',
          label: 'Security Settings',
          href: '/users/security',
        }),
      ],
    }),
  ],
})
```

### 4. Header

For section organization:

```typescript
createNavigationHeader({
  id: 'admin-section',
  label: 'Administration',
  icon: Shield,
  description: 'Administrative tools and settings',
  collapsible: false,
})
```

### 5. Divider

For visual separation:

```typescript
createNavigationDivider({
  id: 'main-divider',
  label: 'Settings', // Optional label
})
```

## 🏢 Complex Real-World Example

```typescript
'use client';

import { usePathname } from 'next/navigation';
import { GenericSidebar } from '@/components/ui';
import { 
  LayoutDashboard, Users, Settings, Shield, Database,
  FileText, BarChart3, CreditCard, Bell, HelpCircle,
  LogOut, UserPlus, Globe, Package, Folder, Zap
} from 'lucide-react';

export function ComplexSidebar() {
  const pathname = usePathname();

  const sidebarConfig: SidebarProps = {
    // Header configuration
    header: {
      title: 'Admin Portal',
      subtitle: 'Enterprise Dashboard',
      logo: {
        src: '/logo.png',
        alt: 'Company Logo',
      },
    },

    // Main navigation sections
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        items: [
          createNavigationLink({
            id: 'dashboard',
            label: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
            exactMatch: true,
          }),
          createNavigationLink({
            id: 'analytics',
            label: 'Analytics',
            href: '/analytics',
            icon: BarChart3,
            badge: { text: 'NEW', variant: 'primary' },
          }),
        ],
      },
      
      {
        id: 'management',
        title: 'Management',
        items: [
          // Complex nested user management
          createNavigationCollapsible({
            id: 'users',
            label: 'User Management',
            icon: Users,
            badge: { text: '12', variant: 'secondary' },
            children: [
              createNavigationLink({
                id: 'all-users',
                label: 'All Users',
                href: '/users',
                icon: Users,
                description: 'View and manage all users',
              }),
              createNavigationLink({
                id: 'user-roles',
                label: 'Roles & Permissions',
                href: '/users/roles',
                icon: Shield,
                permissions: ['admin'],
              }),
              createNavigationDivider({
                id: 'user-divider',
                label: 'User Actions',
              }),
              createNavigationButton({
                id: 'invite-user',
                label: 'Invite New User',
                icon: UserPlus,
                onClick: () => openInviteModal(),
                variant: 'primary',
                shortcut: '⌘I',
              }),
              // Nested user settings
              createNavigationCollapsible({
                id: 'user-settings',
                label: 'User Settings',
                icon: Settings,
                defaultOpen: false,
                children: [
                  createNavigationLink({
                    id: 'profile-settings',
                    label: 'Profile Management',
                    href: '/users/profiles',
                  }),
                  createNavigationLink({
                    id: 'security-settings',
                    label: 'Security Policies',
                    href: '/users/security',
                    permissions: ['admin'],
                  }),
                ],
              }),
            ],
          }),

          // Content management section
          createNavigationCollapsible({
            id: 'content',
            label: 'Content Management',
            icon: FileText,
            children: [
              createNavigationLink({
                id: 'pages',
                label: 'Pages',
                href: '/content/pages',
                icon: FileText,
              }),
              createNavigationLink({
                id: 'media',
                label: 'Media Library',
                href: '/content/media',
                icon: Folder,
                badge: { text: '1.2GB', variant: 'secondary' },
              }),
              createNavigationLink({
                id: 'templates',
                label: 'Templates',
                href: '/content/templates',
                icon: Package,
              }),
            ],
          }),

          createNavigationLink({
            id: 'billing',
            label: 'Billing & Subscriptions',
            href: '/billing',
            icon: CreditCard,
            badge: { text: '!', variant: 'warning' },
          }),
        ],
      },

      {
        id: 'system',
        title: 'System Administration',
        permissions: ['admin', 'developer'],
        items: [
          createNavigationHeader({
            id: 'system-header',
            label: 'Infrastructure',
            icon: Database,
            description: 'System monitoring and management',
          }),
          
          createNavigationCollapsible({
            id: 'infrastructure',
            label: 'Infrastructure',
            icon: Database,
            permissions: ['admin'],
            children: [
              createNavigationLink({
                id: 'monitoring',
                label: 'System Monitoring',
                href: '/system/monitoring',
                icon: Zap,
                badge: { text: 'LIVE', variant: 'success' },
              }),
              createNavigationLink({
                id: 'logs',
                label: 'Application Logs',
                href: '/system/logs',
                icon: FileText,
              }),
              createNavigationLink({
                id: 'database',
                label: 'Database Management',
                href: '/system/database',
                icon: Database,
                permissions: ['admin'],
              }),
            ],
          }),

          createNavigationLink({
            id: 'integrations',
            label: 'API & Integrations',
            href: '/integrations',
            icon: Globe,
            badge: { text: '5', variant: 'success' },
          }),

          createNavigationDivider({
            id: 'settings-divider',
            label: 'Configuration',
          }),

          createNavigationLink({
            id: 'settings',
            label: 'System Settings',
            href: '/settings',
            icon: Settings,
            shortcut: '⌘,',
          }),
        ],
      },
    ],

    // Footer with user info and actions
    footer: {
      user: {
        name: 'John Doe',
        email: 'john@company.com',
        role: 'System Administrator',
        avatar: '/avatars/john.jpg',
      },
      items: [
        createNavigationLink({
          id: 'help',
          label: 'Help & Support',
          href: '/help',
          icon: HelpCircle,
        }),
        createNavigationLink({
          id: 'notifications',
          label: 'Notifications',
          href: '/notifications',
          icon: Bell,
          badge: { text: '3', variant: 'error' },
        }),
      ],
      actions: [
        createNavigationButton({
          id: 'logout',
          label: 'Sign Out',
          icon: LogOut,
          onClick: () => handleLogout(),
          variant: 'danger',
        }),
      ],
    },

    // Advanced configuration
    enableSearch: true,
    searchPlaceholder: 'Search navigation...',
    variant: 'default',
    isCollapsible: true,
    
    // Event handlers
    onItemClick: (item) => {
      analytics.track('sidebar_item_clicked', {
        itemId: item.id,
        itemType: item.type,
      });
    },
    
    onSectionToggle: (sectionId, isOpen) => {
      saveUserPreference(`sidebar_${sectionId}`, isOpen);
    },
    
    onSearch: (query) => {
      analytics.track('sidebar_search', { query });
    },
  };

  return <GenericSidebar {...sidebarConfig} />;
}
```

## 🎨 Styling & Variants

### Available Variants

```typescript
// Minimal variant - clean and simple
<GenericSidebar variant="minimal" {...config} />

// Compact variant - reduced spacing
<GenericSidebar variant="compact" {...config} />

// Default variant - balanced spacing
<GenericSidebar variant="default" {...config} />

// Detailed variant - more spacing and info
<GenericSidebar variant="detailed" {...config} />
```

### Custom Theme

```typescript
const customTheme: SidebarTheme = {
  background: 'rgb(15, 23, 42)', // slate-900
  border: 'rgb(30, 41, 59)',     // slate-800
  text: 'rgb(248, 250, 252)',    // slate-50
  textMuted: 'rgb(148, 163, 184)', // slate-400
  hover: 'rgb(30, 41, 59)',      // slate-800
  active: 'rgb(59, 130, 246)',   // blue-500
  accent: 'rgb(139, 92, 246)',   // violet-500
};

<GenericSidebar theme={customTheme} {...config} />
```

### Responsive Configuration

```typescript
<GenericSidebar
  isMobile={isMobile}
  hideOnMobile={false}
  overlayOnMobile={true}
  width="w-72"
  collapsedWidth="w-16"
  {...config}
/>
```

## 🔐 Permission System

### Basic Permissions

```typescript
// Show item only to users with specific permissions
createNavigationLink({
  id: 'admin-panel',
  label: 'Admin Panel',
  href: '/admin',
  permissions: ['admin'],
})

// Multiple permissions (user needs at least one)
createNavigationLink({
  id: 'reports',
  label: 'Reports',
  href: '/reports',
  permissions: ['admin', 'manager', 'analyst'],
})
```

### Section-level Permissions

```typescript
{
  id: 'admin-section',
  title: 'Administration',
  permissions: ['admin'], // Entire section hidden for non-admins
  items: [
    // Items here inherit section permissions
  ],
}
```

### Using Permission Helpers

```typescript
import { filterSectionsByPermissions } from '@/components/ui/Sidebar/helpers';

const userPermissions = ['user', 'manager']; // From your auth system
const filteredSections = filterSectionsByPermissions(sections, userPermissions);

<GenericSidebar sections={filteredSections} {...otherProps} />
```

## 🔍 Search Functionality

### Enable Search

```typescript
<GenericSidebar
  enableSearch={true}
  searchPlaceholder="Search menu items..."
  onSearch={(query) => {
    console.log('User searched for:', query);
    // Track search analytics
  }}
  {...config}
/>
```

### Search Behavior

- Searches through link and button labels
- Auto-expands collapsible sections with matches
- Highlights matching items
- Filters out non-matching sections
- Provides empty state when no results found

## 📱 Mobile & Responsive

### Mobile Overlay Mode

```typescript
<GenericSidebar
  isMobile={isMobileDevice}
  overlayOnMobile={true}
  onToggleCollapse={(collapsed) => {
    if (isMobileDevice && !collapsed) {
      // Sidebar opened on mobile
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }}
  {...config}
/>
```

### Responsive Utilities

```typescript
import { useMediaQuery } from '@/hooks/useMediaQuery';

function ResponsiveSidebar() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <GenericSidebar
      isMobile={isMobile}
      variant={isMobile ? 'compact' : 'default'}
      overlayOnMobile={true}
      {...config}
    />
  );
}
```

## 🎯 Advanced Features

### Active State Management

```typescript
import { markActiveSections } from '@/components/ui/Sidebar/helpers';

const sectionsWithActiveStates = markActiveSections(sections, pathname);
```

### Badges and Indicators

```typescript
createNavigationLink({
  id: 'notifications',
  label: 'Notifications',
  href: '/notifications',
  badge: {
    text: '12',
    variant: 'error', // default, primary, secondary, success, warning, error
  },
})
```

### Keyboard Shortcuts

```typescript
createNavigationLink({
  id: 'dashboard',
  label: 'Dashboard',
  href: '/dashboard',
  shortcut: '⌘D', // Displayed in sidebar
})
```

### Loading States

```typescript
createNavigationButton({
  id: 'sync-data',
  label: 'Sync Data',
  icon: RefreshCw,
  onClick: () => syncData(),
  isLoading: isSyncing,
  isDisabled: isSyncing,
})
```

## 🚀 Integration Examples

### With Next.js App Router

```typescript
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { GenericSidebar } from '@/components/ui';

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const config = createSidebarConfig({
    currentPath: pathname,
    onLogout: () => {
      router.push('/login');
    },
  });

  return <GenericSidebar {...config} />;
}
```

### With Authentication

```typescript
import { useAuth } from '@/hooks/useAuth';

export function AuthenticatedSidebar() {
  const { user, permissions, logout } = useAuth();

  const config = createSidebarConfig({
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    userPermissions: permissions,
    onLogout: logout,
  });

  return <GenericSidebar {...config} />;
}
```

### With State Management

```typescript
import { useAppSelector, useAppDispatch } from '@/store';
import { toggleSidebar, setSearchQuery } from '@/store/slices/ui';

export function StateManagedSidebar() {
  const dispatch = useAppDispatch();
  const { isCollapsed, searchQuery } = useAppSelector(state => state.ui);

  return (
    <GenericSidebar
      isCollapsed={isCollapsed}
      onToggleCollapse={(collapsed) => dispatch(toggleSidebar(collapsed))}
      onSearch={(query) => dispatch(setSearchQuery(query))}
      {...config}
    />
  );
}
```

## 🎭 Helper Functions

### Quick Configuration Builders

```typescript
import { createAdminSidebar, createSimpleSidebar } from '@/components/ui/Sidebar/helpers';

// Pre-built admin sidebar
const adminConfig = createAdminSidebar({
  tenantName: 'My Company',
  userName: 'John Doe',
  userEmail: 'john@company.com',
  userRole: 'Admin',
  currentPath: pathname,
  onLogout: handleLogout,
});

// Simple sidebar for basic pages
const simpleConfig = createSimpleSidebar([
  {
    id: 'main',
    items: [
      createNavigationLink({
        id: 'home',
        label: 'Home',
        href: '/',
      }),
    ],
  },
]);
```

## 🔧 Best Practices

### 1. Organization

- Group related items in sections
- Use descriptive IDs and labels
- Keep navigation hierarchy shallow (max 3 levels)
- Use dividers sparingly for visual organization

### 2. Performance

- Use permissions to filter items before rendering
- Implement lazy loading for large navigation structures
- Memoize configuration objects
- Use React.memo for navigation items with complex rendering

### 3. Accessibility

- Always provide meaningful labels and descriptions
- Use proper ARIA attributes (built-in)
- Ensure keyboard navigation works correctly
- Test with screen readers

### 4. UX

- Keep most-used items at the top
- Use badges sparingly for important notifications
- Provide keyboard shortcuts for power users
- Maintain consistent icon usage

## 🎯 Migration from Old Sidebar

```typescript
// Old hardcoded sidebar
<Sidebar
  groups={[
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
  ]}
/>

// New generic sidebar
<GenericSidebar
  sections={[
    {
      id: 'main',
      title: 'Main',
      items: [
        createNavigationLink({
          id: 'dashboard',
          label: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
        }),
      ],
    },
  ]}
/>
```

This generic sidebar system provides the ultimate flexibility for complex UIs while maintaining clean, modular code. It can handle any navigation structure you throw at it while providing excellent TypeScript support and performance.
