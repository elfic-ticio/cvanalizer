"use client";

import { useState } from "react";
import { ScoreCard } from "./ScoreCard";
import { SkillsGrid } from "./SkillsGrid";

interface Analysis {
  id: string;
  score: number;
  jobTitle: string;
  company: string | null;
  matchSkills: unknown;
  missingSkills: unknown;
  suggestions: unknown;
  summary: string;
  createdAt: Date;
  cvUrl: string;
}

export function AnalysisHistory({ analyses }: { analyses: Analysis[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {analyses.map((analysis) => {
        const isOpen = expanded === analysis.id;
        const scoreColor =
          analysis.score >= 75
            ? "text-accent"
            : analysis.score >= 50
              ? "text-yellow-400"
              : "text-red-400";

        const matchSkills = analysis.matchSkills as string[];
        const missingSkills = analysis.missingSkills as string[];
        const suggestions = analysis.suggestions as string[];

        return (
          <div key={analysis.id} className="border border-border">
            <button
              onClick={() => setExpanded(isOpen ? null : analysis.id)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface transition-colors text-left"
            >
              <div className="flex items-center gap-6">
                <span className={`font-mono text-lg font-bold ${scoreColor} w-12`}>
                  {analysis.score}
                </span>
                <div>
                  <p className="font-sans text-sm font-medium text-[#e8e8e8]">
                    {analysis.jobTitle}
                  </p>
                  {analysis.company && (
                    <p className="font-mono text-2xs text-muted">
                      {analysis.company}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="font-mono text-2xs text-muted hidden sm:block">
                  {new Date(analysis.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="font-mono text-xs text-muted">
                  {isOpen ? "−" : "+"}
                </span>
              </div>
            </button>

            {isOpen && (
              <div className="px-6 pb-6 space-y-4 border-t border-border pt-6">
                <ScoreCard score={analysis.score} summary={analysis.summary} />
                <SkillsGrid
                  matchSkills={matchSkills}
                  missingSkills={missingSkills}
                />

                {suggestions.length > 0 && (
                  <div className="border border-border p-6">
                    <p className="font-mono text-xs text-muted uppercase tracking-widest mb-4">
                      Suggestions
                    </p>
                    <ol className="space-y-3">
                      {suggestions.map((s, i) => (
                        <li key={i} className="flex gap-4">
                          <span className="font-mono text-accent text-xs mt-0.5 shrink-0">
                            0{i + 1}
                          </span>
                          <p className="font-sans text-sm text-[#e8e8e8] leading-relaxed">
                            {s}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <span className="font-mono text-xs text-muted">
                  {analysis.cvUrl}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
