# Shared Component Reference

This document summarizes the reusable components shipped with the RTR Admin UI. Each entry lists the import path, props (similar to a Swagger-style contract), and a ready-to-copy usage example.

## Table of Contents
- [Atoms](#atoms)
  - [Button](#button)
  - [Input](#input)
- [Utilities](#utilities)
  - [ClientOnly](#clientonly)
  - [NoSSRWrapper](#nossrwrapper)
- [Layout](#layout)
  - [DashboardShell](#dashboardshell)
  - [Navbar](#navbar)
  - [MobileDrawer](#mobiledrawer)
  - [Sidebar (legacy layout)](#sidebar-legacy-layout)
  - [ThemeDemo](#themedemo)
- [Maintenance](#maintenance)
  - [MaintenanceView](#maintenanceview)
- [Dashboard UI Cards](#dashboard-ui-cards)
  - [StatCard](#statcard)
  - [ChartCard](#chartcard)
  - [ActivityCard](#activitycard)
  - [QuickActionsCard](#quickactionscard)
  - [StatusCard](#statuscard)
  - [NotificationsCard](#notificationscard)
- [Generic Sidebar System](#generic-sidebar-system)
  - [Sidebar](#sidebar)
  - [NavigationItem types](#navigationitem-types)
  - [Helper builders](#helper-builders)

> **Imports:** All paths below assume the `recrutr/*` alias configured in `tsconfig.json` (e.g. `import Button from 'recrutr/components/atoms/Button';`).

---

## Atoms

### Button
**Import**
```tsx
import Button, { type ButtonProps } from 'recrutr/components/atoms/Button';
```

**Props**
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Visual style preset. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Horizontal/vertical padding + icon sizing. |
| `icon` | `LucideIcon` | `undefined` | Optional icon component rendered left/right. |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Controls icon placement when `icon` provided. |
| `isLoading` | `boolean` | `false` | Replaces content with a spinner and disables the button. |
| `fullWidth` | `boolean` | `false` | Forces the button to stretch to 100% width. |
| `disabled` | `boolean` | `false` | Inherited from `ButtonHTMLAttributes`. |
| `...props` | `React.ButtonHTMLAttributes<HTMLButtonElement>` | — | Native button props (e.g. `type`, `onClick`). |

**Usage**
```tsx
import { Settings } from 'lucide-react';

<Button
  variant="secondary"
  size="lg"
  icon={Settings}
  iconPosition="right"
  onClick={() => console.log('Go to settings')}
>
  Manage workspace
</Button>
```

### Input
**Import**
```tsx
import Input, { type InputProps } from 'recrutr/components/atoms/Input';
```

**Props**
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | `undefined` | Optional field label rendered above the input. |
| `error` | `string` | `undefined` | When present, renders red error text and styles. |
| `helpText` | `string` | `undefined` | Helper text shown under the field when no error. |
| `leftIcon` | `LucideIcon` | `undefined` | Icon rendered inside the left padding. |
| `rightIcon` | `LucideIcon` | `undefined` | Icon rendered inside the right padding. |
| `onRightIconClick` | `() => void` | `undefined` | Click handler for the right icon (enables pointer interaction). |
| `variant` | `'default' \| 'filled'` | `'default'` | Chooses border/background style. |
| `isInvalid` | `boolean` | Falsy | Shortcut to trigger error styling without `error` text. |
| `id` | `string` | Auto-generated | Pass to control associated label `htmlFor`. |
| `...props` | `React.InputHTMLAttributes<HTMLInputElement>` | — | Native input props. |

**Usage**
```tsx
import { Search, Eye } from 'lucide-react';

<Input
  label="Workspace name"
  placeholder="Acme HQ"
  leftIcon={Search}
  rightIcon={Eye}
  onRightIconClick={() => setReveal(!reveal)}
  helpText="Used in customer-facing emails"
/>
```

---

## Utilities

### ClientOnly
**Import**
```tsx
import ClientOnly from 'recrutr/components/ClientOnly';
```

**Props**
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | — | Content to render after the component mounts on the client. |
| `fallback` | `React.ReactNode` | `null` | Placeholder rendered until the client hydration completes. |
| `suppressHydrationWarning` | `boolean` | `true` | Forwards the flag to the wrapper `<div>` to silence hydration mismatches. |

**Usage**
```tsx
<ClientOnly fallback={<span>Loading chart…</span>}>
  <HeavyChart data={chartData} />
</ClientOnly>
```

### NoSSRWrapper
**Import**
```tsx
import NoSSRWrapper from 'recrutr/components/NoSSR';
```

**Signature**
`const Wrapped = NoSSRWrapper(Component);`

**Options**
| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `Component` | `React.ComponentType<T>` | — | The client-only component you want to lazy mount without SSR. |

The HOC returns a dynamically imported wrapper with SSR disabled and a built-in loading skeleton.

**Usage**
```tsx
import dynamic from 'next/dynamic';
import NoSSRWrapper from 'recrutr/components/NoSSR';
import { type ChartProps } from './charts/SalesChart';

const SalesChart = dynamic(() => import('./charts/SalesChart'));
const SalesChartNoSSR = NoSSRWrapper<ChartProps>(SalesChart);

<SalesChartNoSSR region="emea" />
```

---

## Layout

### DashboardShell
**Import**
```tsx
import DashboardShell from 'recrutr/components/layout/DashboardShell';
```

**Props**
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | — | Main page content rendered inside the shell. |
| `tenantName` | `string` | `'Acme Corp'` | Label for the navbar and sidebar branding. |
| `tenantLogo` | `string` | `undefined` | Optional logo URL. |
| `environment` | `'dev' \| 'staging' \| 'prod'` | `undefined` | Adds an environment pill in the navbar. |

**Usage**
```tsx
import DashboardShell from 'recrutr/components/layout/DashboardShell';
import { StatCard } from 'recrutr/components/ui';

export default function DashboardPage() {
  return (
    <DashboardShell tenantName="RecruTR" environment="staging">
      <div className="grid gap-6 md:grid-cols-2">
        <StatCard
          title="Active tenants"
          value="128"
          change="12%"
          trend="up"
          icon={Users}
        />
        {/* Other content */}
      </div>
    </DashboardShell>
  );
}
```

### Navbar
**Import**
```tsx
import Navbar, { type NavbarProps, type NavItem } from 'recrutr/components/layout/Navbar';
```

**Props**
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `navItems` | `NavItem[]` | — | Primary navigation links. |
| `tenantName` | `string` | `'Your SaaS'` | Brand text next to the avatar/logo. |
| `tenantLogo` | `string` | `undefined` | Logo URL (square image recommended). |
| `environment` | `'dev' \| 'staging' \| 'prod'` | `undefined` | Shows an environment badge (hidden when omitted). |
| `onMobileMenuToggle` | `(isOpen: boolean) => void` | `undefined` | Callback fired when the hamburger menu toggles. |

`NavItem` fields: `label`, `href`, optional `icon`, optional `match` (`'exact'` or `'startsWith'`).

**Usage**
```tsx
import { LayoutDashboard, Users } from 'lucide-react';

const items: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, match: 'exact' },
  { label: 'Users', href: '/dashboard/users', icon: Users }
];

<Navbar
  navItems={items}
  tenantName="RecruTR"
  environment="prod"
/>
```

### MobileDrawer
**Import**
```tsx
import MobileDrawer, { type MobileDrawerProps } from 'recrutr/components/layout/MobileDrawer';
```

**Props**
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | — | Controls drawer visibility (rendered only when `true`). |
| `onClose` | `() => void` | — | Fired on overlay click, close button, or sign out. |
| `navItems` | `NavItem[]` | — | Same schema as `Navbar` for mobile navigation. |

**Usage**
```tsx
<MobileDrawer
  isOpen={isDrawerOpen}
  onClose={() => setDrawerOpen(false)}
  navItems={items}
/>
```

### Sidebar (legacy layout)
**Import**
```tsx
import Sidebar, { type SideGroup, type SidebarProps } from 'recrutr/components/layout/Sidebar';
```

**Props**
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `groups` | `SideGroup[]` | — | Sections of links rendered top-to-bottom. |
| `tenantName` | `string` | `'Your SaaS'` | Branding text in the header. |
| `tenantLogo` | `string` | `undefined` | Logo image URL. |
| `isCollapsed` | `boolean` | Internal state | Controlled collapse flag (supply with `onToggleCollapse`). |
| `onToggleCollapse` | `(collapsed: boolean) => void` | `undefined` | Receives collapse state changes. |
| `className` | `string` | `''` | Appends custom classes. |

`SideGroup.items` accept `{ label, href, icon?, match? }` entries.

**Usage**
```tsx
const groups: SideGroup[] = [
  {
    title: 'Workspace',
    items: [
      { label: 'Dashboard', href: '/dashboard', match: 'exact' },
      { label: 'Settings', href: '/settings' }
    ]
  }
];

<Sidebar groups={groups} tenantName="RecruTR" />
```

### ThemeDemo
**Import**
```tsx
import ThemeDemo from 'recrutr/components/layout/ThemeDemo';
```

No props — renders a button grid that calls `applyTheme` from `lib/theme/tokens`.

**Usage**
```tsx
<ThemeDemo />
```

---

## Maintenance

### MaintenanceView
**Import**
```tsx
import { MaintenanceView } from 'recrutr/components/maintenance-view';
```

**Props**
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `supportEmail` | `string` | — | Email address inserted into the mailto link. |

**Usage**
```tsx
<MaintenanceView supportEmail="support@example.com" />
```

---

## Dashboard UI Cards

### StatCard
**Import**
```tsx
import { StatCard, type StatCardProps } from 'recrutr/components/ui';
```

**Props**
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Metric label. |
| `value` | `string` | — | Primary metric value. |
| `change` | `string` | `undefined` | Delta text (e.g. `"+12%"`). |
| `trend` | `'up' \| 'down' \| 'neutral'` | `'neutral'` | Selects arrow icon + color. |
| `icon` | `LucideIcon` | — | Icon displayed in the pill on the right. |
| `description` | `string` | `'from last month'` | Small caption shown under the change value. |
| `className` | `string` | `''` | Additional styles. |
| `variant` | `'default' \| 'minimal' \| 'highlighted'` | `'default'` | Alters background/border treatment. |

**Usage**
```tsx
import { Users } from 'lucide-react';

<StatCard
  title="Active tenants"
  value="128"
  change="12%"
  trend="up"
  icon={Users}
/>
```

### ChartCard
**Import**
```tsx
import { ChartCard, type ChartCardProps } from 'recrutr/components/ui';
```

**Props**
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Card heading. |
| `description` | `string` | `undefined` | Optional subheading. |
| `children` | `React.ReactNode` | `undefined` | Inject your chart component; fallback placeholder renders when omitted. |
| `actionLabel` | `string` | `'View all'` | CTA label. |
| `onAction` | `() => void` | `undefined` | Called when CTA button clicked. |
| `icon` | `LucideIcon` | `undefined` | Optional badge icon in the header. |
| `className` | `string` | `''` | Extra styles. |
| `height` | `string` | `'h-64'` | Tailwind height class for the content area. |
| `variant` | `'default' \| 'compact' \| 'featured'` | `'default'` | Adjusts padding/background preset. |

**Usage**
```tsx
import { LineChart } from 'lucide-react';

<ChartCard
  title="Monthly revenue"
  description="Last 12 months"
  icon={LineChart}
>
  <RevenueChart data={series} />
</ChartCard>
```

### ActivityCard
**Import**
```tsx
import { ActivityCard, type ActivityItem } from 'recrutr/components/ui';
```

**Props**
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Card heading. |
| `activities` | `ActivityItem[]` | — | Timeline data (see below). |
| `actionLabel` | `string` | `'View all'` | CTA text. |
| `onAction` | `() => void` | `undefined` | CTA handler. |
| `onItemClick` | `(item: ActivityItem) => void` | `undefined` | Row click handler. |
| `className` | `string` | `''` | Extra classes. |
| `variant` | `'default' \| 'compact' \| 'detailed'` | `'default'` | Controls padding & spacing. |
| `showAvatars` | `boolean` | `true` | Toggle avatar rendering. |
| `showIcons` | `boolean` | `false` | Use `item.icon` instead of avatar. |
| `maxItems` | `number` | `undefined` | Limits rendered rows. |
| `emptyMessage` | `string` | `'No recent activity'` | Placeholder text when list empty. |

`ActivityItem`: `{ id, user, action, time, avatar?, icon?, metadata? }`.

**Usage**
```tsx
const activities: ActivityItem[] = [
  { id: 1, user: 'Jane Cooper', action: 'invited a new member', time: '5m ago' }
];

<ActivityCard
  title="Team activity"
  activities={activities}
  onItemClick={(item) => console.log('Open activity', item)}
/>
```

### QuickActionsCard
**Import**
```tsx
import { QuickActionsCard, type QuickAction } from 'recrutr/components/ui';
```

**Props**
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Card heading. |
| `description` | `string` | `undefined` | Optional helper text. |
| `actions` | `QuickAction[]` | — | Button definitions (`id`, `label`, `onClick`, optional `icon`, `variant`, `disabled`, `description`). |
| `className` | `string` | `''` | Extra styles. |
| `variant` | `'default' \| 'compact' \| 'grid'` | `'default'` | Layout preset. |
| `columns` | `number` | `1` | Column count when using the `grid` variant. |

**Usage**
```tsx
import { Plus, Upload } from 'lucide-react';

const actions: QuickAction[] = [
  { id: 'invite', label: 'Invite member', icon: Plus, onClick: inviteUser, variant: 'primary' },
  { id: 'import', label: 'Import tenants', icon: Upload, onClick: openImport }
];

<QuickActionsCard
  title="Quick actions"
  description="Do the common admin tasks"
  actions={actions}
  variant="grid"
  columns={2}
/>
```

### StatusCard
**Import**
```tsx
import { StatusCard, type StatusItem } from 'recrutr/components/ui';
```

**Props**
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Card heading. |
| `description` | `string` | `undefined` | Helper text. |
| `items` | `StatusItem[]` | — | Status rows (see below). |
| `className` | `string` | `''` | Extra classes. |
| `variant` | `'default' \| 'compact' \| 'detailed'` | `'default'` | Adjusts density, shows overall badge for non-compact. |
| `showLastUpdated` | `boolean` | `false` | Displays `item.lastUpdated`. |
| `onItemClick` | `(item: StatusItem) => void` | `undefined` | Item click handler. |

`StatusItem`: `{ id, label, status, description?, icon?, lastUpdated? }`. `status` is one of `'operational' | 'warning' | 'error' | 'maintenance' | 'unknown'`.

**Usage**
```tsx
const status: StatusItem[] = [
  { id: 'api', label: 'Public API', status: 'operational', lastUpdated: '2m ago' },
  { id: 'billing', label: 'Billing sync', status: 'warning', description: 'Delayed invoices' }
];

<StatusCard
  title="Service health"
  items={status}
  showLastUpdated
/>
```

### NotificationsCard
**Import**
```tsx
import { NotificationsCard, type Notification } from 'recrutr/components/ui';
```

**Props**
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Card heading. |
| `notifications` | `Notification[]` | — | Notification data (see below). |
| `actionLabel` | `string` | `'View all'` | Header CTA text. |
| `onAction` | `() => void` | `undefined` | Header CTA handler. |
| `onNotificationClick` | `(notification: Notification) => void` | `undefined` | Row click handler. |
| `onDismissAll` | `() => void` | `undefined` | Clears notifications (header button). |
| `className` | `string` | `''` | Extra styles. |
| `variant` | `'default' \| 'compact' \| 'inline'` | `'default'` | Layout preset. |
| `maxItems` | `number` | `undefined` | Limits rendered notifications. |
| `showDismiss` | `boolean` | `true` | Enables per-notification dismiss button. |
| `emptyMessage` | `string` | `'No notifications'` | Placeholder text. |

`Notification`: `{ id, title, message, type, icon?, timestamp?, isRead?, actionLabel?, onAction?, onDismiss? }`.

**Usage**
```tsx
const notifications: Notification[] = [
  {
    id: 'trial-expiring',
    title: 'Trial expires soon',
    message: 'Upgrade within 3 days to keep access.',
    type: 'warning',
    timestamp: '5m ago'
  }
];

<NotificationsCard
  title="Inbox"
  notifications={notifications}
  onNotificationClick={(note) => console.log('Open', note.id)}
  onDismissAll={() => clearAll()}
/>
```

---

## Generic Sidebar System

### Sidebar
**Import**
```tsx
import { GenericSidebar, Sidebar, type SidebarProps } from 'recrutr/components/ui';
```

The re-export `GenericSidebar` equals the `Sidebar` component defined under `components/ui/Sidebar/Sidebar.tsx`.

**Props**
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `sections` | `NavigationSection[]` | — | Sidebar groups composed of `NavigationItem` entries. |
| `header` | `SidebarHeader` | `undefined` | Optional header with logo/title/actions. |
| `footer` | `SidebarFooter` | `undefined` | Optional footer block with user info/actions. |
| `isCollapsible` | `boolean` | `true` | Enables collapse toggle button. |
| `isCollapsed` | `boolean` | Internal state | Controlled collapse flag. |
| `onToggleCollapse` | `(collapsed: boolean) => void` | `undefined` | Called when collapse toggled. |
| `defaultCollapsed` | `boolean` | `false` | Initial collapsed state when uncontrolled. |
| `variant` | `'default' \| 'minimal' \| 'compact' \| 'detailed'` | `'default'` | Changes padding and borders. |
| `theme` | `SidebarTheme` | `undefined` | Optional design tokens (background, text colors, etc.). |
| `width` | `string` | `'w-64'` | Tailwind width class. |
| `collapsedWidth` | `string` | `'w-16'` | Width class when collapsed. |
| `isMobile` | `boolean` | `false` | When true, renders in mobile overlay mode. |
| `hideOnMobile` | `boolean` | `false` | Hides sidebar entirely on small screens. |
| `overlayOnMobile` | `boolean` | `false` | Adds backdrop overlay for mobile experience. |
| `className` | `string` | `''` | Wrapper class overrides. |
| `headerClassName` | `string` | `''` | Header container classes. |
| `contentClassName` | `string` | `''` | Scrollable content classes. |
| `footerClassName` | `string` | `''` | Footer container classes. |
| `onItemClick` | `(item: NavigationItem) => void` | `undefined` | Fires when any navigation item is activated. |
| `onSectionToggle` | `(sectionId: string, isOpen: boolean) => void` | `undefined` | Receives collapsible section toggles. |
| `enableSearch` | `boolean` | `false` | Shows search input for filtering items. |
| `searchPlaceholder` | `string` | `'Search...'` | Custom placeholder when search enabled. |
| `onSearch` | `(query: string) => void` | `undefined` | Called with search query. |
| `enableDragReorder` | `boolean` | `undefined` | Reserved for future drag-and-drop support. |
| `onReorder` | `(sections: NavigationSection[]) => void` | `undefined` | Reserved for drag-and-drop events. |

**Usage**
```tsx
import { GenericSidebar, type NavigationSection } from 'recrutr/components/ui';
import { LayoutDashboard, Users } from 'lucide-react';

const sections: NavigationSection[] = [
  {
    id: 'main',
    title: 'Main',
    items: [
      { id: 'dashboard', type: 'link', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { id: 'users', type: 'link', label: 'Users', href: '/dashboard/users', icon: Users }
    ]
  }
];

<GenericSidebar
  sections={sections}
  enableSearch
  footer={{
    user: { name: 'John Doe', email: 'john@example.com' },
    actions: [
      { id: 'logout', type: 'button', label: 'Sign out', onClick: handleLogout, variant: 'danger' }
    ]
  }}
/>
```

### NavigationItem types
Located in `recrutr/components/ui/Sidebar/types`.

- `NavigationLink`: `{ id, label, href, icon?, badge?, isActive?, isDisabled?, target?, exactMatch?, description?, shortcut? }`
- `NavigationButton`: `{ id, label, onClick, icon?, variant?, isDisabled?, isLoading?, description?, shortcut? }`
- `NavigationDivider`: `{ id, label? }`
- `NavigationHeader`: `{ id, label, icon?, description?, collapsible?, defaultCollapsed? }`
- `NavigationCollapsible`: `{ id, label, icon?, children, defaultOpen?, badge?, description? }`

Group them inside `NavigationSection`: `{ id, title?, items, isVisible?, permissions?, className? }`.

### Helper builders
`recrutr/components/ui/Sidebar/helpers` exposes factory helpers and utilities:

| Helper | Description |
| --- | --- |
| `createNavigationLink` / `createNavigationButton` / `createNavigationCollapsible` / `createNavigationDivider` / `createNavigationHeader` | Type-safe constructors for navigation items. |
| `createNavigationSection` | Factory retaining section typing. |
| `filterItemsByPermissions` / `filterSectionsByPermissions` | Remove items that the provided `userPermissions` array cannot access. |
| `markActiveItems` / `markActiveSections` | Marks links as active based on the current path (supports nested collapsibles). |
| `createAdminSidebar` | Opinionated preset returning a `SidebarProps` object for admin dashboards. |
| `createSimpleSidebar` / `createCompactSidebar` | Quickly spin up minimal/compact configurations. |

**Example**
```tsx
import {
  GenericSidebar,
  createNavigationSection,
  createNavigationLink,
  markActiveSections
} from 'recrutr/components/ui/Sidebar/helpers';

const baseSections = [
  createNavigationSection({
    id: 'main',
    title: 'Main',
    items: [
      createNavigationLink({ id: 'home', label: 'Home', href: '/dashboard' })
    ]
  })
];

const sections = markActiveSections(baseSections, '/dashboard');

<GenericSidebar sections={sections} />
```

---

> Need another component documented? Add it here using the same import/props/example pattern so the catalog stays complete.
