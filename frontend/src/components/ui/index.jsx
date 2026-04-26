// src/components/ui/index.jsx — Shared UI primitives

import React from 'react';
import { motion } from 'framer-motion';

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({
  children, onClick, type = 'button', variant = 'primary',
  size = 'md', disabled = false, loading = false, className = '', icon,
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ds-bg disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  const variants = {
    primary:   'bg-ds-accent hover:bg-ds-accentHover text-white shadow-glow-sm hover:shadow-accent',
    secondary: 'bg-white/5 hover:bg-white/10 text-ds-text border border-ds-border',
    danger:    'bg-ds-red/10 hover:bg-ds-red/20 text-ds-red border border-ds-red/30',
    ghost:     'hover:bg-white/5 text-ds-muted hover:text-ds-text',
    outline:   'border border-ds-accent/50 hover:border-ds-accent text-ds-accent hover:bg-ds-accent/10',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      ) : icon}
      {children}
    </button>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', hover = false, glow = false }) {
  return (
    <div className={`
      bg-ds-card border border-ds-border rounded-xl
      ${hover ? 'hover:border-ds-accent/40 hover:shadow-card transition-all duration-300 cursor-pointer' : ''}
      ${glow ? 'animate-glow' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'info', size = 'sm' }) {
  const sizes = { xs: 'px-1.5 py-0.5 text-xs', sm: 'px-2 py-1 text-xs', md: 'px-3 py-1 text-sm' };
  return (
    <span className={`inline-flex items-center rounded-md font-medium badge-${variant} ${sizes[size]}`}>
      {children}
    </span>
  );
}

// ── Severity Badge ────────────────────────────────────────────────────────────
export function SeverityBadge({ severity }) {
  const labels = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low', info: 'Info' };
  return <Badge variant={severity}>{labels[severity] || severity}</Badge>;
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <svg className={`animate-spin text-ds-accent ${sizes[size]} ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

// ── Score Ring ─────────────────────────────────────────────────────────────────
export function ScoreRing({ score, size = 80, label }) {
  const radius      = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress    = ((score || 0) / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return '#00e676';
    if (s >= 60) return '#4caf50';
    if (s >= 40) return '#ffb300';
    return '#ff5252';
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="#252535" strokeWidth="6"/>
        {/* Progress ring */}
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={getColor(score)} strokeWidth="6"
          strokeDasharray={`${progress} ${circumference}`}
          strokeDashoffset="0"
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
        />
        {/* Score text */}
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
          fontSize={size > 60 ? '16' : '12'} fontWeight="700" fill={getColor(score)}>
          {score || 0}
        </text>
      </svg>
      {label && <p className="text-xs text-ds-muted text-center">{label}</p>}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, subtext, icon, color = 'accent', trend }) {
  const colors = {
    accent: 'text-ds-accent bg-ds-accent/10',
    pink:   'text-ds-pink bg-ds-pink/10',
    cyan:   'text-ds-cyan bg-ds-cyan/10',
    green:  'text-ds-green bg-ds-green/10',
    amber:  'text-ds-amber bg-ds-amber/10',
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-ds-muted uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-display font-bold text-ds-text truncate">{value ?? '—'}</p>
          {subtext && <p className="text-xs text-ds-muted mt-1 truncate">{subtext}</p>}
          {trend !== undefined && (
            <p className={`text-xs mt-1 ${trend >= 0 ? 'text-ds-green' : 'text-ds-red'}`}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-3 ${colors[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ title, description, action, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-ds-accent/10 flex items-center justify-center mb-5 text-ds-accent">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-display font-semibold text-ds-text mb-2">{title}</h3>
      <p className="text-sm text-ds-muted max-w-sm mb-6">{description}</p>
      {action}
    </motion.div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-ds-muted mb-1.5">{label}</label>
      )}
      <input
        className={`w-full px-4 py-2.5 bg-ds-bg border rounded-lg text-ds-text placeholder-ds-faint text-sm
          focus:outline-none focus:ring-2 focus:ring-ds-accent/50 focus:border-ds-accent transition-all
          ${error ? 'border-ds-red/50 focus:ring-ds-red/30' : 'border-ds-border'}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-ds-red">{error}</p>}
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────
export function Textarea({ label, error, className = '', rows = 4, ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-ds-muted mb-1.5">{label}</label>
      )}
      <textarea
        rows={rows}
        className={`w-full px-4 py-2.5 bg-ds-bg border rounded-lg text-ds-text placeholder-ds-faint text-sm
          focus:outline-none focus:ring-2 focus:ring-ds-accent/50 focus:border-ds-accent transition-all resize-none
          ${error ? 'border-ds-red/50' : 'border-ds-border'}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-ds-red">{error}</p>}
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
export function SectionHeader({ title, description, actions }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="text-xl font-display font-bold text-ds-text">{title}</h2>
        {description && <p className="text-sm text-ds-muted mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

// ── Tab Bar ───────────────────────────────────────────────────────────────────
export function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex items-center gap-1 border-b border-ds-border overflow-x-auto scrollbar-none">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 -mb-px ${
            active === tab.id
              ? 'border-ds-accent text-white'
              : 'border-transparent text-ds-muted hover:text-ds-text hover:border-ds-faint'
          }`}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span className={`px-1.5 py-0.5 rounded text-xs ${
              active === tab.id ? 'bg-ds-accent/20 text-ds-accent' : 'bg-ds-faint text-ds-muted'
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = 'accent', label, showValue = true }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colors = {
    accent: 'bg-ds-accent',
    green:  'bg-ds-green',
    amber:  'bg-ds-amber',
    red:    'bg-ds-red',
  };

  return (
    <div>
      {(label || showValue) && (
        <div className="flex justify-between mb-1.5">
          {label && <span className="text-xs text-ds-muted">{label}</span>}
          {showValue && <span className="text-xs text-ds-text font-medium">{pct}%</span>}
        </div>
      )}
      <div className="w-full h-1.5 bg-ds-border rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colors[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ── Collapsible Issue Card ─────────────────────────────────────────────────────
export function IssueCard({ issue, index }) {
  const [open, setOpen] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="border border-ds-border rounded-lg overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors text-left"
      >
        <SeverityBadge severity={issue.severity} />
        <span className="flex-1 text-sm font-medium text-ds-text truncate">{issue.title}</span>
        {issue.line && (
          <span className="text-xs text-ds-muted flex-shrink-0">Line {issue.line}</span>
        )}
        <svg className={`w-4 h-4 text-ds-muted flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-ds-border/50 pt-3">
          <p className="text-sm text-ds-muted">{issue.description}</p>
          {issue.suggestion && (
            <div className="flex gap-2 mt-2">
              <span className="text-xs text-ds-green font-medium flex-shrink-0 mt-0.5">Fix:</span>
              <p className="text-xs text-ds-muted">{issue.suggestion}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
