/**
 * Main Application Runtime for Hunt Prototype
 * State management and view router mirroring Next.js client-side navigation
 */

import { mockProblems, mockCurrentUser, mockMcpLogs } from './data/mockData.js';
import { renderHeader } from './components/uiComponents.js';
import { 
  renderFeedView, 
  renderDetailView, 
  renderCreateView, 
  renderMcpView, 
  renderOnboardingView, 
  renderProfileView 
} from './views/viewModules.js';

class HuntAppRuntime {
  constructor() {
    this.currentScreen = 'feed';
    this.problems = [...mockProblems];
    this.currentProblem = this.problems[0];
    this.currentUser = mockCurrentUser;
    this.mcpLogs = [...mockMcpLogs];
    this.currentTagFilter = 'all';
    this.searchQuery = '';
  }

  init() {
    this.render();
  }

  navigate(screenId) {
    if (screenId === 'auth') {
      window.location.href = 'index.html';
      return;
    }
    this.currentScreen = screenId;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openProblemDetail(problemId) {
    const found = this.problems.find(p => p.id === problemId);
    if (found) {
      this.currentProblem = found;
      this.navigate('detail');
    }
  }

  setTagFilter(tag, buttonEl) {
    this.currentTagFilter = tag;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (buttonEl) buttonEl.classList.add('active');
    this.applyFilters();
  }

  filterProblems(query) {
    this.searchQuery = query.toLowerCase();
    this.applyFilters();
  }

  applyFilters() {
    let filtered = this.problems;
    if (this.currentTagFilter !== 'all') {
      filtered = filtered.filter(p => p.tags.includes(this.currentTagFilter));
    }
    if (this.searchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(this.searchQuery) ||
        p.symptoms.toLowerCase().includes(this.searchQuery) ||
        p.tags.some(t => t.toLowerCase().includes(this.searchQuery))
      );
    }

    const mount = document.getElementById('problem-list-mount');
    if (mount) {
      mount.innerHTML = filtered.map(p => window.HuntAppComponents.renderProblemCard(p)).join('');
    }
  }

  handleCreateProblem(e) {
    e.preventDefault();
    const title = document.getElementById('new-title').value;
    const env = document.getElementById('new-env').value;
    const symptoms = document.getElementById('new-symptoms').value;
    const attempts = document.getElementById('new-attempts').value;
    const rootcause = document.getElementById('new-rootcause').value;
    const solution = document.getElementById('new-solution').value;

    const newProblem = {
      id: Math.floor(Math.random() * 9000) + 1000,
      title,
      context: env,
      environment: { runtime: env },
      symptoms,
      tags: ["Community", "Investigating"],
      author: {
        username: this.currentUser.username,
        display_name: this.currentUser.display_name,
        avatar_initials: "MS"
      },
      status: "investigating",
      confirmations_count: 0,
      helpful_votes: 1,
      created_at: "Just now",
      failed_attempts: attempts ? [{ attempt: attempts, result: "Failed", reason: "Identified as dead end" }] : [],
      root_cause: rootcause || "Under investigation",
      solutions: solution ? [{
        id: "sol_user",
        title: "Initial Proposed Solution",
        status: "Proposed",
        code: solution,
        why_it_works: "Author proposed fix",
        confirmations: 0
      }] : []
    };

    this.problems.unshift(newProblem);
    this.currentProblem = newProblem;
    this.showToast("Problem documented and published!");
    this.navigate('detail');
  }

  simulateMcpCall() {
    const time = new Date().toTimeString().split(' ')[0];
    const log = {
      time,
      agent: "Claude-Agent",
      type: "tool_call",
      tool: "hunt_find_failed_attempts",
      args: { problem_id: 4821 },
      response: "200 OK: Injected 3 failed paths to avoid repeat debugging cycles."
    };
    this.mcpLogs.push(log);
    this.showToast("MCP tool executed by agent");
    if (this.currentScreen === 'mcp') {
      this.render();
    }
  }

  showToast(message) {
    const toast = document.getElementById('toast-popup');
    const msg = document.getElementById('toast-msg');
    if (toast && msg) {
      msg.textContent = message;
      toast.classList.add('visible');
      setTimeout(() => toast.classList.remove('visible'), 2600);
    }
  }

  render() {
    const appHeaderMount = document.getElementById('header-mount');
    const appViewMount = document.getElementById('view-mount');

    if (appHeaderMount) {
      appHeaderMount.innerHTML = renderHeader(this.currentScreen);
    }

    if (appViewMount) {
      switch (this.currentScreen) {
        case 'feed':
          appViewMount.innerHTML = renderFeedView(this.problems);
          break;
        case 'detail':
          appViewMount.innerHTML = renderDetailView(this.currentProblem);
          break;
        case 'create':
          appViewMount.innerHTML = renderCreateView();
          break;
        case 'mcp':
          appViewMount.innerHTML = renderMcpView(this.mcpLogs);
          break;
        case 'onboarding':
          appViewMount.innerHTML = renderOnboardingView();
          break;
        case 'profile':
          appViewMount.innerHTML = renderProfileView(this.currentUser);
          break;
        default:
          appViewMount.innerHTML = renderFeedView(this.problems);
      }
    }
  }
}

// Bootstrap runtime onto window object
window.HuntApp = new HuntAppRuntime();
document.addEventListener('DOMContentLoaded', () => {
  window.HuntApp.init();
});
