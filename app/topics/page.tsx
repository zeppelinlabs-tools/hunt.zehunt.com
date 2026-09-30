'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TopicStat {
  name: string;
  category: string;
  problemCount: number;
  verifiedCount: number;
  description: string;
}

export default function TopicsIndexPage() {
  const topics: TopicStat[] = [
    {
      name: 'Next.js',
      category: 'Framework',
      problemCount: 42,
      verifiedCount: 38,
      description: 'App Router, Server Actions, Middleware, caching, and Turbopack issues.'
    },
    {
      name: 'Supabase',
      category: 'Backend & Auth',
      problemCount: 29,
      verifiedCount: 26,
      description: 'SSR authentication, session cookie propagation, RLS policies, and database webhooks.'
    },
    {
      name: 'Neon',
      category: 'Database',
      problemCount: 18,
      verifiedCount: 16,
      description: 'Serverless PostgreSQL, connection pooling, branch workflows, and cold start handling.'
    },
    {
      name: 'Vercel',
      category: 'Deployment',
      problemCount: 31,
      verifiedCount: 28,
      description: 'Edge functions, build timeouts, environment propagation, and preview deployment edge cases.'
    },
    {
      name: 'MCP',
      category: 'AI & Agents',
      problemCount: 15,
      verifiedCount: 11,
      description: 'Model Context Protocol, stdio/SSE transports, agent authorization, and tool scoping.'
    },
    {
      name: 'Prisma',
      category: 'ORM',
      problemCount: 24,
      verifiedCount: 21,
      description: 'Connection limits on hot-reloading, schema migrations, and edge client generation.'
    },
    {
      name: 'Docker',
      category: 'DevOps & Containers',
      problemCount: 35,
      verifiedCount: 30,
      description: 'Multi-stage builds, rootless container security, WSL2 networking, and volume caching.'
    },
    {
      name: 'Authentication',
      category: 'Security',
      problemCount: 48,
      verifiedCount: 44,
      description: 'OAuth callbacks, JWT revocation, session timeouts, and cross-site cookie policies.'
    }
  ];

  const [search, setSearch] = useState('');

  const filtered = topics.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-[#171717]">Taxonomy & Technical Topics</h1>
        <p className="text-xs text-[#525252] mt-1">
          Explore recurring engineering failure patterns grouped by framework, runtime, database, and deployment environment.
        </p>

        <div className="mt-4 max-w-md">
          <input
            type="text"
            placeholder="Search topics (e.g. Next.js, Postgres, Docker)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(t => (
          <Link
            key={t.name}
            href={`/topics/${encodeURIComponent(t.name)}`}
            className="bg-white border border-[#e5e5e5] rounded-xl p-5 hover:border-[#d4d4d4] hover:shadow-sm transition-all block group"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-base text-[#171717] group-hover:text-[#2563eb] transition-colors">
                {t.name}
              </h3>
              <span className="badge-tag accent text-[10px]">{t.category}</span>
            </div>

            <p className="text-xs text-[#525252] mb-4 leading-relaxed line-clamp-2">
              {t.description}
            </p>

            <div className="flex items-center justify-between text-xs text-[#737373] border-t border-[#f5f5f5] pt-3">
              <span><strong>{t.problemCount}</strong> problems logged</span>
              <span className="text-[#15803d] font-semibold">✓ {t.verifiedCount} verified</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
