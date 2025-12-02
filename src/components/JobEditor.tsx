"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { analyzeJobDescription, ScoreReport, Issue } from "../utils/optimizer";
import { autoTuneText, GOLD_STANDARD_TEMPLATE, getSuggestionsForTitle } from "../utils/fixer";
import { downloadPDF, shareViaEmail } from "../utils/exporter";
import TextHighlighter from "./TextHighlighter";
import { TONE_PROFILES, ToneKey } from "../utils/constants";

// Dictionary for manual fixes (Simplified version of fixer.ts logic)
const QUICK_FIXES: Record<string, string> = {
  "ninja": "Specialist",
  "rockstar": "High Performer",
  "guru": "Expert",
  "wizard": "Lead",
  "hustle": "work efficiently",
  "guys": "team",
  "he": "they",
  "she": "they",
  "salesman": "Salesperson"
};

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

interface JobEditorProps {
  initialCredits: number;
  initialPlan: string;
}

export default function JobEditor({ initialCredits, initialPlan }: JobEditorProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [report, setReport] = useState<ScoreReport | null>(null);
  const [viewMode, setViewMode] = useState<"edit" | "audit">("edit");
  const [toast, setToast] = useState<string | null>(null);
  const [tone, setTone] = useState<ToneKey>("professional");
  const [isProMode, setIsProMode] = useState(false);
  const [credits, setCredits] = useState(initialCredits);
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Autosave
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTitle = localStorage.getItem("jt_draft_title");
      const savedDesc = localStorage.getItem("jt_draft_desc");
      if (savedTitle) setTitle(savedTitle);
      if (savedDesc) setDescription(savedDesc);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem("jt_draft_title", title);
      localStorage.setItem("jt_draft_desc", description);
      if (title || description) setLastSaved(new Date());
    }, 1000);
    return () => clearTimeout(handler);
  }, [title, description]);

  // Analysis
  useEffect(() => {
    if (description.trim().length > 0) {
      const result = analyzeJobDescription(description, title);
      setReport(result);
      if (result.overallScore >= 90 && viewMode === 'audit' && (!report || report.overallScore < 90)) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } else {
      setReport(null);
    }
  }, [description, title, viewMode]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- ACTIONS ---

  const handleFixIssue = (issue: Issue) => {
    if (!issue.context) return;
    
    const word = issue.context.toLowerCase();
    const betterWord = QUICK_FIXES[word];

    if (betterWord) {
      // Replace the word in the description
      const regex = new RegExp(`\\b${issue.context}\\b`, "gi");
      const newDesc = description.replace(regex, betterWord);
      setDescription(newDesc);
      setToast(`✨ Fixed: "${issue.context}" → "${betterWord}"`);
    } else {
      setToast(`ℹ️ No auto-fix for "${issue.context}". Please edit manually.`);
      setViewMode("edit"); // Switch to edit mode so they can fix it
    }
  };

  const callAI = async (type: "expand" | "rewrite") => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai-tune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, currentText: description, type, tone }),
      });
      const data = await res.json();

      if (res.status === 401) { setToast("🔒 Please Sign In."); setIsLoading(false); return; }
      if (res.status === 403 && data.error === "OUT_OF_CREDITS") { setShowUpgradeModal(true); setIsLoading(false); return; }
      if (!res.ok) throw new Error("AI request failed");

      if (!data.result) throw new Error("No result returned from AI");

      let cleanResult = data.result.replace(/##/g, "").replace(/\n\n\n/g, "\n\n");
      
      if (typeof data.remainingCredits === 'number') {
        setCredits(data.remainingCredits);
      }
      
      if (type === "expand") {
        setDescription((prev) => `${prev}\n\n${cleanResult}`);
        setToast(`🤖 Content Expanded!`);
      } else {
        setDescription(cleanResult);
        setToast(`🤖 Rewrite Complete!`);
      }
    } catch (error) {
      console.error(error);
      setToast("❌ System Error. Please try again.");
    } finally {
      setIsLoading(false);
      setViewMode("edit");
    }
  };

  const handleAutoTune = () => {
    if (isProMode) {
      if (!confirm("Pro Mode: Use 1 Credit to AI rewrite?")) return;
      callAI("rewrite");
    } else {
      const fixed = autoTuneText(description);
      setDescription(fixed);
      setToast("✨ Text Auto-Tuned.");
      setViewMode("edit");
    }
  };

  const handleExpand = () => {
    if (title.length < 3) { setToast("⚠️ Enter a Job Title first."); return; }
    if (isProMode) {
      callAI("expand");
    } else {
      const suggestions = getSuggestionsForTitle(title);
      if (suggestions.length === 0) { setToast("⚠️ No library match. Enable PRO."); return; }
      const bulletText = suggestions.map((s) => `• ${s}`).join("\n");
      setDescription((prev) => `${prev}\n\nSUGGESTED RESPONSIBILITIES:\n${bulletText}`);
      setToast("🚀 Standard content added.");
      setViewMode("edit");
    }
  };

  const handleCopy = async () => { await navigator.clipboard.writeText(`${title}\n\n${description}`); setToast("📋 Copied!"); };
  const handleExportPDF = () => { if(title || description) { downloadPDF(title, description); setToast("📄 PDF Downloading..."); } };
  const handleLoadSample = () => { setTitle(SAMPLE_TITLE); setDescription(SAMPLE_DESC.trim()); setViewMode("audit"); };
  
  const handleInsertTemplate = () => { 
    if (description.length > 50 && !confirm("Overwrite text?")) return; 
    setTitle("Senior [Role Name]"); 
    setDescription(GOLD_STANDARD_TEMPLATE); 
    setToast("📋 Template Inserted."); 
    setViewMode("edit"); 
  };

  const handleClear = () => { 
    if(confirm("Clear draft?")) {
      setTitle(""); setDescription(""); setViewMode("edit"); 
      localStorage.removeItem("jt_draft_title"); 
      localStorage.removeItem("jt_draft_desc");
    }
  };

  const getScoreColor = (score: number) => { if (score >= 80) return "text-emerald-600"; if (score >= 50) return "text-amber-500"; return "text-rose-600"; };
  const getScoreBg = (score: number) => { 
      if (score >= 80) return "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"; 
      if (score >= 50) return "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"; 
      return "bg-gradient-to-br from-rose-50 to-red-50 border-rose-200"; 
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full relative">
      
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-white/80 flex flex-col items-center justify-center backdrop-blur-md rounded-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-indigo-800 font-bold animate-pulse">AI is crafting your JD...</p>
        </div>
      )}
      
      {toast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[60] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce-short cursor-pointer" onClick={() => setToast(null)}>
          <span>{toast}</span>
        </div>
      )}

      {showUpgradeModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden animate-float">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
              <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">✕</button>
              
              <div className="mb-4 text-4xl">⚡</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Upgrade to Pro</h3>
              <p className="text-slate-600 mb-6">Unlimited rewrites, advanced tones, and premium support.</p>
              
              <a href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || "#"} target="_blank" rel="noopener noreferrer" className="block w-full py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 mb-4" onClick={() => setTimeout(() => setShowUpgradeModal(false), 2000)}>
                  Buy 100 Credits - $19
              </a>
              <button onClick={() => setShowUpgradeModal(false)} className="text-sm text-slate-400 hover:text-slate-600 underline">No thanks</button>
          </div>
        </div>
      )}

      {/* --- EDITOR COLUMN --- */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        {/* Toolbar */}
        <div className="glass-panel p-3 rounded-t-xl border-b-0 flex flex-col xl:flex-row items-center justify-between gap-3 sticky top-0 z-20">
          <div className="flex bg-slate-100/50 p-1 rounded-lg w-full xl:w-auto backdrop-blur-sm">
            <button onClick={() => setViewMode("edit")} className={`flex-1 xl:flex-none px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-300 ${viewMode === "edit" ? "bg-white text-blue-600 shadow-md" : "text-slate-500 hover:text-slate-700"}`}>✏️ Write</button>
            <button onClick={() => setViewMode("audit")} disabled={!report} className={`flex-1 xl:flex-none px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-300 ${viewMode === "audit" ? "bg-white text-blue-600 shadow-md" : "text-slate-500 hover:text-slate-700 disabled:opacity-50"} ${report && report.issues.length > 0 ? 'animate-pulse text-rose-500' : ''}`}>👁️ Audit View</button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-2 w-full xl:w-auto">
             <div className="flex items-center mr-2 bg-slate-100/50 rounded-full px-1 py-1 border border-slate-200/50">
               <button onClick={() => setIsProMode(false)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${!isProMode ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400'}`}>Basic</button>
               <button onClick={() => setIsProMode(true)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1 ${isProMode ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'text-slate-400'}`}><span>PRO</span><span className="text-[10px]">AI</span></button>
             </div>

             {isProMode && (
                <select value={tone} onChange={(e) => setTone(e.target.value as ToneKey)} className="bg-white border border-slate-200 text-xs font-bold text-slate-600 rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500 shadow-sm">
                  {Object.entries(TONE_PROFILES).map(([key, profile]) => (
                    <option key={key} value={key}>{profile.label}</option>
                  ))}
                </select>
             )}
             
             <div className="w-px bg-slate-300 mx-1 hidden xl:block h-6"></div>
             
             <button onClick={handleExpand} className={`px-3 py-1.5 rounded text-xs font-bold transition-all duration-300 flex items-center gap-1 border ${isProMode ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"}`}>
                {isProMode ? "🤖 Expand" : "➕ Expand"}
             </button>
             
             <button onClick={handleAutoTune} disabled={description.length < 10} className={`px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-all duration-300 flex items-center gap-1 disabled:opacity-50 ${isProMode ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700" : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"}`}>
                {isProMode ? "✨ Rewrite" : "✨ Fix"}
             </button>

             <button onClick={() => setShowUpgradeModal(true)} className="px-3 py-1.5 rounded text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 transition-colors flex items-center gap-1">
                ⚡ {credits}
             </button>

             <div className="w-px bg-slate-300 mx-1 hidden xl:block h-6"></div>
             <button onClick={handleInsertTemplate} className="btn-secondary" title="Template">📋</button>
             <button onClick={handleLoadSample} className="btn-secondary">Demo</button>
             <button onClick={handleClear} className="btn-secondary text-red-500 hover:bg-red-50">🗑️</button>
          </div>
        </div>

        <div className="glass-panel rounded-b-xl min-h-[600px] flex flex-col relative overflow-hidden border-t-0">
           <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
             <div className="flex-grow mr-4">
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Job Title</label>
               <input type="text" className="w-full bg-white/50 backdrop-blur-sm border border-slate-200 p-3 rounded-lg text-lg font-semibold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" placeholder="e.g. Senior Product Manager" value={title} onChange={(e) => setTitle(e.target.value)} />
             </div>
             {lastSaved && <span className="text-[10px] text-slate-400 whitespace-nowrap mt-6 opacity-70">Saved {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
           </div>
           <div className="flex-grow flex flex-col relative">
             <div className="px-6 pt-4 pb-2 flex justify-between items-end"><label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Job Description</label></div>
             {viewMode === "edit" ? (
               <textarea className="w-full h-full p-6 resize-none focus:outline-none text-slate-700 leading-relaxed font-sans placeholder-slate-300 text-base bg-transparent" placeholder="Paste your JD here..." value={description} onChange={(e) => setDescription(e.target.value)} />
             ) : (
               <div className="w-full h-full p-6 overflow-y-auto bg-slate-50/50">
                 {/* Pass the onFix handler here */}
                 <TextHighlighter text={description} issues={report?.issues || []} onFix={handleFixIssue} />
               </div>
             )}
           </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN --- */}
      <div className="lg:col-span-4">
        <div className="sticky top-24 flex flex-col gap-6">
          <div className={`p-6 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-500 ${report ? getScoreBg(report.overallScore) : 'glass-panel'}`}>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Performance Score</h2>
            {report ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-end justify-between mb-6">
                   <span className={`text-6xl font-black ${getScoreColor(report.overallScore)}`}>{report.overallScore}</span>
                   <div className="text-right">
                       <span className="text-xs font-bold text-slate-400 uppercase block">Verdict</span>
                       <span className={`text-sm font-bold ${getScoreColor(report.overallScore)}`}>{report.overallScore > 80 ? "Great" : report.overallScore > 50 ? "Needs Work" : "High Risk"}</span>
                   </div>
                </div>
                <div className="space-y-4 mb-6">
                  <ScoreBar label="Searchability (SEO)" score={report.seoScore} />
                  <ScoreBar label="Conversion (Readability)" score={report.conversionScore} />
                  <ScoreBar label="Legal Risk" score={report.riskScore} />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200/50">
                  <button onClick={async () => { await navigator.clipboard.writeText(`${title}\n\n${description}`); setToast("📋 Copied!"); }} className="flex flex-col items-center justify-center gap-1 py-3 rounded-lg bg-white/50 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-white hover:border-emerald-200 hover:text-emerald-600 transition-all shadow-sm transform hover:-translate-y-1"><span className="text-lg">📋</span> Copy</button>
                  <button onClick={() => { if(title || description) downloadPDF(title, description); }} className="flex flex-col items-center justify-center gap-1 py-3 rounded-lg bg-white/50 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-white hover:border-red-200 hover:text-red-600 transition-all shadow-sm transform hover:-translate-y-1"><span className="text-lg">📄</span> PDF</button>
                  <button onClick={() => shareViaEmail(title, description)} className="flex flex-col items-center justify-center gap-1 py-3 rounded-lg bg-white/50 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-white hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm transform hover:-translate-y-1"><span className="text-lg">✉️</span> Email</button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center opacity-70">
                <div className="text-4xl mb-3 animate-bounce">👇</div>
                <p className="text-slate-400 font-medium">Paste text to begin...</p>
              </div>
            )}
          </div>
          
          <div className="glass-panel rounded-xl flex flex-col max-h-[600px]">
             <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl flex justify-between items-center">
              <h3 className="font-bold text-slate-700">Audit Findings</h3>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${report && report.issues.length > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>{report?.issues.length || 0}</span>
            </div>
            <div className="overflow-y-auto p-2 space-y-2 custom-scrollbar flex-grow min-h-[200px]">
              {report && report.issues.length > 0 ? (
                report.issues.map((issue) => (
                  <div key={issue.id} className="p-3 bg-white/80 rounded border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide flex-shrink-0 ${issue.severity === 'high' ? 'bg-red-100 text-red-700' : issue.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{issue.type}</span>
                       {issue.context && <span className="text-rose-600 font-mono text-xs bg-rose-50 px-1 rounded truncate max-w-[150px]">"{issue.context}"</span>}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{issue.message}</p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-50">
                    <span className="text-4xl mb-2 text-slate-300">✨</span>
                    <p className="text-xs text-slate-400">Issues will appear here.</p>
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
  const getColor = (s: number) => { if (s >= 80) return "bg-emerald-500"; if (s >= 50) return "bg-amber-500"; return "bg-rose-500"; };
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-slate-500">{label}</span>
        <span className="font-bold text-slate-700">{score}%</span>
      </div>
      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full ${getColor(score)} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}