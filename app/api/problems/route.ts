import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'problems.json');

interface ProblemRecord {
  id: number;
  title: string;
  root_cause?: string;
  tags: string[];
  symptoms: string[];
  [key: string]: unknown;
}

function readProblems(): ProblemRecord[] {
  try {
    const raw = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeProblems(data: ProblemRecord[]) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';
  const tag = searchParams.get('tag') || 'all';

  let problems = readProblems();

  if (tag !== 'all') {
    problems = problems.filter((p: ProblemRecord) => p.tags.includes(tag));
  }

  if (query) {
    problems = problems.filter((p: ProblemRecord) =>
      p.title.toLowerCase().includes(query) ||
      p.root_cause?.toLowerCase().includes(query) ||
      p.symptoms?.some((s: string) => s.toLowerCase().includes(query)) ||
      p.tags?.some((t: string) => t.toLowerCase().includes(query))
    );
  }

  return NextResponse.json({ success: true, count: problems.length, data: problems });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const problems = readProblems();

    const newProblem = {
      id: Math.floor(Math.random() * 9000) + 1000,
      title: body.title,
      status: body.status || 'Published',
      context: body.context || 'Developer submitted context',
      environment: body.environment || {},
      error: body.error || '',
      symptoms: Array.isArray(body.symptoms) ? body.symptoms : [body.symptoms].filter(Boolean),
      attempts: body.attempts || [],
      root_cause: body.root_cause || '',
      solutions: body.solutions || [],
      verification: body.verification || {
        verified_by: 'Author',
        verified_at: 'Today',
        environment: 'Production',
        version: '1.0',
        confirmation_count: 0
      },
      tags: body.tags || ['Community'],
      author: body.author || { username: 'madnan', display_name: 'Adnan Sultan' },
      helpful_votes: 1,
      created_at: 'Just now',
      discussions: []
    };

    problems.unshift(newProblem);
    writeProblems(problems);

    return NextResponse.json({ success: true, data: newProblem }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
