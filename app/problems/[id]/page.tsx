'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRole } from '@/components/RoleProvider';

interface AttemptItem {
  description: string;
  result: string;
  reason: string;
}

interface SolutionItem {
  id: string;
  title: string;
  state: string;
  author: string;
  confirmations_count: number;
  code: string;
  why_it_works: string;
  trade_offs?: string;
  limitations?: string;
}

interface DiscussionItem {
  id: string;
  author: string;
  type: string;
  content: string;
  version_reported?: string;
  time_ago: string;
  votes: number;
}

interface ProblemDetail {
  id: number;
  title: string;
  status: string;
  created_at: string;
  context: string;
  environment: Record<string, string>;
  error?: string;
  symptoms: string[];
  attempts: AttemptItem[];
  root_cause: string;
  solutions: SolutionItem[];
  discussions: DiscussionItem[];
  tags: string[];
  helpful_votes: number;
  author?: { username?: string };
  verification?: { confirmation_count?: number; verified_by?: string };
}

interface CurrentUserDetail {
  username?: string;
  bookmarks?: { id: number }[];
}

export default function ProblemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const { role } = useRole();
  const isDeveloper = role === 'developer' || role === 'admin';

  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUserDetail | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentType, setCommentType] = useState('Confirmation');
  const [commentVersion, setCommentVersion] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  useEffect(() => {
    fetch('/api/v1/problems')
      .then(res => res.json())
      .then(d => {
        if (d.success && d.data) {
          const found = d.data.find((item: ProblemDetail) => item.id === id);
          if (found) setProblem(found);
          else router.push('/solutions');
        }
      })
      .catch(console.error);

    fetch('/api/v1/auth/me')
      .then(res => res.json())
      .then(d => {
        if (d.success) setCurrentUser(d.user);
      })
      .catch(console.error);
  }, [id, router]);

  if (!problem) {
    return <div className="py-16 text-center text-base text-[#737373]">Loading problem investigation...</div>;
  }

  const isBookmarked = currentUser?.bookmarks?.some((b: { id: number }) => b.id === problem.id);

  const handleVote = () => {
    if (!isDeveloper) return;
    setProblem({ ...problem, helpful_votes: (problem.helpful_votes || 0) + 1 });
    showToast(`Feedback recorded: "This was useful" (Total: ${problem.helpful_votes + 1})`);
  };

  const handleConfirmWorked = () => {
    if (!isDeveloper) return;
    const currentCount = problem.verification?.confirmation_count || 0;
    setProblem({
      ...problem,
      verification: {
        ...problem.verification,
        confirmation_count: currentCount + 1
      }
    });
    showToast("Confirmed: Verified this solution works in your environment!");
  };

  const toggleBookmark = async () => {
    if (!isDeveloper) return;
    const res = await fetch('/api/v1/users/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'bookmark', problem })
    });
    const result = await res.json();
    if (result.success) {
      setCurrentUser((prev) => ({ ...(prev ?? {}), bookmarks: result.bookmarks }));
      showToast(isBookmarked ? 'Removed from bookmarks' : 'Added to personal bookmarks');
    }
  };

  const handleAddComment = () => {
    if (!isDeveloper || !commentText.trim()) return;
    const newComment = {
      id: `disc_${Date.now()}`,
      author: currentUser?.username || 'madnan',
      type: commentType,
      content: commentText.trim(),
      version_reported: commentVersion || 'Production',
      time_ago: 'Just now',
      votes: 1
    };
    setProblem({
      ...problem,
      discussions: [...(problem.discussions || []), newComment]
    });
    setCommentText('');
    setCommentVersion('');
    showToast(`Comment added as [${commentType}]`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181b] text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-mono flex items-center gap-2">
          <span className="text-[#34d399]">✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Breadcrumb & Action Header */}
      <div>
        <Link href="/solutions" className="text-sm text-[#2563eb] hover:underline font-medium mb-3 inline-flex items-center gap-1.5">
          <span>&larr;</span>
          <span>Back to Verified Solutions Feed</span>
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171717] leading-tight">
              {problem.title}
            </h1>
            <p className="text-sm text-[#525252] mt-1.5 flex items-center gap-2 flex-wrap">
              <span>Case #{problem.id}</span>
              <span>&bull;</span>
              <span>Status: <strong className="text-[#15803d] font-semibold">{problem.status}</strong></span>
              <span>&bull;</span>
              <span>Documented by <strong>@{problem.author?.username}</strong></span>
              <span>&bull;</span>
              <span>{problem.created_at}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {isDeveloper ? (
              <>
                <button
                  onClick={toggleBookmark}
                  className="px-4 py-2 bg-white border border-[#e5e5e5] rounded-xl text-sm font-semibold hover:border-[#d4d4d4] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span className={isBookmarked ? 'text-amber-500' : 'text-[#737373]'}>
                    {isBookmarked ? '★' : '☆'}
                  </span>
                  <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                </button>
                <button
                  onClick={handleVote}
                  className="px-4 py-2 bg-white border border-[#e5e5e5] rounded-xl text-sm font-semibold hover:border-[#d4d4d4] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span className="text-[#2563eb]">▲</span>
                  <span>Useful ({problem.helpful_votes || 0})</span>
                </button>
              </>
            ) : (
              <span className="text-xs text-[#737373] bg-[#f5f5f5] px-3 py-1.5 rounded-lg border border-[#e5e5e5]">
                Read-only view
              </span>
            )}
          </div>
        </div>

        {/* Taxonomy Badges */}
        <div className="flex gap-2 mt-3.5 flex-wrap">
          {problem.tags?.map((t: string) => (
            <span key={t} className="badge-tag text-xs font-mono">{t}</span>
          ))}
          <span className="badge-tag verified text-xs font-mono">
            ✓ {problem.verification?.confirmation_count || 0} Confirmations
          </span>
        </div>
      </div>

      {/* Main Grid: Left Investigation & Right Provenance Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="flex flex-col gap-6">
          {/* Environment & Observed Symptoms */}
          <div className="bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-[#f8fafc] border-b border-[#e5e5e5] flex justify-between items-center text-sm font-bold uppercase tracking-wider text-[#334155]">
              <span>Environment Matrix &amp; Observed Symptoms</span>
              <span className="font-mono text-xs text-[#64748b]">Investigation Matrix</span>
            </div>
            <div className="p-5 text-sm sm:text-base leading-relaxed space-y-3">
              <p><strong className="text-[#171717]">Project Context:</strong> {problem.context}</p>
              
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#737373]">Runtime Matrix:</span>
                <pre className="bg-[#18181b] text-[#f4f4f5] font-mono text-sm p-4 rounded-xl overflow-x-auto leading-relaxed">
                  {JSON.stringify(problem.environment, null, 2)}
                </pre>
              </div>

              {problem.error && (
                <div className="bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] p-3.5 rounded-xl text-sm font-mono my-2">
                  <strong className="block mb-1 text-xs uppercase tracking-wider">Observed Error Message:</strong>
                  {problem.error}
                </div>
              )}

              <div>
                <p className="font-bold text-[#171717] mb-1.5">Symptoms:</p>
                <ul className="list-disc pl-5 space-y-1 text-[#525252]">
                  {problem.symptoms?.map((s: string, idx: number) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Failed Attempts & Dead Ends */}
          <div className="bg-white border border-[#fed7aa] rounded-2xl overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-[#fff7ed] border-b border-[#fed7aa] flex justify-between items-center text-sm font-bold uppercase tracking-wider text-[#9a3412]">
              <span className="flex items-center gap-2">
                <span>⚠️</span>
                <span>Failed Attempts Preserved (Avoid Repeating)</span>
              </span>
              <span className="font-mono text-xs text-[#c2410c]">{problem.attempts?.length || 0} dead ends logged</span>
            </div>
            <div className="p-5 space-y-3.5">
              {problem.attempts?.map((a: AttemptItem, idx: number) => (
                <div key={idx} className="bg-[#fffaf5] border border-[#fed7aa] p-4 rounded-xl">
                  <div className="text-[#9a3412] font-bold text-sm flex items-center gap-2">
                    <span>✕</span>
                    <span>Attempt #{idx + 1}: {a.description}</span>
                  </div>
                  <div className="text-sm text-[#525252] mt-1.5 leading-relaxed">
                    <strong className="text-[#78350f]">Outcome:</strong> {a.result} &bull; <strong className="text-[#78350f]">Why it failed:</strong> {a.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Root Cause */}
          <div className="bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-[#f8fafc] border-b border-[#e5e5e5] flex justify-between items-center text-sm font-bold uppercase tracking-wider text-[#334155]">
              <span>Verified Root Cause</span>
              <span className="font-mono text-xs text-[#64748b]">Underlying Breakdown</span>
            </div>
            <div className="p-5 text-sm sm:text-base leading-relaxed text-[#171717]">
              {problem.root_cause}
            </div>
          </div>

          {/* Solutions */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg text-[#171717]">
                Verified Solutions ({problem.solutions?.length || 0} Approaches)
              </h2>
              <span className="font-mono text-xs text-[#15803d] font-semibold bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-1 rounded-md">
                Reproducible Fixes
              </span>
            </div>

            {problem.solutions?.map((sol: SolutionItem) => (
              <div key={sol.id} className="bg-white border border-[#bbf7d0] rounded-2xl overflow-hidden shadow-xs">
                <div className="px-5 py-4 bg-[#f0fdf4] border-b border-[#bbf7d0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <strong className="text-[#15803d] text-base">{sol.title}</strong>
                    <div className="text-xs text-[#525252] mt-0.5">
                      Status: <strong className="text-[#166534]">{sol.state}</strong> &bull; Author: @{sol.author}
                    </div>
                  </div>
                  {isDeveloper && (
                    <button
                      onClick={handleConfirmWorked}
                      className="bg-[#2563eb] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#1d4ed8] shadow-xs cursor-pointer transition-colors"
                    >
                      ✓ Worked For Me ({sol.confirmations_count})
                    </button>
                  )}
                </div>
                <div className="p-5 text-sm space-y-3">
                  <pre className="bg-[#18181b] text-[#fafafa] font-mono text-sm p-4 rounded-xl overflow-x-auto leading-relaxed">
                    {sol.code}
                  </pre>
                  <div className="pt-2 text-sm sm:text-base leading-relaxed">
                    <strong className="text-[#171717]">Why it works:</strong> {sol.why_it_works}
                  </div>
                  {sol.trade_offs && (
                    <div className="text-sm text-[#525252]">
                      <strong className="text-[#171717]">Trade-offs:</strong> {sol.trade_offs}
                    </div>
                  )}
                  {sol.limitations && (
                    <div className="text-sm text-[#525252]">
                      <strong className="text-[#171717]">Limitations:</strong> {sol.limitations}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Classified Discussions & Peer Comments */}
          <div className="bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-[#f8fafc] border-b border-[#e5e5e5] flex justify-between items-center text-sm font-bold uppercase tracking-wider text-[#334155]">
              <span>Peer Discussions ({problem.discussions?.length || 0} Contributions)</span>
              <span className="font-mono text-xs text-[#64748b]">Classified Insights</span>
            </div>
            <div className="p-5 space-y-5">
              {problem.discussions?.map((d: DiscussionItem) => (
                <div key={d.id} className="border-b border-[#e5e5e5] pb-4 space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-[#171717]">
                      @{d.author} &bull; <span className="text-[#737373] font-normal">{d.time_ago}</span> {d.version_reported && `(${d.version_reported})`}
                    </span>
                    <span className="badge-tag accent text-xs">{d.type}</span>
                  </div>
                  <p className="text-sm text-[#525252] leading-relaxed">{d.content}</p>
                </div>
              ))}

              {isDeveloper ? (
                <div className="bg-[#f8fafc] border border-[#e5e5e5] rounded-xl p-4 space-y-3">
                  <div className="text-sm font-bold text-[#171717]">
                    Contribute an experience, clarification, or alternative:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[160px_140px_1fr] gap-2.5">
                    <select
                      value={commentType}
                      onChange={e => setCommentType(e.target.value)}
                      className="bg-white border border-[#e5e5e5] rounded-lg px-3 py-2 text-sm text-[#171717] outline-none"
                    >
                      <option value="Confirmation">Confirmation</option>
                      <option value="Clarification">Clarification</option>
                      <option value="Alternative">Alternative</option>
                      <option value="Correction">Correction</option>
                      <option value="Experience">Experience</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Tested version"
                      value={commentVersion}
                      onChange={e => setCommentVersion(e.target.value)}
                      className="bg-white border border-[#e5e5e5] rounded-lg px-3 py-2 text-sm text-[#171717] outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Share your reproduction findings or details..."
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      className="bg-white border border-[#e5e5e5] rounded-lg px-3 py-2 text-sm text-[#171717] outline-none"
                    />
                  </div>
                  <button
                    onClick={handleAddComment}
                    className="bg-[#2563eb] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#1d4ed8] shadow-xs cursor-pointer transition-colors"
                  >
                    Post Classified Feedback
                  </button>
                </div>
              ) : (
                <div className="text-sm text-[#737373]">
                  <Link href="/auth/signin" className="text-[#2563eb] underline font-semibold">Sign in</Link> as a developer to post comments and community confirmations.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Provenance & Agent Access */}
        <div className="flex flex-col gap-5">
          {/* Provenance Card */}
          <div className="bg-white border border-[#e5e5e5] p-5 rounded-2xl text-sm space-y-3 shadow-xs">
            <h3 className="font-bold uppercase tracking-wider text-[#737373] text-xs">
              Verification Provenance
            </h3>
            <div className="flex justify-between items-center py-1 border-b border-[#f5f5f5]">
              <span className="text-[#737373]">Status:</span>
              <strong className="text-[#15803d] font-semibold">{problem.status}</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#f5f5f5]">
              <span className="text-[#737373]">Verified By:</span>
              <span className="font-semibold text-[#171717]">@{problem.verification?.verified_by}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#f5f5f5]">
              <span className="text-[#737373]">Confirmations:</span>
              <strong className="text-[#171717] font-semibold">{problem.verification?.confirmation_count || 0} developers</strong>
            </div>
            {isDeveloper && (
              <button
                onClick={handleConfirmWorked}
                className="w-full bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] py-2.5 rounded-xl text-sm font-semibold hover:bg-[#dcfce7] transition-colors mt-2 cursor-pointer"
              >
                + Confirm &quot;Worked For Me&quot;
              </button>
            )}
          </div>

          {/* AI Agent Access Card */}
          <div className="bg-white border border-[#e5e5e5] p-5 rounded-2xl text-sm space-y-3 shadow-xs">
            <h3 className="font-bold uppercase tracking-wider text-[#737373] text-xs">
              AI Agent Access (MCP)
            </h3>
            <p className="text-xs text-[#525252] leading-relaxed">
              Claude Desktop, Cursor, and Kiro retrieve this investigation using:
            </p>
            <pre className="bg-[#18181b] text-[#38bdf8] p-3 rounded-xl font-mono text-xs overflow-x-auto">
{`hunt_get_problem({
  id: ${problem.id},
  with_attempts: true
})`}
            </pre>
            <Link
              href="/agents"
              className="w-full text-center block bg-white border border-[#e5e5e5] hover:bg-[#f5f5f5] text-[#171717] font-semibold py-2 rounded-xl text-xs transition-colors shadow-xs"
            >
              Open MCP Gateway &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
