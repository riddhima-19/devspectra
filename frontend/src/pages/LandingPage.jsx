// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FEATURES = [
  { icon: '📐', title: 'Deep Code Metrics', desc: 'LOC, Halstead, Cyclomatic Complexity, OO metrics, and more — all computed automatically by AI.' },
  { icon: '🔍', title: 'Quality Analysis', desc: 'Detect code smells, security vulnerabilities, and get refactoring and optimisation suggestions.' },
  { icon: '📌', title: '9 UML Diagrams', desc: 'Auto-generate Use Case, Class, Sequence, Activity, State, Deployment, Component & more.' },
  { icon: '📄', title: 'IEEE SRS Document', desc: 'Full IEEE 830-compliant Software Requirements Specification generated from your code.' },
  { icon: '🏗️', title: 'Construction Analysis', desc: 'Coding standards check, code review, checklist evaluation and improvement tips.' },
  { icon: '⬇️', title: 'Export Everything', desc: 'Download SRS as PDF, analysis report as JSON, or UML diagrams as Mermaid source.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ds-bg text-ds-text overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-ds-border bg-ds-surface/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ds-accent to-ds-cyan flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display font-bold text-lg gradient-text">DevSpectra</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-ds-muted hover:text-ds-text transition-colors px-4 py-2">Sign In</Link>
            <Link to="/register" className="px-4 py-2 bg-ds-accent hover:bg-ds-accentHover text-white text-sm font-medium rounded-lg transition-all shadow-glow-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-ds-accent/8 rounded-full blur-[120px] pointer-events-none -translate-x-1/2" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-ds-pink/6 rounded-full blur-[100px] pointer-events-none translate-x-1/2" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1.5 text-xs font-medium text-ds-accent bg-ds-accent/10 border border-ds-accent/30 rounded-full mb-6">
            AI-Powered Code Intelligence
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
            Your Code.{' '}
            <span className="gradient-text">Analysed.</span>
            <br />Documented. Visualised.
          </h1>
          <p className="text-lg text-ds-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload any codebase and get instant AI-generated metrics, UML diagrams,
            security analysis, and a complete IEEE Software Requirements Specification.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="px-8 py-4 bg-ds-accent hover:bg-ds-accentHover text-white font-semibold rounded-xl transition-all shadow-glow-sm hover:shadow-accent text-base">
              Start Analysing Free →
            </Link>
            <Link to="/login"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-ds-text font-medium rounded-xl border border-ds-border transition-all text-base">
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl font-display font-bold text-ds-text mb-4">Everything you need</h2>
          <p className="text-ds-muted">Powered by Gemini AI and built for professional software engineering</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-ds-card border border-ds-border rounded-xl p-6 hover:border-ds-accent/40 transition-all group"
            >
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="font-display font-semibold text-ds-text mb-2 group-hover:text-ds-accent transition-colors">{title}</h3>
              <p className="text-sm text-ds-muted leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto bg-gradient-to-br from-ds-accent/10 to-ds-pink/10 border border-ds-accent/20 rounded-2xl p-12"
        >
          <h2 className="text-3xl font-display font-bold text-ds-text mb-4">Ready to analyse your code?</h2>
          <p className="text-ds-muted mb-8">Upload your project and get a full engineering report in minutes.</p>
          <Link to="/register"
            className="inline-block px-8 py-4 bg-ds-accent hover:bg-ds-accentHover text-white font-semibold rounded-xl transition-all shadow-glow-sm">
            Create Free Account →
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-ds-border py-8 px-6 text-center">
        <p className="text-xs text-ds-faint">© 2024 DevSpectra · AI-Powered Code Intelligence</p>
      </footer>
    </div>
  );
}
