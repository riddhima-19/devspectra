// src/pages/GenerateSRS.jsx — Standalone SRS + Project Plan generator (matches screenshot)
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AppLayout from '../components/layout/AppLayout';
import MermaidDiagram from '../components/MermaidDiagram';
import api from '../api/axios';

const TABS = ['SRS Document', 'Project Plan', 'Gantt Chart'];

export default function GenerateSRS() {
  const [form, setForm] = useState({
    name: '', purpose: '', scope: '', targetUsers: '',
    features: '', techStack: '', timeline: '', teamSize: '',
  });
  const [activeTab,  setActiveTab]  = useState(0);
  const [loading,    setLoading]    = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [srsResult,  setSrsResult]  = useState('');
  const [planResult, setPlanResult] = useState(null);
  const [generated,  setGenerated]  = useState(false);
  const [errors,     setErrors]     = useState({});

  const update = f => e => setForm(prev => ({ ...prev, [f]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name        = 'Project name is required';
    if (!form.purpose.trim())     e.purpose     = 'Purpose is required';
    if (!form.targetUsers.trim()) e.targetUsers = 'Target users is required';
    if (!form.features.trim())    e.features    = 'Key features are required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGenerateSRS = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post('/srs/generate', form);
      setSrsResult(res.data.srs);
      setGenerated(true);
      setActiveTab(0);
      toast.success(`SRS generated! (${res.data.wordCount?.toLocaleString()} words)`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate SRS. Check your API key.');
    } finally { setLoading(false); }
  };

  const handleGeneratePlan = async () => {
    if (!validate()) return;
    setLoadingPlan(true);
    try {
      const res = await api.post('/srs/project-plan', form);
      setPlanResult(res.data.plan);
      setGenerated(true);
      setActiveTab(1);
      toast.success('Project plan generated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate project plan.');
    } finally { setLoadingPlan(false); }
  };

  const handleGenerateAll = async () => {
    if (!validate()) return;
    setLoading(true);
    setLoadingPlan(true);
    try {
      const [srsRes, planRes] = await Promise.all([
        api.post('/srs/generate', form),
        api.post('/srs/project-plan', form),
      ]);
      setSrsResult(srsRes.data.srs);
      setPlanResult(planRes.data.plan);
      setGenerated(true);
      setActiveTab(0);
      toast.success('SRS and project plan generated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Generation failed. Check your API key.');
    } finally { setLoading(false); setLoadingPlan(false); }
  };

  const downloadSRS = () => {
    if (!srsResult) return;
    const blob = new Blob([srsResult], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `SRS_${form.name.replace(/\s+/g,'_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('SRS downloaded!');
  };

  const downloadPlanJSON = () => {
    if (!planResult) return;
    const blob = new Blob([JSON.stringify(planResult, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `ProjectPlan_${form.name.replace(/\s+/g,'_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Project plan downloaded!');
  };

  return (
    <AppLayout title="Generate SRS">
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Form card */}
        <div className="card" style={{ padding: 32, marginBottom: 24 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e2f0', margin: '0 0 6px' }}>SRS Document Generator</h2>
            <p style={{ fontSize: 14, color: '#8888a4', margin: 0 }}>
              Enter your project details to generate a comprehensive Software Requirements Specification
            </p>
          </div>

          {/* Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#c4c4d4', marginBottom: 6 }}>
                Project Name <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input className="input-field" placeholder="Enter project name"
                value={form.name} onChange={update('name')} />
              {errors.name && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#c4c4d4', marginBottom: 6 }}>
                Target Users <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input className="input-field" placeholder="e.g., Developers, Admins, End Users"
                value={form.targetUsers} onChange={update('targetUsers')} />
              {errors.targetUsers && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.targetUsers}</p>}
            </div>
          </div>

          {/* Purpose */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#c4c4d4', marginBottom: 6 }}>
              Purpose <span style={{ color: '#f87171' }}>*</span>
            </label>
            <textarea className="input-field" rows={3}
              placeholder="Describe the purpose and goals of your project..."
              value={form.purpose} onChange={update('purpose')}
              style={{ resize: 'vertical' }} />
            {errors.purpose && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.purpose}</p>}
          </div>

          {/* Scope */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#c4c4d4', marginBottom: 6 }}>Scope</label>
            <textarea className="input-field" rows={3}
              placeholder="Define the boundaries and limitations of the project..."
              value={form.scope} onChange={update('scope')} style={{ resize: 'vertical' }} />
          </div>

          {/* Key Features */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#c4c4d4', marginBottom: 6 }}>
              Key Features <span style={{ color: '#f87171' }}>*</span>
            </label>
            <textarea className="input-field" rows={4}
              placeholder="List key features (one per line) e.g.:&#10;User authentication&#10;Dashboard analytics&#10;Report generation&#10;API integration"
              value={form.features} onChange={update('features')} style={{ resize: 'vertical' }} />
            {errors.features && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.features}</p>}
          </div>

          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#c4c4d4', marginBottom: 6 }}>Tech Stack</label>
              <input className="input-field" placeholder="e.g., React, Node.js, MongoDB"
                value={form.techStack} onChange={update('techStack')} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#c4c4d4', marginBottom: 6 }}>Timeline</label>
              <input className="input-field" placeholder="e.g., 6 months"
                value={form.timeline} onChange={update('timeline')} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#c4c4d4', marginBottom: 6 }}>Team Size</label>
              <input className="input-field" placeholder="e.g., 3-5 developers"
                value={form.teamSize} onChange={update('teamSize')} />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}
              onClick={handleGenerateAll} disabled={loading || loadingPlan}>
              {(loading || loadingPlan) ? (
                <>
                  <svg className="animate-spin" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Generating…
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  Generate SRS Document + Project Plan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {generated && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Tab header */}
            <div style={{ display: 'flex', borderBottom: '1px solid #252535', marginBottom: 24 }}>
              {TABS.map((t, i) => (
                <button key={t} className={`tab-btn${activeTab === i ? ' active' : ''}`}
                  onClick={() => setActiveTab(i)}>{t}</button>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, paddingBottom: 8 }}>
                {srsResult && (
                  <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={downloadSRS}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download SRS
                  </button>
                )}
                {planResult && (
                  <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={downloadPlanJSON}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download Plan
                  </button>
                )}
              </div>
            </div>

            {/* Tab 0: SRS Document */}
            {activeTab === 0 && (
              <div className="card" style={{ padding: 32 }}>
                {srsResult ? (
                  <div className="prose-dark">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{srsResult}</ReactMarkdown>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8888a4' }}>
                    <p>SRS not generated yet. Click "Generate SRS Document + Project Plan"</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 1: Project Plan */}
            {activeTab === 1 && planResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Overview */}
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#e2e2f0', margin: '0 0 16px' }}>Project Overview</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {[
                      { label: 'Duration',    value: planResult.duration || 'N/A' },
                      { label: 'Phases',      value: planResult.phases?.length || 0 },
                      { label: 'Team Roles',  value: planResult.resources?.length || 0 },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 22, fontWeight: 700, color: '#3b82f6', margin: '0 0 4px' }}>{s.value}</p>
                        <p style={{ fontSize: 12, color: '#8888a4', margin: 0 }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phases */}
                {planResult.phases?.map((phase, i) => (
                  <div key={i} className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e2e2f0', margin: 0 }}>
                        Phase {i + 1}: {phase.name}
                      </h3>
                      <span className="badge">{phase.duration}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <p style={{ fontSize: 12, color: '#8888a4', margin: '0 0 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tasks</p>
                        {phase.tasks?.map((task, j) => (
                          <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: '#c4c4d4' }}>{task.name}</span>
                            <span style={{ fontSize: 11, color: '#8888a4', marginLeft: 'auto' }}>{task.duration}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p style={{ fontSize: 12, color: '#8888a4', margin: '0 0 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deliverables</p>
                        {phase.deliverables?.map((d, j) => (
                          <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <svg width="12" height="12" fill="none" stroke="#4ade80" strokeWidth="2.5" viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            <span style={{ fontSize: 13, color: '#c4c4d4' }}>{d}</span>
                          </div>
                        ))}
                        {phase.milestones?.map((m, j) => (
                          <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <svg width="12" height="12" fill="#fbbf24" viewBox="0 0 24 24">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            <span style={{ fontSize: 13, color: '#fbbf24' }}>{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Risks */}
                {planResult.risks?.length > 0 && (
                  <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e2e2f0', margin: '0 0 16px' }}>Risk Register</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {planResult.risks.map((risk, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', background: '#111118', borderRadius: 8, alignItems: 'flex-start' }}>
                          <span className={`badge badge-${risk.probability === 'High' ? 'red' : risk.probability === 'Medium' ? 'amber' : 'green'}`}
                            style={{ flexShrink: 0 }}>{risk.probability}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, color: '#e2e2f0', margin: '0 0 4px', fontWeight: 500 }}>{risk.risk}</p>
                            <p style={{ fontSize: 12, color: '#8888a4', margin: 0 }}>Mitigation: {risk.mitigation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources */}
                {planResult.resources?.length > 0 && (
                  <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e2e2f0', margin: '0 0 16px' }}>Team Resources</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                      {planResult.resources.map((r, i) => (
                        <div key={i} style={{ padding: '14px 16px', background: '#111118', borderRadius: 8, border: '1px solid #252535' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e2f0', margin: 0 }}>{r.role}</p>
                            <span className="badge">×{r.count}</span>
                          </div>
                          {r.responsibilities?.slice(0, 2).map((resp, j) => (
                            <p key={j} style={{ fontSize: 11, color: '#8888a4', margin: '2px 0' }}>• {resp}</p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Gantt Chart */}
            {activeTab === 2 && (
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e2e2f0', margin: '0 0 20px' }}>Project Timeline — Gantt Chart</h3>
                {planResult?.ganttChart ? (
                  <>
                    <MermaidDiagram code={planResult.ganttChart} title="Project Gantt Chart" />
                    <details style={{ marginTop: 16 }}>
                      <summary style={{ cursor: 'pointer', fontSize: 13, color: '#8888a4' }}>View Mermaid source</summary>
                      <pre style={{ background: '#111118', border: '1px solid #252535', borderRadius: 8, padding: 16, marginTop: 8, fontSize: 12, color: '#c4c4d4', overflow: 'auto' }}>
                        {planResult.ganttChart}
                      </pre>
                    </details>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8888a4' }}>
                    <p>Generate a project plan first to see the Gantt chart</p>
                    <button className="btn-primary" style={{ marginTop: 16 }} onClick={handleGeneratePlan} disabled={loadingPlan}>
                      {loadingPlan ? 'Generating…' : 'Generate Project Plan'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
