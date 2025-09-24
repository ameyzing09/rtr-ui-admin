'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle2,
  Construction,
  LayoutDashboard,
  LineChart,
  Link2,
  Menu,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  Upload,
  Users,
} from 'lucide-react';
import { Button, Input } from '@/components/atoms';
import { MaintenanceView } from '@/components/maintenance-view';
import {
  MobileDrawer,
  Navbar,
  ThemeDemo,
  type NavItem,
} from '@/components/layout';
import {
  ActivityCard,
  ChartCard,
  GenericSidebar,
  NotificationsCard,
  QuickActionsCard,
  StatCard,
  StatusCard,
} from '@/components/ui';
import type {
  ActivityItem,
  Notification,
  QuickAction,
  StatusItem,
} from '@/components/ui';
import {
  createAdminSidebar,
  createNavigationLink,
  createNavigationSection,
  markActiveSections,
} from '@/components/ui/Sidebar/helpers';
import { ThemeToggle, useTheme } from '@/components/theme';

const THEMES = {
  dark: {
    pageBg: 'bg-slate-950',
    pageText: 'text-slate-100',
    headerChip: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
    headerTitle: 'text-slate-100',
    headerMuted: 'text-slate-300/80',
    sectionSurface: 'border-white/10 bg-slate-900/70',
    sectionShadow: 'shadow-[0_30px_80px_-48px_rgba(15,23,42,0.8)]',
    sectionTitle: 'text-slate-100',
    sectionMuted: 'text-slate-300/80',
    drawerNote: 'text-slate-300/60',
    navbarSurface: 'border-white/10 bg-white/5',
    chartBackdrop: 'bg-slate-900/40',
    chartBar: 'bg-cyan-400/70',
  },
  light: {
    pageBg: 'bg-slate-50',
    pageText: 'text-slate-900',
    headerChip: 'border-cyan-500/20 bg-cyan-100 text-cyan-700',
    headerTitle: 'text-slate-900',
    headerMuted: 'text-slate-600',
    sectionSurface: 'border-slate-200 bg-white/85',
    sectionShadow: 'shadow-[0_25px_60px_-35px_rgba(15,23,42,0.25)]',
    sectionTitle: 'text-slate-900',
    sectionMuted: 'text-slate-600',
    drawerNote: 'text-slate-500',
    navbarSurface: 'border-slate-200 bg-white/70',
    chartBackdrop: 'bg-slate-200/70',
    chartBar: 'bg-cyan-500/60',
  },
} as const;

type SectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  surfaceClass: string;
  shadowClass: string;
  titleClass: string;
  mutedTextClass: string;
};

function Section({
  title,
  description,
  children,
  surfaceClass,
  shadowClass,
  titleClass,
  mutedTextClass,
}: SectionProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className={`text-2xl font-semibold ${titleClass}`}>{title}</h2>
        {description && (
          <p className={`text-sm ${mutedTextClass}`}>{description}</p>
        )}
      </div>
      <div
        className={`rounded-3xl border p-6 backdrop-blur-xl transition-colors duration-500 ${surfaceClass} ${shadowClass}`}
      >
        {children}
      </div>
    </section>
  );
}

const buttonVariants = ['primary', 'secondary', 'outline', 'ghost', 'danger'] as const;
const buttonSizes = ['sm', 'md', 'lg'] as const;

const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, match: 'exact' },
  { label: 'Users', href: '/dashboard/users', icon: Users },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
];

const activityItems: ActivityItem[] = [
  { id: '1', user: 'Jane Cooper', action: 'invited a new analyst to the workspace', time: '5m ago' },
  { id: '2', user: 'Marvin McKinney', action: 'reviewed billing exports', time: '18m ago' },
  { id: '3', user: 'Courtney Henry', action: 'updated tenant permissions', time: '1h ago' },
];

const quickActions: QuickAction[] = [
  { id: 'invite', label: 'Invite member', icon: Plus, onClick: () => console.log('Invite member'), variant: 'primary' },
  { id: 'import', label: 'Import tenants', icon: Upload, onClick: () => console.log('Import tenants') },
  { id: 'refresh', label: 'Refresh metrics', icon: RefreshCcw, onClick: () => console.log('Refresh metrics'), variant: 'secondary' },
];

const statusItems: StatusItem[] = [
  { id: 'api', label: 'Public API', status: 'operational', lastUpdated: '2m ago', icon: ShieldCheck },
  { id: 'jobs', label: 'Background jobs', status: 'maintenance', description: 'Scaling queue workers', lastUpdated: '10m ago', icon: Construction },
  { id: 'billing', label: 'Billing sync', status: 'warning', description: 'Delayed invoices', icon: AlertTriangle },
];

const notifications: Notification[] = [
  {
    id: 'warning',
    title: 'Trial ends in 3 days',
    message: 'Upgrade your workspace to keep tenant onboarding automations running.',
    type: 'warning',
    timestamp: '5m ago',
    actionLabel: 'Upgrade now',
    onAction: () => console.log('Upgrade clicked'),
  },
  {
    id: 'deploy',
    title: 'Deploy complete',
    message: 'Version 2.8.1 finished rolling out across all regions.',
    type: 'success',
    icon: CheckCircle2,
    timestamp: '18m ago',
  },
];

const sidebarSections = markActiveSections(
  [
    createNavigationSection({
      id: 'main',
      title: 'Main',
      items: [
        createNavigationLink({ id: 'dash', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }),
        createNavigationLink({ id: 'users', label: 'Users', href: '/dashboard/users', icon: Users }),
        createNavigationLink({ id: 'analytics', label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 }),
      ],
    }),
  ],
  '/dashboard/users',
);

const adminSidebarConfig = createAdminSidebar({
  tenantName: 'RecruTR',
  tenantLogo: undefined,
  userName: 'John Doe',
  userEmail: 'john.doe@example.com',
  userRole: 'Administrator',
  onLogout: () => console.log('Logout clicked'),
  currentPath: '/dashboard/users',
});

export default function ComponentsPreviewPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme: themeMode } = useTheme();
  const isDark = themeMode === 'dark';
  const palette = isDark ? THEMES.dark : THEMES.light;

  const chartPlaceholder = (
    <div
      className={`flex h-full w-full items-end justify-between gap-2 rounded-lg p-4 ${palette.chartBackdrop}`}
    >
      {[40, 65, 48, 72, 54, 88].map((height, index) => (
        <div
          key={`${height}-${index}`}
          className={`w-full rounded-t ${palette.chartBar}`}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );

  return (
    <div
      className={`min-h-screen pb-24 transition-colors duration-500 ${palette.pageBg} ${palette.pageText}`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 pt-14">
        <header className="space-y-6 text-center">
          <div className="flex items-center justify-center gap-6">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition-colors duration-500 ${palette.headerChip}`}
            >
              Shared Component Gallery
            </span>
            <ThemeToggle className="hidden md:inline-flex" />
          </div>
          <h1
            className={`text-3xl font-semibold sm:text-4xl transition-colors duration-500 ${palette.headerTitle}`}
          >
            Interface kit preview
          </h1>
          <p
            className={`mx-auto max-w-2xl text-sm transition-colors duration-500 sm:text-base ${palette.headerMuted}`}
          >
            Browse the reusable primitives powering RTR Admin. Resize the viewport to see responsive behaviors and compare variants side by side.
          </p>
        </header>

        <Section
          title="Buttons"
          description="Variants and sizes. Toggle the responsive controls in dev tools to preview their layout at smaller widths."
          surfaceClass={palette.sectionSurface}
          shadowClass={palette.sectionShadow}
          titleClass={palette.sectionTitle}
          mutedTextClass={palette.sectionMuted}
        >
          <div className="space-y-8">
            {buttonVariants.map((variant) => (
              <div key={variant} className="space-y-3">
                <p className={`text-sm font-semibold uppercase tracking-[0.3em] ${palette.sectionMuted}`}>
                  {variant}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {buttonSizes.map((size) => (
                    <Button key={`${variant}-${size}`} variant={variant} size={size}>
                      {`${variant} (${size})`}
                    </Button>
                  ))}
                  <Button
                    variant={variant}
                    size="md"
                    icon={Settings}
                    iconPosition="right"
                  >
                    With icon
                  </Button>
                  <Button variant={variant} isLoading>
                    Loading state
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Inputs"
          description="Standard text input in default and filled variants with helper states."
          surfaceClass={palette.sectionSurface}
          shadowClass={palette.sectionShadow}
          titleClass={palette.sectionTitle}
          mutedTextClass={palette.sectionMuted}
        >
          <div className="grid gap-6 md:grid-cols-2">
            <Input
              label="Workspace name"
              placeholder="RecruTR HQ"
              helpText="Shown in communications."
              className="w-full"
            />
            <Input
              label="Search tenants"
              placeholder="Start typing..."
              leftIcon={Search}
              rightIcon={Bell}
              onRightIconClick={() => console.log('Bell clicked')}
              variant="filled"
              className="w-full"
            />
            <Input
              label="API token"
              placeholder="••••••••••"
              error="Token must be at least 32 characters."
              className="w-full"
            />
            <Input
              label="Instance URL"
              placeholder="https://"
              leftIcon={Link2}
              className="w-full"
            />
          </div>
        </Section>

        <Section
          title="Dashboard cards"
          description="Composed cards adapt to available width. Resize to see grid wrapping."
          surfaceClass={palette.sectionSurface}
          shadowClass={palette.sectionShadow}
          titleClass={palette.sectionTitle}
          mutedTextClass={palette.sectionMuted}
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <StatCard
              title="Active tenants"
              value="128"
              change="12%"
              trend="up"
              icon={Users}
            />
            <StatCard
              title="Invoices overdue"
              value="14"
              change="8%"
              trend="down"
              icon={AlertTriangle}
              variant="highlighted"
            />
            <ChartCard
              title="Monthly revenue"
              description="Rolling 6 months"
              icon={LineChart}
            >
              {chartPlaceholder}
            </ChartCard>
            <ActivityCard
              title="Team activity"
              activities={activityItems}
              onAction={() => console.log('View all activity')}
              maxItems={3}
            />
            <QuickActionsCard
              title="Quick actions"
              description="Primary admin workflows"
              actions={quickActions}
              variant="grid"
              columns={2}
            />
            <StatusCard
              title="Service health"
              description="Live system status"
              items={statusItems}
              showLastUpdated
              onItemClick={(item) => console.log('Clicked status', item.id)}
            />
            <NotificationsCard
              title="Notifications"
              notifications={notifications}
              onNotificationClick={(notification) => console.log('Open notification', notification.id)}
              onDismissAll={() => console.log('Dismiss all notifications')}
              maxItems={3}
            />
          </div>
        </Section>

        <Section
          title="Responsive layout primitives"
          description="Navbar, drawer, sidebar, and theme utilities rendered within a demo canvas."
          surfaceClass={palette.sectionSurface}
          shadowClass={palette.sectionShadow}
          titleClass={palette.sectionTitle}
          mutedTextClass={palette.sectionMuted}
        >
          <div className="space-y-10">
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${palette.sectionTitle}`}>
                Navbar & Mobile Drawer
              </h3>
              <p className={`text-sm ${palette.sectionMuted}`}>
                Shrink the viewport under 768px to see the navbar collapse into a hamburger menu. Use the button below to preview the drawer without resizing.
              </p>
              <div
                className={`overflow-hidden rounded-3xl border transition-colors duration-500 ${palette.navbarSurface}`}
              >
                <Navbar
                  navItems={navItems}
                  tenantName="RecruTR"
                  environment="staging"
                  onMobileMenuToggle={setDrawerOpen}
                />
              </div>
              <Button variant="outline" icon={Menu} onClick={() => setDrawerOpen(true)}>
                Open mobile drawer
              </Button>
              <MobileDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                navItems={navItems}
              />
            </div>

            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${palette.sectionTitle}`}>
                Generic Sidebar
              </h3>
              <p className={`text-sm ${palette.sectionMuted}`}>
                Resize wider than 1024px to see the sidebar and preview content next to each other.
              </p>
              <div className="overflow-hidden rounded-3xl border border-transparent bg-transparent">
                <div className="hidden lg:flex">
                  <GenericSidebar {...adminSidebarConfig} sections={sidebarSections} />
                  <div className="flex-1 p-6">
                    <p className={`text-base font-medium ${palette.sectionTitle}`}>
                      Preview area
                    </p>
                    <p className={`mt-2 text-sm ${palette.sectionMuted}`}>
                      Content stretches beside the sidebar on large screens. Collapse via the chevron to inspect the compact state.
                    </p>
                  </div>
                </div>
                <div
                  className={`flex items-center justify-center p-6 text-sm lg:hidden ${palette.drawerNote}`}
                >
                  Expand the viewport (&gt;= 1024px) to view the full sidebar demo.
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${palette.sectionTitle}`}>
                Theme tokens
              </h3>
              <p className={`text-sm ${palette.sectionMuted}`}>
                ThemeDemo applies runtime design tokens for tenants. The interaction is client-side.
              </p>
              <div
                className={`rounded-3xl border p-6 backdrop-blur-xl transition-colors duration-500 ${palette.sectionSurface} ${palette.sectionShadow}`}
              >
                <ThemeDemo />
              </div>
            </div>
          </div>
        </Section>

        <Section
          title="Maintenance view"
          description="Embed the maintenance layout used by the top-level maintenance mode."
          surfaceClass={palette.sectionSurface}
          shadowClass={palette.sectionShadow}
          titleClass={palette.sectionTitle}
          mutedTextClass={palette.sectionMuted}
        >
          <MaintenanceView supportEmail="support@recrutr.in" />
        </Section>
      </div>
    </div>
  );
}


