'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RoleGate from '@/components/RoleGate';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/notifications')
      .then(res => res.json())
      .then(d => {
        if (d.success && d.notifications) {
          setNotifications(d.notifications);
        }
      })
      .catch(console.error);
  }, []);

  const markAllRead = async () => {
    await fetch('/api/v1/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_all_read' })
    });
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
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
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#737373]">
            No notifications yet
          </div>
        ) : (
          notifications.map(n => (
            <Link
              key={n.id}
              href={n.link || '#'}
              className={`p-4 flex items-start justify-between gap-4 hover:bg-[#f5f5f5] transition-colors ${
                !n.is_read ? 'bg-[#fbfcfe]' : ''
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-[#171717]">{n.title}</span>
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-[#2563eb]"></span>}
                </div>
                <p className="text-xs text-[#525252]">{n.message}</p>
              </div>
              <span className="text-[11px] font-mono text-[#737373] whitespace-nowrap">
                {new Date(n.created_at).toLocaleString()}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
    </RoleGate>
  );
}
