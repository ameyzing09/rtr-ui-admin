'use client';

import React from 'react';
import {
  Users,
  Briefcase,
  CalendarClock,
  FileCheck2,
  Activity,
  UserPlus,
  FileText,
} from 'lucide-react';
import {
  StatCard,
  ChartCard,
  ActivityCard,
  QuickActionsCard,
  type ActivityItem,
  type QuickAction,
} from '@/components/ui';

const hrStats = [
  { title: 'Open Positions', value: '18', change: '+2 this week', trend: 'up' as const, icon: Briefcase },
  { title: 'Candidates In Review', value: '146', change: '+24 new', trend: 'up' as const, icon: Users },
  { title: 'Interviews Scheduled', value: '26', change: '+8 vs avg', trend: 'up' as const, icon: CalendarClock },
  { title: 'Offer Acceptance Rate', value: '78%', change: '+4%', trend: 'up' as const, icon: FileCheck2 },
];

const hrActivity: ActivityItem[] = [
  { id: '1', user: 'Aisha Khan', action: 'reviewed 12 new applicants for Data Scientist', time: '9m ago', avatar: 'AK' },
  { id: '2', user: 'Vikram Patel', action: 'sent bulk follow-ups to Design candidates', time: '18m ago', avatar: 'VP' },
  { id: '3', user: 'Neha Gupta', action: 'advanced 3 candidates to Final for SRE', time: '35m ago', avatar: 'NG' },
];

const hrQuick: QuickAction[] = [
  { id: 'req', label: 'Create Requisition', icon: FileText, onClick: () => console.log('Create requisition'), variant: 'primary' },
  { id: 'bulk', label: 'Bulk Message', icon: UserPlus, onClick: () => console.log('Bulk message') },
  { id: 'schedule', label: 'Schedule Interviews', icon: CalendarClock, onClick: () => console.log('Schedule interviews'), variant: 'secondary' },
];

export default function TenantDemoDashboard() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[var(--card-foreground)]">HR Demo Dashboard</h1>
        <p className="text-[var(--muted-foreground)]">A tenant-level view focused on day-to-day recruiting activities.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {hrStats.map((s) => (
          <StatCard key={s.title} title={s.title} value={s.value} change={s.change} trend={s.trend} icon={s.icon} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Hiring Velocity"
          description="Time-to-fill by function"
          icon={Activity}
        />

        <ActivityCard
          title="Recruiter Activity"
          activities={hrActivity}
          onAction={() => console.log('View all activity')}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <QuickActionsCard title="Quick Actions" description="HR workflows" actions={hrQuick} />

        <ChartCard
          title="New Applicants"
          description="Applications per week"
          icon={Users}
        />
      </div>
    </div>
  );
}

