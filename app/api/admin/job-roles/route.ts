import { UserRole } from "@/generated/prisma/client";
import { z } from "zod";
import { requireSameOrigin, requireUser } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

const roleSchema=z.object({
  title:z.string().trim().min(2).max(100),
  category:z.string().trim().min(2).max(80),
  description:z.string().trim().min(10).max(500),
  requiredSkills:z.array(z.string().trim().min(1).max(80)).min(1).max(20),
  preferredSkills:z.array(z.string().trim().min(1).max(80)).max(20),
  skillWeights:z.record(z.string(),z.number().min(0).max(10)).optional().superRefine((value,context)=>{if(Object.keys(value??{}).length>20)context.addIssue({code:"custom",message:"A role may contain at most 20 skill weights."});})
});

export async function GET(){
  const auth=await requireUser(UserRole.ADMIN);
  if("error" in auth)return auth.error;
  const roles=await prisma.jobRole.findMany({orderBy:[{category:"asc"},{title:"asc"}]});
  return Response.json({roles});
}

export async function POST(request:Request){
  const originError=requireSameOrigin(request);
  if(originError)return originError;
  const auth=await requireUser(UserRole.ADMIN);
  if("error" in auth)return auth.error;
  const parsed=roleSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return Response.json({error:"Enter a valid role title, category, description, required skills, and weights."},{status:400});
  const duplicate=await prisma.jobRole.findUnique({where:{title_category:{title:parsed.data.title,category:parsed.data.category}},select:{id:true}});
  if(duplicate)return Response.json({error:"A role with this title and category already exists."},{status:409});
  const role=await prisma.jobRole.create({data:{...parsed.data,skillWeights:parsed.data.skillWeights??{},source:"ADMIN_TEMPLATE"}});
  await prisma.auditEvent.create({data:{actorId:auth.user.id,action:"JOB_ROLE_CREATED",resourceType:"JobRole"}});
  return Response.json({role},{status:201});
}
