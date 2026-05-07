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

  const body = await req.json() as {
    cvUrl: string;
    jobDescription: string;
    jobTitle: string;
    company?: string;
  };

  const { cvUrl, jobDescription, jobTitle, company } = body;

  if (!cvUrl || !jobDescription || !jobTitle) {
    return NextResponse.json(
      { error: "cvUrl, jobDescription, and jobTitle are required" },
      { status: 400 }
    );
  }

  const pdfResponse = await fetch(cvUrl, {
    headers: {
      Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
    },
  });
  if (!pdfResponse.ok) {
    return NextResponse.json(
      { error: "Failed to fetch PDF from storage" },
      { status: 400 }
    );
  }

  const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
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
      cvUrl,
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
