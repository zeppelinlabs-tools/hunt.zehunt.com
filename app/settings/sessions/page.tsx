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
  scope?: string;
}

export default function SecuritySessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(d => {
        if (d.success) setSessions(d.sessions);
      })
      .catch(console.error);
  }, []);

  const handleRevoke = async (id: string, name: string) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'revoke_session', session_id: id })
    });
    const result = await res.json();
    if (result.success) {
      setSessions(result.sessions);
      showToast(`Revoked: ${name}`);
    }
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
    <RoleGate allow={['developer']} title="Security and session management">
    <div className="bg-white border border-[#e5e5e5] rounded-xl p-7 max-w-3xl mx-auto shadow-sm">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-[#171717]">Security, Sessions & Agent Tokens</h1>
        <p className="text-xs text-[#525252] mt-1">
          Review active browser clients, CLI sessions, and authorized autonomous AI agent access keys.
        </p>
      </div>

      <div className="border border-[#e5e5e5] rounded-lg overflow-hidden mb-6 text-xs">
        <table className="w-full text-left">
          <thead className="bg-[#f5f5f5] text-[#525252] font-semibold border-b border-[#e5e5e5]">
            <tr>
              <th className="p-3">Client / Instance</th>
              <th className="p-3">IP / Location</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e5e5]">
            {sessions.map(s => (
              <tr key={s.id}>
                <td className="p-3 font-semibold text-[#171717]">
                  {s.device}
                  {s.scope && <div className="font-mono text-[11px] text-[#737373] font-normal">Scope: {s.scope}</div>}
                </td>
                <td className="p-3 font-mono text-[11px] text-[#525252]">{s.ip}</td>
                <td className="p-3"><span className="badge-tag verified">{s.last_seen}</span></td>
                <td className="p-3 text-right">
                  {s.is_current ? (
                    <span className="text-[#737373] text-[11px]">Current Session</span>
                  ) : (
                    <button
                      onClick={() => handleRevoke(s.id, s.device)}
                      className="text-[#b91c1c] hover:underline font-medium"
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border border-[#fecaca] bg-[#fff5f5] p-4 rounded-lg flex justify-between items-center">
        <div>
          <h4 className="font-bold text-xs text-[#b91c1c]">Delete Account</h4>
          <p className="text-xs text-[#525252] mt-0.5">
            Immediately blocks future sign-ins and revokes all linked AI-agent authorization keys.
          </p>
        </div>
        <button
          onClick={handleDeleteAccount}
          className="bg-[#b91c1c] text-white px-3.5 py-1.5 rounded text-xs font-semibold hover:bg-[#991b1b] transition-colors"
        >
          Delete Account
        </button>
      </div>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-[#18181b] text-white font-mono text-xs px-4 py-2.5 rounded-lg shadow-lg z-50">
          {toastMsg}
        </div>
      )}
    </div>
    </RoleGate>
  );
}
