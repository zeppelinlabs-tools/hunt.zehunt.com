'use client';

import Link from 'next/link';
import { PlatformRole, useRole } from '@/components/RoleProvider';

export default function RoleGate({
  allow,
  title,
  children,
}: {
  allow: PlatformRole[];
  title: string;
  children: React.ReactNode;
}) {
  const { role, loading } = useRole();
  const allowed = allow.includes(role);

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-[#737373] flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-ping"></span>
        <span>Verifying access permissions...</span>
      </div>
    );
  }

  if (allowed) return <>{children}</>;

  return (
    <div className="max-w-xl mx-auto bg-white border border-[#e5e5e5] rounded-2xl p-8 text-center shadow-xs space-y-5 my-8">
      <div className="w-12 h-12 rounded-2xl bg-[#fee2e2] text-[#dc2626] mx-auto flex items-center justify-center font-bold text-xl">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-[#171717]">
          Access Restricted
        </h2>
        <p className="text-sm text-[#525252] max-w-sm mx-auto leading-relaxed">
          <strong>{title}</strong> is restricted to {allow.join(' or ')} accounts. Please sign in to continue.
        </p>
      </div>

      <div className="pt-2 flex justify-center items-center gap-3">
        <Link
          href="/auth/signin"
          className="px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
        >
          Sign In with Account
        </Link>
        <Link
          href="/solutions"
          className="px-5 py-2.5 bg-white border border-[#e5e5e5] hover:bg-[#f5f5f5] text-[#525252] hover:text-[#171717] text-xs font-semibold rounded-xl transition-colors shadow-xs"
        >
          Return to Solutions
        </Link>
      </div>
    </div>
  );
}
