import { UserRole } from "@/generated/prisma/client";
import { z } from "zod";
import { requireSameOrigin, requireUser } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

const updateSchema=z.object({
  title:z.string().trim().min(2).max(100).optional(),
  category:z.string().trim().min(2).max(80).optional(),
  description:z.string().trim().min(10).max(500).optional(),
  requiredSkills:z.array(z.string().trim().min(1).max(80)).min(1).max(20).optional(),
  preferredSkills:z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  skillWeights:z.record(z.string(),z.number().min(0).max(10)).optional().superRefine((value,context)=>{if(Object.keys(value??{}).length>20)context.addIssue({code:"custom",message:"A role may contain at most 20 skill weights."});}),
  isActive:z.boolean().optional()
});

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  const originError=requireSameOrigin(request);
  if(originError)return originError;
  const auth=await requireUser(UserRole.ADMIN);
  if("error" in auth)return auth.error;
  const {id}=await params;
  const parsed=updateSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success||!Object.keys(parsed.data??{}).length)return Response.json({error:"No valid role changes were supplied."},{status:400});
  const existing=await prisma.jobRole.findUnique({where:{id},select:{title:true,category:true}});
  if(!existing)return Response.json({error:"Job role not found."},{status:404});
  const title=parsed.data.title??existing.title;
  const category=parsed.data.category??existing.category;
  const duplicate=await prisma.jobRole.findFirst({where:{title,category,id:{not:id}},select:{id:true}});
  if(duplicate)return Response.json({error:"A role with this title and category already exists."},{status:409});
  const result=await prisma.jobRole.updateMany({where:{id},data:parsed.data});
  if(!result.count)return Response.json({error:"Job role not found."},{status:404});
  await prisma.auditEvent.create({data:{actorId:auth.user.id,action:"JOB_ROLE_UPDATED",resourceType:"JobRole"}});
  return Response.json({ok:true});
}

export async function DELETE(_request:Request,{params}:{params:Promise<{id:string}>}){
  const originError=requireSameOrigin(_request);
  if(originError)return originError;
  const auth=await requireUser(UserRole.ADMIN);
  if("error" in auth)return auth.error;
  const {id}=await params;
  const role=await prisma.jobRole.findUnique({where:{id},select:{id:true,_count:{select:{recommendations:true,savedBy:true}}}});
  if(!role)return Response.json({error:"Job role not found."},{status:404});
  if(role._count.recommendations||role._count.savedBy)return Response.json({error:"This role is referenced by saved student data. Deactivate it instead of deleting it."},{status:409});
  await prisma.jobRole.delete({where:{id}});
  await prisma.auditEvent.create({data:{actorId:auth.user.id,action:"JOB_ROLE_DELETED",resourceType:"JobRole"}});
  return Response.json({ok:true});
}
