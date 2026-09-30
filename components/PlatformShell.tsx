'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useRole } from '@/components/RoleProvider';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function PlatformShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { role, user, logout } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminViewMode, setAdminViewMode] = useState<'admin' | 'developer'>('admin');

  // Route-based workspace mode synchronization
  useEffect(() => {
    if (role === 'admin') {
      if (pathname.startsWith('/admin') || pathname.startsWith('/analytics')) {
        setAdminViewMode('admin');
      } else if (
        pathname.startsWith('/solutions') ||
        pathname.startsWith('/problems') ||
        pathname.startsWith('/topics') ||
        pathname.startsWith('/stacks') ||
        pathname.startsWith('/bookmarks')
      ) {
        setAdminViewMode('developer');
      }
    }
  }, [pathname, role]);

  const switchToDeveloperMode = () => {
    setAdminViewMode('developer');
    setMobileMenuOpen(false);
    if (pathname.startsWith('/admin') || pathname.startsWith('/analytics')) {
      router.push('/solutions');
    }
  };

  const switchToAdminMode = () => {
    setAdminViewMode('admin');
    setMobileMenuOpen(false);
    router.push('/admin');
  };

  // If on landing page or auth pages, do not render platform shell sidebar
  const isLandingPage = pathname === '/';
  const isAuthPage = pathname.startsWith('/auth');

  if (isLandingPage || isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa] text-[#171717]">
        {children}
      </div>
    );
  }

  // Pure Admin Navigation (No duplicate developer options)
  const adminNavSections: NavSection[] = [
    {
      title: 'Platform Governance',
      items: [
        {
          href: '/admin',
          label: 'Platform Overview & Moderation',
          icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          ),
        },
        {
          href: '/analytics',
          label: 'Platform Analytics & KPIs',
          icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          ),
        },
        {
          href: '/agents',
          label: 'Agent Audits & MCP Tokens',
          icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2"></rect>
              <rect x="9" y="9" width="6" height="6"></rect>
              <line x1="9" y1="1" x2="9" y2="4"></line>
              <line x1="15" y1="1" x2="15" y2="4"></line>
              <line x1="9" y1="20" x2="9" y2="23"></line>
              <line x1="15" y1="20" x2="15" y2="23"></line>
              <line x1="20" y1="9" x2="23" y2="9"></line>
              <line x1="20" y1="14" x2="23" y2="14"></line>
              <line x1="1" y1="9" x2="4" y2="9"></line>
              <line x1="1" y1="14" x2="4" y2="14"></line>
            </svg>
          ),
        },
        {
          href: '/settings/sessions',
          label: 'Security & Active Sessions',
          icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          ),
        },
      ],
    },
  ];

  // Pure Developer Navigation
  const developerNavSections: NavSection[] = [
    {
      title: 'Knowledge Core',
      items: [
        {
          href: '/solutions',
          label: 'Verified Solutions',
          icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          ),
        },
        {
          href: '/topics',
          label: 'Topics & Taxonomy',
          icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          ),
        },
        {
          href: '/stacks',
          label: 'Tech Stacks',
          icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Personal Workspace',
      items: [
        {
          href: '/bookmarks',
          label: 'My Bookmarks',
          icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          ),
        },
        {
          href: '/profile',
          label: 'Developer Profile',
          icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          ),
        },
        {
          href: '/notifications',
          label: 'Alerts & Activity',
          icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          ),
        },
      ],
    },
    {
      title: 'AI & Integrations',
      items: [
        {
          href: '/agents',
          label: 'MCP Agent Gateway',
          icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2"></rect>
              <rect x="9" y="9" width="6" height="6"></rect>
              <line x1="9" y1="1" x2="9" y2="4"></line>
              <line x1="15" y1="1" x2="15" y2="4"></line>
              <line x1="9" y1="20" x2="9" y2="23"></line>
              <line x1="15" y1="20" x2="15" y2="23"></line>
              <line x1="20" y1="9" x2="23" y2="9"></line>
              <line x1="20" y1="14" x2="23" y2="14"></line>
              <line x1="1" y1="9" x2="4" y2="9"></line>
              <line x1="1" y1="14" x2="4" y2="14"></line>
            </svg>
          ),
        },
      ],
    },
  ];

  const isInAdminMode = role === 'admin' && adminViewMode === 'admin';
  const activeNavSections = isInAdminMode ? adminNavSections : developerNavSections;

  return (
    <div className="min-h-screen flex bg-[#fafafa] text-[#171717]">
      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Real Platform Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#e5e5e5] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Brand Header */}
          <div className="p-4 border-b border-[#e5e5e5] flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/hunt-icon.jpg"
                alt="Hunt"
                className="w-8 h-8 rounded-lg object-contain bg-black shadow-xs group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-[#171717]">
                  {isInAdminMode ? 'Hunt Admin' : 'Hunt Platform'}
                </span>
                <span className="text-[10px] font-mono text-[#525252] font-semibold flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isInAdminMode ? 'bg-[#2563eb]' : 'bg-[#15803d] animate-pulse'}`}></span>
                  {isInAdminMode ? 'Governance Console' : 'MCP Active'}
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 text-[#737373] hover:text-[#171717]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* ADMIN MODE: Clear switch to Developer Platform */}
          {role === 'admin' && isInAdminMode && (
            <div className="p-3 bg-[#f8fafc] border-b border-[#e5e5e5]">
              <button
                type="button"
                onClick={switchToDeveloperMode}
                className="w-full py-2 px-3 bg-white hover:bg-[#eff6ff] border border-[#cbd5e1] hover:border-[#2563eb] rounded-xl text-xs font-semibold text-[#1e293b] hover:text-[#2563eb] transition-all flex items-center justify-between shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-[#2563eb]">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                  <span>Use as Developer</span>
                </div>
                <span className="text-xs group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </button>
            </div>
          )}

          {/* DEVELOPER MODE (When Admin): Clear indicator & switch back to Admin */}
          {role === 'admin' && !isInAdminMode && (
            <div className="p-3 bg-[#0f172a] text-white border-b border-[#1e293b]">
              <div className="flex items-center justify-between text-[11px] mb-1.5 text-[#94a3b8]">
                <span>Admin Operating as Developer</span>
              </div>
              <button
                type="button"
                onClick={switchToAdminMode}
                className="w-full py-1.5 px-3 bg-[#1e293b] hover:bg-[#334155] text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer"
              >
                <span>&larr; Return to Admin Console</span>
                <span className="text-[10px] font-mono bg-[#38bdf8]/20 text-[#38bdf8] px-1 rounded">PRO</span>
              </button>
            </div>
          )}

          {/* Primary Action Button (Only in Developer Mode) */}
          {!isInAdminMode && (
            <div className="p-4 pb-2">
              <Link
                href="/problems/new"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm py-2.5 px-4 rounded-xl shadow-xs transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Document Problem
              </Link>
            </div>
          )}

          {/* Clean Navigation Sections (Zero duplicate links) */}
          <nav className="flex-1 p-4 space-y-6">
            {activeNavSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#a3a3a3] px-3 mb-2">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname === item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#171717] text-white font-semibold shadow-xs'
                          : 'text-[#525252] hover:text-[#171717] hover:bg-[#f5f5f5]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? 'text-white' : 'text-[#737373]'}>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User Account Section at bottom */}
          <div className="p-4 border-t border-[#e5e5e5] bg-[#fafafa]/80 space-y-3">
            {user ? (
              <div className="flex items-center justify-between">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                >
                  <div className={`w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-xs ${
                    role === 'admin' ? 'bg-[#0f172a]' : 'bg-[#2563eb]'
                  }`}>
                    {user.display_name?.substring(0, 2).toUpperCase() || 'DV'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#171717] leading-tight">
                      {user.display_name}
                    </span>
                    <span className="text-[11px] font-mono text-[#737373]">
                      @{user.username} {role === 'admin' && '• Superuser'}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => void logout()}
                  title="Sign out"
                  className="p-1.5 text-[#a3a3a3] hover:text-[#b91c1c] transition-colors rounded-lg hover:bg-white cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Link
                  href="/auth/signin"
                  className="w-full block text-center py-2 text-xs font-semibold text-[#171717] bg-white border border-[#e5e5e5] rounded-lg hover:bg-[#f5f5f5]"
                >
                  Sign In to Account
                </Link>
              </div>
            )}

            <div className="pt-2 border-t border-[#e5e5e5]/60 flex items-center justify-between text-[11px] text-[#737373]">
              <Link href="/" className="hover:text-[#171717] font-medium flex items-center gap-1">
                <span>&larr;</span> Landing Page
              </Link>
              <span className="font-mono text-[10px]">hunt.zehunt</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Platform Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Subtle Top Utility Bar */}
        <header className="sticky top-0 z-30 h-14 bg-white/80 backdrop-blur-md border-b border-[#e5e5e5] px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg border border-[#e5e5e5] text-[#525252] hover:bg-[#f5f5f5]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            {/* Quick Context Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-[#737373]">
              <span className="font-semibold text-[#171717]">
                {isInAdminMode ? 'Hunt Admin' : 'Hunt Platform'}
              </span>
              <span>/</span>
              <span className="capitalize font-medium text-[#171717]">
                {pathname.split('/')[1] || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isInAdminMode ? (
              <button
                type="button"
                onClick={switchToDeveloperMode}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#cbd5e1] bg-white hover:bg-[#f8fafc] text-xs font-semibold text-[#1e293b] shadow-2xs transition-colors cursor-pointer"
              >
                <span>Switch to Developer Platform</span>
                <span>&rarr;</span>
              </button>
            ) : (
              <>
                {role === 'admin' && (
                  <button
                    type="button"
                    onClick={switchToAdminMode}
                    className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#0f172a] bg-[#0f172a] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>🛡️ Admin Console</span>
                  </button>
                )}

                <Link
                  href="/solutions"
                  className="hidden sm:flex items-center gap-2 bg-[#f5f5f5] hover:bg-[#ebebeb] border border-[#e5e5e5] rounded-lg px-3 py-1.5 text-xs text-[#737373] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <span>Quick search...</span>
                  <span className="font-mono text-[10px] bg-white border border-[#e5e5e5] px-1.5 py-0.5 rounded text-[#525252]">⌘K</span>
                </Link>

                <Link
                  href="/problems/new"
                  className="flex items-center gap-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-xs"
                >
                  <span>+</span>
                  <span>Document</span>
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
