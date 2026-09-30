'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/solutions?q=${encodeURIComponent(search.trim())}`);
    } else {
      router.push('/solutions');
    }
  };

  const trendingTags = [
    'Next.js 15',
    'Supabase Auth',
    'PostgreSQL Neon',
    'Docker WSL2',
    'Prisma Pool',
    'Claude MCP',
  ];

  return (
    <div className="w-full min-h-screen bg-[#fafafa] text-[#171717]">
      {/* Product Header with Real Brand Logo */}
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/horizantal-logo.jpg"
            alt="Hunt by Zehunt"
            className="h-9 w-auto max-w-[170px] object-contain rounded-md"
          />
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/signin"
            className="text-xs font-semibold text-[#525252] hover:text-[#171717] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/solutions"
            className="px-4 py-2 text-xs font-semibold text-white bg-[#171717] hover:bg-[#262626] rounded-lg shadow-xs transition-all flex items-center gap-1.5"
          >
            <span>Launch Platform</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </header>

      {/* Main Landing Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-16">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-6 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#e5e5e5] bg-white shadow-xs text-xs font-mono text-[#525252]">
            <span className="w-2 h-2 rounded-full bg-[#2563eb]"></span>
            <span>MCP Protocol Ready for Claude Desktop, Cursor &amp; Kiro</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#171717] leading-[1.15]">
            The problem-solving memory layer for developers and AI agents.
          </h1>

          <p className="text-base sm:text-lg text-[#525252] max-w-2xl mx-auto leading-relaxed">
            Hunt captures the complete investigation cycle: environment context, dead ends, root causes, and reproducible verified solutions.
          </p>

          {/* Big Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mt-6">
            <div className="relative flex items-center bg-white border border-[#d4d4d4] rounded-2xl p-2 shadow-sm focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#2563eb]/20 transition-all">
              <div className="pl-3 text-[#737373]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search error messages, stack trace, or failure symptoms..."
                className="w-full px-3 py-2 text-sm sm:text-base text-[#171717] outline-none bg-transparent placeholder:text-[#a3a3a3]"
              />
              <button
                type="submit"
                className="bg-[#171717] text-white hover:bg-[#262626] font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                Hunt Solution
              </button>
            </div>
          </form>

          {/* Trending Chips */}
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-[#737373] pt-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#a3a3a3]">Trending issues:</span>
            {trendingTags.map((tag) => (
              <Link
                key={tag}
                href={`/solutions?q=${encodeURIComponent(tag)}`}
                className="px-2.5 py-1 bg-white border border-[#e5e5e5] rounded-md hover:border-[#2563eb] hover:text-[#2563eb] transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </section>

        {/* Feature Loop Section (Why Hunt is different) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-white border border-[#e5e5e5] p-6 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="text-lg font-bold text-[#171717]">Failed Attempts Preserved</h3>
            <p className="text-xs sm:text-sm text-[#525252] leading-relaxed">
              Most forums only show the final fix. Hunt explicitly preserves discarded dead-ends, keeping developers and AI agents from repeating wasted hours.
            </p>
          </div>

          <div className="bg-white border border-[#e5e5e5] p-6 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] text-[#15803d] flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="text-lg font-bold text-[#171717]">Verification Provenance</h3>
            <p className="text-xs sm:text-sm text-[#525252] leading-relaxed">
              Every solution records exact runtime environments, author verification, and community confirmations from developers on specific framework versions.
            </p>
          </div>

          <div className="bg-white border border-[#e5e5e5] p-6 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#faf5ff] text-[#9333ea] flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="text-lg font-bold text-[#171717]">Native Agent MCP Integration</h3>
            <p className="text-xs sm:text-sm text-[#525252] leading-relaxed">
              Expose validated solutions directly to Cursor, Claude Desktop, and Kiro via HTTP MCP protocol with token-scoped access and human review controls.
            </p>
          </div>
        </section>

        {/* Protocol Quick Connect Banner */}
        <section className="bg-[#171717] text-white rounded-2xl p-8 max-w-6xl mx-auto shadow-md">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-mono uppercase tracking-widest text-[#60a5fa]">Universal Agent Interface</span>
              <h2 className="text-2xl font-bold tracking-tight">Connect your AI coding agent via Model Context Protocol</h2>
              <p className="text-xs sm:text-sm text-[#a3a3a3] leading-relaxed">
                Use standard HTTP endpoint with platform-specific header <code className="text-[#34d399] font-mono">X-Hunt-API-Key</code> to retrieve tested fixes directly into your editor context.
              </p>
            </div>
            <div className="bg-[#262626] border border-[#404040] rounded-xl p-4 font-mono text-xs space-y-2 w-full lg:w-auto">
              <div className="text-[#a3a3a3] text-[11px]">// claude_desktop_config.json</div>
              <div className="text-[#38bdf8]">&quot;hunt&quot;: &#123;</div>
              <div className="pl-4 text-[#e5e5e5]">&quot;endpoint&quot;: <span className="text-[#f472b6]">&quot;http://hunt.zehunt.com/mcp&quot;</span>,</div>
              <div className="pl-4 text-[#e5e5e5]">&quot;headers&quot;: &#123; <span className="text-[#a3a3a3]">&quot;X-Hunt-API-Key&quot;: &quot;hunt_sk_...&quot;</span> &#125;</div>
              <div className="text-[#38bdf8]">&#125;</div>
            </div>
          </div>
        </section>

        {/* Live Problem Preview Section */}
        <section className="bg-white border border-[#e5e5e5] rounded-2xl p-8 max-w-6xl mx-auto shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#15803d] font-semibold">Live Investigation Preview</span>
              <h3 className="text-xl font-bold text-[#171717]">Problem #4821: Supabase auth fails after Vercel deployment</h3>
            </div>
            <Link href="/problems/4821" className="text-xs font-semibold text-[#2563eb] hover:underline">
              Inspect Full Problem &rarr;
            </Link>
          </div>
          <div className="bg-[#f5f5f5] p-3.5 rounded-lg font-mono text-xs text-[#525252]">
            Observed: 401 Unauthorized during server action cookie mutation
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-[#fffaf5] border border-[#fed7aa] rounded-xl">
              <strong className="text-[#9a3412] block mb-1">Failed Attempts Avoided:</strong>
              <p className="text-[#525252] leading-relaxed">Rotated JWT secret keys (no effect, cookie issue). Downgraded Node runtime.</p>
            </div>
            <div className="p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl">
              <strong className="text-[#15803d] block mb-1">Verified Fix:</strong>
              <p className="text-[#525252] leading-relaxed">Wrap server client creation with explicit cookie store handlers.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e5e5e5] bg-white mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#737373]">
          <div className="flex items-center gap-3">
            <img src="/hunt-icon.jpg" alt="Hunt" className="w-5 h-5 rounded object-cover" />
            <span className="font-bold text-[#171717]">Hunt</span>
            <span>&bull;</span>
            <span>An AI-native developer knowledge network by <strong>Zehunt</strong></span>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/solutions" className="hover:text-[#171717]">Solutions</Link>
            <Link href="/topics" className="hover:text-[#171717]">Topics</Link>
            <Link href="/stacks" className="hover:text-[#171717]">Stacks</Link>
            <Link href="/agents" className="hover:text-[#171717]">MCP Protocol</Link>
            <Link href="/auth/signin" className="hover:text-[#171717]">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
