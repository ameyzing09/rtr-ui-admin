'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  href?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

// Mock notifications - replace with real data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Application',
    message: 'John Doe applied for Senior React Developer',
    timestamp: '5 minutes ago',
    read: false,
    href: '/dashboard/applications',
    type: 'info',
  },
  {
    id: '2',
    title: 'Interview Scheduled',
    message: 'Interview with Jane Smith scheduled for tomorrow at 2 PM',
    timestamp: '1 hour ago',
    read: false,
    href: '/dashboard/interviews',
    type: 'success',
  },
  {
    id: '3',
    title: 'Job Post Expiring',
    message: 'Senior Frontend Developer job expires in 3 days',
    timestamp: '3 hours ago',
    read: true,
    href: '/dashboard/jobs',
    type: 'warning',
  },
];

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getTypeStyles = (type?: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          relative p-2 rounded-full
          transition-smooth focus-ring nav-link-hover
          text-gray-700
        "
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="
            absolute -top-1 -right-1 w-5 h-5
            bg-red-500 text-white text-xs font-bold
            rounded-full flex items-center justify-center
          ">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="
          absolute right-0 top-full mt-2 w-96
          glass-surface rounded-lg shadow-xl border border-gray-200
          max-h-[32rem] flex flex-col
          z-50
        ">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 transition-smooth"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Bell className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`
                      p-4 transition-smooth cursor-pointer
                      ${!notification.read ? 'bg-blue-50/50' : 'hover:bg-gray-50'}
                    `}
                  >
                    {notification.href ? (
                      <Link
                        href={notification.href}
                        onClick={() => {
                          markAsRead(notification.id);
                          setIsOpen(false);
                        }}
                        className="block"
                      >
                        <NotificationContent notification={notification} />
                      </Link>
                    ) : (
                      <div onClick={() => markAsRead(notification.id)}>
                        <NotificationContent notification={notification} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-3">
            <Link
              href="/dashboard/notifications"
              className="
                block text-center text-sm text-blue-600 hover:text-blue-700
                transition-smooth
              "
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationContent({ notification }: { notification: Notification }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
          {!notification.read && (
            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
      </div>
    </div>
  );
}
