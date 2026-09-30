'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRole } from '@/components/RoleProvider';

export default function SignInPage() {
  const router = useRouter();
  const { switchRole } = useRole();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();
      if (!result.success) {
        setError(result.error || 'Unable to sign in');
        setIsSubmitting(false);
        return;
      }

      await switchRole(result.user?.role || 'developer');
      router.push('/solutions');
    } catch {
      setError('An unexpected error occurred during sign in');
      setIsSubmitting(false);
    }
  };

  const selectDeveloperRole = async () => {
    setIsSubmitting(true);
    await switchRole('developer');
    router.push('/solutions');
  };

  const selectAdminRole = async () => {
    setIsSubmitting(true);
    await switchRole('admin');
    router.push('/admin');
  };

  const selectGuestRole = async () => {
    setIsSubmitting(true);
    await switchRole('guest');
    router.push('/solutions');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fafafa]">
      <div className="w-full max-w-lg bg-white border border-[#e5e5e5] rounded-3xl p-8 sm:p-10 shadow-sm space-y-7">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block group mb-1">
            <img
              src="/horizantal-logo.jpg"
              alt="Hunt by Zehunt"
              className="h-10 w-auto mx-auto object-contain"
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171717]">
            Sign in to Hunt
          </h1>
          <p className="text-sm text-[#525252] max-w-sm mx-auto">
            Select your platform role or enter your credentials to access verified developer intelligence.
          </p>
        </div>

        {/* Role Selector Grid */}
        <div className="space-y-3">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#737373] text-center">
            Select Role Access
          </div>

          <div className="space-y-2.5">
            {/* Developer Role Option */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={selectDeveloperRole}
              className="w-full text-left p-4 rounded-2xl border border-[#e5e5e5] hover:border-[#2563eb] hover:bg-[#eff6ff]/30 transition-all flex items-start gap-4 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center font-bold text-lg shrink-0 group-hover:scale-105 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#171717] group-hover:text-[#2563eb] transition-colors">
                    Developer Account
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] font-semibold">
                    Adnan Sultan
                  </span>
                </div>
                <p className="text-xs text-[#525252] mt-0.5 leading-relaxed">
                  Full problem authoring, MCP agent tokens, code bookmarks, and profile.
                </p>
              </div>
            </button>

            {/* Admin Role Option */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={selectAdminRole}
              className="w-full text-left p-4 rounded-2xl border border-[#e5e5e5] hover:border-[#171717] hover:bg-[#f5f5f5]/60 transition-all flex items-start gap-4 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] text-[#171717] flex items-center justify-center font-bold text-lg shrink-0 group-hover:scale-105 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#171717]">
                    Platform Administrator
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5] font-semibold">
                    Hunt Admin
                  </span>
                </div>
                <p className="text-xs text-[#525252] mt-0.5 leading-relaxed">
                  Governance console, moderation queues, audit logs, and platform analytics.
                </p>
              </div>
            </button>

            {/* Guest Role Option */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={selectGuestRole}
              className="w-full text-left p-3.5 rounded-2xl border border-dashed border-[#d4d4d4] hover:border-[#737373] hover:bg-[#fafafa] transition-all flex items-center gap-3.5 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#fafafa] text-[#737373] flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <div className="flex-1 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#525252] group-hover:text-[#171717]">
                  Continue as Guest (Read-Only Mode)
                </span>
                <span className="text-xs text-[#a3a3a3]">&rarr;</span>
              </div>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center text-[#737373] text-xs">
          <div className="flex-1 border-b border-[#e5e5e5]"></div>
          <span className="px-3 font-mono text-[11px] text-[#a3a3a3] uppercase">or sign in with password</span>
          <div className="flex-1 border-b border-[#e5e5e5]"></div>
        </div>

        {/* Standard Credentials Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#d4d4d4] rounded-xl text-sm text-[#171717] focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
              placeholder="madnan@zehunt.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-[#171717]">Password</label>
              <Link href="/auth/reset" className="text-xs text-[#2563eb] hover:underline">Forgot password?</Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#d4d4d4] rounded-xl text-sm text-[#171717] focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-xs text-[#b91c1c] font-medium">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#171717] hover:bg-[#262626] text-white font-semibold text-sm rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In with Email'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-[#525252] pt-1">
          <Link href="/" className="hover:text-[#171717] font-medium">
            &larr; Back to Hunt landing page
          </Link>
        </div>
      </div>
    </div>
  );
}
