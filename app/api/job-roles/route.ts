import { requireSameOrigin, requireUser } from "@/lib/authorization";
import { parseStoredJobRole } from "@/lib/job-catalog";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const search = new URL(request.url).searchParams.get("q")?.trim().toLowerCase();
  const records=await prisma.jobRole.findMany({where:{isActive:true},orderBy:[{category:"asc"},{title:"asc"}]});
  const latest=await prisma.resumeAnalysis.findFirst({where:{userId:auth.user.id,status:"COMPLETED"},orderBy:{createdAt:"desc"},select:{structuredResult:true}});
  const matchScores=new Map<string,number>();
  const result=latest?.structuredResult as {roleMatches?:{title:string;score:number}[]}|null;
  for(const match of result?.roleMatches??[])matchScores.set(match.title,match.score);
  const roles=records.flatMap((record)=>{
    const parsed=parseStoredJobRole(record);
    if(!parsed.success)return [];
    const role=parsed.data;
    return !search||`${role.title} ${role.description} ${role.category} ${role.requiredSkills.join(" ")}`.toLowerCase().includes(search)
      ?[{id:record.id,...role,matchScore:matchScores.get(role.title)??null,source:record.source==="ADMIN_TEMPLATE"?"Administrator role template":"Reference template — not a live vacancy"}]
      :[];
  });
  const categories=[...new Set(roles.map((role)=>role.category))];
  const saved = await prisma.savedJobRole.findMany({ where: { userId: auth.user.id }, select: { jobRoleId:true } });
  return Response.json({ roles, categories, savedRoleIds: saved.map((item) => item.jobRoleId) });
}

export async function POST(request: Request) {
  const originError=requireSameOrigin(request);
  if(originError)return originError;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { id } = await request.json().catch(() => ({ id: "" }));
  if(typeof id!=="string"||!id)return Response.json({error:"A role ID is required."},{status:400});
  const role=await prisma.jobRole.findFirst({where:{id,isActive:true},select:{id:true}});
  if(!role)return Response.json({error:"Active role template not found."},{status:404});
  await prisma.savedJobRole.upsert({
    where: { userId_jobRoleId: { userId: auth.user.id, jobRoleId: role.id } },
    create: { userId: auth.user.id, jobRoleId: role.id },
    update: {}
  });
  return Response.json({ saved: true });
}

export async function DELETE(request: Request) {
  const originError=requireSameOrigin(request);
  if(originError)return originError;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "A role ID is required." }, { status: 400 });
  await prisma.savedJobRole.deleteMany({ where: { userId: auth.user.id, jobRoleId:id } });
  return Response.json({ saved: false });
}
