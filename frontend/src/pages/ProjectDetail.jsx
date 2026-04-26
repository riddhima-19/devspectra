// src/pages/ProjectDetail.jsx — Project page with live analysis progress
// (Uses useAnalysis hook, AnalysisProgress component, ConfirmModal, CodeViewer)
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { projectsAPI } from '../api/services';
import useAnalysis from '../hooks/useAnalysis';
import useDashboardStore from '../store/dashboardStore';
import PageLayout from '../components/layout/PageLayout';
import AnalysisProgress from '../components/AnalysisProgress';
import ConfirmModal from '../components/ConfirmModal';
import CodeViewer from '../components/CodeViewer';
import { Button, Card, StatCard, Spinner, ScoreRing } from '../components/ui';
import { fmtDate, fmtRelative, fmtNumber, scoreLabel, scoreColorClass } from '../utils/formatters';

function StatusPill({ status }) {
  const cfg = {
    draft:     { label: 'Draft',     cls: 'bg-ds-muted/20 text-ds-muted border-ds-muted/30' },
    analyzing: { label: 'Analysing', cls: 'bg-ds-amber/15 text-ds-amber border-ds-amber/30' },
    completed: { label: 'Complete',  cls: 'bg-ds-green/15 text-ds-green border-ds-green/30' },
    failed:    { label: 'Failed',    cls: 'bg-ds-red/15 text-ds-red border-ds-red/30' },
  }[status] || { label: status, cls: '' };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

export default function ProjectDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const invalidate = useDashboardStore(s => s.invalidate);
  const [project,    setProject]    = useState(null);
  const [analysis,   setAnalysis]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [showCode,   setShowCode]   = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await projectsAPI.get(id);
      setProject(res.data.project);
      setAnalysis(res.data.analysis || null);
    } catch {
      toast.error('Failed to load project');
      navigate('/dashboard');
    } finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  const { run, running, statusMsg, progress } = useAnalysis(id, (done) => {
    setAnalysis(done);
    setProject(p => p ? { ...p, status: 'completed' } : p);
    invalidate();
  });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await projectsAPI.delete(id);
      toast.success('Project deleted');
      invalidate();
      navigate('/dashboard');
    } catch {
      toast.error('Failed to delete project');
      setDeleting(false);
      setShowDelete(false);
    }
  };

  const allCode = project
    ? [project.sourceCode, ...(project.files||[]).map(f=>`// ── ${f.originalName} ──\n${f.content||''}`)].filter(Boolean).join('\n\n')
    : '';

  if (loading) return <PageLayout><div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg"/></div></PageLayout>;
  if (!project) return null;

  const hasAnalysis = analysis?.status === 'completed';
  const score = analysis?.codeQuality?.score;

  return (
    <PageLayout>
      <div className="py-8 max-w-4xl mx-auto space-y-6">
        <motion.nav initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex items-center gap-2 text-sm text-ds-muted">
          <Link to="/dashboard" className="hover:text-ds-text transition-colors">Dashboard</Link>
          <span className="text-ds-faint">/</span>
          <span className="text-ds-text truncate max-w-xs">{project.title}</span>
        </motion.nav>

        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-2xl font-display font-bold text-ds-text">{project.title}</h1>
                  <StatusPill status={project.status} />
                </div>
                {project.description && <p className="text-sm text-ds-muted mb-3 leading-relaxed">{project.description}</p>}
                {project.techStack?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.techStack.map(t => (
                      <span key={t} className="px-2.5 py-0.5 bg-ds-accent/10 text-ds-accent text-xs rounded-md border border-ds-accent/20 font-medium">{t}</span>
                    ))}
                  </div>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-ds-muted hover:text-ds-accent transition-colors mb-3">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    {project.githubUrl.replace('https://','')}
                  </a>
                )}
                <p className="text-xs text-ds-faint">
                  Created {fmtDate(project.createdAt)} · Updated {fmtRelative(project.updatedAt)}
                  {project.analysisCount > 0 && ` · ${project.analysisCount} analyses`}
                </p>
              </div>
              <div className="flex flex-col gap-2 items-end flex-shrink-0">
                {hasAnalysis && (
                  <div className="flex flex-col items-center mb-1">
                    <ScoreRing score={score} size={72} />
                    <p className={`text-xs mt-1 font-medium ${scoreColorClass(score)}`}>{scoreLabel(score)}</p>
                  </div>
                )}
                <div className="flex flex-col gap-2 w-36">
                  {!running && (
                    <Button onClick={run} className="w-full" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}>
                      {hasAnalysis ? 'Re-Analyse' : 'Run Analysis'}
                    </Button>
                  )}
                  {hasAnalysis && !running && (
                    <Button variant="secondary" className="w-full" onClick={() => navigate(`/projects/${id}/analysis`)}>View Report →</Button>
                  )}
                  {allCode && (
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowCode(v => !v)}>
                      {showCode ? 'Hide Code' : 'View Code'}
                    </Button>
                  )}
                  <Button variant="danger" size="sm" className="w-full" onClick={() => setShowDelete(true)}>Delete</Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {running && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
            <AnalysisProgress progress={progress} statusMsg={statusMsg} />
          </motion.div>
        )}

        {hasAnalysis && !running && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-display font-semibold text-ds-text">Analysis Snapshot</h2>
              <span className="text-xs text-ds-muted">{fmtRelative(analysis.createdAt)}{analysis.processingTime && ` · ${(analysis.processingTime/1000).toFixed(1)}s`}</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <StatCard label="Quality Score" value={`${score??'—'}/100`} color="accent" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}/>
              <StatCard label="Lines of Code" value={fmtNumber(analysis.metrics?.loc)} color="cyan" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>}/>
              <StatCard label="Issues" value={fmtNumber((analysis.codeSmells?.length||0)+(analysis.securityIssues?.length||0))} color="amber" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>}/>
              <StatCard label="UML Diagrams" value={fmtNumber(analysis.umlDiagrams?.length)} color="pink" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343"/></svg>}/>
            </div>
            {analysis.summary && (
              <Card className="p-4 mb-4">
                <p className="text-xs text-ds-muted uppercase tracking-wider mb-2">AI Summary</p>
                <p className="text-sm text-ds-text leading-relaxed">{analysis.summary}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {analysis.language && <span className="px-2 py-0.5 bg-ds-accent/10 text-ds-accent text-xs rounded border border-ds-accent/20">{analysis.language}</span>}
                  {(analysis.frameworks||[]).map(f => <span key={f} className="px-2 py-0.5 bg-ds-cyan/10 text-ds-cyan text-xs rounded border border-ds-cyan/20">{f}</span>)}
                </div>
              </Card>
            )}
            <Button variant="outline" className="w-full" onClick={() => navigate(`/projects/${id}/analysis`)}>Open Full Analysis Report →</Button>
          </motion.div>
        )}

        {!hasAnalysis && !running && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}>
            <Card className="p-10 text-center border-dashed border-ds-border/60">
              <div className="w-16 h-16 rounded-2xl bg-ds-accent/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-ds-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <h3 className="text-lg font-display font-semibold text-ds-text mb-2">Ready for AI Analysis</h3>
              <p className="text-sm text-ds-muted max-w-sm mx-auto mb-6">Click "Run Analysis" to get metrics, code quality report, 9 UML diagrams, and a complete IEEE 830 SRS document.</p>
              <Button onClick={run} size="lg">Run AI Analysis</Button>
            </Card>
          </motion.div>
        )}

        {showCode && allCode && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-display font-semibold text-ds-text">Source Code</h2>
              <button onClick={() => setShowCode(false)} className="text-xs text-ds-muted hover:text-ds-text transition-colors">Hide ↑</button>
            </div>
            <CodeViewer code={allCode} language={analysis?.language||'javascript'} maxHeight="480px" />
          </motion.div>
        )}
      </div>

      <ConfirmModal
        open={showDelete}
        title="Delete Project"
        message={`Delete "${project.title}" and all its analyses permanently? This cannot be undone.`}
        confirmLabel="Delete Project"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </PageLayout>
  );
}
