'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RoleGate from '@/components/RoleGate';

interface UserItem {
  id: string;
  email: string;
  username: string;
  display_name: string;
  role: 'developer' | 'admin';
  status: 'active' | 'restricted' | 'deleted' | 'disabled';
  bio?: string;
  stats?: {
    problems_count?: number;
    solutions_count?: number;
    confirmations_count?: number;
    helpful_votes?: number;
    connected_agents_count?: number;
  };
  restriction_reason?: string;
  restricted_at?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'restricted' | 'admin'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Restrict modal state
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [restrictReason, setRestrictReason] = useState('Repeated synthetic or unverified solutions');
  const [customReason, setCustomReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleRestrict = async () => {
    if (!selectedUser) return;
    setIsProcessing(true);
    const reasonToSave = customReason.trim() || restrictReason;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restrict',
          userId: selectedUser.id,
          reason: reasonToSave,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id
              ? {
                  ...u,
                  status: 'restricted',
                  restriction_reason: reasonToSave,
                  restricted_at: new Date().toISOString(),
                }
              : u
          )
        );
        showToast(`Account @${selectedUser.username} has been restricted.`);
        setSelectedUser(null);
        setCustomReason('');
      } else {
        showToast(`Failed: ${data.error}`);
      }
    } catch {
      showToast('Network error while updating user restriction.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnrestrict = async (user: UserItem) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unrestrict',
          userId: user.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id
              ? {
                  ...u,
                  status: 'active',
                  restriction_reason: undefined,
                  restricted_at: undefined,
                }
              : u
          )
        );
        showToast(`Account @${user.username} has been restored to active status.`);
      } else {
        showToast(`Failed: ${data.error}`);
      }
    } catch {
      showToast('Network error while unrestricting user.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'active') return u.status === 'active';
    if (statusFilter === 'restricted') return u.status === 'restricted';
    if (statusFilter === 'admin') return u.role === 'admin';
    return true;
  });

  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.status === 'active').length;
  const restrictedCount = users.filter((u) => u.status === 'restricted').length;
  const totalSolutions = users.reduce((acc, u) => acc + (u.stats?.solutions_count || 0), 0);

  return (
    <RoleGate allow={['admin']} title="Developer governance">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#2563eb] bg-[#eff6ff] px-2 py-0.5 rounded border border-[#bfdbfe]">
                Trust &amp; Safety
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#171717]">
              Developer &amp; User Governance
            </h1>
            <p className="text-base text-[#525252] mt-1 max-w-3xl">
              Audit registered community accounts, monitor developer trust metrics, and restrict or restore access to keep platform knowledge authentic.
            </p>
          </div>

          <Link
            href="/admin"
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-white border border-[#e5e5e5] hover:bg-[#f5f5f5] text-[#171717] transition-colors shadow-2xs"
          >
            &larr; Admin Overview
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#e5e5e5] p-5 rounded-2xl shadow-xs">
            <div className="text-3xl font-bold text-[#171717]">{totalUsers}</div>
            <div className="text-sm text-[#737373] mt-1 font-medium">Registered Accounts</div>
          </div>
          <div className="bg-white border border-[#e5e5e5] p-5 rounded-2xl shadow-xs">
            <div className="text-3xl font-bold text-[#15803d]">{activeCount}</div>
            <div className="text-sm text-[#737373] mt-1 font-medium">Active Community Devs</div>
          </div>
          <div className="bg-white border border-[#e5e5e5] p-5 rounded-2xl shadow-xs">
            <div className="text-3xl font-bold text-[#b91c1c]">{restrictedCount}</div>
            <div className="text-sm text-[#737373] mt-1 font-medium">Restricted / Suspended</div>
          </div>
          <div className="bg-white border border-[#e5e5e5] p-5 rounded-2xl shadow-xs">
            <div className="text-3xl font-bold text-[#2563eb]">{totalSolutions}</div>
            <div className="text-sm text-[#737373] mt-1 font-medium">Verified Solutions Authored</div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white border border-[#e5e5e5] p-4 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a3a3a3]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, @username, or email..."
              className="w-full pl-10 pr-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm text-[#171717] outline-none focus:border-[#2563eb] focus:bg-white transition-all placeholder:text-[#94a3b8]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(
              [
                { key: 'all', label: `All (${totalUsers})` },
                { key: 'active', label: `Active (${activeCount})` },
                { key: 'restricted', label: `Restricted (${restrictedCount})` },
                { key: 'admin', label: 'Admins' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.key}
                onClick={() => setStatusFilter(filter.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
                  statusFilter === filter.key
                    ? 'bg-[#0f172a] text-white shadow-xs'
                    : 'bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Developers Management Table */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#e5e5e5] flex justify-between items-center text-sm">
            <span className="font-bold text-[#171717]">
              Community Members ({filteredUsers.length} shown)
            </span>
            <span className="text-xs text-[#64748b] font-mono">
              Policy enforcement active
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-[#737373]">
              Loading user registry...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#737373]">
              No accounts match the current search or status filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#e5e5e5] text-[#525252] bg-white text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-4">Developer</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Contribution Metrics</th>
                    <th className="p-4">Status &amp; Policy</th>
                    <th className="p-4 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {filteredUsers.map((u) => {
                    const isRestricted = u.status === 'restricted';
                    const isAdmin = u.role === 'admin';

                    return (
                      <tr
                        key={u.id}
                        className={`hover:bg-[#fafafa] transition-colors ${
                          isRestricted ? 'bg-[#fff5f5]/60' : ''
                        }`}
                      >
                        {/* User Identity */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white ${
                                isAdmin
                                  ? 'bg-[#0f172a]'
                                  : isRestricted
                                  ? 'bg-[#dc2626]'
                                  : 'bg-[#2563eb]'
                              }`}
                            >
                              {u.display_name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-[#171717] flex items-center gap-1.5">
                                <span>{u.display_name}</span>
                                {isAdmin && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#0f172a] text-white rounded font-bold">
                                    Admin
                                  </span>
                                )}
                              </span>
                              <span className="text-xs text-[#737373] font-mono">
                                @{u.username} &bull; {u.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="p-4">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg capitalize ${
                              isAdmin
                                ? 'bg-[#f1f5f9] text-[#0f172a] border border-[#cbd5e1]'
                                : 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        {/* Contribution Metrics */}
                        <td className="p-4">
                          <div className="flex items-center gap-3 text-xs text-[#525252]">
                            <span title="Problems Authored">
                              <strong className="text-[#171717]">
                                {u.stats?.problems_count || 0}
                              </strong>{' '}
                              problems
                            </span>
                            <span>&bull;</span>
                            <span title="Verified Solutions">
                              <strong className="text-[#15803d]">
                                {u.stats?.solutions_count || 0}
                              </strong>{' '}
                              solutions
                            </span>
                            <span>&bull;</span>
                            <span title="Confirmations Received">
                              <strong className="text-[#2563eb]">
                                {u.stats?.confirmations_count || 0}
                              </strong>{' '}
                              confirms
                            </span>
                          </div>
                        </td>

                        {/* Status & Reason */}
                        <td className="p-4">
                          {isRestricted ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]"></span>
                                Restricted
                              </span>
                              {u.restriction_reason && (
                                <p className="text-[11px] text-[#991b1b] max-w-xs leading-tight">
                                  {u.restriction_reason}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#dcfce7] text-[#15803d] border border-[#86efac]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]"></span>
                              Active &bull; Good Standing
                            </span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="p-4 text-right">
                          {isAdmin ? (
                            <span className="text-xs font-mono text-[#94a3b8] italic">
                              Protected Admin
                            </span>
                          ) : isRestricted ? (
                            <button
                              onClick={() => handleUnrestrict(u)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 bg-[#15803d] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Unrestrict Access
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedUser(u)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 bg-white hover:bg-[#fee2e2] border border-[#fca5a5] text-[#b91c1c] text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Restrict Access
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Restrict Reason Confirmation */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#e5e5e5] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#fee2e2] text-[#dc2626] flex items-center justify-center font-bold">
                    ⚠️
                  </div>
                  <h3 className="text-lg font-bold text-[#171717]">
                    Restrict Developer Account
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-[#a3a3a3] hover:text-[#171717] text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-[#525252]">
                  You are restricting <strong>{selectedUser.display_name}</strong> (@{selectedUser.username}).
                  This will revoke their publishing privileges and disable authenticated API/MCP mutations.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#737373]">
                  Select Violation Reason
                </label>
                <div className="space-y-1.5 text-xs">
                  {[
                    'Repeated synthetic or unverified solutions',
                    'Secret leak violation or API key exposure',
                    'Automated scraping / bot rate-limit abuse',
                    'Misleading debugging advice / spam',
                    'Community code-of-conduct violation',
                  ].map((reason) => (
                    <label
                      key={reason}
                      className="flex items-center gap-2 p-2 rounded-lg border border-[#e2e8f0] hover:bg-[#f8fafc] cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="presetReason"
                        checked={restrictReason === reason}
                        onChange={() => setRestrictReason(reason)}
                        className="text-[#dc2626]"
                      />
                      <span className="text-[#171717] font-medium">{reason}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#737373] mb-1">
                    Or Custom Administrative Note
                  </label>
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Optional specific detail regarding the restriction..."
                    className="w-full px-3.5 py-2 text-sm bg-white border border-[#cbd5e1] rounded-xl outline-none focus:border-[#dc2626]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#e5e5e5]">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#525252] hover:text-[#171717] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRestrict}
                  disabled={isProcessing}
                  className="px-4 py-2 text-xs font-semibold bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'Restricting...' : 'Confirm Account Restriction'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#18181b] text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-mono flex items-center gap-2">
            <span className="text-[#34d399]">✓</span>
            <span>{toastMsg}</span>
          </div>
        )}
      </div>
    </RoleGate>
  );
}
