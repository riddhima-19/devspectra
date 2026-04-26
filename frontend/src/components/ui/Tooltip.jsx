// src/components/ui/Tooltip.jsx — Accessible hover tooltip
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Tooltip — wraps any element and shows a tooltip on hover/focus.
 *
 * Usage:
 *   <Tooltip content="Cyclomatic complexity measures code path count">
 *     <span>CC: 12</span>
 *   </Tooltip>
 */
export default function Tooltip({
  children,
  content,
  placement = 'top',  // 'top' | 'bottom' | 'left' | 'right'
  delay     = 300,
  maxWidth  = 240,
}) {
  const [visible, setVisible] = useState(false);
  const [coords,  setCoords]  = useState({ x: 0, y: 0 });
  const timerRef = useRef(null);
  const trigRef  = useRef(null);

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Placement styles for the tooltip box
  const placements = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowPlacement = {
    top:    'top-full left-1/2 -translate-x-1/2 border-t-ds-card',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-ds-card',
    left:   'left-full top-1/2 -translate-y-1/2 border-l-ds-card',
    right:  'right-full top-1/2 -translate-y-1/2 border-r-ds-card',
  };

  if (!content) return children;

  return (
    <span
      ref={trigRef}
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      <AnimatePresence>
        {visible && (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.12 }}
            className={`
              absolute z-[9999] pointer-events-none
              ${placements[placement]}
            `}
            style={{ maxWidth }}
          >
            <div className="
              px-3 py-2 rounded-lg text-xs text-ds-text leading-relaxed
              bg-ds-card border border-ds-border shadow-card
              whitespace-normal
            ">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
