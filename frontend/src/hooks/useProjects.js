// src/hooks/useProjects.js — Custom hook for project management
import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { projectsAPI } from '../api/services';

/**
 * useProjects — fetches and manages the user's project list.
 *
 * @param {object} options — { autoLoad: bool, initialFilter: string }
 */
export default function useProjects({ autoLoad = true, limit = 50 } = {}) {
  const [projects,  setProjects]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [error,     setError]     = useState(null);

  // ── Fetch projects ───────────────────────────────────────────────
  const load = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectsAPI.list({ page, limit, ...params });
      setProjects(res.data.projects);
      setTotal(res.data.total);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load projects';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    if (autoLoad) load();
  }, [autoLoad, load]);

  // ── Delete project ───────────────────────────────────────────────
  const remove = useCallback(async (id) => {
    try {
      await projectsAPI.delete(id);
      setProjects(prev => prev.filter(p => p._id !== id));
      setTotal(prev => prev - 1);
      toast.success('Project deleted');
      return true;
    } catch {
      toast.error('Failed to delete project');
      return false;
    }
  }, []);

  // ── Update local project status (e.g. after analysis starts) ────
  const updateLocal = useCallback((id, updates) => {
    setProjects(prev =>
      prev.map(p => p._id === id ? { ...p, ...updates } : p)
    );
  }, []);

  // ── Prepend a newly created project ─────────────────────────────
  const prepend = useCallback((project) => {
    setProjects(prev => [project, ...prev]);
    setTotal(prev => prev + 1);
  }, []);

  return { projects, loading, total, page, setPage, error, load, remove, updateLocal, prepend };
}
