'use client';

import { useState } from 'react';
import Link from 'next/link';
import RoleGate from '@/components/RoleGate';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  const stats = {
    searches: 8420,
    searchToClick: '68.4%',
    successfulResolutionRate: '82.1%',
    mcpRetrievals: 3190,
    agentDrafts: 142,
    avgInvestigationTimeSaved: '4.2 hrs'
  };

  const topSearches = [
    { query: 'Next.js Supabase 401 production', count: 482, resolution: '94%' },
    { query: 'Neon PostgreSQL connection pool exhaustion Prisma', count: 320, resolution: '89%' },
    { query: 'Claude Desktop MCP stdio Windows WSL2 hang', count: 210, resolution: '61%' },
    { query: 'Turbopack memory leak dynamic route generation', count: 184, resolution: '78%' },
    { query: 'Docker multi-stage build cache invalidation pnpm', count: 142, resolution: '91%' }
  ];

  return (
    <RoleGate allow={['admin']} title="Platform analytics">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#171717]">
              Platform Analytics &amp; Intelligence
            </h1>
            <p className="text-base text-[#525252] mt-1">
              Key product metric: Measuring problem-to-successful-resolution rate across developers and connected AI agents.
            </p>
          </div>
          <div className="flex gap-1.5 bg-[#f5f5f5] p-1.5 rounded-xl border border-[#e5e5e5] text-sm">
            {(['24h', '7d', '30d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  timeRange === range
                    ? 'bg-white shadow-xs text-[#171717]'
                    : 'text-[#737373] hover:text-[#171717]'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Resolution KPI Card */}
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-7 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs uppercase font-bold text-[#15803d] tracking-wider">
              North Star Product Metric (M20)
            </span>
            <span className="badge-tag verified text-xs">Target: &gt; 80%</span>
          </div>
          <div className="text-5xl font-extrabold text-[#15803d] tracking-tight">
            {stats.successfulResolutionRate}
          </div>
          <p className="text-sm text-[#166534] mt-2 leading-relaxed max-w-2xl">
            Percentage of developers and AI agents reporting that a retrieved Hunt investigation successfully solved their issue without repeat debugging loops.
          </p>
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#e5e5e5] p-6 rounded-2xl shadow-xs">
            <div className="text-3xl font-bold text-[#171717]">{stats.searches.toLocaleString()}</div>
            <div className="text-sm text-[#737373] mt-1 font-medium">Total Search Queries</div>
          </div>
          <div className="bg-white border border-[#e5e5e5] p-6 rounded-2xl shadow-xs">
            <div className="text-3xl font-bold text-[#171717]">{stats.searchToClick}</div>
            <div className="text-sm text-[#737373] mt-1 font-medium">Search &rarr; Problem Click Rate</div>
          </div>
          <div className="bg-white border border-[#e5e5e5] p-6 rounded-2xl shadow-xs">
            <div className="text-3xl font-bold text-[#2563eb]">{stats.mcpRetrievals.toLocaleString()}</div>
            <div className="text-sm text-[#737373] mt-1 font-medium">AI Agent Retrievals (MCP)</div>
          </div>
          <div className="bg-white border border-[#e5e5e5] p-6 rounded-2xl shadow-xs">
            <div className="text-3xl font-bold text-[#15803d]">{stats.avgInvestigationTimeSaved}</div>
            <div className="text-sm text-[#737373] mt-1 font-medium">Debugging Saved / Case</div>
          </div>
        </div>

        {/* Top Search Queries Table */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#e5e5e5] flex justify-between items-center text-sm">
            <span className="font-bold text-[#171717]">Top Technical Queries &amp; Resolution Success</span>
            <span className="text-xs font-mono text-[#737373]">Live indexing</span>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#e5e5e5] bg-white text-[#525252] text-xs uppercase font-semibold">
              <tr>
                <th className="p-4">Query String</th>
                <th className="p-4">Volume</th>
                <th className="p-4">Resolution Success</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5]">
              {topSearches.map(item => (
                <tr key={item.query} className="hover:bg-[#fafafa] transition-colors">
                  <td className="p-4 font-semibold text-[#171717]">{item.query}</td>
                  <td className="p-4 text-[#737373]">{item.count} queries</td>
                  <td className="p-4">
                    <span className="badge-tag verified text-xs font-semibold">{item.resolution} resolved</span>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/solutions?q=${encodeURIComponent(item.query)}`}
                      className="text-sm font-semibold text-[#2563eb] hover:underline"
                    >
                      View Solutions &rarr;
                    </Link>
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
