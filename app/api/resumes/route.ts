import { requireSameOrigin, requireUser } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const resumes = await prisma.resume.findMany({
    where: { userId: auth.user.id },
    select: { id: true, originalFilename: true, fileType: true, parsingStatus: true, createdAt: true, _count: { select: { analyses: true } } },
    orderBy: { createdAt: "desc" }
  });
  return Response.json({ resumes });
}

export async function DELETE(request: Request) {
  const originError=requireSameOrigin(request);
  if(originError)return originError;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { id } = await request.json().catch(() => ({ id: "" }));
  if (typeof id !== "string" || !id) return Response.json({ error: "A resume ID is required." }, { status: 400 });
  const resume=await prisma.resume.findFirst({where:{id,userId:auth.user.id},select:{id:true,analyses:{select:{id:true}}}});
  if(!resume)return Response.json({error:"Resume not found."},{status:404});
  await prisma.$transaction([
    prisma.learningPlan.deleteMany({where:{userId:auth.user.id,analysisId:{in:resume.analyses.map((analysis)=>analysis.id)}}}),
    prisma.resume.delete({where:{id:resume.id}}),
    prisma.auditEvent.create({data:{actorId:auth.user.id,action:"RESUME_DELETED",resourceType:"Resume"}})
  ]);
  return Response.json({ ok: true });
}
