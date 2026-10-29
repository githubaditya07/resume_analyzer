import { LearningTaskStatus } from "@/generated/prisma/client";
import { requireSameOrigin, requireUser } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const originError=requireSameOrigin(request);
  if(originError)return originError;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.completed !== "boolean") return Response.json({ error: "Choose a valid completion state." }, { status: 400 });
  const owned = await prisma.learningTask.findFirst({ where: { id, learningPlan: { userId: auth.user.id } }, select: { id: true } });
  if (!owned) return Response.json({ error: "Learning activity not found." }, { status: 404 });
  const task = await prisma.learningTask.update({
    where: { id },
    data: { status: body.completed ? LearningTaskStatus.DONE : LearningTaskStatus.TODO, completedAt: body.completed ? new Date() : null },
    select: { id: true, status: true }
  });
  return Response.json({ task });
}
