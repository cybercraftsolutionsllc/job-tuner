import React from "react";
import { Issue } from "../utils/optimizer";
import { escapeRegExp } from "../utils/sanitizer";

interface HighlighterProps {
  text: string;
  issues: Issue[];
}

export default function TextHighlighter({ text, issues }: HighlighterProps) {
  if (!text) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center italic opacity-60">
        <span className="text-4xl mb-2 not-italic">📝</span>
        <p>Start typing or generate content to see the analysis...</p>
      </div>
    );
  }

  // 1. Basic HTML Escaping to prevent XSS
  let htmlContent = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 2. RENDER MARKDOWN BOLD (**text**) - Improved regex for multiple occurrences
  // This turns AI headers into nice bold text. using [^*] ensures we match content inside **
  htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
  
  // Render Markdown Headers (## Header)
  htmlContent = htmlContent.replace(/^##\s+(.*)$/gm, '<h3 class="text-lg font-bold text-slate-800 mt-4 mb-2">$1</h3>');

  // 3. Handle Newlines
  htmlContent = htmlContent.replace(/\n/g, "<br/>");

  // 4. HIGHLIGHT ISSUES
  // Sort by length to avoid partial replacements (longest first)
  const sortedIssues = [...issues].sort((a, b) => (b.context?.length || 0) - (a.context?.length || 0));

  // Use a temporary placeholder strategy if performance becomes an issue with large texts, 
  // but for JDs, direct replacement is usually fine.
  sortedIssues.forEach((issue) => {
    if (!issue.context) return; 

    const colorClass =
      issue.severity === "high"
        ? "bg-red-100 border-b-2 border-red-500 text-red-900"
        : issue.severity === "medium"
        ? "bg-amber-100 border-b-2 border-amber-500 text-amber-900"
        : "bg-blue-50 border-b-2 border-blue-400 text-blue-900";

    const safeWord = escapeRegExp(issue.context);
    // Only match whole words/phrases to prevent highlighting inside other words
    // The negative lookahead/behind ensures we aren't inside an HTML tag attribute
    const regex = new RegExp(`(?<!<[^>]*)(\\b${safeWord}\\b)`, "gi");

    htmlContent = htmlContent.replace(
      regex,
      `<span class="${colorClass} px-1 rounded cursor-help transition-colors hover:opacity-80 relative group" title="${issue.message}">$1</span>`
    );
  });

  return (
    <div
      className="prose max-w-none font-sans text-slate-700 leading-relaxed whitespace-pre-wrap selection:bg-blue-100 selection:text-blue-900"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}