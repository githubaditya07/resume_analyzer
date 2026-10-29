import { requireUser } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const analysis = await prisma.resumeAnalysis.findFirst({
    where: { id, userId: auth.user.id },
    select: {
      id: true, status: true, analysisType: true, targetRole: true, createdAt: true, completedAt: true, structuredResult: true,
      resume: { select: { originalFilename: true } }
    }
  });
  if (!analysis) return Response.json({ error: "Analysis not found." }, { status: 404 });
  if (analysis.status === "FAILED") return Response.json({ error: "This analysis could not be completed. Try analyzing the resume again." }, { status: 409 });
  return Response.json({ analysis });
}
