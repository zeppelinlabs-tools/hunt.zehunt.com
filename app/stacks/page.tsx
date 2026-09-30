'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TechStack {
  id: string;
  name: string;
  subtitle: string;
  primaryTech: string[];
  solvedCount: number;
  popularIssues: string[];
}

export default function StacksPage() {
  const [stacks] = useState<TechStack[]>([
    {
      id: 'modern-web',
      name: 'Modern Fullstack (Next.js + Neon + Supabase)',
      subtitle: 'Modern SSR, Server Actions, Serverless Postgres, and Cookie Auth',
      primaryTech: ['Next.js 15', 'Neon Postgres', 'Supabase Auth', 'Prisma', 'Tailwind'],
      solvedCount: 142,
      popularIssues: [
        'Cookie propagation failures in Next.js Server Components',
        'Prisma connection pool saturation during hot reload',
        'Vercel deployment route handler 401 unhandled headers'
      ]
    },
    {
      id: 'agentic-ai',
      name: 'Agentic AI & MCP Architecture',
      subtitle: 'Model Context Protocol, Local LLM Tooling, and Autonomous Dev Agents',
      primaryTech: ['MCP', 'Claude Desktop', 'Cursor', 'Kiro', 'Node.js', 'Python'],
      solvedCount: 68,
      popularIssues: [
        'Stdio transport buffering on Windows WSL2 bridge',
        'MCP token scope revocation during automated sub-agent runs',
        'JSON-RPC line-delimited message truncation'
      ]
    },
    {
      id: 'cloud-native',
      name: 'Cloud-Native & Container Ops',
      subtitle: 'Microservices, Dockerized Pipelines, and Kubernetes Infrastructure',
      primaryTech: ['Docker', 'Kubernetes', 'AWS', 'Linux Ubuntu', 'Nginx'],
      solvedCount: 95,
      popularIssues: [
        'Multi-stage build cache invalidation with pnpm monorepos',
        'Rootless container socket permission denial',
        'WSL2 memory consumption on background Docker desktop'
      ]
    },
    {
      id: 'backend-microservices',
      name: 'Distributed Backend & APIs',
      subtitle: 'High-throughput APIs, Redis Caching, and Event Streaming',
      primaryTech: ['FastAPI', 'Node 22', 'Redis', 'PostgreSQL', 'Go'],
      solvedCount: 110,
      popularIssues: [
        'JWT token rotation replay detection false positives',
        'Database connection timeout during background task bursts',
        'CORS preflight failures on subdomains'
      ]
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-[#e5e5e5] pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-[#171717]">Production Tech Stacks</h1>
        <p className="text-xs text-[#525252] mt-1">
          Explore complete architecture blueprints and their recurring production bugs, dead-ends, and battle-tested solutions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stacks.map((stack) => (
          <div
            key={stack.id}
            className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-[#d4d4d4] transition-all"
          >
            <div>
              <div className="flex justify-between items-start gap-4 mb-2">
                <h2 className="text-lg font-bold text-[#171717]">{stack.name}</h2>
                <span className="badge-tag verified text-[11px] shrink-0 font-mono">
                  {stack.solvedCount} Solved Cases
                </span>
              </div>

              <p className="text-xs text-[#525252] mb-4 leading-relaxed">{stack.subtitle}</p>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {stack.primaryTech.map((tech) => (
                  <span key={tech} className="badge-tag accent text-[11px]">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="border-t border-[#f5f5f5] pt-3.5 space-y-2 mb-6">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#737373] font-semibold">
                  Most recurring failures:
                </div>
                <ul className="space-y-1.5 text-xs text-[#525252]">
                  {stack.popularIssues.map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#dc2626] font-bold">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Link
              href={`/solutions?q=${encodeURIComponent(stack.primaryTech[0])}`}
              className="w-full text-center px-4 py-2 text-xs font-semibold text-[#171717] bg-[#f5f5f5] hover:bg-[#ebebeb] border border-[#e5e5e5] rounded-xl transition-colors block"
            >
              Browse Verified Fixes for this Stack →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
