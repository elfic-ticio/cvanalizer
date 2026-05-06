import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AnalysisHistory } from "@/components/AnalysisHistory";

async function getAnalyses(userId: string, company?: string) {
  return db.analysis.findMany({
    where: {
      userId,
      ...(company ? { company: { contains: company, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      score: true,
      jobTitle: true,
      company: true,
      matchSkills: true,
      missingSkills: true,
      suggestions: true,
      summary: true,
      createdAt: true,
      cvUrl: true,
    },
  });
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { company?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const analyses = await getAnalyses(session.user.id, searchParams.company);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="font-mono text-xs text-muted uppercase tracking-widest mb-1">
            All Analyses
          </p>
          <h1 className="font-sans text-2xl font-bold">History</h1>
        </div>
        <Link
          href="/analyze"
          className="font-mono text-xs bg-accent text-background px-4 py-2 uppercase tracking-widest hover:bg-[#d4f570] transition-colors"
        >
          + New Analysis
        </Link>
      </div>

      {/* Filter */}
      <form className="flex gap-3">
        <input
          name="company"
          type="text"
          defaultValue={searchParams.company}
          placeholder="Filter by company..."
          className="bg-surface border border-border px-4 py-2 font-mono text-sm text-[#e8e8e8] placeholder:text-muted focus:outline-none focus:border-accent transition-colors w-64"
        />
        <button
          type="submit"
          className="font-mono text-xs border border-border px-4 py-2 uppercase tracking-widest hover:border-accent hover:text-accent transition-colors"
        >
          Filter
        </button>
        {searchParams.company && (
          <Link
            href="/history"
            className="font-mono text-xs border border-border px-4 py-2 uppercase tracking-widest hover:border-accent hover:text-accent transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      {analyses.length === 0 ? (
        <div className="border border-border border-dashed p-16 text-center">
          <p className="font-mono text-xs text-muted uppercase tracking-widest mb-2">
            {searchParams.company ? "No results found" : "No analyses yet"}
          </p>
          {!searchParams.company && (
            <Link
              href="/analyze"
              className="font-mono text-xs bg-accent text-background px-6 py-2 uppercase tracking-widest hover:bg-[#d4f570] transition-colors inline-block mt-4"
            >
              Analyze your first CV
            </Link>
          )}
        </div>
      ) : (
        <AnalysisHistory analyses={analyses} />
      )}
    </div>
  );
}
