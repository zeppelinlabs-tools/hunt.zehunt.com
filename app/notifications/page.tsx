'use client';

import { useState } from 'react';
import Link from 'next/link';
import RoleGate from '@/components/RoleGate';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'confirmation',
      title: 'Solution Confirmed',
      message: '@dev_kelsey confirmed your solution for "Supabase authentication fails after Vercel deployment"',
      time: '2 hours ago',
      unread: true,
      href: '/problems/4821'
    },
    {
      id: 2,
      type: 'comment',
      title: 'New Peer Experience Added',
      message: '@marcus_io commented with a middleware matcher clarification on problem #4821',
      time: '5 hours ago',
      unread: true,
      href: '/problems/4821'
    },
    {
      id: 3,
      type: 'agent',
      title: 'Agent Query Logged',
      message: 'Cursor-Agent successfully retrieved your verified fix for Next.js cookies via MCP',
      time: 'Yesterday',
      unread: false,
      href: '/agents'
    }
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <RoleGate allow={['developer', 'admin']} title="Notifications">
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#171717]">Notifications</h1>
          <p className="text-xs text-[#525252] mt-0.5">
            Confirmations, solution discussions, and AI agent activity alerts.
          </p>
        </div>
        <button onClick={markAllRead} className="filter-btn text-xs">
          Mark all as read
        </button>
      </div>

      <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden shadow-sm divide-y divide-[#e5e5e5]">
        {notifications.map(n => (
          <Link
            key={n.id}
            href={n.href}
            className={`p-4 flex items-start justify-between gap-4 hover:bg-[#f5f5f5] transition-colors ${
              n.unread ? 'bg-[#fbfcfe]' : ''
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-[#171717]">{n.title}</span>
                {n.unread && <span className="w-2 h-2 rounded-full bg-[#2563eb]"></span>}
              </div>
              <p className="text-xs text-[#525252]">{n.message}</p>
            </div>
            <span className="text-[11px] font-mono text-[#737373] whitespace-nowrap">{n.time}</span>
          </Link>
        ))}
      </div>
    </div>
    </RoleGate>
  );
}
