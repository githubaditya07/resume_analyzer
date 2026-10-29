import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { requireSameOrigin } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

const profileSchema=z.object({
  degree:z.string().trim().max(120).optional().nullable(),
  specialization:z.string().trim().max(120).optional().nullable(),
  graduationYear:z.union([z.number().int().min(1950).max(2100),z.null()]).optional(),
  experienceLevel:z.string().trim().max(60).optional().nullable(),
  preferredRoles:z.array(z.string().trim().min(1).max(80)).max(10).optional(),
  preferredIndustries:z.array(z.string().trim().min(1).max(80)).max(10).optional(),
  preferredLocations:z.array(z.string().trim().min(1).max(80)).max(10).optional(),
  workMode:z.string().trim().max(40).optional().nullable(),
  learningPace:z.string().trim().max(40).optional().nullable()
});

export async function GET(){
  const session=await getServerSession(authOptions);
  if(!session?.user?.id)return Response.json({error:"Authentication required."},{status:401});
  const profile=await prisma.studentProfile.findUnique({where:{userId:session.user.id}});
  return Response.json({profile});
}

export async function PATCH(request:Request){
  const originError=requireSameOrigin(request);
  if(originError)return originError;
  const session=await getServerSession(authOptions);
  if(!session?.user?.id)return Response.json({error:"Authentication required."},{status:401});
  const parsed=profileSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return Response.json({error:"Check the profile fields and try again."},{status:400});
  const profile=await prisma.studentProfile.upsert({where:{userId:session.user.id},create:{userId:session.user.id,preferredRoles:[],preferredIndustries:[],preferredLocations:[],...parsed.data},update:parsed.data});
  return Response.json({profile});
}
