'use client';

import { useState } from 'react';
import Link from 'next/link';
import RoleGate from '@/components/RoleGate';

export default function AdminPage() {
  const metrics = {
    totalUsers: 1420,
    totalProblems: 4281,
    verifiedSolutions: 3890,
    mcpQueriesToday: 914,
    secretBlocks: 27
  };

  const [flaggedItems, setFlaggedItems] = useState([
    {
      id: 101,
      type: 'Potential Secret',
      target: 'Problem #4902 - JWT Token in headers trace',
      reporter: 'SecretScanner (Automated)',
      status: 'Under Review'
    },
    {
      id: 102,
      type: 'Outdated Version',
      target: 'Solution #219 - Next.js 13 pages directory fix',
      reporter: '@alex_dev',
      status: 'Flagged'
    }
  ]);

  return (
    <RoleGate allow={['admin']} title="Admin console">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#171717]">
              Administration &amp; Platform Governance
            </h1>
            <p className="text-base text-[#525252] mt-1">
              System health, secret moderation pipeline, user accounts, and MCP gateway metrics.
            </p>
          </div>
          <Link
            href="/admin/users"
            className="px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Developer Governance &amp; Restrictions</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link
            href="/admin/users"
            className="bg-white hover:bg-[#f8fafc] border border-[#e5e5e5] hover:border-[#cbd5e1] p-5 rounded-2xl shadow-xs transition-all block group"
          >
            <div className="flex justify-between items-start">
              <div className="text-3xl font-bold text-[#171717]">{metrics.totalUsers}</div>
              <span className="text-xs text-[#2563eb] group-hover:translate-x-0.5 transition-transform font-mono">Manage &rarr;</span>
            </div>
            <div className="text-sm text-[#737373] mt-1 font-medium">Registered Developers</div>
          </Link>
          <div className="bg-white border border-[#e5e5e5] p-5 rounded-2xl shadow-xs">
            <div className="text-3xl font-bold text-[#171717]">{metrics.totalProblems}</div>
            <div className="text-sm text-[#737373] mt-1 font-medium">Problems Logged</div>
          </div>
          <div className="bg-white border border-[#e5e5e5] p-5 rounded-2xl shadow-xs">
            <div className="text-3xl font-bold text-[#15803d]">{metrics.verifiedSolutions}</div>
            <div className="text-sm text-[#737373] mt-1 font-medium">Verified Solutions</div>
          </div>
          <div className="bg-white border border-[#e5e5e5] p-5 rounded-2xl shadow-xs">
            <div className="text-3xl font-bold text-[#2563eb]">{metrics.mcpQueriesToday}</div>
            <div className="text-sm text-[#737373] mt-1 font-medium">MCP Queries (24h)</div>
          </div>
          <div className="bg-white border border-[#e5e5e5] p-5 rounded-2xl shadow-xs">
            <div className="text-3xl font-bold text-[#b91c1c]">{metrics.secretBlocks}</div>
            <div className="text-sm text-[#737373] mt-1 font-medium">Secret Leaks Prevented</div>
          </div>
        </div>

        {/* Moderation Queue */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#e5e5e5] flex justify-between items-center text-sm">
            <span className="font-bold text-[#171717]">Moderation &amp; Content Review Queue</span>
            <span className="badge-tag mono text-xs">Queue: {flaggedItems.length} items pending</span>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#e5e5e5] text-[#525252] bg-white text-xs uppercase font-semibold">
              <tr>
                <th className="p-4">Category</th>
                <th className="p-4">Content Item</th>
                <th className="p-4">Flagged By</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5]">
              {flaggedItems.map(item => (
                <tr key={item.id} className="hover:bg-[#fafafa] transition-colors">
                  <td className="p-4 font-semibold text-[#b91c1c]">{item.type}</td>
                  <td className="p-4 text-[#171717] font-medium">{item.target}</td>
                  <td className="p-4 text-[#737373]">{item.reporter}</td>
                  <td className="p-4">
                    <span className="badge-tag warning text-xs font-semibold">{item.status}</span>
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <button
                      onClick={() => setFlaggedItems(flaggedItems.filter(f => f.id !== item.id))}
                      className="text-[#15803d] hover:underline font-semibold text-sm cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setFlaggedItems(flaggedItems.filter(f => f.id !== item.id))}
                      className="text-[#b91c1c] hover:underline font-semibold text-sm cursor-pointer"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RoleGate>
  );
}
