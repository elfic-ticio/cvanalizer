"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="font-mono text-2xs text-muted hover:text-[#e8e8e8] uppercase tracking-widest transition-colors"
    >
      Sign out
    </button>
  );
}
