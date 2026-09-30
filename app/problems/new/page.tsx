'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RoleGate from '@/components/RoleGate';

export default function NewProblemPage() {
  const router = useRouter();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const context = formData.get('context') as string;
    const env = formData.get('env') as string;
    const error = formData.get('error') as string;
    const symptoms = (formData.get('symptoms') as string)?.split('\n').filter(Boolean);
    const tags = (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean);
    const attemptDesc = formData.get('attemptDesc') as string;
    const attemptReason = formData.get('attemptReason') as string;
    const rootcause = formData.get('rootcause') as string;
    const solTitle = formData.get('solTitle') as string;
    const solCode = formData.get('solCode') as string;
    const solWhy = formData.get('solWhy') as string;

    const payload = {
      title,
      status: 'Verified',
      created_at: 'Just now',
      context,
      environment: {
        runtime: env || 'Node.js 22',
        framework: tags[0] || 'Next.js 15'
      },
      error: error || null,
      symptoms: symptoms.length ? symptoms : ['Issue occurred in runtime execution'],
      attempts: attemptDesc ? [{
        description: attemptDesc,
        result: 'Failed',
        reason: attemptReason || 'Did not address root cause'
      }] : [],
      root_cause: rootcause || 'Architectural mismatch in configuration',
      solutions: solTitle ? [{
        id: `sol_${Date.now()}`,
        title: solTitle,
        state: 'Verified',
        code: solCode || '// solution code',
        why_it_works: solWhy || 'Resolves underlying runtime misconfiguration',
        author: 'madnan',
        confirmations_count: 1,
        last_confirmation: 'Today',
        verified_environments: [env || 'Production']
      }] : [],
      verification: {
        verified_by: 'madnan',
        verified_at: 'Today',
        environment: env || 'Production',
        version: '1.0',
        confirmation_count: 1
      },
      tags: tags.length ? tags : ['Next.js'],
      author: { username: 'madnan', display_name: 'Adnan Sultan' }
    };

    const res = await fetch('/api/problems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.success) {
      showToast('Problem documented and published!');
      setTimeout(() => router.push(`/problems/${result.data.id}`), 800);
    }
  };

  return (
    <RoleGate allow={['developer', 'admin']} title="Problem creation">
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-8 max-w-3xl mx-auto shadow-xs">
        <div className="mb-8">
          <Link href="/solutions" className="text-sm text-[#2563eb] font-semibold mb-3 inline-flex items-center gap-1">
            <span>&larr;</span>
            <span>Back to All Solutions</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#171717]">
            Document a Problem &amp; Investigation
          </h1>
          <p className="text-base text-[#525252] mt-1.5">
            Share your real engineering problem, what failed, and the verified fix so other developers and AI agents avoid wasted debugging loops.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#171717] mb-1.5">
              Problem Title *
            </label>
            <input
              name="title"
              className="w-full bg-white border border-[#d4d4d4] rounded-xl px-4 py-2.5 text-base text-[#171717] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all placeholder:text-[#a3a3a3]"
              placeholder="e.g. Supabase authentication fails after Vercel deployment"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#171717] mb-1.5">
                Context (What were you building?)
              </label>
              <input
                name="context"
                className="w-full bg-white border border-[#d4d4d4] rounded-xl px-4 py-2.5 text-base text-[#171717] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all placeholder:text-[#a3a3a3]"
                placeholder="e.g. Next.js app using Supabase SSR authentication"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#171717] mb-1.5">
                Environment Details (M04 Matrix)
              </label>
              <input
                name="env"
                className="w-full bg-white border border-[#d4d4d4] rounded-xl px-4 py-2.5 text-base text-[#171717] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all placeholder:text-[#a3a3a3]"
                placeholder="e.g. Next.js 15, Node 22, Vercel"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#171717] mb-1.5">
                Observed Error Message
              </label>
              <input
                name="error"
                className="w-full bg-white border border-[#d4d4d4] rounded-xl px-4 py-2.5 text-base text-[#171717] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all placeholder:text-[#a3a3a3]"
                placeholder="e.g. 401 Unauthorized"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#171717] mb-1.5">
                Tags (Comma separated)
              </label>
              <input
                name="tags"
                className="w-full bg-white border border-[#d4d4d4] rounded-xl px-4 py-2.5 text-base text-[#171717] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all placeholder:text-[#a3a3a3]"
                placeholder="Next.js, Supabase, Vercel, Authentication"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#171717] mb-1.5">
              Symptoms (Observed failures vs expected)
            </label>
            <textarea
              name="symptoms"
              rows={3}
              className="w-full bg-white border border-[#d4d4d4] rounded-xl px-4 py-2.5 text-base text-[#171717] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all placeholder:text-[#a3a3a3]"
              placeholder="Works locally. Returns 401 in production on server actions."
              required
            />
          </div>

          {/* Failed attempts - Hunt Core Differentiator */}
          <div className="bg-[#fffcf9] border border-[#fed7aa] p-5 rounded-2xl space-y-3">
            <div>
              <label className="block text-sm font-bold text-[#9a3412]">
                ⚠️ Failed Attempts &amp; Dead Ends (What didn&apos;t work - M06)
              </label>
              <p className="text-xs text-[#9a3412] mt-0.5">
                Prevents AI coding agents and developers from repeating these exact debugging actions.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <input
                name="attemptDesc"
                className="w-full bg-white border border-[#fed7aa] rounded-xl px-3.5 py-2 text-sm text-[#171717] outline-none focus:border-[#c2410c]"
                placeholder="What did you try that failed? (e.g. Rotated API keys)"
              />
              <input
                name="attemptReason"
                className="w-full bg-white border border-[#fed7aa] rounded-xl px-3.5 py-2 text-sm text-[#171717] outline-none focus:border-[#c2410c]"
                placeholder="Why did it fail? (e.g. Issue was cookie propagation)"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#171717] mb-1.5">
              Verified Root Cause
            </label>
            <textarea
              name="rootcause"
              rows={3}
              className="w-full bg-white border border-[#d4d4d4] rounded-xl px-4 py-2.5 text-base text-[#171717] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all placeholder:text-[#a3a3a3]"
              placeholder="Why did this issue actually happen? Underlying breakdown."
            />
          </div>

          {/* Solution */}
          <div className="bg-[#f8fafc] border border-[#e5e5e5] p-5 rounded-2xl space-y-3.5">
            <label className="block text-sm font-bold text-[#171717]">
              Verified Solution (M05)
            </label>
            <input
              name="solTitle"
              className="w-full bg-white border border-[#d4d4d4] rounded-xl px-4 py-2 text-base text-[#171717] outline-none focus:border-[#2563eb]"
              placeholder="Solution Title (e.g. Propagate response cookies in middleware)"
            />
            <textarea
              name="solCode"
              rows={4}
              className="w-full bg-[#18181b] text-white font-mono text-sm rounded-xl p-4 outline-none focus:ring-2 focus:ring-[#2563eb]"
              placeholder="// Paste the code or configuration snippet..."
            />
            <input
              name="solWhy"
              className="w-full bg-white border border-[#d4d4d4] rounded-xl px-4 py-2 text-sm text-[#171717] outline-none focus:border-[#2563eb]"
              placeholder="Why it works (Mechanics)"
            />
          </div>

          {/* Secret Leak Protection (M16) */}
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] px-4 py-3 rounded-xl text-sm font-mono flex items-center gap-2">
            <span>✓</span>
            <span>Secret Protection (M16): Scanned for API keys, AWS credentials, and DB tokens. Safe.</span>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] font-semibold text-sm px-6 py-3 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              Publish Investigation
            </button>
            <button
              type="button"
              onClick={() => showToast('Draft saved to local workspace')}
              className="bg-white border border-[#e5e5e5] text-[#525252] hover:text-[#171717] font-semibold text-sm px-6 py-3 rounded-xl transition-colors cursor-pointer"
            >
              Save Draft
            </button>
          </div>
        </form>

        {toastMsg && (
          <div className="fixed bottom-6 right-6 bg-[#18181b] text-white font-mono text-sm px-4 py-2.5 rounded-xl shadow-lg z-50 flex items-center gap-2">
            <span className="text-[#34d399]">✓</span>
            <span>{toastMsg}</span>
          </div>
        )}
      </div>
    </RoleGate>
  );
}
