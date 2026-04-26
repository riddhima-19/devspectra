// src/hooks/useAnalysis.js — Custom hook for analysis lifecycle
import { useState, useCallback, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { analysisAPI } from '../api/services';

const POLL_INTERVAL_MS = 5000;

const STATUS_MESSAGES = [
  'Starting AI engines…',
  'Parsing source code structure…',
  'Computing LOC and complexity metrics…',
  'Calculating Halstead metrics…',
  'Detecting code smells…',
  'Scanning for security vulnerabilities…',
  'Identifying design patterns…',
  'Generating UML diagrams…',
  'Composing IEEE SRS document…',
  'Finalising analysis report…',
];

/**
 * useAnalysis — manages the full analysis lifecycle for a project.
 *
 * @param {string} projectId
 * @param {Function} onComplete — called when analysis finishes (receives analysisData)
 */
export default function useAnalysis(projectId, onComplete) {
  const [running,    setRunning]    = useState(false);
  const [statusMsg,  setStatusMsg]  = useState('');
  const [progress,   setProgress]   = useState(0);   // 0–100 estimated
  const [analysisId, setAnalysisId] = useState(null);
  const [error,      setError]      = useState(null);

  const pollRef  = useRef(null);
  const msgIdx   = useRef(0);
  const startTime = useRef(null);

  // ── Stop polling ────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  // ── Start polling ────────────────────────────────────────────────
  const startPolling = useCallback((id) => {
    stopPolling();
    msgIdx.current = 0;

    pollRef.current = setInterval(async () => {
      // Advance status message and estimated progress
      const idx = Math.min(msgIdx.current, STATUS_MESSAGES.length - 1);
      setStatusMsg(STATUS_MESSAGES[idx]);
      msgIdx.current += 1;

      // Estimate progress based on elapsed time (max 90% until confirmed done)
      const elapsed = Date.now() - startTime.current;
      const estimated = Math.min(90, Math.round((elapsed / 150000) * 100)); // 150s = ~100%
      setProgress(estimated);

      try {
        const res = await analysisAPI.pollStatus(id);
        const { status, errorMessage } = res.data;

        if (status === 'completed') {
          stopPolling();
          setProgress(100);
          setStatusMsg('Analysis complete!');
          setRunning(false);

          // Fetch full result
          const fullRes = await analysisAPI.getByProject(projectId);
          onComplete?.(fullRes.data.analysis);
          toast.success('✅ Analysis complete!');
        } else if (status === 'failed') {
          stopPolling();
          setRunning(false);
          setProgress(0);
          setStatusMsg('');
          const msg = errorMessage || 'Analysis failed';
          setError(msg);
          toast.error(msg);
        }
      } catch {
        // Network hiccup — keep polling
      }
    }, POLL_INTERVAL_MS);
  }, [projectId, onComplete, stopPolling]);

  // ── Run analysis ─────────────────────────────────────────────────
  const run = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setError(null);
    setProgress(0);
    setStatusMsg('Starting AI analysis…');
    startTime.current = Date.now();

    try {
      const res = await analysisAPI.run(projectId);
      const id  = res.data.analysisId;
      setAnalysisId(id);
      toast('Analysis started — this takes 1–3 minutes', { icon: '🤖', duration: 5000 });
      startPolling(id);
    } catch (err) {
      setRunning(false);
      setProgress(0);
      setStatusMsg('');
      const msg = err.response?.data?.error || 'Failed to start analysis';
      setError(msg);
      toast.error(msg);
    }
  }, [projectId, running, startPolling]);

  // ── Cancel (frontend only — stops polling UI, analysis continues in bg) ──
  const cancel = useCallback(() => {
    stopPolling();
    setRunning(false);
    setProgress(0);
    setStatusMsg('');
    setAnalysisId(null);
  }, [stopPolling]);

  return { run, cancel, running, statusMsg, progress, analysisId, error };
}
