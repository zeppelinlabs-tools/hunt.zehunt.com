'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RoleGate from '@/components/RoleGate';

interface AgentLog {
  timestamp?: string;
  time?: string;
  agent: string;
  type: string;
  tool?: string;
  args?: Record<string, unknown>;
  response?: string;
  message?: string;
}

export default function AgentGatewayPage() {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  useEffect(() => {
    fetch('/api/mcp')
      .then(res => res.json())
      .then(d => {
        if (d.success && d.audit) setLogs(d.audit);
      })
      .catch(console.error);
  }, []);

  const handleSimulateCall = async () => {
    const res = await fetch('/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hunt-API-Key': 'hunt_sk_live_demo_982'
      },
      body: JSON.stringify({
        tool: 'hunt_find_failed_attempts',
        args: { problem_id: 4821 },
        agent: 'Claude-Desktop'
      })
    });
    const result = await res.json();
    if (result.result) {
      setLogs(prev => [
        ...prev,
        {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          agent: 'Claude-Desktop',
          type: 'tool_call',
          tool: 'hunt_find_failed_attempts',
          args: { problem_id: 4821 },
          response: result.result.data
        }
      ]);
      showToast('Agent query executed over http://hunt.zehunt.com/mcp');
    }
  };

  return (
    <RoleGate allow={['developer', 'admin']} title="Agent gateway">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#171717]">
              AI Agent Platform &amp; Live Audit
            </h1>
            <p className="text-base text-[#525252] mt-1">
              Model Context Protocol (MCP) gateway connecting autonomous coding tools (Claude, Cursor, Kiro) to Hunt&apos;s verified problem knowledge.
            </p>
          </div>
          <button
            onClick={handleSimulateCall}
            className="px-5 py-2.5 bg-[#2563eb] text-white hover:bg-[#1d4ed8] text-sm font-semibold rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-2 shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Simulate Agent Tool Query
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Terminal log view */}
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl overflow-hidden shadow-xl flex flex-col">
            <div className="bg-[#18181b] px-5 py-3 border-b border-[#27272a] flex justify-between items-center text-sm font-mono text-[#a1a1aa]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                <div className="w-3 h-3 rounded-full bg-[#eab308]"></div>
                <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
              </div>
              <div className="text-xs">hunt-mcp-gateway // live agent session</div>
              <div className="text-[#34d399] font-bold text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse"></span>
                CONNECTED
              </div>
            </div>

            <div className="p-6 font-mono text-sm text-[#e4e4e7] space-y-4 max-h-[600px] overflow-y-auto">
              {logs.map((log, idx) => (
                <div key={idx} className="leading-relaxed border-b border-[#27272a]/50 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#71717a] text-xs">[{log.timestamp || log.time}]</span>
                    <span className="bg-[#27272a] px-2 py-0.5 rounded text-[#fbbf24] text-xs font-semibold">
                      {log.agent}
                    </span>
                  </div>
                  {log.type === 'tool_call' ? (
                    <div className="space-y-1">
                      <div className="text-[#60a5fa] font-bold">
                        &rarr; {log.tool} <span className="text-[#f472b6] font-normal text-xs">{JSON.stringify(log.args)}</span>
                      </div>
                      <div className="text-[#34d399] bg-[#18181b] p-3 rounded-lg text-xs leading-relaxed mt-1">
                        {log.response}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[#a1a1aa]">{log.message}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Controls */}
          <div className="space-y-5">
            <div className="bg-white border border-[#e5e5e5] p-5 rounded-2xl text-sm space-y-3 shadow-xs">
              <h3 className="font-bold uppercase tracking-wider text-[#737373] text-xs">
                HTTP MCP Endpoint
              </h3>
              <p className="text-xs text-[#525252]">Access endpoint with header authorization:</p>
              <pre className="bg-[#18181b] text-[#38bdf8] p-3.5 rounded-xl font-mono text-xs select-all leading-relaxed">
Endpoint: http://hunt.zehunt.com/mcp
Header:   X-Hunt-API-Key: hunt_sk_live...
              </pre>
            </div>

            <div className="bg-white border border-[#e5e5e5] p-5 rounded-2xl text-sm space-y-3.5 shadow-xs">
              <h3 className="font-bold uppercase tracking-wider text-[#737373] text-xs">
                Agent Access Permissions (M14)
              </h3>
              <p className="text-xs text-[#525252]">Granular permissions granted to your connected developer agents:</p>
              <div className="space-y-2.5 text-sm">
                <label className="flex items-center gap-2.5 text-[#171717]">
                  <input type="checkbox" defaultChecked disabled className="rounded text-[#2563eb]" />
                  <span><strong>knowledge:read</strong> (Search &amp; retrieve)</span>
                </label>
                <label className="flex items-center gap-2.5 text-[#171717]">
                  <input type="checkbox" defaultChecked disabled className="rounded text-[#2563eb]" />
                  <span><strong>attempts:read</strong> (Read dead-ends)</span>
                </label>
                <label className="flex items-center gap-2.5 text-[#171717]">
                  <input type="checkbox" defaultChecked className="rounded text-[#2563eb]" />
                  <span><strong>knowledge:write</strong> (Draft solutions)</span>
                </label>
              </div>
            </div>

            <div className="bg-white border border-[#e5e5e5] p-5 rounded-2xl text-sm space-y-3 shadow-xs">
              <h3 className="font-bold uppercase tracking-wider text-[#737373] text-xs">
                Connected Agents (M15)
              </h3>
              <div className="border-b border-[#f5f5f5] pb-2.5">
                <div className="font-bold text-[#171717]">Cursor Coding Agent</div>
                <div className="text-xs text-[#737373] mt-0.5">Active via stdio &bull; Last query: 2m ago</div>
              </div>
              <div className="border-b border-[#f5f5f5] pb-2.5">
                <div className="font-bold text-[#171717]">Claude Desktop MCP</div>
                <div className="text-xs text-[#737373] mt-0.5">Local transport &bull; Ready</div>
              </div>
              <div>
                <div className="font-bold text-[#171717]">Kiro Autonomous Worker</div>
                <div className="text-xs text-[#737373] mt-0.5">Idle</div>
              </div>
            </div>

            <div className="bg-white border border-[#e5e5e5] p-4 rounded-xl text-sm">
              <Link href="/settings/sessions" className="text-[#2563eb] font-semibold hover:underline flex items-center justify-between">
                <span>Manage Security Tokens &amp; Sessions</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

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
