
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  // Mock notifications - will be replaced with real data
  const notifications: Notification[] = [
    {
      id: 1,
      title: 'New registration',
      message: 'John Doe registered for Data Science Workshop',
      time: '2 minutes ago',
      read: false,
    },
    {
      id: 2,
      title: 'Payment received',
      message: 'KES 2,000 received from Jane Smith',
      time: '1 hour ago',
      read: false,
    },
    {
      id: 3,
      title: 'Certificate issued',
      message: 'Certificate sent to 5 attendees',
      time: '3 hours ago',
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="font-semibold text-gray-900">Notifications</span>
              <Link
                href="/notifications"
                className="text-sm text-primary hover:text-primary/80"
                onClick={() => setIsOpen(false)}
              >
                View all
              </Link>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {notification.time}
                  </p>
                </div>
              ))}
            </div>

            {notifications.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p>No notifications</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}