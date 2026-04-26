// src/components/ConfirmModal.jsx — Accessible confirmation dialog
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui';

/**
 * ConfirmModal — modal dialog for destructive actions.
 *
 * Props:
 *   open        {bool}     — whether modal is visible
 *   title       {string}
 *   message     {string}
 *   confirmLabel{string}   — default "Confirm"
 *   cancelLabel {string}   — default "Cancel"
 *   variant     {string}   — "danger" | "primary"
 *   loading     {bool}
 *   onConfirm   {fn}
 *   onCancel    {fn}
 */
export default function ConfirmModal({
  open         = false,
  title        = 'Are you sure?',
  message      = '',
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'danger',
  loading      = false,
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null);

  // Focus cancel button when modal opens (safer default)
  useEffect(() => {
    if (open) setTimeout(() => cancelRef.current?.focus(), 50);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && open) onCancel?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto w-full max-w-sm bg-ds-card border border-ds-border
                rounded-2xl shadow-card p-6"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                variant === 'danger' ? 'bg-ds-red/15' : 'bg-ds-accent/15'
              }`}>
                {variant === 'danger' ? (
                  <svg className="w-6 h-6 text-ds-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-ds-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                )}
              </div>

              {/* Text */}
              <h2 id="confirm-title" className="text-lg font-display font-bold text-ds-text mb-2">
                {title}
              </h2>
              {message && (
                <p className="text-sm text-ds-muted leading-relaxed mb-6">{message}</p>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end mt-6">
                <Button
                  ref={cancelRef}
                  variant="secondary"
                  onClick={onCancel}
                  disabled={loading}
                >
                  {cancelLabel}
                </Button>
                <Button
                  variant={variant}
                  onClick={onConfirm}
                  loading={loading}
                >
                  {confirmLabel}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
