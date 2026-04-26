// src/components/ExportPanel.jsx
// Reusable export actions panel shown in the analysis header
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { exportAPI, triggerDownload } from '../api/services';
import { Button } from './ui';

export default function ExportPanel({ analysisId, projectTitle = 'project' }) {
  const [exporting, setExporting] = useState(null); // 'pdf' | 'json' | 'md'

  const handle = async (type) => {
    if (exporting) return;
    setExporting(type);

    const toastId = toast.loading(`Preparing ${type.toUpperCase()}…`);
    try {
      let blob, filename;
      if (type === 'pdf') {
        const res  = await exportAPI.downloadSrsPdf(analysisId);
        blob       = res.data;
        filename   = `SRS_${projectTitle.replace(/\s+/g, '_')}.pdf`;
      } else if (type === 'json') {
        const res  = await exportAPI.downloadReportJson(analysisId);
        blob       = res.data;
        filename   = `DevSpectra_Report_${projectTitle.replace(/\s+/g, '_')}.json`;
      } else {
        const res  = await exportAPI.downloadSrsMd(analysisId);
        blob       = res.data;
        filename   = `SRS_${projectTitle.replace(/\s+/g, '_')}.md`;
      }
      triggerDownload(blob, filename);
      toast.success(`${filename} downloaded`, { id: toastId });
    } catch {
      toast.error(`Failed to export ${type.toUpperCase()}`, { id: toastId });
    } finally {
      setExporting(null);
    }
  };

  const exports = [
    {
      type:    'pdf',
      label:   'SRS PDF',
      hint:    'IEEE 830 document',
      variant: 'primary',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        </svg>
      ),
    },
    {
      type:    'md',
      label:   'SRS Markdown',
      hint:    'Raw markdown source',
      variant: 'secondary',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z"/>
        </svg>
      ),
    },
    {
      type:    'json',
      label:   'Full Report',
      hint:    'All data as JSON',
      variant: 'secondary',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {exports.map(({ type, label, variant, icon }) => (
        <Button
          key={type}
          variant={variant}
          size="sm"
          loading={exporting === type}
          disabled={!!exporting}
          onClick={() => handle(type)}
          icon={icon}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
