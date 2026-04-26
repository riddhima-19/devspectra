function computeBasicStats(code) {
  if (!code || typeof code !== 'string') {
    return { loc: 0, sloc: 0, blankLines: 0, commentLines: 0, commentRatio: 0 };
  }
  const lines = code.split('\n');
  const loc   = lines.length;
  let blankLines = 0, commentLines = 0, sloc = 0;
  for (const line of lines) {
    const t = line.trim();
    if (t === '') { blankLines++; }
    else if (t.startsWith('//') || t.startsWith('#') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('"""') || t.startsWith("'''")) { commentLines++; }
    else { sloc++; }
  }
  const commentRatio   = loc > 0 ? parseFloat(((commentLines / loc) * 100).toFixed(1)) : 0;
  const functionPatterns = [
    /\bfunction\s+\w+\s*\(/g, /\bconst\s+\w+\s*=\s*(\(|async)/g,
    /\bdef\s+\w+\s*\(/g, /\bfunc\s+\w+\s*\(/g, /\bfn\s+\w+\s*\(/g,
  ];
  let functionCount = 0;
  for (const p of functionPatterns) {
    const m = code.match(p);
    if (m) functionCount += m.length;
  }
  const classCount = (code.match(/\bclass\s+\w+/g) || []).length;
  return {
    loc, sloc, blankLines, commentLines, commentRatio, functionCount, classCount,
    avgFunctionLength: functionCount > 0 ? parseFloat((sloc / functionCount).toFixed(1)) : 0,
  };
}

function detectLanguage(filename = '', code = '') {
  const ext = filename.split('.').pop().toLowerCase();
  const extMap = {
    js:'JavaScript', jsx:'JavaScript', ts:'TypeScript', tsx:'TypeScript',
    py:'Python', java:'Java', cpp:'C++', c:'C', cs:'C#',
    go:'Go', rb:'Ruby', php:'PHP', swift:'Swift', kt:'Kotlin', rs:'Rust',
    html:'HTML', css:'CSS', sql:'SQL', sh:'Shell',
  };
  if (extMap[ext]) return extMap[ext];
  if (code.includes('def ') && code.includes('import '))  return 'Python';
  if (code.includes('function ') || code.includes('=>'))  return 'JavaScript';
  if (code.includes('public class '))                     return 'Java';
  if (code.includes('package main') && code.includes('func ')) return 'Go';
  return 'Unknown';
}

module.exports = { computeBasicStats, detectLanguage };