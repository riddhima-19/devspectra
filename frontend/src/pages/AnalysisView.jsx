// src/pages/AnalysisView.jsx — Full analysis report with tabbed sections
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import toast from 'react-hot-toast';
import { analysisAPI, exportAPI, triggerDownload } from '../api/services';
import PageLayout from '../components/layout/PageLayout';
import MermaidDiagram from '../components/MermaidDiagram';
import {
  Button, Card, Badge, Spinner, ScoreRing, TabBar, ProgressBar,
  SeverityBadge, IssueCard, SectionHeader,
} from '../components/ui';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const TABS = [
  { id: 'overview',      label: 'Overview',      icon: '📊' },
  { id: 'metrics',       label: 'Metrics',        icon: '📐' },
  { id: 'quality',       label: 'Code Quality',   icon: '🔍' },
  { id: 'construction',  label: 'Construction',   icon: '🏗️' },
  { id: 'uml',           label: 'UML Diagrams',   icon: '📌' },
  { id: 'srs',           label: 'SRS Document',   icon: '📄' },
];

export default function AnalysisView() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [analysis, setAnalysis]   = useState(null);
  const [project,  setProject]    = useState(null);
  const [loading,  setLoading]    = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [exporting, setExporting] = useState(null); // 'pdf' | 'json' | 'md'
  const [activeUml, setActiveUml] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await analysisAPI.getByProject(id);
      setAnalysis(res.data.analysis);
      // Optionally load project details
    } catch {
      toast.error('Failed to load analysis');
      navigate(`/projects/${id}`);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  // ── Export handlers ───────────────────────────────────────────────
  const handleExport = async (type) => {
    if (!analysis) return;
    setExporting(type);
    try {
      if (type === 'pdf') {
        const res = await exportAPI.downloadSrsPdf(analysis._id);
        triggerDownload(res.data, `SRS_${Date.now()}.pdf`);
        toast.success('PDF downloaded');
      } else if (type === 'json') {
        const res = await exportAPI.downloadReportJson(analysis._id);
        triggerDownload(res.data, `Report_${Date.now()}.json`);
        toast.success('JSON report downloaded');
      } else if (type === 'md') {
        const res = await exportAPI.downloadSrsMd(analysis._id);
        triggerDownload(res.data, `SRS_${Date.now()}.md`);
        toast.success('Markdown SRS downloaded');
      }
    } catch {
      toast.error(`Failed to export ${type.toUpperCase()}`);
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <p className="text-ds-muted text-sm">Loading analysis report…</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!analysis || analysis.status !== 'completed') {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-ds-muted">No completed analysis found.</p>
        </div>
      </PageLayout>
    );
  }

  const tabCounts = {
    quality:      (analysis.codeSmells?.length || 0) + (analysis.securityIssues?.length || 0),
    uml:           analysis.umlDiagrams?.length || 0,
  };

  return (
    <PageLayout>
      <div className="py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <nav className="flex items-center gap-2 text-sm text-ds-muted mb-4">
            <Link to="/dashboard" className="hover:text-ds-text transition-colors">Dashboard</Link>
            <span>/</span>
            <Link to={`/projects/${id}`} className="hover:text-ds-text transition-colors">Project</Link>
            <span>/</span>
            <span className="text-ds-text">Analysis Report</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-ds-text">Analysis Report</h1>
              <p className="text-sm text-ds-muted mt-1">
                {analysis.language && <span className="text-ds-accent">{analysis.language}</span>}
                {analysis.frameworks?.length > 0 && (
                  <span> · {analysis.frameworks.join(', ')}</span>
                )}
                {analysis.processingTime && (
                  <span> · Analysed in {(analysis.processingTime / 1000).toFixed(1)}s</span>
                )}
              </p>
            </div>
            {/* Export buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button variant="secondary" size="sm" loading={exporting === 'json'} onClick={() => handleExport('json')}
                icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>}>
                JSON Report
              </Button>
              <Button variant="secondary" size="sm" loading={exporting === 'md'} onClick={() => handleExport('md')}
                icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}>
                SRS Markdown
              </Button>
              <Button size="sm" loading={exporting === 'pdf'} onClick={() => handleExport('pdf')}
                icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>}>
                Download PDF
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <TabBar
          tabs={TABS.map(t => ({
            ...t,
            count: tabCounts[t.id],
            icon: <span className="text-base leading-none">{t.icon}</span>,
          }))}
          active={activeTab}
          onChange={setActiveTab}
        />

        {/* Tab content */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview'     && <OverviewTab     a={analysis} />}
              {activeTab === 'metrics'      && <MetricsTab      a={analysis} />}
              {activeTab === 'quality'      && <QualityTab      a={analysis} />}
              {activeTab === 'construction' && <ConstructionTab a={analysis} />}
              {activeTab === 'uml'          && <UMLTab          a={analysis} activeUml={activeUml} setActiveUml={setActiveUml} />}
              {activeTab === 'srs'          && <SRSTab          a={analysis} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageLayout>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────
function OverviewTab({ a }) {
  const radarData = {
    labels: ['Maintainability', 'Readability', 'Testability', 'Security', 'Performance', 'Quality'],
    datasets: [{
      label: 'Code Quality',
      data: [
        a.codeQuality?.maintainability || 0,
        a.codeQuality?.readability     || 0,
        a.codeQuality?.testability     || 0,
        Math.max(0, 100 - (a.securityIssues?.length || 0) * 10),
        Math.max(0, 100 - (a.optimizations?.length || 0) * 5),
        a.codeQuality?.score           || 0,
      ],
      backgroundColor: 'rgba(108, 99, 255, 0.2)',
      borderColor:     'rgba(108, 99, 255, 0.8)',
      pointBackgroundColor: '#6c63ff',
      borderWidth: 2,
    }],
  };

  const radarOptions = {
    responsive: true,
    scales: {
      r: {
        beginAtZero: true, max: 100,
        ticks:       { color: '#8888a4', font: { size: 10 }, stepSize: 25 },
        grid:        { color: '#252535' },
        pointLabels: { color: '#8888a4', font: { size: 11 } },
      },
    },
    plugins: { legend: { display: false } },
  };

  return (
    <div className="space-y-6">
      {/* Score cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Quality', score: a.codeQuality?.score,           color: '#6c63ff' },
          { label: 'Maintainability', score: a.codeQuality?.maintainability, color: '#00d4ff' },
          { label: 'Readability',     score: a.codeQuality?.readability,     color: '#00e676' },
          { label: 'Testability',     score: a.codeQuality?.testability,     color: '#e94560' },
        ].map(({ label, score }) => (
          <Card key={label} className="p-5 flex flex-col items-center">
            <ScoreRing score={score} size={80} />
            <p className="text-xs text-ds-muted mt-2 text-center">{label}</p>
          </Card>
        ))}
      </div>

      {/* Summary + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {a.summary && (
          <Card className="p-5">
            <h3 className="text-sm font-medium text-ds-muted mb-3">Code Summary</h3>
            <p className="text-sm text-ds-text leading-relaxed">{a.summary}</p>
            {a.designPatterns?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-ds-muted mb-2">Design Patterns Detected</p>
                <div className="flex flex-wrap gap-2">
                  {a.designPatterns.map((dp, i) => (
                    <span key={i} className="px-2.5 py-1 bg-ds-accent/10 text-ds-accent text-xs rounded-lg border border-ds-accent/20">
                      {dp.pattern}
                      {dp.confidence && (
                        <span className="ml-1 text-ds-accent/60">{Math.round(dp.confidence * 100)}%</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}
        <Card className="p-5">
          <h3 className="text-sm font-medium text-ds-muted mb-3">Quality Radar</h3>
          <Radar data={radarData} options={radarOptions} />
        </Card>
      </div>

      {/* Issue summary */}
      <Card className="p-5">
        <h3 className="text-sm font-medium text-ds-muted mb-4">Issues Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Code Smells',    count: a.codeSmells?.length     || 0, color: 'amber' },
            { label: 'Security',       count: a.securityIssues?.length || 0, color: 'red'   },
            { label: 'Optimisations',  count: a.optimizations?.length  || 0, color: 'cyan'  },
            { label: 'Refactoring',    count: a.refactoring?.length    || 0, color: 'accent'},
          ].map(({ label, count, color }) => (
            <div key={label} className="text-center">
              <p className={`text-2xl font-display font-bold text-ds-${color}`}>{count}</p>
              <p className="text-xs text-ds-muted mt-1">{label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: METRICS
// ─────────────────────────────────────────────────────────────────────────────
function MetricsTab({ a }) {
  const m   = a.metrics || {};
  const hal = m.halstead || {};
  const cc  = m.cyclomaticComplexity || {};
  const oo  = m.oo || {};
  const ifm = m.informationFlow || {};

  const MetricRow = ({ label, value, sub }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-ds-border/50 last:border-0">
      <div>
        <p className="text-sm text-ds-text">{label}</p>
        {sub && <p className="text-xs text-ds-faint mt-0.5">{sub}</p>}
      </div>
      <span className="text-sm font-mono font-medium text-ds-accent">
        {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value ?? '—'}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Size metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-5">
          <h3 className="text-xs font-medium text-ds-muted uppercase tracking-wider mb-4">Size-Oriented Metrics</h3>
          <MetricRow label="Lines of Code (LOC)"          value={m.loc}           sub="Total lines"/>
          <MetricRow label="Source LOC (SLOC)"             value={m.sloc}          sub="Executable lines"/>
          <MetricRow label="Blank Lines"                   value={m.blankLines}    />
          <MetricRow label="Comment Lines"                 value={m.commentLines}  />
          <MetricRow label="Comment Ratio"                 value={m.commentRatio != null ? `${m.commentRatio.toFixed(1)}%` : null} />
          <MetricRow label="Functions"                     value={m.functionCount} />
          <MetricRow label="Avg Function Length"           value={m.avgFunctionLength} sub="Lines per function"/>
        </Card>

        <Card className="p-5">
          <h3 className="text-xs font-medium text-ds-muted uppercase tracking-wider mb-4">Halstead Metrics</h3>
          <MetricRow label="Vocabulary (η)"    value={hal.vocabulary}  sub="Unique operators + operands"/>
          <MetricRow label="Length (N)"        value={hal.length}      sub="Total operators + operands"/>
          <MetricRow label="Volume (V)"        value={hal.volume?.toFixed(1)}   sub="N × log2(η)"/>
          <MetricRow label="Difficulty (D)"    value={hal.difficulty?.toFixed(2)} sub="Ease of understanding"/>
          <MetricRow label="Effort (E)"        value={hal.effort?.toFixed(0)}   sub="Mental effort required"/>
          <MetricRow label="Time to Program"   value={hal.timeToProgram != null ? `${(hal.timeToProgram / 3600).toFixed(2)}h` : null} />
          <MetricRow label="Estimated Bugs"    value={hal.bugs?.toFixed(3)}  sub="Halstead bug prediction"/>
        </Card>

        <Card className="p-5">
          <h3 className="text-xs font-medium text-ds-muted uppercase tracking-wider mb-4">Object-Oriented Metrics</h3>
          <MetricRow label="Classes (NOC)"            value={oo.classCount}               />
          <MetricRow label="Avg Methods / Class"      value={oo.avgMethodsPerClass?.toFixed(1)} />
          <MetricRow label="Inheritance Depth (DIT)"  value={oo.depthOfInheritanceTree}   sub="Max inheritance chain"/>
          <MetricRow label="Coupling (CBO)"           value={oo.couplingBetweenClasses}   sub="Inter-class dependencies"/>
          <MetricRow label="LCOM"                     value={oo.lackOfCohesionInMethods?.toFixed(2)} sub="Cohesion of class"/>
          <MetricRow label="WMC"                      value={oo.weightedMethodsPerClass?.toFixed(1)} sub="Complexity per class"/>
          <MetricRow label="RFC"                      value={oo.responsesForClass?.toFixed(1)} sub="Responses for a class"/>
        </Card>
      </div>

      {/* Cyclomatic Complexity */}
      <Card className="p-5">
        <h3 className="text-xs font-medium text-ds-muted uppercase tracking-wider mb-4">Cyclomatic Complexity</h3>
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div className="flex items-center gap-4">
            <ScoreRing score={Math.max(0, 100 - (cc.average || 0) * 5)} size={64} />
            <div>
              <p className="text-xl font-display font-bold text-ds-text">{cc.average?.toFixed(1) || '—'}</p>
              <p className="text-xs text-ds-muted">Average complexity</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-ds-muted mb-1">Max complexity: <span className="text-ds-amber font-medium">{cc.max || '—'}</span></p>
            <ProgressBar value={cc.max || 0} max={30} color={cc.max > 20 ? 'red' : cc.max > 10 ? 'amber' : 'green'} />
          </div>
        </div>
        {cc.perFunction?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-ds-muted mb-3">Per-function breakdown</p>
            {cc.perFunction.slice(0, 12).map((fn, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-mono text-ds-text w-40 truncate flex-shrink-0">{fn.name}</span>
                <div className="flex-1">
                  <ProgressBar
                    value={fn.complexity} max={Math.max(...(cc.perFunction || []).map(f => f.complexity), 1)}
                    color={fn.complexity > 10 ? 'red' : fn.complexity > 5 ? 'amber' : 'green'}
                    showValue={false}
                  />
                </div>
                <span className={`text-xs font-mono w-6 text-right flex-shrink-0 ${fn.complexity > 10 ? 'text-ds-red' : fn.complexity > 5 ? 'text-ds-amber' : 'text-ds-green'}`}>
                  {fn.complexity}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Information flow */}
      <Card className="p-5">
        <h3 className="text-xs font-medium text-ds-muted uppercase tracking-wider mb-4">Information Flow Metrics</h3>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-display font-bold text-ds-accent">{ifm.fanIn ?? '—'}</p>
            <p className="text-xs text-ds-muted mt-1">Fan-In</p>
            <p className="text-xs text-ds-faint">Modules calling this</p>
          </div>
          <div>
            <p className="text-3xl font-display font-bold text-ds-cyan">{ifm.fanOut ?? '—'}</p>
            <p className="text-xs text-ds-muted mt-1">Fan-Out</p>
            <p className="text-xs text-ds-faint">Modules called by this</p>
          </div>
          <div>
            <p className="text-3xl font-display font-bold text-ds-pink">{ifm.ifMetric?.toFixed(2) ?? '—'}</p>
            <p className="text-xs text-ds-muted mt-1">IF Metric</p>
            <p className="text-xs text-ds-faint">length² × (fan-in × fan-out)²</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: CODE QUALITY
// ─────────────────────────────────────────────────────────────────────────────
function QualityTab({ a }) {
  const sections = [
    { key: 'codeSmells',     title: 'Code Smells',         icon: '🧪', data: a.codeSmells },
    { key: 'securityIssues', title: 'Security Issues',     icon: '🔒', data: a.securityIssues },
    { key: 'optimizations',  title: 'Optimisations',       icon: '⚡', data: a.optimizations },
    { key: 'refactoring',    title: 'Refactoring Suggestions', icon: '🔧', data: a.refactoring },
  ];

  return (
    <div className="space-y-8">
      {sections.map(({ key, title, icon, data }) => (
        <div key={key}>
          <SectionHeader
            title={`${icon} ${title}`}
            description={`${data?.length || 0} items found`}
          />
          {data?.length > 0 ? (
            <div className="space-y-3">
              {data.map((issue, i) => <IssueCard key={i} issue={issue} index={i} />)}
            </div>
          ) : (
            <Card className="p-5 text-center">
              <p className="text-sm text-ds-muted">No {title.toLowerCase()} detected ✓</p>
            </Card>
          )}
        </div>
      ))}

      {/* Test cases */}
      {a.testCases?.length > 0 && (
        <div>
          <SectionHeader title="🧪 Suggested Test Cases" description={`${a.testCases.length} test cases`}/>
          <div className="space-y-3">
            {a.testCases.map((tc, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-medium text-ds-text">{tc.description}</p>
                  <Badge variant="info">{tc.type}</Badge>
                </div>
                {tc.code && (
                  <pre className="bg-ds-bg border border-ds-border rounded-lg p-3 text-xs font-mono text-ds-muted overflow-x-auto">
                    {tc.code}
                  </pre>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: CONSTRUCTION
// ─────────────────────────────────────────────────────────────────────────────
function ConstructionTab({ a }) {
  const c = a.construction || {};

  return (
    <div className="space-y-8">
      {/* Code checklist */}
      {c.codeChecklist?.length > 0 && (
        <div>
          <SectionHeader title="✅ Code Checklist" description="Automated code review checklist"/>
          <Card className="divide-y divide-ds-border/50">
            {c.codeChecklist.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                  item.passed ? 'bg-ds-green/20' : 'bg-ds-red/20'
                }`}>
                  {item.passed ? (
                    <svg className="w-3 h-3 text-ds-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-ds-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ds-text">{item.item}</p>
                  {item.note && <p className="text-xs text-ds-muted mt-0.5">{item.note}</p>}
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* Coding standards */}
      {c.codingStandards?.length > 0 && (
        <div>
          <SectionHeader title="📏 Coding Standards" description={`${c.codingStandards.length} violations found`}/>
          <div className="space-y-3">
            {c.codingStandards.map((issue, i) => <IssueCard key={i} issue={issue} index={i} />)}
          </div>
        </div>
      )}

      {/* Review suggestions + tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { title: '💬 Review Suggestions', items: c.reviewSuggestions, color: 'accent' },
          { title: '🔧 Refactoring Tips',   items: c.refactoringTips,  color: 'cyan'   },
          { title: '⚡ Optimisation Tips',  items: c.optimizationTips, color: 'amber'  },
        ].map(({ title, items, color }) => (
          <Card key={title} className="p-5">
            <h3 className="text-sm font-medium text-ds-text mb-4">{title}</h3>
            {items?.length > 0 ? (
              <ul className="space-y-2.5">
                {items.map((item, i) => (
                  <li key={i} className={`flex gap-2.5 text-xs text-ds-muted leading-relaxed`}>
                    <span className={`text-ds-${color} flex-shrink-0 mt-0.5`}>›</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-ds-faint">No suggestions</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: UML DIAGRAMS
// ─────────────────────────────────────────────────────────────────────────────
function UMLTab({ a, activeUml, setActiveUml }) {
  const diagrams = a.umlDiagrams || [];

  if (!diagrams.length) {
    return (
      <Card className="p-8 text-center">
        <p className="text-ds-muted">No UML diagrams generated</p>
      </Card>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-52 flex-shrink-0">
        <div className="sticky top-20 space-y-1">
          {diagrams.map((d, i) => (
            <button
              key={i}
              onClick={() => setActiveUml(i)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeUml === i
                  ? 'bg-ds-accent/20 text-ds-accent border border-ds-accent/30'
                  : 'text-ds-muted hover:text-ds-text hover:bg-white/5'
              }`}
            >
              {d.title}
            </button>
          ))}
        </div>
      </div>

      {/* Diagram area */}
      <div className="flex-1 min-w-0">
        {diagrams[activeUml] && (
          <motion.div
            key={activeUml}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-4">
              <h2 className="text-xl font-display font-semibold text-ds-text">
                {diagrams[activeUml].title}
              </h2>
              <p className="text-sm text-ds-muted mt-0.5">
                {activeUml + 1} of {diagrams.length} diagrams
              </p>
            </div>
            <MermaidDiagram
              code={diagrams[activeUml].mermaid}
              title={diagrams[activeUml].title}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: SRS DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────
function SRSTab({ a }) {
  if (!a.srs?.raw) {
    return (
      <Card className="p-8 text-center">
        <p className="text-ds-muted">SRS document not yet generated</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-display font-semibold text-ds-text">IEEE 830 SRS Document</h2>
          <p className="text-sm text-ds-muted mt-0.5">
            {a.srs.wordCount?.toLocaleString()} words ·
            Generated {new Date(a.srs.generatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      {/* Markdown renderer */}
      <div className="prose prose-invert prose-sm max-w-none
        prose-headings:font-display prose-headings:text-ds-text
        prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
        prose-p:text-ds-muted prose-p:leading-relaxed
        prose-li:text-ds-muted prose-li:leading-relaxed
        prose-strong:text-ds-text
        prose-code:text-ds-accent prose-code:bg-ds-bg prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
        prose-pre:bg-ds-bg prose-pre:border prose-pre:border-ds-border prose-pre:rounded-lg
        prose-blockquote:border-ds-accent prose-blockquote:text-ds-muted
        prose-hr:border-ds-border
        prose-a:text-ds-accent prose-a:no-underline hover:prose-a:underline
        prose-table:text-sm prose-thead:text-ds-text prose-td:text-ds-muted prose-th:text-ds-muted
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {a.srs.raw}
        </ReactMarkdown>
      </div>
    </Card>
  );
  
}

