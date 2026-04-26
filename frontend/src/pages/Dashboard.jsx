// src/pages/Dashboard.jsx — matches screenshot design exactly
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import { projectsAPI } from '../api/services';

const STATUS_DOT = {
  draft:     { color: '#8888a4', label: 'Draft' },
  analyzing: { color: '#fbbf24', label: 'Analysing' },
  completed: { color: '#4ade80', label: 'Complete' },
  failed:    { color: '#f87171', label: 'Failed' },
};

const TECH_COLORS = {
  React:      '#60a5fa', 'Node.js': '#4ade80', Python: '#fbbf24',
  JavaScript: '#fbbf24', TypeScript: '#60a5fa', Java: '#f87171',
  Vue: '#4ade80', Angular: '#f87171', Django: '#4ade80', Flask: '#c084fc',
};

function ProjectCard({ project, index, onDelete }) {
  const navigate  = useNavigate();
  const mainTech  = project.techStack?.[0] || '';
  const badgeColor = TECH_COLORS[mainTech] || '#8888a4';
  const status    = STATUS_DOT[project.status] || STATUS_DOT.draft;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="card"
      style={{ padding: 24, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12 }}
      onClick={() => navigate(`/projects/${project._id}`)}
    >
      {/* Title + badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#e2e2f0', margin: 0, lineHeight: 1.3 }}>
          {project.title}
        </h3>
        {mainTech && (
          <span style={{
            padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, flexShrink: 0,
            background: `${badgeColor}22`, color: badgeColor,
          }}>{mainTech}</span>
        )}
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: '#8888a4', margin: 0, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {project.description || 'No description provided.'}
      </p>

      {/* Date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#3a3a55' }}>
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        Created {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: status.color, display: 'inline-block' }} />
          <span style={{ color: status.color }}>{status.label}</span>
        </span>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #252535', marginTop: 4 }} />

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
        <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '7px 10px' }}
          onClick={() => navigate(`/projects/${project._id}`)}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M10 20l4-16M6 9l-4 4 4 4M18 9l4 4-4 4"/>
          </svg>
          Analyze
        </button>
        <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '7px 10px' }}
          onClick={() => navigate(project.status === 'completed' ? `/projects/${project._id}/analysis` : `/projects/${project._id}`)}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          SRS
        </button>
        <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '7px 10px' }}
          onClick={() => navigate(project.status === 'completed' ? `/projects/${project._id}/analysis` : `/projects/${project._id}`)}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          Report
        </button>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const navigate     = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectsAPI.list({ limit: 50 });
      setProjects(res.data.projects || []);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = projects.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Dashboard">
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#e2e2f0', margin: '0 0 4px' }}>My Projects</h2>
          <p style={{ fontSize: 13, color: '#8888a4', margin: 0 }}>Manage and analyze your code projects</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/projects/new')}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Project
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 400 }}>
        <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#3a3a55', pointerEvents: 'none' }}
          width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input className="input-field" style={{ paddingLeft: 38 }} placeholder="Search projects…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Projects', value: projects.length, color: '#3b82f6' },
          { label: 'Completed',      value: projects.filter(p => p.status === 'completed').length, color: '#4ade80' },
          { label: 'In Progress',    value: projects.filter(p => p.status === 'analyzing').length, color: '#fbbf24' },
          { label: 'Draft',          value: projects.filter(p => p.status === 'draft').length, color: '#8888a4' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
            <p style={{ fontSize: 12, color: '#8888a4', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Projects grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 240 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
          <h3 style={{ color: '#e2e2f0', marginBottom: 8 }}>{projects.length === 0 ? 'No projects yet' : 'No matching projects'}</h3>
          <p style={{ color: '#8888a4', marginBottom: 24, fontSize: 14 }}>
            {projects.length === 0 ? 'Create your first project to start AI-powered analysis' : 'Try a different search term'}
          </p>
          {projects.length === 0 && (
            <button className="btn-primary" onClick={() => navigate('/projects/new')}>Create First Project</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filtered.map((p, i) => <ProjectCard key={p._id} project={p} index={i} />)}
        </div>
      )}
    </AppLayout>
  );
}
