'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RoleGate from '@/components/RoleGate';
import { useRole } from '@/components/RoleProvider';

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

const DEFAULT_DEV_PROFILE: ProfileUser = {
  display_name: 'Adnan Sultan',
  username: 'madnan',
  github: 'https://github.com/zehunt',
  website: 'https://zehunt.com',
  bio: 'Staff Software Engineer. Building distributed AI systems, Next.js architecture, and database infrastructure.',
  skills: ['TypeScript', 'Next.js', 'PostgreSQL', 'Neon', 'Distributed Systems', 'MCP'],
  technologies: ['React 19', 'Prisma', 'Docker', 'Node 22', 'Tailwind CSS'],
  stats: {
    problems_count: 14,
    solutions_count: 29,
    confirmations_count: 118,
    helpful_votes: 342,
  },
  bookmarks: [
    { id: 4821, title: 'Supabase authentication fails after Vercel deployment', category: 'Authentication' },
    { id: 4819, title: 'Neon Postgres connection pool exhaustion during Next.js dev', category: 'Databases' },
  ],
};

function ProfileContent() {
  const { user: authUser } = useRole();
  const [profileUser, setProfileUser] = useState<ProfileUser>(DEFAULT_DEV_PROFILE);
  const [problems, setProblems] = useState<ProfileProblemItem[]>([]);
  const [activeTab, setActiveTab] = useState<'problems' | 'bookmarks'>('problems');

  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then(res => res.json())
      .then(d => {
        if (d.success && d.user) {
          setProfileUser(d.user);
        } else if (authUser) {
          setProfileUser(prev => ({
            ...prev,
            display_name: authUser.display_name,
            username: authUser.username,
          }));
        }
      })
      .catch(() => {});

    fetch('/api/v1/problems')
      .then(res => res.json())
      .then(d => {
        if (d.success && d.data) setProblems(d.data);
      })
      .catch(() => {});
  }, [authUser]);

  return (
    <div className="space-y-6">
      {/* Profile Header Box */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="flex gap-5 items-start">
            <div className="w-20 h-20 rounded-2xl bg-[#171717] text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
              {profileUser.display_name?.substring(0, 2) || 'MS'}
            </div>
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
                {profileUser.display_name}
              </h1>
              <div className="font-mono text-xs text-[#525252] flex items-center gap-2">
                <span>@{profileUser.username}</span>
                <span>&bull;</span>
                <a href={profileUser.github} target="_blank" rel="noreferrer" className="text-[#2563eb] hover:underline font-semibold">
                  GitHub
                </a>
                <span>&bull;</span>
                <a href={profileUser.website} target="_blank" rel="noreferrer" className="text-[#2563eb] hover:underline font-semibold">
                  Website
                </a>
              </div>
              <p className="text-sm text-[#525252] max-w-xl leading-relaxed">{profileUser.bio}</p>
              <div className="flex gap-2 flex-wrap pt-2">
                {profileUser.skills?.map((s: string) => (
                  <span key={s} className="badge-tag accent text-xs">{s}</span>
                ))}
                {profileUser.technologies?.map((t: string) => (
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
            <div className="text-2xl sm:text-3xl font-extrabold text-[#171717]">{profileUser.stats?.problems_count || 14}</div>
            <div className="text-xs text-[#737373] mt-1 font-medium">Documented Problems</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#171717]">{profileUser.stats?.solutions_count || 29}</div>
            <div className="text-xs text-[#737373] mt-1 font-medium">Solutions Submitted</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#15803d]">{profileUser.stats?.confirmations_count || 118}</div>
            <div className="text-xs text-[#737373] mt-1 font-medium">Verified Confirmations</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#2563eb]">{profileUser.stats?.helpful_votes || 342}</div>
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
          My Documented Cases ({problems.length || 3})
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
            activeTab === 'bookmarks'
              ? 'bg-[#171717] text-white shadow-xs'
              : 'bg-white border border-[#e5e5e5] text-[#525252] hover:text-[#171717]'
          }`}
        >
          Saved Bookmarks ({profileUser.bookmarks?.length || 2})
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-3.5">
        {activeTab === 'bookmarks' ? (
          (profileUser.bookmarks || []).map((b) => (
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
  );
}

export default function ProfilePage() {
  return (
    <RoleGate allow={['developer', 'admin']} title="Developer profile">
      <ProfileContent />
    </RoleGate>
  );
}
