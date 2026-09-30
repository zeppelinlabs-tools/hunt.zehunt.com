'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TopicStat {
  name: string;
  slug: string;
  count: number;
}

export default function TopicsIndexPage() {
  const [topics, setTopics] = useState<TopicStat[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/topics')
      .then(res => res.json())
      .then(d => {
        if (d.success && d.topics) {
          setTopics(d.topics);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = topics.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-12">Loading topics...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-[#171717]">Taxonomy & Technical Topics</h1>
        <p className="text-xs text-[#525252] mt-1">
          Explore recurring engineering failure patterns grouped by framework, runtime, database, and deployment environment.
        </p>

        <div className="mt-4 max-w-md">
          <input
            type="text"
            placeholder="Search topics (e.g. Next.js, Postgres, Docker)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-[#737373]">
            No topics found
          </div>
        ) : (
          filtered.map(t => (
            <Link
              key={t.slug}
              href={`/topics/${t.slug}`}
              className="bg-white border border-[#e5e5e5] rounded-xl p-5 hover:border-[#d4d4d4] hover:shadow-sm transition-all block group"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-base text-[#171717] group-hover:text-[#2563eb] transition-colors">
                  {t.name}
                </h3>
              </div>

              <div className="flex items-center justify-between text-xs text-[#737373] border-t border-[#f5f5f5] pt-3">
                <span><strong>{t.count}</strong> problems</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
