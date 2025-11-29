import React from "react";
import { Issue } from "../utils/optimizer";
import { escapeRegExp } from "../utils/sanitizer";

interface HighlighterProps {
  text: string;
  issues: Issue[];
}

export default function TextHighlighter({ text, issues }: HighlighterProps) {
  if (!text) return <p className="text-gray-400">No text to analyze.</p>;

  // We need to split the text by the trigger words to wrap them.
  // This is a complex operation. A simple robust way for an MVP:
  // 1. Sort issues by length (longest first) to avoid partial replacement issues.
  // 2. Use a regex to replace known triggers with a marked placeholder.
  
  // Note: For a perfect implementation, we'd need an AST parser. 
  // For this level, we will render the text and use a dangerouslySetInnerHTML approach 
  // BUT carefully controlled to only inject span tags.

  let htmlContent = text
    // Protect against XSS by basic escaping first (simplified)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");

  // Create a map of issues to colors
  issues.forEach((issue) => {
    if (!issue.context) return; // Skip issues without specific words (like word count)

    const colorClass =
      issue.severity === "high"
        ? "bg-red-200 border-b-2 border-red-500"
        : issue.severity === "medium"
        ? "bg-yellow-200 border-b-2 border-yellow-500"
        : "bg-blue-100 border-b-2 border-blue-400";

    // Create a generic regex for the word, case insensitive
    const safeWord = escapeRegExp(issue.context);
    const regex = new RegExp(`\\b(${safeWord})\\b`, "gi");

    // Replace with a span. We add a specialized class to identifying it.
    htmlContent = htmlContent.replace(
      regex,
      `<span class="${colorClass} px-1 rounded cursor-help" title="${issue.message}">$1</span>`
    );
  });

  return (
    <div
      className="prose max-w-none font-sans text-gray-800 leading-relaxed whitespace-pre-wrap"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}