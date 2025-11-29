"use client";

import { useState, useEffect } from "react";
import { analyzeJobDescription, ScoreReport } from "../utils/optimizer";
import TextHighlighter from "./TextHighlighter";
import { cleanText } from "../utils/sanitizer";

export default function JobEditor() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [report, setReport] = useState<ScoreReport | null>(null);
  const [viewMode, setViewMode] = useState<"edit" | "audit">("edit");

  // Run analysis whenever title or description changes
  useEffect(() => {
    if (description.trim().length > 0) {
      // We pass the raw description to the analyzer, 
      // but the analyzer should be robust enough to handle it.
      // (Assuming optimizer.ts handles string parsing)
      const result = analyzeJobDescription(description, title);
      setReport(result);
    } else {
      setReport(null);
    }
  }, [title, description]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 50) return "text-amber-500";
    return "text-rose-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-200";
    if (score >= 50) return "bg-amber-50 border-amber-200";
    return "bg-rose-50 border-rose-200";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      
      {/* LEFT COLUMN: EDITOR / HIGHLIGHTER (Span 8 cols) */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        
        {/* Toolbar */}
        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("edit")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === "edit"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              ✏️ Write
            </button>
            <button
              onClick={() => setViewMode("audit")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === "audit"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              👁️ Audit View
            </button>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">
            {report?.meta.wordCount || 0} words
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-grow min-h-[600px] flex flex-col relative overflow-hidden">
           
           {/* Job Title Input (Always visible) */}
           <div className="p-4 border-b border-gray-100 bg-gray-50/50">
             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
               Job Title
             </label>
             <input
               type="text"
               className="w-full bg-transparent text-lg font-semibold text-gray-900 placeholder-gray-400 focus:outline-none"
               placeholder="e.g. Senior Product Manager"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
             />
           </div>

           {/* Content Area */}
           <div className="flex-grow relative">
             {viewMode === "edit" ? (
               <textarea
                 className="w-full h-full p-6 resize-none focus:outline-none text-gray-700 leading-relaxed font-sans"
                 placeholder="Paste your job description here to begin analysis..."
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 style={{ minHeight: "500px" }}
               />
             ) : (
               <div className="w-full h-full p-6 overflow-y-auto bg-gray-50/30">
                 <TextHighlighter text={description} issues={report?.issues || []} />
               </div>
             )}
           </div>
        </div>
      </div>

      {/* RIGHT COLUMN: DASHBOARD (Span 4 cols - Sticky) */}
      <div className="lg:col-span-4">
        <div className="sticky top-6 flex flex-col gap-4">
          
          {/* MAIN SCORECARD */}
          <div className={`p-6 rounded-xl shadow-sm border ${report ? getScoreBg(report.overallScore) : 'bg-white border-gray-200'}`}>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
              Performance Score
            </h2>
            
            {report ? (
              <div>
                <div className="flex items-end justify-between mb-6">
                   <span className={`text-6xl font-black ${getScoreColor(report.overallScore)}`}>
                     {report.overallScore}
                   </span>
                   <span className="text-sm text-gray-600 font-medium mb-2">/ 100</span>
                </div>

                {/* Pillar Bars */}
                <div className="space-y-3">
                  <ScoreBar label="Searchability (SEO)" score={report.seoScore} />
                  <ScoreBar label="Conversion" score={report.conversionScore} />
                  <ScoreBar label="Risk & Liability" score={report.riskScore} />
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 text-sm">
                Add content to see scores.
              </div>
            )}
          </div>

          {/* ISSUES LIST */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col max-h-[500px]">
            <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span>⚠️</span> Issues Found ({report?.issues.length || 0})
              </h3>
            </div>
            
            <div className="overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {report && report.issues.length > 0 ? (
                report.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 bg-white rounded border border-gray-100 hover:border-blue-300 transition-colors shadow-sm group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                        issue.severity === 'high' ? 'bg-red-100 text-red-700' :
                        issue.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {issue.type}
                      </span>
                    </div>
                    
                    {issue.context && (
                      <div className="text-red-600 font-mono text-xs mb-1 bg-red-50 inline-block px-1 rounded">
                        "{issue.context}"
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {issue.message}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-400 text-xs">
                  Clean bill of health!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for progress bars
function ScoreBar({ label, score }: { label: string; score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return "bg-emerald-500";
    if (s >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-gray-600">{label}</span>
        <span className="font-bold text-gray-800">{score}</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor(score)} transition-all duration-500`} 
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}