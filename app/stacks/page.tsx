'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TechStack {
  name: string;
  technologies: string[];
  problem_count: number;
}

export default function StacksPage() {
  const [stacks, setStacks] = useState<TechStack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/stacks')
      .then(res => res.json())
      .then(d => {
        if (d.success && d.stacks) {
          setStacks(d.stacks);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading stacks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[#e5e5e5] pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-[#171717]">Production Tech Stacks</h1>
        <p className="text-xs text-[#525252] mt-1">
          Explore complete architecture blueprints and their recurring production bugs, dead-ends, and battle-tested solutions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stacks.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-[#737373]">
            No technology stacks found yet
          </div>
        ) : (
          stacks.map((stack, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-[#d4d4d4] transition-all"
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h2 className="text-lg font-bold text-[#171717]">{stack.name}</h2>
                  <span className="badge-tag verified text-[11px] shrink-0 font-mono">
                    {stack.problem_count} Problems
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {stack.technologies.map((tech) => (
                    <span key={tech} className="badge-tag accent text-[11px]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                href={`/solutions?q=${encodeURIComponent(stack.technologies[0] || stack.name)}`}
                className="w-full text-center px-4 py-2 text-xs font-semibold text-[#171717] bg-[#f5f5f5] hover:bg-[#ebebeb] border border-[#e5e5e5] rounded-xl transition-colors block"
              >
                Browse Problems for this Stack →
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
