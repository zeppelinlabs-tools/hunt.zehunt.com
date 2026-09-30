import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const mcpAuditFilePath = path.join(process.cwd(), 'data', 'mcp_audit.json');
const problemsFilePath = path.join(process.cwd(), 'data', 'problems.json');

interface AuditEntry {
  id: string;
  timestamp: string;
  agent: string;
  type: string;
  tool?: string;
  args?: Record<string, unknown>;
  response?: string;
}

interface ProblemLite {
  id: number;
  title: string;
  tags: string[];
  attempts?: unknown[];
  solutions?: unknown[];
}

function readAudit(): AuditEntry[] {
  try {
    return JSON.parse(fs.readFileSync(mcpAuditFilePath, 'utf-8'));
  } catch {
    return [];
  }
}

function writeAudit(data: AuditEntry[]) {
  fs.writeFileSync(mcpAuditFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

function readProblems(): ProblemLite[] {
  try {
    return JSON.parse(fs.readFileSync(problemsFilePath, 'utf-8'));
  } catch {
    return [];
  }
}

export async function GET() {
  const audit = readAudit();
  return NextResponse.json({ success: true, count: audit.length, audit });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      tool: string;
      args: Record<string, unknown>;
      agent?: string;
    };
    const { tool, args, agent = 'Kiro-Agent' } = payload;
    const problems = readProblems();
    const audit = readAudit();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    let responseResult = '';

    if (tool === 'hunt_search') {
      const q = String(args.query || '').toLowerCase();
      const matches = problems.filter((p: ProblemLite) =>
        p.title.toLowerCase().includes(q) || p.tags.some((t: string) => t.toLowerCase().includes(q))
      );
      responseResult = `200 OK: Found ${matches.length} matching investigations.`;
    } else if (tool === 'hunt_find_failed_attempts') {
      const p = problems.find((item: ProblemLite) => item.id === Number(args.problem_id));
      const count = p?.attempts?.length || 0;
      responseResult = `200 OK: Injected ${count} failed attempt dead-ends into agent context.`;
    } else if (tool === 'hunt_get_solution') {
      const p = problems.find((item: ProblemLite) => item.id === Number(args.problem_id));
      const count = p?.solutions?.length || 0;
      responseResult = `200 OK: Delivered ${count} verified code solutions.`;
    } else {
      responseResult = `200 OK: Tool ${tool} executed successfully.`;
    }

    const logEntry = {
      id: `audit_${Date.now()}`,
      timestamp,
      agent,
      type: 'tool_call',
      tool,
      args,
      response: responseResult
    };

    audit.push(logEntry);
    writeAudit(audit);

    return NextResponse.json({ success: true, log: logEntry });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
