# Modular Dashboard Components Guide

A comprehensive guide to using the modular, reusable dashboard components that can be used anywhere in your application.

## 📦 Available Components

All components are available in `src/components/ui/` and can be imported individually or as a group:

```typescript
import { 
  StatCard, 
  ChartCard, 
  ActivityCard, 
  QuickActionsCard, 
  StatusCard, 
  NotificationsCard 
} from '@/components/ui';
```

## 🎯 Component Overview

### 1. StatCard - Metrics Display

Perfect for displaying key metrics, KPIs, and statistics with trend indicators.

**Features:**
- Trend arrows (up/down/neutral)
- Customizable icons
- Multiple variants (default, minimal, highlighted)
- Percentage changes with descriptions

**Usage:**
```typescript
import { StatCard } from '@/components/ui';
import { DollarSign } from 'lucide-react';

<StatCard
  title="Total Revenue"
  value="$45,231.89"
  change="+20.1%"
  trend="up"
  icon={DollarSign}
  description="from last month"
  variant="highlighted"
/>
```

**Props:**
- `title: string` - Main label
- `value: string` - Primary value to display
- `change?: string` - Percentage or absolute change
- `trend?: 'up' | 'down' | 'neutral'` - Visual indicator
- `icon: LucideIcon` - Icon component
- `description?: string` - Change description
- `variant?: 'default' | 'minimal' | 'highlighted'`

### 2. ChartCard - Data Visualization Container

Provides a consistent container for charts and data visualizations.

**Features:**
- Placeholder content when no chart is provided
- Action buttons with callbacks
- Multiple size variants
- Support for any chart library

**Usage:**
```typescript
import { ChartCard } from '@/components/ui';
import { TrendingUp } from 'lucide-react';
import MyChart from './MyChart'; // Your chart component

<ChartCard
  title="Revenue Overview"
  description="Monthly revenue trends"
  icon={TrendingUp}
  variant="featured"
  height="h-80"
  onAction={() => window.open('/detailed-analytics')}
  actionLabel="View Details"
>
  <MyChart data={chartData} />
</ChartCard>
```

**Props:**
- `title: string` - Card title
- `description?: string` - Subtitle
- `children?: React.ReactNode` - Chart content
- `actionLabel?: string` - Action button text
- `onAction?: () => void` - Action callback
- `icon?: LucideIcon` - Header icon
- `height?: string` - Content height class
- `variant?: 'default' | 'compact' | 'featured'`

### 3. ActivityCard - Activity Feed

Displays user activities, logs, or recent events in a clean list format.

**Features:**
- User avatars or custom icons
- Clickable items with callbacks
- Pagination support
- Empty state handling
- Multiple display variants

**Usage:**
```typescript
import { ActivityCard, type ActivityItem } from '@/components/ui';

const activities: ActivityItem[] = [
  {
    id: '1',
    user: 'John Doe',
    action: 'Created new project',
    time: '2 minutes ago',
    avatar: 'JD',
    metadata: { project: 'Dashboard v2' }
  }
];

<ActivityCard
  title="Recent Activity"
  activities={activities}
  maxItems={5}
  variant="detailed"
  showAvatars={true}
  onAction={() => router.push('/activity-log')}
  onItemClick={(item) => showActivityDetails(item)}
/>
```

**Props:**
- `title: string` - Card title
- `activities: ActivityItem[]` - Activity data
- `actionLabel?: string` - "View all" button text
- `onAction?: () => void` - View all callback
- `onItemClick?: (item) => void` - Item click handler
- `variant?: 'default' | 'compact' | 'detailed'`
- `showAvatars?: boolean` - Show user avatars
- `maxItems?: number` - Limit displayed items

### 4. QuickActionsCard - Action Buttons

Groups related actions in a clean, organized layout.

**Features:**
- Multiple button variants and styles
- Grid or list layouts
- Icon support
- Disabled state handling
- Descriptions and tooltips

**Usage:**
```typescript
import { QuickActionsCard, type QuickAction } from '@/components/ui';
import { UserPlus, FileText, Settings } from 'lucide-react';

const actions: QuickAction[] = [
  {
    id: 'create-user',
    label: 'Create New User',
    icon: UserPlus,
    variant: 'primary',
    onClick: () => openUserModal(),
    description: 'Add team member'
  },
  {
    id: 'export-data',
    label: 'Export Data',
    icon: FileText,
    onClick: () => exportToCSV(),
    disabled: !hasData
  }
];

<QuickActionsCard
  title="Quick Actions"
  description="Common tasks"
  actions={actions}
  variant="grid"
  columns={2}
/>
```

**Props:**
- `title: string` - Card title
- `actions: QuickAction[]` - Action definitions
- `description?: string` - Card subtitle
- `variant?: 'default' | 'compact' | 'grid'`
- `columns?: number` - Grid columns (for grid variant)

### 5. StatusCard - System Status

Displays system health, service status, or any status indicators.

**Features:**
- Multiple status types (operational, warning, error, maintenance)
- Last updated timestamps
- Clickable status items
- Overall status calculation
- Icon support for each item

**Usage:**
```typescript
import { StatusCard, type StatusItem } from '@/components/ui';
import { Database, Zap, Shield } from 'lucide-react';

const statusItems: StatusItem[] = [
  {
    id: 'api',
    label: 'API Gateway',
    status: 'operational',
    icon: Zap,
    lastUpdated: '2 mins ago'
  },
  {
    id: 'database',
    label: 'Database',
    status: 'warning',
    description: 'High CPU usage',
    icon: Database,
    lastUpdated: '5 mins ago'
  }
];

<StatusCard
  title="System Status"
  items={statusItems}
  variant="detailed"
  showLastUpdated={true}
  onItemClick={(item) => showStatusDetails(item)}
/>
```

**Props:**
- `title: string` - Card title
- `items: StatusItem[]` - Status data
- `description?: string` - Card subtitle
- `variant?: 'default' | 'compact' | 'detailed'`
- `showLastUpdated?: boolean` - Show timestamps
- `onItemClick?: (item) => void` - Item click handler

### 6. NotificationsCard - Alerts & Messages

Displays notifications, alerts, and messages with different priority levels.

**Features:**
- Multiple notification types (info, success, warning, error)
- Read/unread states
- Dismissible notifications
- Action buttons
- Timestamp display

**Usage:**
```typescript
import { NotificationsCard, type Notification } from '@/components/ui';

const notifications: Notification[] = [
  {
    id: 'update-1',
    title: 'System Update Available',
    message: 'New features and security improvements',
    type: 'info',
    timestamp: '5 minutes ago',
    isRead: false,
    actionLabel: 'Update Now',
    onAction: () => startUpdate(),
    onDismiss: () => dismissNotification('update-1')
  }
];

<NotificationsCard
  title="Alerts"
  notifications={notifications}
  maxItems={3}
  showDismiss={true}
  onAction={() => router.push('/notifications')}
  onNotificationClick={(notification) => markAsRead(notification)}
  onDismissAll={() => clearAllNotifications()}
/>
```

**Props:**
- `title: string` - Card title
- `notifications: Notification[]` - Notification data
- `actionLabel?: string` - "View all" button text
- `onAction?: () => void` - View all callback
- `maxItems?: number` - Limit displayed items
- `showDismiss?: boolean` - Show dismiss buttons
- `variant?: 'default' | 'compact' | 'inline'`

## 🚀 Real-World Examples

### 1. Analytics Dashboard

```typescript
'use client';

import { StatCard, ChartCard } from '@/components/ui';
import { Users, DollarSign, TrendingUp } from 'lucide-react';

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Monthly Revenue"
          value="$12,450"
          change="+8.2%"
          trend="up"
          icon={DollarSign}
          variant="highlighted"
        />
        <StatCard
          title="Active Users"
          value="1,234"
          change="+12.5%"
          trend="up"
          icon={Users}
        />
        <StatCard
          title="Conversion Rate"
          value="3.2%"
          change="-0.3%"
          trend="down"
          icon={TrendingUp}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Revenue Trends"
          description="Last 12 months"
          icon={DollarSign}
          onAction={() => router.push('/analytics/revenue')}
        >
          {/* Your chart component here */}
        </ChartCard>
        
        <ChartCard
          title="User Growth"
          description="Daily active users"
          icon={Users}
          variant="featured"
        >
          {/* Your chart component here */}
        </ChartCard>
      </div>
    </div>
  );
}
```

### 2. Operations Dashboard

```typescript
'use client';

import { StatusCard, ActivityCard, NotificationsCard } from '@/components/ui';

export default function OperationsDashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <StatusCard
        title="Infrastructure Status"
        items={infrastructureStatus}
        variant="detailed"
        showLastUpdated={true}
      />
      
      <ActivityCard
        title="Recent Deployments"
        activities={deploymentActivity}
        variant="detailed"
        onItemClick={showDeploymentDetails}
      />
      
      <NotificationsCard
        title="System Alerts"
        notifications={systemAlerts}
        variant="compact"
        className="lg:col-span-2"
      />
    </div>
  );
}
```

### 3. Admin Panel

```typescript
'use client';

import { QuickActionsCard, StatCard, ActivityCard } from '@/components/ui';

export default function AdminPanel() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map(stat => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickActionsCard
          title="Admin Actions"
          actions={adminActions}
          variant="grid"
          columns={1}
        />
        
        <ActivityCard
          title="User Activity"
          activities={userActivity}
          className="lg:col-span-2"
          onItemClick={showUserDetails}
        />
      </div>
    </div>
  );
}
```

## 🎨 Styling & Customization

### Component Variants

Each component offers multiple variants for different use cases:

- **default**: Standard appearance
- **compact**: Reduced padding and smaller text
- **detailed**: Additional information and spacing
- **minimal**: Clean, minimal design
- **highlighted**: Emphasized appearance
- **featured**: Premium styling with gradients

### Custom Styling

All components accept a `className` prop for custom styling:

```typescript
<StatCard
  {...props}
  className="border-2 border-blue-500 shadow-xl"
/>
```

### Theme Integration

Components automatically use your CSS variables from the theme system:

```css
.custom-variant {
  background: rgb(var(--color-primary) / 0.1);
  border-color: rgb(var(--color-primary));
}
```

## 📱 Responsive Design

All components are mobile-first and responsive:

- **Mobile**: Single column layouts
- **Tablet**: 2-column grids where appropriate
- **Desktop**: Full grid layouts with optimized spacing

```typescript
// Responsive grid example
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
</div>
```

## 🔧 Advanced Usage

### Conditional Rendering

```typescript
{hasPermission && (
  <QuickActionsCard
    title="Admin Actions"
    actions={adminActions}
  />
)}
```

### Dynamic Data Loading

```typescript
const [activities, setActivities] = useState<ActivityItem[]>([]);

useEffect(() => {
  fetchActivities().then(setActivities);
}, []);

<ActivityCard
  title="Recent Activity"
  activities={activities}
  emptyMessage="No recent activity"
/>
```

### Error Handling

```typescript
<StatusCard
  title="System Status"
  items={statusItems}
  onItemClick={(item) => {
    try {
      handleStatusClick(item);
    } catch (error) {
      showErrorToast('Failed to load status details');
    }
  }}
/>
```

## 🚀 Performance Tips

1. **Memoize expensive callbacks**:
```typescript
const handleItemClick = useCallback((item) => {
  // Handle click
}, [dependencies]);
```

2. **Limit displayed items**:
```typescript
<ActivityCard
  activities={activities}
  maxItems={10} // Prevent rendering hundreds of items
/>
```

3. **Use variants appropriately**:
```typescript
// Use 'compact' for dense layouts
<StatCard variant="compact" {...props} />
```

## 🎯 Best Practices

1. **Consistent Data Shapes**: Use TypeScript interfaces for consistent data
2. **Error Boundaries**: Wrap components in error boundaries for production
3. **Loading States**: Show loading indicators while fetching data
4. **Accessibility**: Always provide meaningful `actionLabel` text
5. **Mobile Testing**: Test all variants on mobile devices

This modular system allows you to create consistent, professional dashboards with minimal code while maintaining full customization flexibility.
