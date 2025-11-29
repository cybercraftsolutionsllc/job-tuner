"use client";

import { useState, useEffect } from "react";
import { analyzeJobDescription, ScoreReport } from "../utils/optimizer";
import { autoTuneText, GOLD_STANDARD_TEMPLATE } from "../utils/fixer";
import TextHighlighter from "./TextHighlighter";

// Sample "Bad" Job Description for the Demo
const SAMPLE_TITLE = "Rockstar Ninja Developer Needed ASAP!!!";
const SAMPLE_DESC = `
We are looking for a young, energetic digital native to join our fast-paced family! You must be willing to wear many hats and hustle 24/7. 

We need a ninja who is a master of code.
The candidate must be able to lift 25 lbs and be clean shaven.
He must have a degree from a top university.
We offer a competitive salary.

Requirements:
- Code all day
-No complainers
-Thick skin
`;

export default function JobEditor() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [report, setReport] = useState<ScoreReport | null>(null);
  const [viewMode, setViewMode] = useState<"edit" | "audit">("edit");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (description.trim().length > 0) {
      const result = analyzeJobDescription(description, title);
      setReport(result);
    } else {
      setReport(null);
    }
  }, [title, description]);

  // Toast Timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleLoadSample = () => {
    setTitle(SAMPLE_TITLE);
    setDescription(SAMPLE_DESC.trim());
    setViewMode("audit");
  };

  const handleAutoTune = () => {
    const fixed = autoTuneText(description);
    setDescription(fixed);
    setToast("✨ Text Auto-Tuned! Bad words replaced & formatting fixed.");
    setViewMode("edit"); // Switch back to edit so they can see changes
  };

  const handleInsertTemplate = () => {
    if (description.length > 50) {
      if(!confirm("This will overwrite your current text. Are you sure?")) return;
    }
    setTitle("Senior [Role Name]");
    setDescription(GOLD_STANDARD_TEMPLATE);
    setToast("📋 Gold Standard Template Inserted.");
    setViewMode("edit");
  };

  const handleCopy = () => {
    const fullText = `${title}\n\n${description}`;
    navigator.clipboard.writeText(fullText);
    setToast("✅ Copied to clipboard!");
  };

  const handleClear = () => {
    setTitle("");
    setDescription("");
    setViewMode("edit");
  };

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full relative">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce-short">
          <span>{toast}</span>
        </div>
      )}

      {/* LEFT COLUMN: EDITOR */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        
        {/* Toolbar */}
        <div className="bg-white p-3 rounded-t-xl border-b border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setViewMode("edit")}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                viewMode === "edit"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              ✏️ Write
            </button>
            <button
              onClick={() => setViewMode("audit")}
              disabled={!report}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                viewMode === "audit"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 disabled:opacity-50"
              }`}
            >
              👁️ Audit View
            </button>
          </div>

          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
             {/* Magic Actions */}
             <button 
              onClick={handleInsertTemplate}
              className="whitespace-nowrap text-xs font-medium text-slate-600 hover:bg-slate-100 px-3 py-2 rounded border border-slate-200 transition-colors flex items-center gap-1"
              title="Insert a perfect JD structure"
            >
              📋 Template
            </button>
            <button 
              onClick={handleAutoTune}
              disabled={description.length < 10}
              className="whitespace-nowrap text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-4 py-2 rounded shadow-sm transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Fix bad words and formatting automatically"
            >
              ✨ Auto-Tune
            </button>
            <div className="w-px bg-slate-300 mx-1"></div>
            <button 
              onClick={handleLoadSample}
              className="whitespace-nowrap text-xs font-medium text-blue-600 hover:bg-blue-50 px-3 py-2 rounded border border-blue-200 transition-colors"
            >
              Demo
            </button>
            <button 
              onClick={handleClear}
              className="whitespace-nowrap text-xs font-medium text-slate-400 hover:text-red-500 hover:bg-slate-50 px-3 py-2 rounded transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="bg-white rounded-b-xl shadow-lg border-x border-b border-slate-200 min-h-[600px] flex flex-col relative overflow-hidden">
           
           <div className="p-6 border-b border-slate-100 bg-slate-50/30">
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
               Job Title
             </label>
             <input
               type="text"
               className="w-full bg-white border border-slate-200 p-3 rounded-lg text-lg font-semibold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
               placeholder="e.g. Senior Product Manager"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
             />
           </div>

           <div className="flex-grow flex flex-col relative">
             <div className="px-6 pt-4 pb-2 flex justify-between items-end">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Job Description
                </label>
                {viewMode === 'edit' && description.length > 0 && (
                   <button onClick={handleCopy} className="text-xs text-blue-600 hover:underline">
                     Copy All Text
                   </button>
                )}
             </div>
             
             {viewMode === "edit" ? (
               <textarea
                 className="w-full h-full p-6 resize-none focus:outline-none text-slate-700 leading-relaxed font-sans placeholder-slate-300 text-base"
                 placeholder="Paste your JD here, or click 'Template' to start with a Gold Standard structure..."
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
               />
             ) : (
               <div className="w-full h-full p-6 overflow-y-auto bg-slate-50/50">
                 <TextHighlighter text={description} issues={report?.issues || []} />
               </div>
             )}
           </div>

            {/* Analyze CTA */}
            {viewMode === 'edit' && description.length > 50 && (
                <div className="absolute bottom-6 right-6">
                    <button 
                        onClick={() => setViewMode('audit')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-xl flex items-center gap-2 transform transition-transform hover:scale-105 active:scale-95"
                    >
                        <span>Analyze Score</span>
                        <span>👉</span>
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* RIGHT COLUMN: SCORECARD */}
      <div className="lg:col-span-4">
        <div className="sticky top-24 flex flex-col gap-6">
          <div className={`p-6 rounded-xl shadow-lg border ${report ? getScoreBg(report.overallScore) : 'bg-white border-slate-200'}`}>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
              Performance Score
            </h2>
            
            {report ? (
              <div>
                <div className="flex items-end justify-between mb-6">
                   <span className={`text-6xl font-black ${getScoreColor(report.overallScore)}`}>
                     {report.overallScore}
                   </span>
                   <div className="text-right">
                       <span className="text-xs font-bold text-slate-400 uppercase block">Verdict</span>
                       <span className={`text-sm font-bold ${getScoreColor(report.overallScore)}`}>
                            {report.overallScore > 80 ? "Great" : report.overallScore > 50 ? "Needs Work" : "High Risk"}
                       </span>
                   </div>
                </div>

                <div className="space-y-4">
                  <ScoreBar label="Searchability (SEO)" score={report.seoScore} />
                  <ScoreBar label="Conversion (Readability)" score={report.conversionScore} />
                  <ScoreBar label="Legal Risk" score={report.riskScore} />
                </div>
                
                {report.overallScore < 80 && (
                  <div className="mt-6 pt-4 border-t border-slate-200/50">
                    <button 
                      onClick={handleAutoTune}
                      className="w-full py-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-indigo-700 rounded-lg text-sm font-bold hover:from-purple-200 hover:to-indigo-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>✨ Auto-Tune & Fix</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="text-4xl mb-3">👇</div>
                <p className="text-slate-400 font-medium">Paste text to begin...</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col max-h-[600px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl flex justify-between items-center">
              <h3 className="font-bold text-slate-700">Audit Findings</h3>
              <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
                {report?.issues.length || 0}
              </span>
            </div>
            
            <div className="overflow-y-auto p-2 space-y-2 custom-scrollbar flex-grow min-h-[200px]">
              {report && report.issues.length > 0 ? (
                report.issues.map((issue) => (
                  <div key={issue.id} className="p-3 bg-white rounded border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide flex-shrink-0 ${
                        issue.severity === 'high' ? 'bg-red-100 text-red-700' :
                        issue.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {issue.type}
                      </span>
                       {issue.context && (
                        <span className="text-rose-600 font-mono text-xs bg-rose-50 px-1 rounded truncate max-w-[150px]">
                            "{issue.context}"
                        </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{issue.message}</p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-50">
                    <span className="text-4xl mb-2">✨</span>
                    <p className="text-sm text-slate-500">
                      {report ? "Clean bill of health!" : "Issues will appear here."}
                    </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return "bg-emerald-500";
    if (s >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-slate-500">{label}</span>
        <span className="font-bold text-slate-700">{score}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${getColor(score)} transition-all duration-1000 ease-out`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}