'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RoleGate from '@/components/RoleGate';

interface BookmarkItem {
  id: number;
  title: string;
  category: string;
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(d => {
        if (d.success && d.user?.bookmarks) {
          setBookmarks(d.user.bookmarks);
        }
      })
      .catch(console.error);
  }, []);

  const categories = ['all', ...new Set(bookmarks.map(b => b.category || 'General'))];

  const filtered = categoryFilter === 'all'
    ? bookmarks
    : bookmarks.filter(b => b.category === categoryFilter);

  return (
    <RoleGate allow={['developer', 'admin']} title="Personal bookmarks">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#171717]">
            Personal Knowledge &amp; Bookmarks
          </h1>
          <p className="text-base text-[#525252] mt-1">
            Saved problems, verified fixes, and notes. This private knowledge collection is accessible to your connected AI agents (M12).
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
                categoryFilter === cat
                  ? 'bg-[#171717] text-white shadow-xs'
                  : 'bg-white border border-[#e5e5e5] text-[#525252] hover:text-[#171717]'
              }`}
            >
              {cat === 'all' ? `All Collections (${bookmarks.length})` : cat}
            </button>
          ))}
        </div>

        <div className="space-y-3.5">
          {filtered.length === 0 ? (
            <div className="bg-white border border-[#e5e5e5] rounded-2xl p-12 text-center text-sm text-[#737373] shadow-xs">
              No bookmarked solutions in this collection yet. Browse verified solutions to bookmark investigations.
            </div>
          ) : (
            filtered.map(b => (
              <Link
                key={b.id}
                href={`/problems/${b.id}`}
                className="bg-white border border-[#e5e5e5] rounded-2xl p-5 block hover:border-[#2563eb]/50 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-center gap-4">
                  <h3 className="font-bold text-lg text-[#171717] group-hover:text-[#2563eb] transition-colors">
                    {b.title}
                  </h3>
                  <span className="badge-tag accent text-xs">{b.category}</span>
                </div>
                <p className="text-sm text-[#737373] mt-1.5 flex items-center gap-2">
                  <span className="text-[#15803d]">✓ Saved to personal memory</span>
                  <span>&bull;</span>
                  <span>Queryable by Cursor, Claude Desktop, and Kiro over MCP</span>
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </RoleGate>
  );
}
