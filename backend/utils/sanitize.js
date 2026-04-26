// utils/sanitize.js
// Sanitizes AI responses before saving to MongoDB.
// The AI sometimes returns arrays/objects as strings — this fixes that.

/**
 * Safely parse a value that might be a JSON string or already an array/object.
 */
function safeParse(value, fallback = []) {
  if (value === null || value === undefined) return fallback;
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return fallback;
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? parsed : fallback);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/**
 * Ensure a value is a plain array of strings (for reviewSuggestions etc.)
 */
function ensureStringArray(value) {
  const arr = safeParse(value, []);
  if (!Array.isArray(arr)) return [];
  return arr.map(item => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object') {
      return item.suggestion || item.text || item.description || item.tip || JSON.stringify(item);
    }
    return String(item);
  }).filter(Boolean);
}

/**
 * Ensure issue arrays (codeSmells, securityIssues etc.) are valid.
 * Each item must be an object with at least a title.
 */
function ensureIssueArray(value) {
  const arr = safeParse(value, []);
  if (!Array.isArray(arr)) return [];
  return arr.filter(item => item && typeof item === 'object' && (item.title || item.description));
}

/**
 * Ensure testCases is an array of objects with description/type/code fields.
 * This is the main fix for the CastError — AI sometimes returns testCases as a string.
 */
function ensureTestCaseArray(value) {
  const arr = safeParse(value, []);
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(item => item && typeof item === 'object')
    .map(item => ({
      description: String(item.description || item.name || item.test || ''),
      type:        String(item.type || 'unit'),
      code:        String(item.code || item.example || ''),
    }))
    .filter(item => item.description);
}

/**
 * Ensure designPatterns is an array of valid objects.
 */
function ensurePatternArray(value) {
  const arr = safeParse(value, []);
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(item => item && typeof item === 'object')
    .map(item => ({
      pattern:    String(item.pattern || item.name || ''),
      confidence: Number(item.confidence) || 0,
      location:   String(item.location || ''),
    }))
    .filter(item => item.pattern);
}

/**
 * Ensure codeChecklist is an array of valid objects.
 */
function ensureChecklistArray(value) {
  const arr = safeParse(value, []);
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(item => item && typeof item === 'object')
    .map(item => ({
      item:   String(item.item || item.check || item.description || ''),
      passed: Boolean(item.passed !== undefined ? item.passed : item.status === 'pass'),
      note:   String(item.note || item.reason || item.explanation || ''),
    }))
    .filter(item => item.item);
}

/**
 * Ensure UML diagrams array is valid.
 */
function ensureUmlArray(value) {
  const arr = safeParse(value, []);
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(item => item && typeof item === 'object' && item.mermaid)
    .map(item => ({
      type:    String(item.type || 'diagram'),
      title:   String(item.title || item.name || 'UML Diagram'),
      mermaid: String(item.mermaid || ''),
    }));
}

/**
 * Sanitize a number field — return null if not a valid number.
 */
function ensureNumber(value) {
  const n = Number(value);
  return isNaN(n) ? null : n;
}

/**
 * Sanitize perFunction array for cyclomatic complexity.
 */
function ensurePerFunctionArray(value) {
  const arr = safeParse(value, []);
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(item => item && typeof item === 'object')
    .map(item => ({
      name:       String(item.name || item.function || 'unknown'),
      complexity: Number(item.complexity || item.value || 1),
    }));
}

/**
 * Master sanitizer — takes raw AI quality result and returns clean object.
 */
function sanitizeQualityResult(raw) {
  if (!raw || typeof raw !== 'object') return {
    codeSmells: [], optimizations: [], refactoring: [],
    securityIssues: [], designPatterns: [], testCases: [],
  };
  return {
    codeSmells:     ensureIssueArray(raw.codeSmells),
    optimizations:  ensureIssueArray(raw.optimizations),
    refactoring:    ensureIssueArray(raw.refactoring),
    securityIssues: ensureIssueArray(raw.securityIssues),
    designPatterns: ensurePatternArray(raw.designPatterns),
    testCases:      ensureTestCaseArray(raw.testCases),
  };
}

/**
 * Master sanitizer — takes raw AI construction result and returns clean object.
 */
function sanitizeConstructionResult(raw) {
  if (!raw || typeof raw !== 'object') return {
    codingStandards: [], codeChecklist: [],
    reviewSuggestions: [], refactoringTips: [], optimizationTips: [],
  };
  return {
    codingStandards:   ensureIssueArray(raw.codingStandards),
    codeChecklist:     ensureChecklistArray(raw.codeChecklist),
    reviewSuggestions: ensureStringArray(raw.reviewSuggestions),
    refactoringTips:   ensureStringArray(raw.refactoringTips),
    optimizationTips:  ensureStringArray(raw.optimizationTips),
  };
}

/**
 * Sanitize metrics object — ensures all numeric fields are actual numbers.
 */
function sanitizeMetrics(raw) {
  if (!raw || typeof raw !== 'object') return {};

  const hal = raw.halstead || {};
  const cc  = raw.cyclomaticComplexity || {};
  const oo  = raw.oo || {};
  const ifm = raw.informationFlow || {};

  return {
    loc:               ensureNumber(raw.loc),
    sloc:              ensureNumber(raw.sloc),
    blankLines:        ensureNumber(raw.blankLines),
    commentLines:      ensureNumber(raw.commentLines),
    commentRatio:      ensureNumber(raw.commentRatio),
    functionCount:     ensureNumber(raw.functionCount),
    avgFunctionLength: ensureNumber(raw.avgFunctionLength),
    halstead: {
      vocabulary:    ensureNumber(hal.vocabulary),
      length:        ensureNumber(hal.length),
      volume:        ensureNumber(hal.volume),
      difficulty:    ensureNumber(hal.difficulty),
      effort:        ensureNumber(hal.effort),
      timeToProgram: ensureNumber(hal.timeToProgram),
      bugs:          ensureNumber(hal.bugs),
    },
    cyclomaticComplexity: {
      average:     ensureNumber(cc.average),
      max:         ensureNumber(cc.max),
      perFunction: ensurePerFunctionArray(cc.perFunction),
    },
    informationFlow: {
      fanIn:    ensureNumber(ifm.fanIn),
      fanOut:   ensureNumber(ifm.fanOut),
      ifMetric: ensureNumber(ifm.ifMetric),
    },
    oo: {
      classCount:               ensureNumber(oo.classCount),
      avgMethodsPerClass:       ensureNumber(oo.avgMethodsPerClass),
      depthOfInheritanceTree:   ensureNumber(oo.depthOfInheritanceTree),
      couplingBetweenClasses:   ensureNumber(oo.couplingBetweenClasses),
      lackOfCohesionInMethods:  ensureNumber(oo.lackOfCohesionInMethods),
      weightedMethodsPerClass:  ensureNumber(oo.weightedMethodsPerClass),
      responsesForClass:        ensureNumber(oo.responsesForClass),
    },
  };
}

module.exports = {
  safeParse,
  ensureStringArray,
  ensureIssueArray,
  ensureTestCaseArray,
  ensurePatternArray,
  ensureChecklistArray,
  ensureUmlArray,
  ensureNumber,
  sanitizeQualityResult,
  sanitizeConstructionResult,
  sanitizeMetrics,
};