interface SkillsGridProps {
  matchSkills: string[];
  missingSkills: string[];
}

export function SkillsGrid({ matchSkills, missingSkills }: SkillsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Match */}
      <div className="border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          <p className="font-mono text-xs text-muted uppercase tracking-widest">
            Matching Skills ({matchSkills.length})
          </p>
        </div>
        {matchSkills.length === 0 ? (
          <p className="font-mono text-xs text-muted">None identified</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {matchSkills.map((skill) => (
              <span
                key={skill}
                className="font-mono text-2xs bg-accent/10 text-accent border border-accent/20 px-2 py-1"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Missing */}
      <div className="border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <p className="font-mono text-xs text-muted uppercase tracking-widest">
            Missing Skills ({missingSkills.length})
          </p>
        </div>
        {missingSkills.length === 0 ? (
          <p className="font-mono text-xs text-muted">None — great match!</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill) => (
              <span
                key={skill}
                className="font-mono text-2xs bg-red-950/30 text-red-400 border border-red-900/30 px-2 py-1"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
