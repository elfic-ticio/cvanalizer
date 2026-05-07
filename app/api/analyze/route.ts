import { auth } from "@/lib/auth";
import { analyzeCV } from "@/lib/gemini";
import { extractTextFromPDF } from "@/lib/pdf";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const jobTitle = formData.get("jobTitle") as string | null;
  const company = formData.get("company") as string | null;
  const jobDescription = formData.get("jobDescription") as string | null;

  if (!file || !jobTitle || !jobDescription) {
    return NextResponse.json(
      { error: "file, jobTitle, and jobDescription are required" },
      { status: 400 }
    );
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are accepted" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
  }

  const pdfBuffer = Buffer.from(await file.arrayBuffer());
  const cvText = await extractTextFromPDF(pdfBuffer);

  if (!cvText || cvText.length < 50) {
    return NextResponse.json(
      { error: "Could not extract readable text from the PDF" },
      { status: 422 }
    );
  }

  const result = await analyzeCV(cvText, jobDescription);

  const analysis = await db.analysis.create({
    data: {
      userId: session.user.id,
      score: result.score,
      cvUrl: file.name,
      jobTitle,
      company: company ?? null,
      matchSkills: result.matchSkills,
      missingSkills: result.missingSkills,
      suggestions: result.suggestions,
      summary: result.summary,
    },
  });

  return NextResponse.json({ analysis });
}
