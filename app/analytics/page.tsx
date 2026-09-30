'use client';

import { useState } from 'react';
import RoleGate from '@/components/RoleGate';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const stats = {
    searches: 42390,
    searchToClick: '68.4%',
    successfulResolutionRate: '84.2%',
    activeAgents: 142,
    avgInvestigationTimeSaved: '47 mins',
  };

  const topSearches = [
    { query: 'supabase auth vercel 401', count: 1240, solved: true },
    { query: 'neon connection pool timeout nextjs', count: 980, solved: true },
    { query: 'docker wsl2 clock drift container', count: 650, solved: true },
    { query: 'prisma p1001 database unreachable edge', count: 520, solved: true },
    { query: 'claude mcp transport closed unexpectedly', count: 410, solved: true },
  ];

  return (
    <RoleGate allow={['admin']} title="Platform analytics">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#171717]">
              Platform Analytics &amp; Search Intelligence
            </h1>
            <p className="text-base text-[#525252] mt-1">
              Search resolution rates, repeated failure domains, and agent query throughput.
            </p>
          </div>

          <div className="flex gap-1 bg-[#e5e5e5]/60 p-1 rounded-xl text-xs font-semibold">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-white text-[#171717] shadow-xs'
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
              North Star Product Metric
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
            <div className="text-3xl font-bold text-[#2563eb]">{stats.activeAgents}</div>
            <div className="text-sm text-[#737373] mt-1 font-medium">Active MCP Agents</div>
          </div>
          <div className="bg-white border border-[#e5e5e5] p-6 rounded-2xl shadow-xs">
            <div className="text-3xl font-bold text-[#15803d]">{stats.avgInvestigationTimeSaved}</div>
            <div className="text-sm text-[#737373] mt-1 font-medium">Avg Debugging Saved / Dev</div>
          </div>
        </div>

        {/* Top Failure Queries */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-xs">
          <h2 className="text-lg font-bold text-[#171717] mb-4">
            Top Searched Error Queries ({timeRange})
          </h2>
          <div className="divide-y divide-[#e5e5e5]">
            {topSearches.map((item, idx) => (
              <div key={idx} className="py-3.5 flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#a3a3a3] w-4">{idx + 1}</span>
                  <span className="font-mono text-xs font-semibold text-[#171717]">{item.query}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#737373]">{item.count} searches</span>
                  <span className="badge-tag verified text-xs">✓ Verified Fix Ready</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RoleGate>
  );
}
