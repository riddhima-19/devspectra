// src/components/SearchBar.jsx — Debounced search input component
import React, { useState, useEffect } from 'react';
import useDebounce from '../hooks/useDebounce';

/**
 * SearchBar — controlled input with debounce.
 *
 * Props:
 *   placeholder {string}
 *   onSearch    {fn(value: string)}  — called with debounced value
 *   delay       {number}             — debounce ms (default 350)
 *   className   {string}
 *   initialValue{string}
 */
export default function SearchBar({
  placeholder  = 'Search…',
  onSearch,
  delay        = 350,
  className    = '',
  initialValue = '',
}) {
  const [value, setValue] = useState(initialValue);
  const debounced         = useDebounce(value, delay);

  useEffect(() => {
    onSearch?.(debounced);
  }, [debounced, onSearch]);

  const clear = () => {
    setValue('');
    onSearch?.('');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search icon */}
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ds-muted pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2.5 bg-ds-card border border-ds-border rounded-lg
          text-sm text-ds-text placeholder-ds-faint
          focus:outline-none focus:ring-2 focus:ring-ds-accent/50 focus:border-ds-accent
          transition-all"
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={clear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ds-muted
            hover:text-ds-text transition-colors"
          aria-label="Clear search"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      )}
    </div>
  );
}
