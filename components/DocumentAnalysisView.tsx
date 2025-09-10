import React, { useState } from 'react';
import type { AnalysisResult } from '../types';
import { ClipboardIcon, CheckIcon } from './icons';

interface DocumentAnalysisViewProps {
  result: AnalysisResult | null;
}

export const DocumentAnalysisView: React.FC<DocumentAnalysisViewProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <div className="p-6 text-center text-slate-500 dark:text-slate-400">
        Summary and keywords will be displayed here after analysis.
      </div>
    );
  }

  const handleCopy = () => {
    if(!result?.summary) return;
    navigator.clipboard.writeText(result.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Summary</h3>
            <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1 text-sm font-medium border rounded-md transition-colors duration-200 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                disabled={copied}
            >
                {copied ? <CheckIcon className="w-4 h-4 text-emerald-500" /> : <ClipboardIcon className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
            </button>
        </div>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{result.summary}</p>
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {result.keywords.map((keyword, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full dark:bg-indigo-500/20 dark:text-indigo-300 transition-transform hover:scale-105 cursor-default"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};