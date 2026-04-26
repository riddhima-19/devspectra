// src/utils/formatters.js — Display formatting helpers

/**
 * Format a number with locale-aware thousands separators.
 * e.g. 12345 → "12,345"
 */
export const fmtNumber = (n, decimals = 0) =>
  (n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

/**
 * Format bytes to human-readable size string.
 * e.g. 1536 → "1.5 KB"
 */
export function fmtBytes(bytes = 0) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Format milliseconds to a human-readable duration.
 * e.g. 92500 → "1m 32s"
 */
export function fmtDuration(ms = 0) {
  if (ms < 1000) return `${ms}ms`;
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

/**
 * Format a date string or Date object to a relative time label.
 * e.g. "3 hours ago", "2 days ago", "just now"
 */
export function fmtRelative(date) {
  if (!date) return '—';
  const diff = Date.now() - new Date(date).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)      return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60)      return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)      return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)       return `${d}d ago`;
  return new Date(date).toLocaleDateString();
}

/**
 * Format a date to a short locale string.
 * e.g. "Jun 15, 2024"
 */
export function fmtDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

/**
 * Format a date to a full datetime string.
 * e.g. "Jun 15, 2024, 14:32"
 */
export function fmtDateTime(date) {
  if (!date) return '—';
  return new Date(date).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/**
 * Truncate a string to maxLength, appending "…" if truncated.
 */
export function truncate(str = '', maxLength = 80) {
  return str.length > maxLength ? str.slice(0, maxLength - 1) + '…' : str;
}

/**
 * Convert a quality score (0–100) to a label.
 */
export function scoreLabel(score) {
  if (score == null) return 'N/A';
  if (score >= 80)   return 'Excellent';
  if (score >= 60)   return 'Good';
  if (score >= 40)   return 'Fair';
  return 'Poor';
}

/**
 * Return the Tailwind colour class for a quality score.
 */
export function scoreColorClass(score) {
  if (score == null) return 'text-ds-muted';
  if (score >= 80)   return 'text-ds-green';
  if (score >= 60)   return 'text-ds-cyan';
  if (score >= 40)   return 'text-ds-amber';
  return 'text-ds-red';
}

/**
 * Capitalise the first letter of a string.
 */
export const capitalise = (s = '') =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

/**
 * Convert camelCase / snake_case to Title Case for display.
 * e.g. "cyclomaticComplexity" → "Cyclomatic Complexity"
 */
export function prettifyKey(key = '') {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}
