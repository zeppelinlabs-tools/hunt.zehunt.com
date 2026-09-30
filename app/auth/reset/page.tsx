'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <div className="bg-white border border-[#e5e5e5] rounded-xl p-8 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-[#171717] mb-1">Reset your password</h1>
        <p className="text-xs text-[#525252] mb-6">
          Enter your account email. If registered, we will send password recovery instructions immediately.
        </p>

        {sent ? (
          <div className="space-y-4">
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] p-3.5 rounded text-xs leading-relaxed">
              If an account with that email exists, an instruction link has been sent. Check your spam folders if not received within 2 minutes.
            </div>
            <Link href="/auth/signin" className="btn-secondary w-full block text-center">
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">Account Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-input text-xs"
                placeholder="alex@domain.io"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full">Send Recovery Link</button>
            <div className="text-center text-xs">
              <Link href="/auth/signin" className="text-[#2563eb] hover:underline">Back to Sign In</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
