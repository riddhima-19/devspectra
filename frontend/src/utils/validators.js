// src/utils/validators.js — Reusable client-side validation helpers

/**
 * Validate an email address format.
 */
export const isValidEmail = (email = '') =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

/**
 * Validate minimum password requirements.
 * Returns an error string or null if valid.
 */
export function validatePassword(password = '') {
  if (!password)           return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[a-zA-Z]/.test(password)) return 'Password must contain at least one letter';
  return null;
}

/**
 * Validate a URL (http / https only).
 */
export const isValidUrl = (url = '') => {
  if (!url) return true; // optional
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validate a GitHub URL specifically.
 */
export const isGithubUrl = (url = '') =>
  !url || /^https?:\/\/(www\.)?github\.com\/.+/.test(url);

/**
 * Run a set of field validators and return an errors object.
 *
 * @param {object} rules — { fieldName: [{ test: fn, message: string }] }
 * @param {object} values — { fieldName: value }
 * @returns {object}     — { fieldName: errorMessage }
 */
export function runValidators(rules, values) {
  const errors = {};
  for (const [field, validators] of Object.entries(rules)) {
    for (const { test, message } of validators) {
      if (!test(values[field])) {
        errors[field] = message;
        break; // First failing rule wins
      }
    }
  }
  return errors;
}

/**
 * Common validator rules for the register form.
 */
export const registerRules = {
  name: [
    { test: v => v?.trim().length > 0,  message: 'Name is required' },
    { test: v => v?.trim().length <= 80, message: 'Name is too long' },
  ],
  email: [
    { test: v => !!v,             message: 'Email is required' },
    { test: isValidEmail,         message: 'Enter a valid email address' },
  ],
  password: [
    { test: v => !!v,             message: 'Password is required' },
    { test: v => v?.length >= 8,  message: 'Password must be at least 8 characters' },
  ],
};

/**
 * Common validator rules for the project create form.
 */
export const projectRules = {
  title: [
    { test: v => v?.trim().length > 0,   message: 'Title is required' },
    { test: v => v?.trim().length <= 120, message: 'Title must be 120 characters or fewer' },
  ],
  githubUrl: [
    { test: isValidUrl, message: 'Enter a valid URL (https://…)' },
  ],
};
