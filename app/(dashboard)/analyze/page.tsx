"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ScoreCard } from "@/components/ScoreCard";
import { SkillsGrid } from "@/components/SkillsGrid";

interface AnalysisResult {
  id: string;
  score: number;
  jobTitle: string;
  company?: string;
  matchSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  summary: string;
}

type Step = "form" | "uploading" | "analyzing" | "result";

export default function AnalyzePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("form");
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") {
      setFile(dropped);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !jobTitle || !jobDescription) return;

    setError(null);

    try {
      setStep("uploading");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobTitle", jobTitle);
      formData.append("jobDescription", jobDescription);
      if (company) formData.append("company", company);

      setStep("analyzing");
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      if (!analyzeRes.ok) {
        const data = await analyzeRes.json() as { error: string };
        throw new Error(data.error ?? "Analysis failed");
      }
      const { analysis } = await analyzeRes.json() as { analysis: AnalysisResult };
      setResult(analysis);
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("form");
    }
  }

  if (step === "uploading" || step === "analyzing") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
        <p className="font-mono text-xs text-muted uppercase tracking-widest">
          {step === "uploading" ? "Uploading PDF..." : "Analyzing with Gemini..."}
        </p>
      </div>
    );
  }

  if (step === "result" && result) {
    return (
      <div className="space-y-8 max-w-3xl">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-xs text-muted uppercase tracking-widest mb-1">
              Analysis Complete
            </p>
            <h1 className="font-sans text-2xl font-bold">
              {result.jobTitle}
              {result.company && (
                <span className="text-muted font-normal"> at {result.company}</span>
              )}
            </h1>
          </div>
          <button
            onClick={() => {
              setStep("form");
              setResult(null);
              setFile(null);
              setJobTitle("");
              setCompany("");
              setJobDescription("");
            }}
            className="font-mono text-xs border border-border px-4 py-2 uppercase tracking-widest hover:border-accent hover:text-accent transition-colors"
          >
            New Analysis
          </button>
        </div>

        <ScoreCard score={result.score} summary={result.summary} />

        <SkillsGrid
          matchSkills={result.matchSkills}
          missingSkills={result.missingSkills}
        />

        {/* Suggestions */}
        <div className="border border-border p-6">
          <p className="font-mono text-xs text-muted uppercase tracking-widest mb-6">
            Suggestions to Improve
          </p>
          <ol className="space-y-4">
            {result.suggestions.map((suggestion, i) => (
              <li key={i} className="flex gap-4">
                <span className="font-mono text-accent text-xs mt-0.5 shrink-0">
                  0{i + 1}
                </span>
                <p className="font-sans text-sm text-[#e8e8e8] leading-relaxed">
                  {suggestion}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/history")}
            className="font-mono text-xs border border-border px-4 py-2 uppercase tracking-widest hover:border-accent hover:text-accent transition-colors"
          >
            View History
          </button>
          <button
            onClick={() => router.push("/")}
            className="font-mono text-xs bg-accent text-background px-4 py-2 uppercase tracking-widest hover:bg-[#d4f570] transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <p className="font-mono text-xs text-muted uppercase tracking-widest mb-1">
          New Analysis
        </p>
        <h1 className="font-sans text-2xl font-bold">Analyze your CV</h1>
      </div>

      {error && (
        <div className="border border-red-900 bg-red-950/20 px-4 py-3">
          <p className="font-mono text-xs text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PDF Upload */}
        <div>
          <label className="font-mono text-xs text-muted uppercase tracking-widest block mb-3">
            CV / Resume (PDF)
          </label>
          <div
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
              file
                ? "border-accent bg-accent/5"
                : "border-border hover:border-subtle"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <div className="space-y-1">
                <p className="font-mono text-xs text-accent">{file.name}</p>
                <p className="font-mono text-2xs text-muted">
                  {(file.size / 1024).toFixed(0)} KB — click to replace
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-mono text-xs text-muted">
                  Drop your PDF here or click to browse
                </p>
                <p className="font-mono text-2xs text-muted">Max 10MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Job info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-xs text-muted uppercase tracking-widest block mb-2">
              Job Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Senior Frontend Engineer"
              required
              className="w-full bg-surface border border-border px-4 py-3 font-mono text-sm text-[#e8e8e8] placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="font-mono text-xs text-muted uppercase tracking-widest block mb-2">
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Inc."
              className="w-full bg-surface border border-border px-4 py-3 font-mono text-sm text-[#e8e8e8] placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        {/* Job Description */}
        <div>
          <label className="font-mono text-xs text-muted uppercase tracking-widest block mb-2">
            Job Description <span className="text-red-400">*</span>
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            required
            rows={10}
            className="w-full bg-surface border border-border px-4 py-3 font-mono text-sm text-[#e8e8e8] placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={!file || !jobTitle || !jobDescription}
          className="w-full bg-accent text-background py-4 font-mono text-sm font-medium uppercase tracking-wider hover:bg-[#d4f570] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Analyze Compatibility
        </button>
      </form>
    </div>
  );
}
