'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRole } from '@/components/RoleProvider';

export default function SignInPage() {
  const router = useRouter();
  const { refreshSession } = useRole();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await res.json();
    if (!result.success) {
      setError(result.error || 'Unable to sign in');
      return;
    }

    await refreshSession();
    router.push('/');
  };

  const handleQuickDeveloper = async () => {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'madnan@zehunt.com', password: 'dev123' }),
    });
    const result = await res.json();
    if (!result.success) {
      setError(result.error || 'Unable to sign in as developer');
      return;
    }
    await refreshSession();
    router.push('/');
  };

  const handleQuickAdmin = async () => {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hunt.zehunt.com', password: 'admin123' }),
    });
    const result = await res.json();
    if (!result.success) {
      setError(result.error || 'Unable to sign in as admin');
      return;
    }
    await refreshSession();
    router.push('/admin');
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="bg-white border border-[#e5e5e5] rounded-xl p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-tight text-[#171717]">Sign in to Hunt</h1>
          <p className="text-xs text-[#525252] mt-1">
            Access verified problem-solving investigations, track provenance, and manage AI agent tokens.
          </p>
        </div>

        <div className="space-y-2.5 mb-5">
          <button
            type="button"
            onClick={handleQuickDeveloper}
            className="w-full flex items-center justify-center gap-2.5 bg-white border border-[#e5e5e5] rounded-md py-2 px-4 text-xs font-semibold text-[#171717] hover:bg-[#f5f5f5] transition-all"
          >
            Continue as Developer
          </button>

          <button
            type="button"
            onClick={handleQuickAdmin}
            className="w-full flex items-center justify-center gap-2.5 bg-white border border-[#e5e5e5] rounded-md py-2 px-4 text-xs font-semibold text-[#171717] hover:bg-[#f5f5f5] transition-all"
          >
            Continue as Admin
          </button>
        </div>

        <div className="flex items-center text-[#737373] text-xs my-4">
          <div className="flex-1 border-b border-[#e5e5e5]"></div>
          <span className="px-3">or credentials</span>
          <div className="flex-1 border-b border-[#e5e5e5]"></div>
        </div>

        <form onSubmit={handleSignIn} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="form-input text-xs"
              placeholder="alex@domain.io"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-[#171717]">Password</label>
              <Link href="/auth/reset" className="text-xs text-[#2563eb] hover:underline">Forgot password?</Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="form-input text-xs"
              placeholder="••••••••••••"
              required
            />
          </div>

          {error && <p className="text-xs text-[#b91c1c]">{error}</p>}

          <button type="submit" className="btn-primary w-full mt-2">Sign In</button>
        </form>

        <div className="mt-5 text-center text-xs text-[#525252]">
          New developer? <Link href="/auth/signup" className="text-[#2563eb] font-semibold hover:underline">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
