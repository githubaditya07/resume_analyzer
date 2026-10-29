import { requireSameOrigin,requireUser } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const durationSchema=z.object({durationWeeks:z.union([z.literal(2),z.literal(4),z.literal(8)])});

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  const originError=requireSameOrigin(request);
  if(originError)return originError;
  const auth=await requireUser();
  if("error" in auth)return auth.error;
  const {id}=await params;
  const parsed=durationSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return Response.json({error:"Choose a roadmap length of 2, 4, or 8 weeks."},{status:400});
  const plan=await prisma.learningPlan.findFirst({where:{id,userId:auth.user.id},select:{id:true,tasks:{select:{id:true},orderBy:[{weekNumber:"asc"},{id:"asc"}]}}});
  if(!plan)return Response.json({error:"Learning plan not found."},{status:404});
  await prisma.$transaction([
    prisma.learningPlan.update({where:{id},data:{durationWeeks:parsed.data.durationWeeks}}),
    ...plan.tasks.map((task,index)=>prisma.learningTask.update({
      where:{id:task.id},
      data:{weekNumber:Math.ceil((index+1)*parsed.data.durationWeeks/plan.tasks.length)||1}
    }))
  ]);
  return Response.json({ok:true});
}
