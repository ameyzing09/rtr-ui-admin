'use client';
import {
  Users,
  Briefcase,
  CalendarClock,
  FileCheck2,
  Activity,
  UserPlus,
  FileText,
  Database,
  Zap,
  Shield,
} from 'lucide-react';
import ThemeDemo from '@/components/layout/ThemeDemo';
import {
  StatCard,
  ChartCard,
  ActivityCard,
  QuickActionsCard,
  StatusCard,
  NotificationsCard,
  type ActivityItem,
  type QuickAction,
  type StatusItem,
  type Notification
} from '@/components/ui';

// Demo data - Recruitment-focused
const stats = [
  {
    title: 'Open Roles',
    value: '27',
    change: '+3 this week',
    trend: 'up' as const,
    icon: Briefcase,
  },
  {
    title: 'Active Candidates',
    value: '312',
    change: '+42 new',
    trend: 'up' as const,
    icon: Users,
  },
  {
    title: 'Interviews Today',
    value: '18',
    change: '+5 vs avg',
    trend: 'up' as const,
    icon: CalendarClock,
  },
  {
    title: 'Offers This Month',
    value: '12',
    change: '+2 accepted',
    trend: 'up' as const,
    icon: FileCheck2,
  },
];

const recentActivity: ActivityItem[] = [
  {
    id: '1',
    user: 'Priya Sharma',
    action: 'moved a candidate to Onsite for Senior Backend Engineer',
    time: '2 minutes ago',
    avatar: 'PS',
  },
  {
    id: '2',
    user: 'Rahul Verma',
    action: 'posted a new job: Product Designer (Remote)',
    time: '5 minutes ago',
    avatar: 'RV',
  },
  {
    id: '3',
    user: 'Anita Das',
    action: 'scheduled panel interview for Data Analyst',
    time: '10 minutes ago',
    avatar: 'AD',
  },
  {
    id: '4',
    user: 'Sandeep Rao',
    action: 'sent an offer to Mobile Engineer (iOS)',
    time: '15 minutes ago',
    avatar: 'SR',
  },
];

const quickActions: QuickAction[] = [
  {
    id: 'post-job',
    label: 'Post New Job',
    icon: FileText,
    onClick: () => console.log('Post job clicked'),
    variant: 'primary',
  },
  {
    id: 'invite-candidate',
    label: 'Invite Candidate',
    icon: UserPlus,
    onClick: () => console.log('Invite candidate clicked'),
  },
  {
    id: 'schedule-interview',
    label: 'Schedule Interview',
    icon: CalendarClock,
    onClick: () => console.log('Schedule interview clicked'),
  },
];

const systemStatus: StatusItem[] = [
  {
    id: 'job-api',
    label: 'Job Board API',
    status: 'operational',
    icon: Zap,
    lastUpdated: '2 mins ago',
  },
  {
    id: 'scheduler',
    label: 'Scheduler',
    status: 'operational',
    icon: Database,
    lastUpdated: '5 mins ago',
  },
  {
    id: 'emails',
    label: 'Emails',
    status: 'warning',
    description: 'Bounce rate elevated',
    icon: Shield,
    lastUpdated: '1 min ago',
  },
];

const notifications: Notification[] = [
  {
    id: 'system-update',
    title: 'System Update',
    message: 'New features available for your dashboard',
    type: 'info',
    timestamp: '5 minutes ago',
    isRead: false,
    actionLabel: 'Learn More',
    onAction: () => console.log('Learn more clicked'),
  },
  {
    id: 'maintenance',
    title: 'Scheduled Maintenance',
    message: 'System maintenance scheduled for tonight at 2 AM EST',
    type: 'warning',
    timestamp: '1 hour ago',
    isRead: true,
  },
];

export default function DashboardPage() {
  // Demo gate: show admin-only cards under a separate section
  const isSuperAdmin = true;
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[var(--card-foreground)]">Recruitment Dashboard</h1>
        <p className="text-[var(--muted-foreground)]">
          Track hiring performance, candidate flow, and job health across your organization.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart Component */}
        <ChartCard
          title="Hiring Pipeline"
          description="Funnel across stages: Applied → Offer"
          icon={Activity}
          onAction={() => console.log('View pipeline details')}
        />

        {/* Recent Activity */}
        <ActivityCard
          title="Recent Activity"
          activities={recentActivity}
          onAction={() => console.log('View all activity')}
          onItemClick={(item) => console.log('Activity clicked:', item)}
        />
      </div>

      {/* Super Admin Section */}
      {isSuperAdmin && (
        <div className="grid gap-6 lg:grid-cols-3">
          <ThemeDemo />

          <QuickActionsCard
            title="Quick Actions"
            description="Common hiring tasks"
            actions={quickActions}
          />

          <StatusCard
            title="System Status"
            description="Hiring system health"
            items={systemStatus}
            showLastUpdated={true}
            onItemClick={(item) => console.log('Status clicked:', item)}
          />
        </div>
      )}

      {/* Notifications Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <NotificationsCard
          title="Recent Notifications"
          notifications={notifications}
          onAction={() => console.log('View all notifications')}
          onNotificationClick={(notification) => console.log('Notification clicked:', notification)}
        />

        {/* Additional Chart or Content */}
        <ChartCard
          title="Applications Over Time"
          description="Weekly new applicants across job families"
          icon={Activity}
          variant="featured"
          onAction={() => console.log('View applications details')}
        />
      </div>
    </div>
  );
}
