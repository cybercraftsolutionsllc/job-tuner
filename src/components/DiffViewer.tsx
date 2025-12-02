import React from 'react';
import { diffWords } from 'diff';

interface DiffViewerProps {
  oldText: string;
  newText: string;
}

export default function DiffViewer({ oldText, newText }: DiffViewerProps) {
  const diff = diffWords(oldText, newText);

  return (
    <div className="prose max-w-none font-sans text-slate-700 leading-relaxed whitespace-pre-wrap bg-white p-6 rounded-lg border border-slate-200 shadow-inner">
      {diff.map((part, index) => {
        if (part.added) {
          return (
            <span key={index} className="bg-green-100 text-green-800 px-1 rounded font-medium">
              {part.value}
            </span>
          );
        }
        if (part.removed) {
          return (
            <span key={index} className="bg-red-50 text-red-400 decoration-red-400 line-through px-1 opacity-70">
              {part.value}
            </span>
          );
        }
        return <span key={index}>{part.value}</span>;
      })}
    </div>
  );
}