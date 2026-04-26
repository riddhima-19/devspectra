// src/components/MetricsCharts.jsx
// Reusable chart components used across the Metrics tab in AnalysisView
import React from 'react';
import { Bar, Doughnut, Radar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  RadialLinearScale, PointElement, LineElement,
  ArcElement, Filler, Tooltip, Legend, Title,
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  RadialLinearScale, PointElement, LineElement,
  ArcElement, Filler, Tooltip, Legend, Title
);

// ── Shared chart defaults ─────────────────────────────────────────
const TOOLTIP = {
  backgroundColor: '#16161f',
  borderColor:     '#252535',
  borderWidth:     1,
  titleColor:      '#e2e2f0',
  bodyColor:       '#8888a4',
  padding:         10,
  cornerRadius:    8,
};

const TICK_STYLE = { color: '#8888a4', font: { size: 11, family: 'Inter' } };
const GRID_STYLE = { color: '#252535' };

// ── Cyclomatic Complexity Bar Chart ───────────────────────────────
export function ComplexityBarChart({ perFunction = [] }) {
  if (!perFunction.length) return null;

  const sorted = [...perFunction].sort((a, b) => b.complexity - a.complexity).slice(0, 15);

  const data = {
    labels: sorted.map(f => f.name.length > 18 ? f.name.slice(0, 16) + '…' : f.name),
    datasets: [{
      label: 'Cyclomatic Complexity',
      data:  sorted.map(f => f.complexity),
      backgroundColor: sorted.map(f =>
        f.complexity > 10 ? 'rgba(255,82,82,0.7)'  :
        f.complexity > 5  ? 'rgba(255,179,0,0.7)'  :
                            'rgba(0,230,118,0.7)'
      ),
      borderColor: sorted.map(f =>
        f.complexity > 10 ? '#ff5252' :
        f.complexity > 5  ? '#ffb300' :
                            '#00e676'
      ),
      borderWidth:  1,
      borderRadius: 4,
    }],
  };

  return (
    <Bar data={data} options={{
      indexAxis: 'y',
      responsive: true,
      plugins: { legend: { display: false }, tooltip: TOOLTIP },
      scales: {
        x: { ticks: TICK_STYLE, grid: GRID_STYLE, beginAtZero: true },
        y: { ticks: { ...TICK_STYLE, font: { size: 10, family: '"JetBrains Mono", monospace' } }, grid: { display: false } },
      },
    }} />
  );
}

// ── Halstead Metrics Radar ────────────────────────────────────────
export function HalsteadRadar({ halstead = {} }) {
  // Normalise values to 0–100 for display
  const norm = (v, max) => Math.min(100, Math.round(((v || 0) / max) * 100));

  const data = {
    labels: ['Volume', 'Difficulty', 'Effort', 'Vocabulary', 'Length', 'Bug Estimate'],
    datasets: [{
      label: 'Halstead Profile',
      data: [
        norm(halstead.volume,     5000),
        norm(halstead.difficulty, 50),
        norm(halstead.effort,     100000),
        norm(halstead.vocabulary, 200),
        norm(halstead.length,     1000),
        norm(halstead.bugs,       5),
      ],
      backgroundColor: 'rgba(0,212,255,0.15)',
      borderColor:     'rgba(0,212,255,0.8)',
      pointBackgroundColor: '#00d4ff',
      borderWidth: 2,
    }],
  };

  return (
    <Radar data={data} options={{
      responsive: true,
      scales: {
        r: {
          beginAtZero: true, max: 100,
          ticks:       { color: '#8888a4', font: { size: 9 }, stepSize: 25, backdropColor: 'transparent' },
          grid:        { color: '#252535' },
          pointLabels: { color: '#8888a4', font: { size: 10 } },
          angleLines:  { color: '#252535' },
        },
      },
      plugins: { legend: { display: false }, tooltip: TOOLTIP },
    }} />
  );
}

// ── Code Composition Doughnut ─────────────────────────────────────
export function CodeCompositionChart({ metrics = {} }) {
  const source   = metrics.sloc         || 0;
  const comments = metrics.commentLines || 0;
  const blank    = metrics.blankLines   || 0;

  if (!source && !comments && !blank) return null;

  const data = {
    labels: ['Source Code', 'Comments', 'Blank Lines'],
    datasets: [{
      data: [source, comments, blank],
      backgroundColor: ['rgba(108,99,255,0.8)', 'rgba(0,212,255,0.8)', 'rgba(37,37,53,0.8)'],
      borderColor:     ['#6c63ff', '#00d4ff', '#252535'],
      borderWidth: 1,
    }],
  };

  return (
    <Doughnut data={data} options={{
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#8888a4', font: { size: 11 }, padding: 16, usePointStyle: true },
        },
        tooltip: TOOLTIP,
      },
    }} />
  );
}

// ── OO Metrics Bar Chart ──────────────────────────────────────────
export function OOMetricsChart({ oo = {} }) {
  const metrics = [
    { label: 'Classes',          value: oo.classCount              || 0, max: 50  },
    { label: 'Avg Methods',      value: oo.avgMethodsPerClass      || 0, max: 20  },
    { label: 'DIT',              value: oo.depthOfInheritanceTree  || 0, max: 10  },
    { label: 'CBO',              value: oo.couplingBetweenClasses  || 0, max: 20  },
    { label: 'WMC',              value: oo.weightedMethodsPerClass || 0, max: 100 },
    { label: 'RFC',              value: oo.responsesForClass       || 0, max: 100 },
  ];

  // Normalise to 0–100
  const normalised = metrics.map(m => Math.min(100, Math.round((m.value / m.max) * 100)));

  const data = {
    labels: metrics.map(m => m.label),
    datasets: [{
      label: 'Value (normalised)',
      data:  normalised,
      backgroundColor: 'rgba(233,69,96,0.6)',
      borderColor:     '#e94560',
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  return (
    <Bar data={data} options={{
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          ...TOOLTIP,
          callbacks: {
            label: (ctx) => {
              const orig = metrics[ctx.dataIndex];
              return ` ${orig.label}: ${typeof orig.value === 'number' ? orig.value.toFixed(1) : orig.value}`;
            },
          },
        },
      },
      scales: {
        x: { ticks: TICK_STYLE, grid: GRID_STYLE },
        y: {
          ticks: { ...TICK_STYLE, callback: (v) => `${v}%` },
          grid:  GRID_STYLE,
          max:   100,
          beginAtZero: true,
        },
      },
    }} />
  );
}

// ── Quality Score Trend Line ──────────────────────────────────────
export function QualityTrendChart({ analyses = [] }) {
  if (analyses.length < 2) return null;

  const sorted = [...analyses].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const data = {
    labels: sorted.map(a => new Date(a.createdAt).toLocaleDateString()),
    datasets: [{
      label: 'Quality Score',
      data:  sorted.map(a => a.codeQuality?.score || 0),
      borderColor:     '#6c63ff',
      backgroundColor: 'rgba(108,99,255,0.1)',
      pointBackgroundColor: '#6c63ff',
      pointRadius: 4,
      fill:    true,
      tension: 0.4,
    }],
  };

  return (
    <Line data={data} options={{
      responsive: true,
      plugins: { legend: { display: false }, tooltip: TOOLTIP },
      scales: {
        x: { ticks: TICK_STYLE, grid: GRID_STYLE },
        y: { ticks: TICK_STYLE, grid: GRID_STYLE, min: 0, max: 100 },
      },
    }} />
  );
}
