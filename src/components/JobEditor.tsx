"use client";

import { useState, useEffect } from "react";
import { analyzeJobDescription, ScoreReport } from "../utils/optimizer";

export default function JobEditor() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [report, setReport] = useState<ScoreReport | null>(null);

  // Run analysis whenever title or description changes
  useEffect(() => {
    // Only analyze if there is some text
    if (description.trim().length > 0) {
      const result = analyzeJobDescription(description, title);
      setReport(result);
    } else {
      setReport(null);
    }
  }, [title, description]);

  // Helper for Score Color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* LEFT COLUMN: INPUTS */}
      <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Title
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g. Senior Product Manager"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex-grow flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Description
          </label>
          <textarea
            className="w-full flex-grow p-4 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none min-h-[400px]"
            placeholder="Paste your job description here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {/* RIGHT COLUMN: DASHBOARD */}
      <div className="flex flex-col gap-4">
        {/* SCORECARD */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Performance Score
          </h2>
          
          {report ? (
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreColor(report.overallScore)}`}>
                  {report.overallScore}
                </div>
                <div className="text-sm text-gray-500 mt-1">Overall</div>
              </div>

              <div className="flex gap-6 text-center">
                <div>
                  <div className={`text-xl font-bold ${getScoreColor(report.seoScore)}`}>
                    {report.seoScore}
                  </div>
                  <div className="text-xs text-gray-500">SEO</div>
                </div>
                <div>
                  <div className={`text-xl font-bold ${getScoreColor(report.conversionScore)}`}>
                    {report.conversionScore}
                  </div>
                  <div className="text-xs text-gray-500">Conv.</div>
                </div>
                <div>
                  <div className={`text-xl font-bold ${getScoreColor(report.riskScore)}`}>
                    {report.riskScore}
                  </div>
                  <div className="text-xs text-gray-500">Risk</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">
              Start typing to see your score...
            </div>
          )}
        </div>

        {/* ISSUES LIST */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex-grow overflow-y-auto max-h-[500px]">
          <h3 className="text-md font-semibold text-gray-800 mb-3">
            Audit Findings
          </h3>

          {report && report.issues.length > 0 ? (
            <ul className="space-y-3">
              {report.issues.map((issue) => (
                <li
                  key={issue.id}
                  className={`p-3 rounded-md border-l-4 ${
                    issue.severity === "high"
                      ? "bg-red-50 border-red-500"
                      : issue.severity === "medium"
                      ? "bg-yellow-50 border-yellow-500"
                      : "bg-blue-50 border-blue-500"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      {issue.type}
                    </span>
                    {issue.context && (
                      <span className="text-xs bg-white px-2 py-0.5 rounded border border-gray-200 font-mono text-red-600">
                        "{issue.context}"
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 mt-1">{issue.message}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              {report ? "No issues found! Great job." : "Detailed analysis will appear here."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}