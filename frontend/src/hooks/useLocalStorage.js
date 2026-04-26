// src/hooks/useLocalStorage.js — Typed localStorage hook
import { useState, useEffect } from 'react';

/**
 * useLocalStorage — syncs state with localStorage.
 * @param {string} key
 * @param {*}      initialValue
 */
export default function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const val = value instanceof Function ? value(stored) : value;
      setStored(val);
      window.localStorage.setItem(key, JSON.stringify(val));
    } catch (err) {
      console.warn(`useLocalStorage set error for key "${key}":`, err);
    }
  };

  const remove = () => {
    try {
      window.localStorage.removeItem(key);
      setStored(initialValue);
    } catch {}
  };

  // Keep state in sync across tabs
  useEffect(() => {
    const handler = (e) => {
      if (e.key === key && e.newValue !== null) {
        try { setStored(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key]);

  return [stored, setValue, remove];
}
