'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface TopicProblemItem {
  id: number;
  title: string;
  status: string;
  root_cause: string;
  helpful_votes: number;
  tags: string[];
  author?: { username?: string };
  verification?: { confirmation_count?: number };
  created_at: string;
}

export default function TopicDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'Next.js';
  const topicName = decodeURIComponent(slug);

  const [problems, setProblems] = useState<TopicProblemItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unsolved' | 'trending' | 'recent'>('all');

  useEffect(() => {
    fetch('/api/problems')
      .then(res => res.json())
      .then(d => {
        if (d.success && d.data) {
          const matched = d.data.filter((p: TopicProblemItem) =>
            p.tags?.some((t: string) => t.toLowerCase() === topicName.toLowerCase())
          );
          setProblems(matched.length > 0 ? matched : d.data);
        }
      })
      .catch(console.error);
  }, [topicName]);

  const filtered = problems.filter(p => {
    if (activeFilter === 'unsolved') return p.status !== 'Verified';
    if (activeFilter === 'trending') return (p.helpful_votes || 0) > 10;
    return true;
  });

  return (
    <div>
      <div className="bg-white border border-[#e5e5e5] rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-[#737373]">Topic</span>
              <span className="text-xs text-[#737373]">/</span>
              <span className="badge-tag accent">{topicName}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#171717]">{topicName} Knowledge Hub</h1>
            <p className="text-xs text-[#525252] mt-1 max-w-2xl">
              Curated investigations, recurring deployment issues, and author-verified fixes for {topicName}.
            </p>
          </div>
          <Link href="/problems/new" className="btn-primary text-xs">
            + Document {topicName} Problem
          </Link>
        </div>

        <div className="flex gap-2 mt-5 border-t border-[#e5e5e5] pt-3 text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          >
            All Problems ({problems.length})
          </button>
          <button
            onClick={() => setActiveFilter('trending')}
            className={`filter-btn ${activeFilter === 'trending' ? 'active' : ''}`}
          >
            Trending & Highly Voted
          </button>
          <button
            onClick={() => setActiveFilter('unsolved')}
            className={`filter-btn ${activeFilter === 'unsolved' ? 'active' : ''}`}
          >
            Needs Verification / Unsolved
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(p => (
          <Link
            key={p.id}
            href={`/problems/${p.id}`}
            className="bg-white border border-[#e5e5e5] rounded-lg p-5 block hover:border-[#d4d4d4] hover:shadow-sm transition-all"
          >
            <div className="flex justify-between items-center gap-3 mb-2">
              <h3 className="text-base font-semibold text-[#171717]">{p.title}</h3>
              <span className={`badge-tag ${p.status === 'Verified' ? 'verified' : 'danger'}`}>
                {p.status === 'Verified' ? `✓ Verified (${p.verification?.confirmation_count || 0})` : p.status}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap mb-2 text-xs text-[#737373]">
              {p.tags?.map((t: string) => <span key={t} className="badge-tag">{t}</span>)}
              <span>• Documented by @{p.author?.username} • {p.created_at}</span>
            </div>

            <p className="text-xs text-[#525252] line-clamp-2">{p.root_cause}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
