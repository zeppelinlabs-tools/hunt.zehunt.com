/**
 * Views for Hunt Prototype
 * Translates directly to Next.js App Router Page components:
 * - /app/page.tsx (Feed)
 * - /app/problems/[id]/page.tsx (Detail)
 * - /app/problems/new/page.tsx (Contribute)
 * - /app/mcp/page.tsx (MCP Gateway)
 * - /app/onboarding/page.tsx (Onboarding)
 * - /app/profile/page.tsx (Profile)
 */

import { renderProblemCard, renderFailedAttempt, renderSolution } from '../components/uiComponents.js';

export function renderFeedView(problems) {
  return `
    <div class="search-panel">
      <div class="search-input-group">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-muted);">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" id="feed-search-input" placeholder="Search error messages, environment (e.g. Next.js Supabase 401), symptoms or root causes..." oninput="window.HuntApp.filterProblems(this.value)">
        <span class="badge-tag mono">⌘K</span>
      </div>

      <div class="search-filters-row">
        <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: var(--text-muted); margin-right: 4px;">Filter By:</span>
        <button class="filter-btn active" onclick="window.HuntApp.setTagFilter('all', this)">All Frameworks</button>
        <button class="filter-btn" onclick="window.HuntApp.setTagFilter('Next.js 15', this)">Next.js 15</button>
        <button class="filter-btn" onclick="window.HuntApp.setTagFilter('Neon DB', this)">Neon Postgres</button>
        <button class="filter-btn" onclick="window.HuntApp.setTagFilter('Supabase SSR', this)">Supabase SSR</button>
        <button class="filter-btn" onclick="window.HuntApp.setTagFilter('MCP', this)">MCP Protocol</button>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h2 style="font-size: 15px; font-weight: 600; color: var(--text-primary);">
        Verified Investigations <span class="badge-tag mono" style="margin-left: 6px;">${problems.length} problems loaded</span>
      </h2>
      <div style="font-size: 12px; color: var(--text-muted);">
        Sort: <strong>Verified First</strong>
      </div>
    </div>

    <div class="problem-list" id="problem-list-mount">
      ${problems.map(p => renderProblemCard(p)).join('')}
    </div>
  `;
}

export function renderDetailView(problem) {
  if (!problem) return `<div>Problem not found</div>`;

  return `
    <div style="margin-bottom: 20px;">
      <a href="javascript:void(0)" onclick="window.HuntApp.navigate('feed')" style="font-size: 12px; color: var(--accent); text-decoration: none; font-weight: 600;">← Back to Discover</a>
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-top: 8px;">
        <div>
          <h1 class="page-title">${problem.title}</h1>
          <p class="page-subtitle" style="margin-bottom: 8px;">
            Problem #${problem.id} • Documented by <strong>@${problem.author.username}</strong> • ${problem.created_at}
          </p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="filter-btn" onclick="window.HuntApp.showToast('Problem bookmarked')">★ Bookmark</button>
          <button class="filter-btn" onclick="window.HuntApp.showToast('Helpful vote recorded (+1)')">▲ Useful (${problem.helpful_votes})</button>
        </div>
      </div>

      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${problem.tags.map(t => `<span class="badge-tag">${t}</span>`).join('')}
        <span class="badge-tag verified">✓ Verified (${problem.confirmations_count} Confirmations)</span>
      </div>
    </div>

    <div class="detail-grid">
      <div class="detail-main">
        <!-- Environment & Symptoms -->
        <div class="structured-section">
          <div class="structured-header">
            <span>Environment & Symptoms</span>
            <span class="mono">M04 — Context</span>
          </div>
          <div class="structured-content">
            <p><strong>Stack Context:</strong> ${problem.context}</p>
            <div class="code-block">${JSON.stringify(problem.environment, null, 2)}</div>
            <p><strong>Symptoms:</strong> ${problem.symptoms}</p>
          </div>
        </div>

        <!-- M06 Failed Attempts -->
        <div class="structured-section" style="border-color: #fed7aa;">
          <div class="structured-header" style="background: #fff7ed; color: #9a3412;">
            <span>Failed Attempts & Dead Ends (Avoid Repeating)</span>
            <span class="mono">M06 — Investigation</span>
          </div>
          <div class="structured-content">
            ${problem.failed_attempts.map(a => renderFailedAttempt(a)).join('')}
          </div>
        </div>

        <!-- Root Cause -->
        <div class="structured-section">
          <div class="structured-header">
            <span>Verified Root Cause</span>
            <span class="mono">Investigation Conclusion</span>
          </div>
          <div class="structured-content">
            <p>${problem.root_cause}</p>
          </div>
        </div>

        <!-- Solutions -->
        <div class="structured-section" style="border: none;">
          ${problem.solutions.map(s => renderSolution(s)).join('')}
        </div>

        <!-- Discussion -->
        <div class="structured-section">
          <div class="structured-header">
            <span>Developer Discussion (${problem.discussions?.length || 0} Entries)</span>
            <span class="mono">M08 — Community</span>
          </div>
          <div class="structured-content">
            ${(problem.discussions || []).map(d => `
              <div style="border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                  <span><strong>@${d.author}</strong> • ${d.time_ago}</span>
                  <span class="badge-tag verified">Confirmed Fix</span>
                </div>
                <p style="font-size: 13px;">${d.content}</p>
              </div>
            `).join('')}

            <div style="display: flex; gap: 8px;">
              <input type="text" class="form-input" placeholder="Add technical experience, alternative approach or clarification...">
              <button class="btn-primary" style="width: auto; padding: 0 16px;" onclick="window.HuntApp.showToast('Comment submitted')">Post</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Sidebar -->
      <div class="detail-sidebar">
        <div class="sidebar-widget">
          <h3>Verification Provenance (M07)</h3>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between;">
              <span class="mono">Author Verified:</span>
              <span style="color: var(--success); font-weight: 600;">Yes</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="mono">Confirmations:</span>
              <strong>${problem.confirmations_count} developers</strong>
            </div>
          </div>
        </div>

        <div class="sidebar-widget">
          <h3>AI Agent Retrieval (M13)</h3>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">
            AI coding agents can query this structured solution directly via MCP.
          </p>
          <div class="code-block" style="font-size: 11px;">
hunt_get_problem({
  id: ${problem.id},
  include_failed_attempts: true
})
          </div>
          <button class="filter-btn" style="width: 100%; text-align: center; margin-top: 8px;" onclick="window.HuntApp.navigate('mcp')">
            Inspect MCP Gateway →
          </button>
        </div>
      </div>
    </div>
  `;
}

export function renderCreateView() {
  return `
    <div class="form-container">
      <h1 class="page-title">Document a Problem & Investigation</h1>
      <p class="page-subtitle">Preserve what failed, what succeeded, and make your engineering experience reusable for developers & AI agents.</p>

      <form onsubmit="window.HuntApp.handleCreateProblem(event)">
        <div class="form-row">
          <label class="form-label">Problem Title</label>
          <input type="text" id="new-title" class="form-input" placeholder="e.g. Next.js 15 Turbopack memory leak on dynamic route generation" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;" class="form-row">
          <div>
            <label class="form-label">Framework / Environment</label>
            <input type="text" id="new-env" class="form-input" placeholder="e.g. Next.js 15.0, PostgreSQL Neon, Node 22" required>
          </div>
          <div>
            <label class="form-label">Deployment / OS Context</label>
            <input type="text" id="new-deploy" class="form-input" placeholder="e.g. Vercel, Docker Linux">
          </div>
        </div>

        <div class="form-row">
          <label class="form-label">Error Message / Symptoms</label>
          <textarea id="new-symptoms" class="form-textarea" placeholder="Paste exact error log trace or observed failure behavior..." required></textarea>
        </div>

        <div class="form-row">
          <label class="form-label" style="color: #9a3412;">Failed Attempts (Dead ends to warn others about)</label>
          <textarea id="new-attempts" class="form-textarea" style="border-color: #fed7aa; background: #fffcf9;" placeholder="What did you try that did NOT work? e.g. Upgraded package version, rotated keys..."></textarea>
          <div class="form-help">Critical Hunt feature (M06): prevents AI agents from repeating wasted debugging loops.</div>
        </div>

        <div class="form-row">
          <label class="form-label">Verified Root Cause</label>
          <textarea id="new-rootcause" class="form-textarea" placeholder="Why did this problem actually happen?"></textarea>
        </div>

        <div class="form-row">
          <label class="form-label">Solution & Verification</label>
          <textarea id="new-solution" class="form-textarea" placeholder="Provide the code or configuration fix, trade-offs, and how you verified it in production..."></textarea>
        </div>

        <div class="form-row">
          <div class="secret-scan-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Module M16 Secret Scanner: 0 API Keys, DB URLs or JWT tokens detected
          </div>
        </div>

        <div style="display: flex; gap: 12px; margin-top: 24px;">
          <button type="submit" class="btn-primary" style="width: auto; padding: 0 24px;">Publish to Knowledge Base</button>
          <button type="button" class="btn-secondary" style="width: auto; padding: 0 16px;" onclick="window.HuntApp.showToast('Draft saved')">Save Draft</button>
        </div>
      </form>
    </div>
  `;
}

export function renderMcpView(logs) {
  return `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
      <div>
        <h1 class="page-title">MCP Agent Gateway & Live Audit (M13-M15)</h1>
        <p class="page-subtitle">Inspect how Claude Desktop, Cursor, and Kiro interact with Hunt knowledge services via Model Context Protocol.</p>
      </div>
      <button class="filter-btn active" onclick="window.HuntApp.simulateMcpCall()">Run Agent Simulation Call</button>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 320px; gap: 24px;">
      <div>
        <div class="mcp-terminal-card">
          <div class="mcp-bar">
            <div class="mcp-window-controls">
              <div class="control-dot"></div>
              <div class="control-dot"></div>
              <div class="control-dot"></div>
            </div>
            <div>hunt-mcp-gateway // stdio transport</div>
            <div class="mono" style="color: #34d399;">● CONNECTED</div>
          </div>

          <div class="mcp-log-stream" id="mcp-stream">
            ${logs.map(log => `
              <div>
                <span class="mono" style="color: #71717a;">[${log.time}]</span>
                <span class="mcp-tag-agent">${log.agent}</span>
                ${log.type === 'tool_call' ? `<span class="mcp-tool-call">→ ${log.tool}</span>(${JSON.stringify(log.args)})` : log.message}
              </div>
              ${log.response ? `<div style="color: #34d399; margin-bottom: 8px;">← ${log.response}</div>` : ''}
            `).join('')}
          </div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div class="sidebar-widget">
          <h3>Module M14 — Agent Permissions</h3>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">
            Granular permission gating. Human approval required for all write operations.
          </p>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
              <input type="checkbox" checked disabled> <strong>knowledge:read</strong> (Search & retrieve)
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
              <input type="checkbox" checked> <strong>attempts:read</strong> (Skip failed paths)
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
              <input type="checkbox"> <strong>knowledge:write</strong> (Draft creation)
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
              <input type="checkbox"> <strong>community:confirm</strong> (Verify fixes)
            </label>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderOnboardingView() {
  return `
    <div class="wizard-card">
      <span class="badge-tag mono">Module M02 // Wizard</span>
      <h1 class="page-title" style="margin-top: 8px;">Personalize Your Knowledge Stream</h1>
      <p class="page-subtitle">Configure your engineering stacks and failure domains so Hunt delivers high-signal problem matches.</p>

      <div style="margin-bottom: 24px;">
        <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">1. What do you build?</h4>
        <div class="chip-grid">
          <button class="chip-btn selected" onclick="this.classList.toggle('selected')">Web</button>
          <button class="chip-btn selected" onclick="this.classList.toggle('selected')">Backend</button>
          <button class="chip-btn" onclick="this.classList.toggle('selected')">AI / ML</button>
          <button class="chip-btn selected" onclick="this.classList.toggle('selected')">Cloud / DevOps</button>
          <button class="chip-btn" onclick="this.classList.toggle('selected')">Mobile</button>
          <button class="chip-btn" onclick="this.classList.toggle('selected')">Databases</button>
        </div>
      </div>

      <div style="margin-bottom: 24px;">
        <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">2. Problem Domains Encountered</h4>
        <div class="chip-grid">
          <button class="chip-btn selected" onclick="this.classList.toggle('selected')">Authentication</button>
          <button class="chip-btn selected" onclick="this.classList.toggle('selected')">Deployment</button>
          <button class="chip-btn" onclick="this.classList.toggle('selected')">Performance</button>
          <button class="chip-btn selected" onclick="this.classList.toggle('selected')">Postgres / Neon</button>
          <button class="chip-btn" onclick="this.classList.toggle('selected')">AI / LLM Ops</button>
          <button class="chip-btn" onclick="this.classList.toggle('selected')">Memory Leaks</button>
        </div>
      </div>

      <button class="btn-primary" style="width: 100%;" onclick="window.HuntApp.showToast('Preferences saved!'); window.HuntApp.navigate('feed');">
        Complete Onboarding
      </button>
    </div>
  `;
}

export function renderProfileView(user) {
  return `
    <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px;">
        <div style="display: flex; gap: 20px;">
          <div style="width: 72px; height: 72px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700;">
            MS
          </div>
          <div>
            <h1 class="page-title">${user.display_name}</h1>
            <div class="mono" style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">@${user.username} • hunt.dev/@${user.username}</div>
            <p style="font-size: 13px; color: var(--text-secondary); max-width: 560px;">
              Staff Software Engineer. Building distributed AI systems, Next.js architecture, and database infrastructure.
            </p>
          </div>
        </div>
        <button class="filter-btn" onclick="window.HuntApp.navigate('auth')">Manage Account & Security →</button>
      </div>

      <div style="display: flex; gap: 32px; border-top: 1px solid var(--border); margin-top: 24px; padding-top: 16px;">
        <div>
          <div style="font-size: 20px; font-weight: 700;">${user.stats.problems_count}</div>
          <div style="font-size: 12px; color: var(--text-muted);">Problems Logged</div>
        </div>
        <div>
          <div style="font-size: 20px; font-weight: 700;">${user.stats.solutions_count}</div>
          <div style="font-size: 12px; color: var(--text-muted);">Verified Solutions</div>
        </div>
        <div>
          <div style="font-size: 20px; font-weight: 700;">${user.stats.confirmations_count}</div>
          <div style="font-size: 12px; color: var(--text-muted);">Confirmations</div>
        </div>
        <div>
          <div style="font-size: 20px; font-weight: 700;">${user.stats.connected_agents_count}</div>
          <div style="font-size: 12px; color: var(--text-muted);">Connected AI Agents</div>
        </div>
      </div>
    </div>
  `;
}
