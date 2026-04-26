// src/components/MermaidDiagram.jsx
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  darkMode: true,
  themeVariables: {
    primaryColor: '#3b82f6', primaryTextColor: '#e2e2f0',
    primaryBorderColor: '#252535', lineColor: '#8888a4',
    secondaryColor: '#16161f', tertiaryColor: '#111118',
    background: '#0d0d14', mainBkg: '#16161f',
    nodeBorder: '#252535', clusterBkg: '#111118',
    titleColor: '#e2e2f0', edgeLabelBackground: '#111118',
    fontSize: '13px',
  },
  flowchart: { htmlLabels: true, curve: 'basis' },
  gantt: { axisFormat: '%m/%d', fontSize: 12 },
});

let counter = 0;

export default function MermaidDiagram({ code, title }) {
  const ref   = useRef(null);
  const id    = useRef(`mmd-${++counter}`);
  const [err, setErr] = useState(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!code || !ref.current) return;
    setErr(null);
    id.current = `mmd-${++counter}`;
    mermaid.render(id.current, code)
      .then(({ svg }) => {
        if (ref.current) {
          ref.current.innerHTML = svg;
          const s = ref.current.querySelector('svg');
          if (s) { s.style.maxWidth = '100%'; s.style.height = 'auto'; s.removeAttribute('width'); }
        }
      })
      .catch(e => { setErr(e.message || 'Render error'); if (ref.current) ref.current.innerHTML = ''; });
  }, [code]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Zoom controls */}
      <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 4, zIndex: 10 }}>
        {[{l:'+',fn:()=>setZoom(z=>Math.min(z+0.25,3))},{l:'1:1',fn:()=>setZoom(1)},{l:'−',fn:()=>setZoom(z=>Math.max(z-0.25,0.4))}].map(({l,fn})=>(
          <button key={l} onClick={fn} style={{ width:28, height:28, background:'#16161f', border:'1px solid #252535', borderRadius:6, color:'#8888a4', fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{l}</button>
        ))}
      </div>
      <div style={{ background:'#111118', border:'1px solid #252535', borderRadius:12, padding:16, overflowX:'auto', minHeight:120 }}>
        {err ? (
          <div style={{ padding:16, background:'rgba(248,113,113,0.1)', borderRadius:8, border:'1px solid rgba(248,113,113,0.2)' }}>
            <p style={{ color:'#f87171', fontSize:13, margin:0 }}>Diagram render error: {err}</p>
          </div>
        ) : (
          <div ref={ref} style={{ transform:`scale(${zoom})`, transformOrigin:'top center', transition:'transform 0.2s' }} />
        )}
        {code && (
          <details style={{ marginTop:12 }}>
            <summary style={{ cursor:'pointer', fontSize:12, color:'#8888a4' }}>View Mermaid source</summary>
            <pre style={{ background:'#0d0d14', borderRadius:6, padding:12, fontSize:11, color:'#8888a4', overflow:'auto', marginTop:8, border:'1px solid #1e1e2e' }}>{code}</pre>
          </details>
        )}
      </div>
    </div>
  );
}
