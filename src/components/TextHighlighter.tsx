import React from "react";
import { Issue } from "../utils/optimizer";
import { escapeRegExp } from "../utils/sanitizer";

interface HighlighterProps {
  text: string;
  issues: Issue[];
  onFix?: (issue: Issue) => void; // NEW: Callback when issue is clicked
}

export default function TextHighlighter({ text, issues, onFix }: HighlighterProps) {
  if (!text) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center italic opacity-60">
        <span className="text-4xl mb-2 not-italic">📝</span>
        <p>Start typing or generate content to see the analysis...</p>
      </div>
    );
  }

  // We need to parse the text into segments to make them interactive React elements
  // instead of just dangerouslySetInnerHTML strings.
  
  // 1. Sort issues by position/length to handle processing
  const uniqueIssues = issues.filter(i => i.context); // Only highlight issues with specific words
  
  // For simplicity in this React implementation without a complex AST:
  // We will split the text by the issue keywords and map them to spans.
  
  const parts = [];
  let lastIndex = 0;
  
  // Create a regex that matches any of the issue contexts
  if (uniqueIssues.length === 0) {
    return <div className="prose max-w-none font-sans text-slate-700 leading-relaxed whitespace-pre-wrap">{text}</div>;
  }

  // Construct a master regex for all issues
  const pattern = new RegExp(
    `(${uniqueIssues.map(i => `\\b${escapeRegExp(i.context!)}\\b`).join("|")})`,
    "gi"
  );

  const splitText = text.split(pattern);

  return (
    <div className="prose max-w-none font-sans text-slate-700 leading-relaxed whitespace-pre-wrap">
      {splitText.map((part, i) => {
        // Check if this part matches an issue
        const matchedIssue = uniqueIssues.find(
          issue => issue.context?.toLowerCase() === part.toLowerCase()
        );

        if (matchedIssue) {
          const colorClass =
            matchedIssue.severity === "high"
              ? "bg-red-100 text-red-800 border-b-2 border-red-300"
              : matchedIssue.severity === "medium"
              ? "bg-amber-100 text-amber-800 border-b-2 border-amber-300"
              : "bg-blue-50 text-blue-800 border-b-2 border-blue-200";

          return (
            <span
              key={i}
              className={`${colorClass} px-1 rounded cursor-pointer hover:opacity-75 relative group`}
              onClick={() => onFix && onFix(matchedIssue)}
              title={`Click to fix: ${matchedIssue.message}`}
            >
              {part}
              {/* Tooltip hint */}
              <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap mb-1 z-10">
                Fix this
              </span>
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}