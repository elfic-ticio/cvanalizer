import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-mono text-accent text-xs tracking-[0.3em] uppercase">
            CVMatch
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="font-mono text-xs text-muted hover:text-[#e8e8e8] transition-colors uppercase tracking-widest"
            >
              Dashboard
            </Link>
            <Link
              href="/analyze"
              className="font-mono text-xs text-muted hover:text-[#e8e8e8] transition-colors uppercase tracking-widest"
            >
              Analyze
            </Link>
            <Link
              href="/history"
              className="font-mono text-xs text-muted hover:text-[#e8e8e8] transition-colors uppercase tracking-widest"
            >
              History
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-2xs text-muted">
            {session.user.email}
          </span>
          <SignOutButton />
        </div>
      </header>
      <main className="px-6 py-8 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
