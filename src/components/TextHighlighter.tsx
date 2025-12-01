import React from "react";
import { Issue } from "../utils/optimizer";
import { escapeRegExp } from "../utils/sanitizer";

interface HighlighterProps {
  text: string;
  issues: Issue[];
}

export default function TextHighlighter({ text, issues }: HighlighterProps) {
  if (!text) return <p className="text-gray-400 italic">Start typing or generate content to see the analysis...</p>;

  // 1. Basic HTML Escaping to prevent XSS
  let htmlContent = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 2. RENDER MARKDOWN BOLD (**text**)
  // This turns AI headers into nice bold text
  htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');

  // 3. Handle Newlines
  htmlContent = htmlContent.replace(/\n/g, "<br/>");

  // 4. HIGHLIGHT ISSUES
  // Sort by length to avoid partial replacements
  const sortedIssues = [...issues].sort((a, b) => (b.context?.length || 0) - (a.context?.length || 0));

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
    const regex = new RegExp(`\\b(${safeWord})\\b`, "gi");

    htmlContent = htmlContent.replace(
      regex,
      `<span class="${colorClass} px-1 rounded cursor-help transition-colors hover:opacity-80" title="${issue.message}">$1</span>`
    );
  });

  return (
    <div
      className="prose max-w-none font-sans text-slate-700 leading-relaxed whitespace-pre-wrap"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}