'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoleGate from '@/components/RoleGate';

interface SessionItem {
  id: string;
  device: string;
  ip: string;
  type: string;
  is_current: boolean;
  last_seen: string;
}

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.sessions) {
          setSessions(data.sessions);
        }
      })
      .catch(console.error);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRevokeSession = async (id: string) => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'revoke_session', sessionId: id })
    });
    setSessions(prev => prev.filter(s => s.id !== id));
    showToast('Session access terminated immediately');
  };

  const handleRevokeAllOther = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'revoke_other_sessions' })
    });
    setSessions(prev => prev.filter(s => s.is_current));
    showToast('All secondary client authorizations revoked');
  };

  const handleDeleteAccount = async () => {
    if (confirm('Permanently delete account? This will revoke all active browser and AI-agent authorizations.')) {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_account' })
      });
      showToast('Account marked as deleted');
      setTimeout(() => router.push('/auth/signin'), 800);
    }
  };

  return (
    <RoleGate allow={['developer', 'admin']} title="Security and session management">
    <div className="bg-white border border-[#e5e5e5] rounded-xl p-7 max-w-3xl mx-auto shadow-sm">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-[#171717]">Security, Sessions &amp; Agent Tokens</h1>
        <p className="text-xs text-[#525252] mt-1">
          Review active browser clients, CLI sessions, and authorized autonomous AI agent access keys.
        </p>
      </div>

      <div className="border border-[#e5e5e5] rounded-lg overflow-hidden mb-6 text-xs">
        <table className="w-full text-left">
          <thead className="bg-[#f5f5f5] text-[#525252] font-semibold border-b border-[#e5e5e5]">
            <tr>
              <th className="p-3">Client / Instance</th>
              <th className="p-3">Network &amp; Location</th>
              <th className="p-3">Last Active</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e5e5]">
            {sessions.map(s => (
              <tr key={s.id} className="hover:bg-[#fafafa]">
                <td className="p-3 font-medium text-[#171717] flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${s.is_current ? 'bg-[#15803d]' : 'bg-[#a3a3a3]'}`}></span>
                  {s.device}
                  {s.is_current && <span className="bg-[#eff6ff] text-[#2563eb] text-[10px] px-1.5 py-0.5 rounded font-bold">This Client</span>}
                </td>
                <td className="p-3 font-mono text-[#525252]">{s.ip}</td>
                <td className="p-3 text-[#737373]">{s.last_seen}</td>
                <td className="p-3 text-right">
                  {!s.is_current ? (
                    <button
                      onClick={() => handleRevokeSession(s.id)}
                      className="text-[#b91c1c] hover:underline font-semibold cursor-pointer"
                    >
                      Revoke
                    </button>
                  ) : (
                    <span className="text-[#a3a3a3] font-mono text-[10px]">Active Session</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-[#e5e5e5]">
        <button
          onClick={handleRevokeAllOther}
          className="text-xs font-semibold text-[#525252] hover:text-[#171717] hover:underline cursor-pointer"
        >
          Revoke all other active devices &rarr;
        </button>

        <button
          onClick={handleDeleteAccount}
          className="text-xs font-semibold text-[#b91c1c] hover:underline cursor-pointer"
        >
          Delete Account Data
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#171717] text-white text-xs px-4 py-2.5 rounded-lg shadow-lg border border-[#404040]">
          {toast}
        </div>
      )}
    </div>
    </RoleGate>
  );
}
