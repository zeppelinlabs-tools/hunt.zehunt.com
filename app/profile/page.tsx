'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RoleGate from '@/components/RoleGate';

interface ProfileUser {
  display_name?: string;
  username?: string;
  github?: string;
  website?: string;
  bio?: string;
  skills?: string[];
  technologies?: string[];
  stats?: {
    problems_count?: number;
    solutions_count?: number;
    confirmations_count?: number;
    helpful_votes?: number;
  };
  bookmarks?: { id: number; title: string; category: string }[];
}

interface ProfileProblemItem {
  id: number;
  title: string;
  created_at: string;
  verification?: { confirmation_count?: number };
}

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [problems, setProblems] = useState<ProfileProblemItem[]>([]);
  const [activeTab, setActiveTab] = useState<'problems' | 'bookmarks'>('problems');

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(d => {
        if (d.success) setUser(d.user);
      })
      .catch(console.error);

    fetch('/api/problems')
      .then(res => res.json())
      .then(d => {
        if (d.success) setProblems(d.data);
      })
      .catch(console.error);
  }, []);

  if (!user) {
    return <div className="py-16 text-center text-sm text-[#737373]">Loading developer profile...</div>;
  }

  return (
    <RoleGate allow={['developer', 'admin']} title="Developer profile">
      <div className="space-y-6">
        {/* Profile Header Box */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            <div className="flex gap-5 items-start">
              <div className="w-20 h-20 rounded-2xl bg-[#171717] text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
                {user.display_name?.substring(0, 2) || 'MS'}
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
                  {user.display_name}
                </h1>
                <div className="font-mono text-xs text-[#525252] flex items-center gap-2">
                  <span>@{user.username}</span>
                  <span>&bull;</span>
                  <a href={user.github} target="_blank" rel="noreferrer" className="text-[#2563eb] hover:underline font-semibold">GitHub</a>
                  <span>&bull;</span>
                  <a href={user.website} target="_blank" rel="noreferrer" className="text-[#2563eb] hover:underline font-semibold">Website</a>
                </div>
                <p className="text-sm text-[#525252] max-w-xl leading-relaxed">{user.bio}</p>
                <div className="flex gap-2 flex-wrap pt-2">
                  {user.skills?.map((s: string) => (
                    <span key={s} className="badge-tag accent text-xs">{s}</span>
                  ))}
                  {user.technologies?.map((t: string) => (
                    <span key={t} className="badge-tag text-xs">{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/settings/sessions"
              className="px-4 py-2 bg-white border border-[#e5e5e5] rounded-xl text-xs font-semibold text-[#171717] hover:bg-[#f5f5f5] transition-colors shrink-0 shadow-xs"
            >
              Security &amp; Sessions &rarr;
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-[#e5e5e5] mt-8 pt-6">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#171717]">{user.stats?.problems_count || 0}</div>
              <div className="text-xs text-[#737373] mt-1 font-medium">Documented Problems</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#171717]">{user.stats?.solutions_count || 0}</div>
              <div className="text-xs text-[#737373] mt-1 font-medium">Solutions Submitted</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#15803d]">{user.stats?.confirmations_count || 0}</div>
              <div className="text-xs text-[#737373] mt-1 font-medium">Verified Confirmations</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#2563eb]">{user.stats?.helpful_votes || 0}</div>
              <div className="text-xs text-[#737373] mt-1 font-medium">Helpful Feedback</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('problems')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
              activeTab === 'problems'
                ? 'bg-[#171717] text-white shadow-xs'
                : 'bg-white border border-[#e5e5e5] text-[#525252] hover:text-[#171717]'
            }`}
          >
            My Documented Cases ({problems.length})
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
              activeTab === 'bookmarks'
                ? 'bg-[#171717] text-white shadow-xs'
                : 'bg-white border border-[#e5e5e5] text-[#525252] hover:text-[#171717]'
            }`}
          >
            Saved Bookmarks ({user.bookmarks?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-3.5">
          {activeTab === 'bookmarks' ? (
            user.bookmarks?.map((b: { id: number; title: string; category: string }) => (
              <Link
                key={b.id}
                href={`/problems/${b.id}`}
                className="bg-white border border-[#e5e5e5] p-5 rounded-2xl block hover:border-[#2563eb]/50 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-center gap-2">
                  <h3 className="font-bold text-base text-[#171717] group-hover:text-[#2563eb] transition-colors">{b.title}</h3>
                  <span className="badge-tag accent text-xs">{b.category}</span>
                </div>
              </Link>
            ))
          ) : (
            problems.map((p) => (
              <Link
                key={p.id}
                href={`/problems/${p.id}`}
                className="bg-white border border-[#e5e5e5] p-5 rounded-2xl block hover:border-[#2563eb]/50 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-center gap-2">
                  <h3 className="font-bold text-base text-[#171717] group-hover:text-[#2563eb] transition-colors">{p.title}</h3>
                  <span className="badge-tag verified text-xs">
                    ✓ {p.verification?.confirmation_count || 0} Confirmations
                  </span>
                </div>
                <div className="text-xs text-[#737373] mt-1 font-mono">Published {p.created_at}</div>
              </Link>
            ))
          )}
        </div>
      </div>
    </RoleGate>
  );
}
