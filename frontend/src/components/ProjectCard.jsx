// src/components/ProjectCard.jsx — Reusable project summary card
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScoreRing } from './ui';

const STATUS_CONFIG = {
  draft:     { label: 'Draft',      dotClass: 'bg-ds-muted',  textClass: 'text-ds-muted'  },
  analyzing: { label: 'Analysing',  dotClass: 'bg-ds-amber animate-pulse', textClass: 'text-ds-amber' },
  completed: { label: 'Complete',   dotClass: 'bg-ds-green',  textClass: 'text-ds-green'  },
  failed:    { label: 'Failed',     dotClass: 'bg-ds-red',    textClass: 'text-ds-red'    },
};

export default function ProjectCard({ project, analysis, index = 0, onDelete }) {
  const navigate = useNavigate();
  const status   = STATUS_CONFIG[project.status] || STATUS_CONFIG.draft;
  const score    = analysis?.codeQuality?.score;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      whileHover={{ y: -2 }}
    >
      <div
        onClick={() => navigate(`/projects/${project._id}`)}
        className="group bg-ds-card border border-ds-border rounded-xl p-5 cursor-pointer
          hover:border-ds-accent/40 hover:shadow-card transition-all duration-300 flex flex-col gap-3"
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-display font-semibold text-ds-text leading-snug
            line-clamp-2 group-hover:text-ds-accent transition-colors">
            {project.title}
          </h3>
          {score !== undefined && (
            <div className="flex-shrink-0">
              <ScoreRing score={score} size={44} />
            </div>
          )}
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-xs text-ds-muted line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Tech stack */}
        {project.techStack?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.techStack.slice(0, 4).map(tech => (
              <span key={tech}
                className="px-2 py-0.5 bg-ds-accent/10 text-ds-accent text-xs rounded-md border border-ds-accent/20">
                {tech}
              </span>
            ))}
            {project.techStack.length > 4 && (
              <span className="px-2 py-0.5 bg-ds-faint text-ds-muted text-xs rounded-md">
                +{project.techStack.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Analysis quick stats */}
        {analysis?.status === 'completed' && (
          <div className="flex gap-4 text-xs text-ds-muted">
            {analysis.metrics?.loc > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-ds-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                </svg>
                {analysis.metrics.loc.toLocaleString()} LOC
              </span>
            )}
            {(analysis.codeSmells?.length > 0 || analysis.securityIssues?.length > 0) && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-ds-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
                {(analysis.codeSmells?.length || 0) + (analysis.securityIssues?.length || 0)} issues
              </span>
            )}
            {analysis.umlDiagrams?.length > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-ds-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343"/>
                </svg>
                {analysis.umlDiagrams.length} UML
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-ds-border/50">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
            <span className={`text-xs font-medium ${status.textClass}`}>{status.label}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-ds-faint">
              {new Date(project.updatedAt).toLocaleDateString()}
            </span>
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(project._id); }}
                className="opacity-0 group-hover:opacity-100 text-ds-muted hover:text-ds-red transition-all p-0.5 rounded"
                title="Delete project"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
