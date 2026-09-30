'use client';

import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="max-w-md mx-auto my-12">
      <div className="bg-white border border-[#e5e5e5] rounded-xl p-8 shadow-sm text-center">
        <div className="w-10 h-10 bg-[#eff6ff] text-[#2563eb] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
          </svg>
        </div>

        <h1 className="text-xl font-bold tracking-tight text-[#171717] mb-2">Check your email</h1>
        <p className="text-xs text-[#525252] mb-6 leading-relaxed">
          We dispatched an activation link to your email. Click the verification link to confirm your account and enable AI agent execution.
        </p>

        <div className="space-y-2.5">
          <Link href="/" className="btn-primary w-full">
            Simulate Verification & Enter Hunt
          </Link>
          <Link href="/auth/signin" className="btn-secondary w-full">
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
