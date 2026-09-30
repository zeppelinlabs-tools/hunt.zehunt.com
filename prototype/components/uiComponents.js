/**
 * Reusable UI Components
 * Corresponds to React components in Next.js:
 * - <Navbar />
 * - <ProblemCard problem={...} />
 * - <FailedAttemptCard attempt={...} />
 * - <SolutionCard solution={...} />
 */

export function renderHeader(activeScreen) {
  const tabs = [
    { id: 'feed', badge: 'M04/M10', label: 'Knowledge Feed' },
    { id: 'detail', badge: 'M04-M07', label: 'Problem & Solution' },
    { id: 'create', badge: 'M04/M16', label: 'Contribute Problem' },
    { id: 'mcp', badge: 'M13-M15', label: 'MCP Agent Platform' },
    { id: 'onboarding', badge: 'M02', label: 'Onboarding' },
    { id: 'profile', badge: 'M03/M12', label: 'Developer Profile' },
    { id: 'auth', badge: 'M01', label: 'Auth Module' }
  ];

  return `
    <header class="app-header">
      <div class="top-meta-bar">
        <div>
          <span>hunt.zehunt.com</span> &nbsp;•&nbsp; <span>MCP Protocol: Active</span> &nbsp;•&nbsp; <span>Database: Neon PostgreSQL</span>
        </div>
        <div>
          <span>Model: Human + Claude / Cursor / Kiro Gateway</span>
        </div>
      </div>

      <div class="main-nav-bar">
        <div class="brand-section" onclick="window.HuntApp.navigate('feed')">
          <div class="brand-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          Hunt
        </div>

        <nav class="module-nav">
          ${tabs.map(t => `
            <button class="module-tab ${activeScreen === t.id ? 'active' : ''}" onclick="window.HuntApp.navigate('${t.id}')">
              <span class="badge">${t.badge}</span> ${t.label}
            </button>
          `).join('')}
        </nav>

        <div class="header-actions">
          <button class="btn-primary" style="height: 32px; font-size: 12px; padding: 0 12px;" onclick="window.HuntApp.navigate('create')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Document Problem
          </button>
          <div class="user-pill" onclick="window.HuntApp.navigate('profile')">
            <div class="avatar-circle">MS</div>
            <span style="font-weight: 600;">@madnan</span>
          </div>
        </div>
      </div>
    </header>
  `;
}

export function renderProblemCard(problem) {
  const isVerified = problem.status === 'verified';
  return `
    <article class="problem-card" onclick="window.HuntApp.openProblemDetail(${problem.id})">
      <div class="problem-card-top">
        <h3 class="problem-card-title">${problem.title}</h3>
        <span class="badge-tag ${isVerified ? 'verified' : 'danger'}">
          ${isVerified ? `✓ Verified (${problem.confirmations_count} Confirmations)` : 'Investigating'}
        </span>
      </div>

      <div class="problem-card-meta">
        ${problem.tags.map((tag, idx) => `
          <span class="badge-tag ${idx === 0 ? 'accent' : ''}">${tag}</span>
        `).join('')}
        <span>•</span>
        <span>Documented by <strong>@${problem.author.username}</strong></span>
        <span>•</span>
        <span>${problem.created_at}</span>
      </div>

      <div class="symptom-quote">
        "${problem.symptoms}"
      </div>

      <div class="problem-card-footer">
        <div style="display: flex; gap: 16px;">
          <span><strong>${problem.failed_attempts.length}</strong> Failed attempts documented</span>
          <span><strong>${problem.solutions.length}</strong> Solutions</span>
          <span><strong>${problem.helpful_votes}</strong> Helpful votes</span>
        </div>
        <div class="mono" style="font-size: 11px; color: var(--accent);">
          MCP available: hunt_get_problem(#${problem.id}) →
        </div>
      </div>
    </article>
  `;
}

export function renderFailedAttempt(attempt) {
  return `
    <div class="attempt-card">
      <div class="attempt-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        ${attempt.attempt}
      </div>
      <div class="attempt-reason">
        <strong>Result:</strong> ${attempt.result}. ${attempt.reason}
      </div>
    </div>
  `;
}

export function renderSolution(solution) {
  return `
    <div class="solution-card">
      <div class="solution-header">
        <div>
          <strong style="color: var(--success); font-size: 14px;">${solution.title}</strong>
          <div style="font-size: 11px; color: var(--text-secondary);">${solution.status}</div>
        </div>
        <button class="btn-primary" style="height: 32px; padding: 0 12px; font-size: 11px;" onclick="window.HuntApp.showToast('Solution verified for your project!')">
          Confirm This Worked For Me
        </button>
      </div>
      <div class="structured-content">
        <div class="code-block">${escapeHtml(solution.code)}</div>
        <div style="margin-top: 14px; font-size: 12.5px;">
          <strong>Why this works:</strong> ${solution.why_it_works}
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
