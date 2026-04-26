// src/pages/CodeAnalysis.jsx — Direct code paste & analyze (no project needed)
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AppLayout from '../components/layout/AppLayout';
import MermaidDiagram from '../components/MermaidDiagram';
import api from '../api/axios';

const TECH_OPTS = ['JavaScript','TypeScript','Python','Java','C++','C#','Go','Ruby','PHP','Rust','Swift','Kotlin'];
const TABS = ['Summary','Metrics','Code Quality','Construction','UML Diagrams','Test Cases'];

function MetricRow({ label, value, sub }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #1e1e2e' }}>
      <div>
        <span style={{ fontSize: 13, color: '#c4c4d4' }}>{label}</span>
        {sub && <span style={{ fontSize: 11, color: '#3a3a55', marginLeft: 6 }}>{sub}</span>}
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#3b82f6', fontFamily: 'monospace' }}>
        {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : (value ?? '—')}
      </span>
    </div>
  );
}

function IssueItem({ issue, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      style={{ border: '1px solid #252535', borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
      <div onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', cursor: 'pointer' }}>
        <span className={`severity-${issue.severity}`} style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
          {issue.severity}
        </span>
        <span style={{ flex: 1, fontSize: 13, color: '#e2e2f0', fontWeight: 500 }}>{issue.title}</span>
        {issue.line && <span style={{ fontSize: 11, color: '#8888a4' }}>Line {issue.line}</span>}
        <svg width="14" height="14" fill="none" stroke="#8888a4" strokeWidth="2" viewBox="0 0 24 24"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      {open && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid #1e1e2e' }}>
          <p style={{ fontSize: 13, color: '#8888a4', marginTop: 10 }}>{issue.description}</p>
          {issue.suggestion && (
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 600, flexShrink: 0 }}>Fix:</span>
              <p style={{ fontSize: 12, color: '#8888a4', margin: 0 }}>{issue.suggestion}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function ScoreRing({ score, size = 72 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const prog = ((score || 0) / 100) * circ;
  const col  = score >= 80 ? '#4ade80' : score >= 60 ? '#60a5fa' : score >= 40 ? '#fbbf24' : '#f87171';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#252535" strokeWidth="6"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="6"
        strokeDasharray={`${prog} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        fontSize="15" fontWeight="700" fill={col}>{score || 0}</text>
    </svg>
  );
}

export default function CodeAnalysis() {
  const [code,       setCode]       = useState('');
  const [language,   setLanguage]   = useState('');
  const [loading,    setLoading]    = useState('');
  const [result,     setResult]     = useState(null);
  const [activeTab,  setActiveTab]  = useState(0);
  const [activeUml,  setActiveUml]  = useState(0);

  const runFullAnalysis = async () => {
    if (!code.trim()) return toast.error('Please paste your code first');
    setLoading('full');
    setResult(null);
    try {
      // We create a temporary project and immediately analyse it
      const projRes = await api.post('/projects', (() => {
        const fd = new FormData();
        fd.append('title',      'Quick Analysis ' + new Date().toLocaleTimeString());
        fd.append('sourceCode', code);
        if (language) fd.append('techStack', JSON.stringify([language]));
        return fd;
      })(), { headers: { 'Content-Type': 'multipart/form-data' } });

      const projectId = projRes.data.project._id;
      const runRes    = await api.post(`/analysis/run/${projectId}`);
      const analysisId = runRes.data.analysisId;

      toast('Analysing… this takes 1-3 minutes', { icon: '🤖', duration: 6000 });

      // Poll until done
      let analysis = null;
      for (let i = 0; i < 72; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const statusRes = await api.get(`/analysis/status/${analysisId}`);
        if (statusRes.data.status === 'completed') {
          const aRes = await api.get(`/analysis/${analysisId}`);
          analysis = aRes.data.analysis;
          break;
        }
        if (statusRes.data.status === 'failed') {
          throw new Error(statusRes.data.errorMessage || 'Analysis failed');
        }
      }
      if (!analysis) throw new Error('Analysis timed out');
      setResult(analysis);
      setActiveTab(0);
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.message || 'Analysis failed');
    } finally { setLoading(''); }
  };

  const m  = result?.metrics        || {};
  const hal = m.halstead             || {};
  const cc  = m.cyclomaticComplexity || {};
  const oo  = m.oo                   || {};

  return (
    <AppLayout title="Code Analysis">
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Input panel */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#e2e2f0', margin: '0 0 3px' }}>Paste Your Code</h2>
              <p style={{ fontSize: 13, color: '#8888a4', margin: 0 }}>Paste any code to get instant AI-powered analysis</p>
            </div>
            <select className="input-field" style={{ width: 160 }} value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="">Auto-detect</option>
              {TECH_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <textarea className="input-field" rows={14} value={code} onChange={e => setCode(e.target.value)}
            placeholder="// Paste your code here...&#10;function example() {&#10;  return 'Hello World';&#10;}"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, resize: 'vertical' }} />
          {code && (
            <p style={{ fontSize: 12, color: '#3a3a55', marginTop: 6 }}>
              {code.split('\n').length} lines · {code.length.toLocaleString()} chars
            </p>
          )}
          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}
              onClick={runFullAnalysis} disabled={!!loading || !code.trim()}>
              {loading === 'full' ? (
                <>
                  <svg className="animate-spin" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Analysing… (1-3 min)
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  Run Full Analysis (Metrics + UML + SRS)
                </>
              )}
            </button>
            {code && <button className="btn-secondary" onClick={() => setCode('')}>Clear</button>}
          </div>
        </div>

        {/* Results */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #252535', marginBottom: 24 }}>
              {TABS.map((t, i) => (
                <button key={t} className={`tab-btn${activeTab === i ? ' active' : ''}`} onClick={() => setActiveTab(i)}>{t}</button>
              ))}
            </div>

            {/* Tab 0: Summary */}
            {activeTab === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Score cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                  {[
                    { label: 'Quality Score',    score: result.codeQuality?.score },
                    { label: 'Maintainability',  score: result.codeQuality?.maintainability },
                    { label: 'Readability',       score: result.codeQuality?.readability },
                    { label: 'Testability',       score: result.codeQuality?.testability },
                  ].map(({ label, score }) => (
                    <div key={label} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <ScoreRing score={score} size={72} />
                      <p style={{ fontSize: 12, color: '#8888a4', textAlign: 'center', margin: 0 }}>{label}</p>
                    </div>
                  ))}
                </div>
                {/* Summary text */}
                {result.summary && (
                  <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 14, color: '#8888a4', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Summary</h3>
                    <p style={{ fontSize: 14, color: '#c4c4d4', lineHeight: 1.7, margin: 0 }}>{result.summary}</p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                      {result.language && <span className="badge">{result.language}</span>}
                      {result.frameworks?.map(f => <span key={f} className="badge badge-purple">{f}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 1: Metrics */}
            {activeTab === 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 13, color: '#8888a4', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Size Metrics</h3>
                  <MetricRow label="LOC"              value={m.loc} />
                  <MetricRow label="SLOC"             value={m.sloc} />
                  <MetricRow label="Blank Lines"      value={m.blankLines} />
                  <MetricRow label="Comment Lines"    value={m.commentLines} />
                  <MetricRow label="Comment Ratio"    value={m.commentRatio != null ? `${m.commentRatio.toFixed(1)}%` : null} />
                  <MetricRow label="Functions"        value={m.functionCount} />
                  <MetricRow label="Avg Fn Length"    value={m.avgFunctionLength} />
                </div>
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 13, color: '#8888a4', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Halstead</h3>
                  <MetricRow label="Vocabulary (η)"   value={hal.vocabulary} />
                  <MetricRow label="Length (N)"        value={hal.length} />
                  <MetricRow label="Volume (V)"        value={hal.volume?.toFixed(1)} />
                  <MetricRow label="Difficulty (D)"   value={hal.difficulty?.toFixed(2)} />
                  <MetricRow label="Effort (E)"        value={hal.effort?.toFixed(0)} />
                  <MetricRow label="Time (hrs)"        value={hal.timeToProgram != null ? (hal.timeToProgram/3600).toFixed(2) : null} />
                  <MetricRow label="Est. Bugs"         value={hal.bugs?.toFixed(3)} />
                </div>
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 13, color: '#8888a4', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>OO Metrics</h3>
                  <MetricRow label="Classes"           value={oo.classCount} />
                  <MetricRow label="Avg Methods/Class" value={oo.avgMethodsPerClass?.toFixed(1)} />
                  <MetricRow label="DIT"               value={oo.depthOfInheritanceTree} />
                  <MetricRow label="CBO"               value={oo.couplingBetweenClasses} />
                  <MetricRow label="LCOM"              value={oo.lackOfCohesionInMethods?.toFixed(2)} />
                  <MetricRow label="WMC"               value={oo.weightedMethodsPerClass?.toFixed(1)} />
                  <MetricRow label="RFC"               value={oo.responsesForClass?.toFixed(1)} />
                </div>
                {/* Cyclomatic Complexity */}
                {cc.perFunction?.length > 0 && (
                  <div className="card" style={{ padding: 20, gridColumn: '1 / -1' }}>
                    <h3 style={{ fontSize: 13, color: '#8888a4', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Cyclomatic Complexity — Avg: {cc.average?.toFixed(1)} · Max: {cc.max}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {cc.perFunction.slice(0, 12).map((fn, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#c4c4d4', width: 180, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fn.name}</span>
                          <div style={{ flex: 1, height: 6, background: '#1e1e2e', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, (fn.complexity / (cc.max || 1)) * 100)}%`, height: '100%', borderRadius: 3, background: fn.complexity > 10 ? '#f87171' : fn.complexity > 5 ? '#fbbf24' : '#4ade80' }} />
                          </div>
                          <span style={{ fontSize: 12, fontFamily: 'monospace', width: 24, textAlign: 'right', color: fn.complexity > 10 ? '#f87171' : fn.complexity > 5 ? '#fbbf24' : '#4ade80' }}>{fn.complexity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Code Quality */}
            {activeTab === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {[
                  { title: '🧪 Code Smells',        data: result.codeSmells,     key: 'smells' },
                  { title: '🔒 Security Issues',    data: result.securityIssues, key: 'security' },
                  { title: '⚡ Optimisations',      data: result.optimizations,  key: 'opt' },
                  { title: '🔧 Refactoring',         data: result.refactoring,    key: 'ref' },
                ].map(({ title, data, key }) => (
                  <div key={key}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e2e2f0', margin: '0 0 12px' }}>
                      {title} <span style={{ fontSize: 13, color: '#8888a4', fontWeight: 400 }}>({data?.length || 0})</span>
                    </h3>
                    {data?.length > 0
                      ? data.map((issue, i) => <IssueItem key={i} issue={issue} index={i} />)
                      : <p style={{ fontSize: 13, color: '#8888a4' }}>No issues found ✓</p>
                    }
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Construction */}
            {activeTab === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {result.construction?.codeChecklist?.length > 0 && (
                  <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e2e2f0', margin: '0 0 14px' }}>✅ Code Checklist</h3>
                    {result.construction.codeChecklist.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, padding: '9px 0', borderBottom: '1px solid #1e1e2e' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: item.passed ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          {item.passed
                            ? <svg width="10" height="10" fill="none" stroke="#4ade80" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                            : <svg width="10" height="10" fill="none" stroke="#f87171" strokeWidth="3" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          }
                        </div>
                        <div>
                          <p style={{ fontSize: 13, color: '#e2e2f0', margin: '0 0 2px' }}>{item.item}</p>
                          {item.note && <p style={{ fontSize: 12, color: '#8888a4', margin: 0 }}>{item.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  {[
                    { title: '💬 Review Suggestions', items: result.construction?.reviewSuggestions },
                    { title: '🔧 Refactoring Tips',   items: result.construction?.refactoringTips },
                    { title: '⚡ Optimisation Tips',  items: result.construction?.optimizationTips },
                  ].map(({ title, items }) => (
                    <div key={title} className="card" style={{ padding: 20 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 600, color: '#e2e2f0', margin: '0 0 12px' }}>{title}</h3>
                      {items?.length > 0
                        ? <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                            {items.map((item, i) => (
                              <li key={i} style={{ fontSize: 12, color: '#8888a4', marginBottom: 8, paddingLeft: 14, position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 0, color: '#3b82f6' }}>›</span>{item}
                              </li>
                            ))}
                          </ul>
                        : <p style={{ fontSize: 12, color: '#3a3a55' }}>None</p>
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: UML */}
            {activeTab === 4 && (
              <div style={{ display: 'flex', gap: 24 }}>
                <div style={{ width: 200, flexShrink: 0 }}>
                  {result.umlDiagrams?.map((d, i) => (
                    <button key={i} onClick={() => setActiveUml(i)}
                      style={{ width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, marginBottom: 4, background: activeUml === i ? 'rgba(59,130,246,0.15)' : 'transparent', color: activeUml === i ? '#60a5fa' : '#8888a4', transition: 'all 0.15s' }}>
                      {d.title}
                    </button>
                  ))}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {result.umlDiagrams?.[activeUml] && (
                    <>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#e2e2f0', marginBottom: 16 }}>
                        {result.umlDiagrams[activeUml].title}
                      </h3>
                      <MermaidDiagram code={result.umlDiagrams[activeUml].mermaid} />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Tab 5: Test Cases */}
            {activeTab === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {result.testCases?.length > 0
                  ? result.testCases.map((tc, i) => (
                      <div key={i} className="card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <p style={{ fontSize: 14, fontWeight: 500, color: '#e2e2f0', margin: 0 }}>{tc.description}</p>
                          <span className="badge badge-purple">{tc.type}</span>
                        </div>
                        {tc.code && (
                          <pre style={{ background: '#111118', border: '1px solid #252535', borderRadius: 8, padding: 14, fontSize: 12, color: '#c4c4d4', overflow: 'auto', margin: 0 }}>
                            <code>{tc.code}</code>
                          </pre>
                        )}
                      </div>
                    ))
                  : <p style={{ color: '#8888a4', fontSize: 14 }}>No test cases generated</p>
                }
              </div>
            )}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
