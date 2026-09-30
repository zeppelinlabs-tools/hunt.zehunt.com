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

    // Validate input
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/v1/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();
      
      if (!result.success) {
        setError(result.error || 'Invalid email or password');
        setIsSubmitting(false);
        return;
      }

      // Set role based on authenticated user
      await switchRole(result.user?.role || 'developer');
      
      // Redirect based on role
      if (result.user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/solutions');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fafafa]">
      <div className="w-full max-w-md bg-white border border-[#e5e5e5] rounded-3xl p-8 sm:p-10 shadow-sm space-y-7">
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
            Enter your credentials to access verified developer intelligence.
          </p>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 bg-white border border-[#d4d4d4] rounded-xl text-sm text-[#171717] focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 disabled:opacity-50"
              placeholder="dev.madnansultan@gmail.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-[#171717]">Password</label>
              <Link href="/auth/reset" className="text-xs text-[#2563eb] hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 bg-white border border-[#d4d4d4] rounded-xl text-sm text-[#171717] focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-[#fef2f2] border border-[#fecaca] rounded-xl">
              <p className="text-xs text-[#b91c1c] font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#171717] hover:bg-[#262626] text-white font-semibold text-sm rounded-xl transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center pt-2">
          <p className="text-xs text-[#525252]">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-[#2563eb] hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-[#525252] pt-1 border-t border-[#e5e5e5]">
          <Link href="/" className="hover:text-[#171717] font-medium inline-block mt-4">
            &larr; Back to Hunt
          </Link>
        </div>
      </div>
    </div>
  );
}
