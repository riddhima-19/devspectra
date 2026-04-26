// src/components/CodeViewer.jsx
// Syntax-highlighted read-only code viewer using CodeMirror
import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python }     from '@codemirror/lang-python';
import { oneDark }    from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';

// Map file extension → CodeMirror language extension
function getLanguageExtension(filename = '', forceLanguage = '') {
  const lang = forceLanguage.toLowerCase() || filename.split('.').pop().toLowerCase();
  switch (lang) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'javascript':
    case 'typescript': return javascript({ jsx: true, typescript: lang.includes('ts') });
    case 'py':
    case 'python':     return python();
    default:           return javascript(); // fallback
  }
}

export default function CodeViewer({
  code        = '',
  filename    = '',
  language    = '',
  maxHeight   = '500px',
  showCopy    = true,
  showStats   = true,
}) {
  const [copied, setCopied] = useState(false);

  const loc      = code.split('\n').length;
  const chars    = code.length;
  const langExt  = getLanguageExtension(filename, language);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!code.trim()) {
    return (
      <div className="flex items-center justify-center h-32 bg-ds-bg border border-ds-border rounded-xl text-ds-muted text-sm">
        No source code available
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-ds-border">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-ds-card border-b border-ds-border">
        <div className="flex items-center gap-3">
          {/* Traffic light dots */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-ds-red/60" />
            <div className="w-3 h-3 rounded-full bg-ds-amber/60" />
            <div className="w-3 h-3 rounded-full bg-ds-green/60" />
          </div>
          {filename && (
            <span className="text-xs font-mono text-ds-muted">{filename}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {showStats && (
            <span className="text-xs text-ds-faint">
              {loc.toLocaleString()} lines · {chars.toLocaleString()} chars
            </span>
          )}
          {showCopy && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-ds-muted hover:text-ds-text bg-ds-bg border border-ds-border rounded-md transition-all"
            >
              {copied ? (
                <>
                  <svg className="w-3 h-3 text-ds-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  Copy
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div style={{ maxHeight, overflowY: 'auto' }}>
        <CodeMirror
          value={code}
          extensions={[
            langExt,
            EditorView.lineWrapping,
            EditorView.editable.of(false),
          ]}
          theme={oneDark}
          basicSetup={{
            lineNumbers:       true,
            highlightActiveLineGutter: false,
            highlightActiveLine:       false,
            foldGutter:        true,
            dropCursor:        false,
            allowMultipleSelections: false,
            indentOnInput:     false,
            syntaxHighlighting: true,
            bracketMatching:   true,
            autocompletion:    false,
          }}
          style={{ fontSize: '13px' }}
        />
      </div>
    </div>
  );
}
