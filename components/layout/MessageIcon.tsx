
'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export function MessageIcon() {
  // Mock unread message count - will be replaced with real data
  const unreadCount = 2;

  return (
    <Link
      href="/messages"
      className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
    >
      <MessageCircle className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-primary rounded-full">
          {unreadCount}
        </span>
      )}
    </Link>
  );
}