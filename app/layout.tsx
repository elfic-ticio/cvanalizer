import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CVMatch — AI-Powered CV Analyzer",
  description:
    "Analyze your CV against job descriptions using Gemini AI. Get a compatibility score, identify missing skills, and receive concrete improvement suggestions.",
  keywords: ["CV", "resume", "AI", "job matching", "career"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-[#e8e8e8] min-h-screen">
        {children}
      </body>
    </html>
  );
}
