// src/hooks/useDebounce.js — Debounce hook for search/filter inputs
import { useState, useEffect } from 'react';

/**
 * useDebounce — delays updating a value until after `delay` ms have passed
 * since the last change. Prevents excessive API calls on every keystroke.
 *
 * @param {*}      value  — value to debounce
 * @param {number} delay  — milliseconds (default 400)
 */
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
