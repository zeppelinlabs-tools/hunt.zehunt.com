'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface SolutionItem {
  id: number;
  title: string;
  status: string;
  root_cause: string;
  symptoms: string[];
  tags: string[];
  attempts: unknown[];
  solutions: unknown[];
  helpful_votes: number;
  created_at: string;
  author?: { username?: string };
  verification?: { confirmation_count?: number };
}

function SolutionsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [problems, setProblems] = useState<SolutionItem[]>([]);
  const [currentTagFilter, setCurrentTagFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);

  useEffect(() => {
    fetch('/api/v1/problems')
      .then((res) => res.json())
      .then((d) => {
        if (d.success && d.data) setProblems(d.data);
      })
      .catch(console.error);
  }, []);

  const filtered = problems.filter((p) => {
    const matchesTag = currentTagFilter === 'all' || p.tags?.includes(currentTagFilter);
    const matchesQuery =
      !searchQuery ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.root_cause?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.symptoms?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTag && matchesQuery;
  });

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-7 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#171717]">
              Verified Engineering Solutions
            </h1>
            <p className="text-base text-[#525252] mt-1">
              Reproducible problem investigations with confirmed fixes, root causes, and failed attempts preserved.
            </p>
          </div>
          <Link
            href="/problems/new"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl transition-colors shadow-xs shrink-0 flex items-center gap-2"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Document Problem
          </Link>
        </div>

        <div className="flex items-center gap-3.5 bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl px-4 h-13 focus-within:bg-white focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#2563eb]/20 transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search by error code, runtime environment (e.g. Next.js 15, Neon, Supabase), or symptoms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-base text-[#171717] placeholder:text-[#a3a3a3]"
          />
          <span className="badge-tag mono text-xs">⌘K</span>
        </div>

        <div className="flex items-center gap-2.5 mt-5 flex-wrap">
          <span className="text-xs uppercase font-bold tracking-wider text-[#737373] mr-1">
            Filter by framework:
          </span>
          {['all', 'Next.js', 'Neon', 'Supabase', 'MCP', 'Docker', 'Prisma'].map((tag) => (
            <button
              key={tag}
              onClick={() => setCurrentTagFilter(tag)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                currentTagFilter === tag
                  ? 'bg-[#171717] text-white font-semibold shadow-xs'
                  : 'bg-white border border-[#e5e5e5] text-[#525252] hover:text-[#171717] hover:border-[#d4d4d4]'
              }`}
            >
              {tag === 'all' ? 'All Frameworks' : tag}
            </button>
          ))}
        </div>
      </div>

      {/* Solutions Feed Header */}
      <div className="flex justify-between items-center px-1">
        <h2 className="text-base font-bold text-[#171717]">
          Showing {filtered.length} verified problems
        </h2>
        <div className="text-sm text-[#737373]">
          Sorted by: <strong className="text-[#171717]">Community Verified First</strong>
        </div>
      </div>

      {/* Problems Feed Cards */}
      <div className="flex flex-col gap-4">
        {filtered.map((p) => (
          <Link
            key={p.id}
            href={`/problems/${p.id}`}
            className="bg-white border border-[#e5e5e5] rounded-2xl p-6 block hover:border-[#2563eb]/50 hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start gap-4 mb-2.5">
              <h3 className="text-xl font-bold text-[#171717] group-hover:text-[#2563eb] transition-colors leading-snug">
                {p.title}
              </h3>
              <span className={`badge-tag shrink-0 text-xs font-semibold py-1 px-3 ${p.status === 'Verified' ? 'verified' : 'danger'}`}>
                {p.status === 'Verified' ? `✓ Verified (${p.verification?.confirmation_count || 0} Confirmations)` : p.status}
              </span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap mb-3.5 text-sm text-[#737373]">
              {p.tags?.map((t: string, i: number) => (
                <span key={t} className={`badge-tag text-xs ${i === 0 ? 'accent font-semibold' : ''}`}>{t}</span>
              ))}
              <span>&bull;</span>
              <span>Documented by <strong className="text-[#171717]">@{p.author?.username}</strong></span>
              <span>&bull;</span>
              <span>{p.created_at}</span>
            </div>

            <div className="bg-[#f8fafc] border-l-3 border-[#2563eb] font-mono text-sm px-4 py-2.5 rounded-r-lg text-[#334155] mb-4 leading-relaxed">
              {p.symptoms?.map((s: string) => `"${s}"`).join(' ')}
            </div>

            <div className="flex justify-between items-center text-sm text-[#737373] border-t border-[#f5f5f5] pt-3.5">
              <div className="flex gap-5 text-sm">
                <span><strong className="text-[#b91c1c]">{p.attempts?.length || 0}</strong> Failed attempts</span>
                <span><strong className="text-[#15803d]">{p.solutions?.length || 0}</strong> Verified solutions</span>
                <span><strong className="text-[#171717]">{p.helpful_votes || 0}</strong> Helpful votes</span>
              </div>
              <div className="font-mono text-xs text-[#2563eb] font-semibold group-hover:underline flex items-center gap-1">
                <span>Inspect Investigation</span>
                <span>&rarr;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function SolutionsPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-[#737373]">Loading solutions...</div>}>
      <SolutionsContent />
    </Suspense>
  );
}
