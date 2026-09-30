'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRole } from '@/components/RoleProvider';

export default function SignUpPage() {
  const router = useRouter();
  const { refreshSession } = useRole();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await fetch('/api/v1/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password, display_name: username }),
    });

    const result = await res.json();
    if (!result.success) {
      setError(result.error || 'Unable to create account');
      return;
    }

    await refreshSession();
    router.push('/auth/verify');
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="bg-white border border-[#e5e5e5] rounded-xl p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-tight text-[#171717]">Create your Hunt account</h1>
          <p className="text-xs text-[#525252] mt-1">
            Join developers documenting verified root causes and solutions.
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-3.5">
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
            <label className="block text-xs font-semibold text-[#171717] mb-1">Developer handle</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 font-mono text-xs text-[#737373]">hunt.dev/@</span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="form-input text-xs pl-24"
                placeholder="username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="form-input text-xs"
              placeholder="Minimum 8 characters"
              required
            />
          </div>

          {error && <p className="text-xs text-[#b91c1c]">{error}</p>}

          <button type="submit" className="btn-primary w-full mt-2">Create Account</button>
        </form>

        <div className="mt-5 text-center text-xs text-[#525252]">
          Already have an account? <Link href="/auth/signin" className="text-[#2563eb] font-semibold hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
