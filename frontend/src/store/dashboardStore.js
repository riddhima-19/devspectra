// src/store/dashboardStore.js — Dashboard analytics state
import { create } from 'zustand';
import { analysisAPI, projectsAPI } from '../api/services';

const useDashboardStore = create((set, get) => ({
  // ── State ────────────────────────────────────────────────────────
  projects:       [],
  analyses:       [],
  loading:        false,
  lastFetched:    null,

  // ── Derived stats ─────────────────────────────────────────────────
  get stats() {
    const { projects, analyses } = get();
    const completed = projects.filter(p => p.status === 'completed').length;
    const avgScore  = analyses.length
      ? Math.round(analyses.reduce((s, a) => s + (a.codeQuality?.score || 0), 0) / analyses.length)
      : null;
    const totalLoc  = analyses.reduce((s, a) => s + (a.metrics?.loc || 0), 0);
    const issueCount = analyses.reduce(
      (s, a) => s + (a.codeSmells?.length || 0) + (a.securityIssues?.length || 0), 0
    );

    return {
      totalProjects:  projects.length,
      completed,
      avgQualityScore: avgScore,
      totalAnalyses:  analyses.length,
      totalLoc,
      totalIssues:    issueCount,
    };
  },

  // ── Actions ────────────────────────────────────────────────────────
  load: async (force = false) => {
    const { lastFetched } = get();
    // Cache for 60s unless forced
    if (!force && lastFetched && Date.now() - lastFetched < 60_000) return;

    set({ loading: true });
    try {
      const [projRes, anRes] = await Promise.all([
        projectsAPI.list({ limit: 100 }),
        analysisAPI.listAll(),
      ]);
      set({
        projects:    projRes.data.projects,
        analyses:    anRes.data.analyses,
        loading:     false,
        lastFetched: Date.now(),
      });
    } catch {
      set({ loading: false });
    }
  },

  // Called after a project is created or deleted
  invalidate: () => set({ lastFetched: null }),

  // Optimistic update for a single project's status
  updateProjectStatus: (id, status) => {
    set(state => ({
      projects: state.projects.map(p => p._id === id ? { ...p, status } : p),
    }));
  },
}));

export default useDashboardStore;
