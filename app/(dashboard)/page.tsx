import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ScoreChart } from "@/components/ScoreChart";

async function getDashboardData(userId: string) {
  const analyses = await db.analysis.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      score: true,
      jobTitle: true,
      company: true,
      missingSkills: true,
      createdAt: true,
    },
  });

  if (analyses.length === 0) {
    return { analyses: [], avgScore: 0, topMissingSkills: [], chartData: [] };
  }

  const avgScore = Math.round(
    analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length
  );

  const skillCount: Record<string, number> = {};
  for (const analysis of analyses) {
    const missing = analysis.missingSkills as string[];
    for (const skill of missing) {
      skillCount[skill] = (skillCount[skill] ?? 0) + 1;
    }
  }

  const topMissingSkills = Object.entries(skillCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([skill, count]) => ({ skill, count }));

  const chartData = analyses.map((a) => ({
    date: new Date(a.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    score: a.score,
    jobTitle: a.jobTitle,
  }));

  return { analyses, avgScore, topMissingSkills, chartData };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { analyses, avgScore, topMissingSkills, chartData } =
    await getDashboardData(session.user.id);

  const scoreColor =
    avgScore >= 75
      ? "text-accent"
      : avgScore >= 50
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-xs text-muted uppercase tracking-widest mb-1">
            Overview
          </p>
          <h1 className="font-sans text-2xl font-bold">
            {session.user.name ? `${session.user.name.split(" ")[0]}'s` : "Your"}{" "}
            Dashboard
          </h1>
        </div>
        <Link
          href="/analyze"
          className="font-mono text-xs bg-accent text-background px-4 py-2 uppercase tracking-widest hover:bg-[#d4f570] transition-colors"
        >
          + New Analysis
        </Link>
      </div>

      {analyses.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Average Score"
              value={
                <span className={scoreColor}>{avgScore}</span>
              }
              sub="across all CVs"
            />
            <StatCard
              label="Total Analyses"
              value={analyses.length}
              sub="CVs analyzed"
            />
            <StatCard
              label="Latest Score"
              value={
                <span className={
                  analyses[analyses.length - 1].score >= 75
                    ? "text-accent"
                    : analyses[analyses.length - 1].score >= 50
                      ? "text-yellow-400"
                      : "text-red-400"
                }>
                  {analyses[analyses.length - 1].score}
                </span>
              }
              sub={analyses[analyses.length - 1].jobTitle}
            />
          </div>

          {/* Chart */}
          {chartData.length > 1 && (
            <div className="border border-border p-6">
              <p className="font-mono text-xs text-muted uppercase tracking-widest mb-6">
                Score Evolution
              </p>
              <ScoreChart data={chartData} />
            </div>
          )}

          {/* Top missing skills */}
          {topMissingSkills.length > 0 && (
            <div className="border border-border p-6">
              <p className="font-mono text-xs text-muted uppercase tracking-widest mb-6">
                Frequently Missing Skills
              </p>
              <div className="space-y-3">
                {topMissingSkills.map(({ skill, count }) => (
                  <div key={skill} className="flex items-center gap-4">
                    <span className="font-mono text-xs text-[#e8e8e8] w-40 truncate">
                      {skill}
                    </span>
                    <div className="flex-1 h-px bg-border relative">
                      <div
                        className="absolute top-0 left-0 h-0.5 bg-accent -mt-[0.5px]"
                        style={{
                          width: `${(count / topMissingSkills[0].count) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="font-mono text-2xs text-muted w-8 text-right">
                      {count}×
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
}) {
  return (
    <div className="border border-border p-6">
      <p className="font-mono text-2xs text-muted uppercase tracking-widest mb-3">
        {label}
      </p>
      <p className="font-sans text-4xl font-bold mb-1">{value}</p>
      <p className="font-mono text-2xs text-muted truncate">{sub}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-border border-dashed p-16 text-center">
      <p className="font-mono text-xs text-muted uppercase tracking-widest mb-2">
        No analyses yet
      </p>
      <p className="font-sans text-sm text-muted mb-6">
        Upload your CV and a job description to get your first compatibility
        score.
      </p>
      <Link
        href="/analyze"
        className="font-mono text-xs bg-accent text-background px-6 py-2 uppercase tracking-widest hover:bg-[#d4f570] transition-colors inline-block"
      >
        Analyze your first CV
      </Link>
    </div>
  );
}
