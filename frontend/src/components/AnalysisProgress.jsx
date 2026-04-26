// src/components/AnalysisProgress.jsx
// Full-featured animated progress indicator for while AI analysis is running
import React from 'react';
import { motion } from 'framer-motion';

const STEPS = [
  { id: 'metrics',      label: 'Computing code metrics',       icon: '📐' },
  { id: 'quality',      label: 'Analysing code quality',       icon: '🔍' },
  { id: 'security',     label: 'Scanning security issues',      icon: '🔒' },
  { id: 'construction', label: 'Checking construction quality', icon: '🏗️' },
  { id: 'uml',          label: 'Generating UML diagrams',       icon: '📌' },
  { id: 'srs',          label: 'Writing IEEE SRS document',     icon: '📄' },
];

export default function AnalysisProgress({ progress = 0, statusMsg = '' }) {
  // Determine which steps appear "done" based on progress
  const completedSteps = Math.floor((progress / 100) * STEPS.length);
  const activeStep     = Math.min(completedSteps, STEPS.length - 1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-ds-card border border-ds-accent/30 rounded-2xl p-8 animate-glow"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative w-14 h-14 flex-shrink-0">
          {/* Outer ping */}
          <div className="absolute inset-0 rounded-full border-2 border-ds-accent/20 animate-ping" />
          {/* Ring */}
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="22" fill="none" stroke="#252535" strokeWidth="4"/>
            <motion.circle
              cx="28" cy="28" r="22" fill="none"
              stroke="#6c63ff" strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 22}`}
              animate={{ strokeDashoffset: 2 * Math.PI * 22 * (1 - progress / 100) }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </svg>
          {/* Percentage */}
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-ds-accent">
            {progress}%
          </span>
        </div>
        <div>
          <h3 className="text-lg font-display font-bold text-ds-text">AI Analysis Running</h3>
          <p className="text-sm text-ds-muted mt-0.5">{statusMsg || 'Processing your code…'}</p>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3 mb-6">
        {STEPS.map((step, i) => {
          const done    = i < completedSteps;
          const active  = i === activeStep && progress < 100;
          const pending = i > activeStep;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-500 ${
                active  ? 'bg-ds-accent/10 border border-ds-accent/30' :
                done    ? 'bg-ds-green/5'  :
                'opacity-40'
              }`}
            >
              {/* Status icon */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                done   ? 'bg-ds-green/20' :
                active ? 'bg-ds-accent/20' :
                'bg-ds-faint'
              }`}>
                {done ? (
                  <svg className="w-3.5 h-3.5 text-ds-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                  </svg>
                ) : active ? (
                  <div className="w-2 h-2 rounded-full bg-ds-accent animate-pulse" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-ds-faint" />
                )}
              </div>

              <span className="text-sm mr-1">{step.icon}</span>
              <span className={`text-sm ${done ? 'text-ds-green' : active ? 'text-ds-text font-medium' : 'text-ds-muted'}`}>
                {step.label}
              </span>

              {active && (
                <div className="ml-auto flex gap-0.5">
                  {[0,1,2].map(j => (
                    <div key={j} className="w-1 h-1 rounded-full bg-ds-accent animate-bounce"
                      style={{ animationDelay: `${j * 0.15}s` }}/>
                  ))}
                </div>
              )}
              {done && (
                <span className="ml-auto text-xs text-ds-green">Done</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-ds-muted mb-2">
          <span>Overall progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-ds-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-ds-accent to-ds-cyan rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-ds-faint mt-3 text-center">
          Typically takes 1–3 minutes depending on code size
        </p>
      </div>
    </motion.div>
  );
}
