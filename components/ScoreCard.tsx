interface ScoreCardProps {
  score: number;
  summary: string;
}

export function ScoreCard({ score, summary }: ScoreCardProps) {
  const color =
    score >= 75 ? "#c8f060" : score >= 50 ? "#facc15" : "#f87171";

  const label =
    score >= 75 ? "Strong Match" : score >= 50 ? "Moderate Match" : "Weak Match";

  const circumference = 2 * Math.PI * 44;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="border border-border p-6 flex flex-col sm:flex-row items-start sm:items-center gap-8">
      {/* Circular score */}
      <div className="relative shrink-0">
        <svg width="120" height="120" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#1f1f1f"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-sans text-3xl font-bold" style={{ color }}>
            {score}
          </span>
          <span className="font-mono text-2xs text-muted">/100</span>
        </div>
      </div>

      {/* Text */}
      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-widest" style={{ color }}>
          {label}
        </p>
        <p className="font-sans text-sm text-[#e8e8e8] leading-relaxed max-w-md">
          {summary}
        </p>
      </div>
    </div>
  );
}
