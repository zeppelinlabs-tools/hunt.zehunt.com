'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/components/RoleProvider';

export default function Navbar() {
  const pathname = usePathname();
  const { role, user, loading, logout } = useRole();

  const publicLinks = [
    { href: '/solutions', label: 'Solutions' },
    { href: '/topics', label: 'Topics' },
    { href: '/stacks', label: 'Tech Stacks' },
  ];

  const developerLinks = [
    { href: '/solutions', label: 'Solutions' },
    { href: '/topics', label: 'Topics' },
    { href: '/stacks', label: 'Tech Stacks' },
    { href: '/bookmarks', label: 'Bookmarks' },
    { href: '/agents', label: 'Agent MCP' },
    { href: '/notifications', label: 'Alerts' },
  ];

  const adminLinks = [
    { href: '/solutions', label: 'Solutions' },
    { href: '/topics', label: 'Topics' },
    { href: '/stacks', label: 'Tech Stacks' },
    { href: '/agents', label: 'Agent MCP' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/admin', label: 'Admin Console' },
  ];

  const links = role === 'guest' ? publicLinks : role === 'developer' ? developerLinks : adminLinks;

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 border-b border-[#e5e5e5] transition-colors">
      {/* Main Glass Navigation Bar */}
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center gap-6">
        {/* Brand logo mark */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-[#171717] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <path d="M11 8v6"></path>
              <path d="M8 11h6"></path>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-[#171717] leading-tight">Hunt</span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] -mt-0.5">Knowledge Net</span>
          </div>
        </Link>

        {/* Center Pill Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#f5f5f5]/70 border border-[#e5e5e5]/80 p-1 rounded-xl shadow-xs">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-[#171717] font-semibold shadow-xs border border-[#e5e5e5]'
                    : 'text-[#525252] hover:text-[#171717] hover:bg-white/50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          {loading ? (
            <span className="text-xs font-mono text-[#a3a3a3]">...</span>
          ) : role === 'guest' ? (
            <>
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-xs font-semibold text-[#171717] bg-white border border-[#e5e5e5] rounded-lg hover:bg-[#f5f5f5] transition-all shadow-xs"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg transition-all shadow-xs"
              >
                Create Account
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/problems/new"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg transition-all shadow-xs flex items-center gap-1.5"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Document Problem
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-2 border border-[#e5e5e5] p-1.5 pr-3 rounded-lg bg-white hover:border-[#d4d4d4] transition-all shadow-xs"
              >
                <div className="w-6 h-6 rounded-md bg-[#f5f5f5] text-[#171717] flex items-center justify-center font-bold text-[10px]">
                  {user?.display_name?.substring(0, 2).toUpperCase() || 'DV'}
                </div>
                <span className="font-semibold text-xs text-[#171717]">@{user?.username}</span>
              </Link>

              <button
                onClick={() => void logout()}
                className="text-xs text-[#b91c1c] hover:underline font-medium"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
