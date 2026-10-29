import { UserRole } from "@/generated/prisma/client";
import { requireUser } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export async function GET(request:Request){
  const auth=await requireUser(UserRole.ADMIN);
  if("error" in auth)return auth.error;
  const year=Number(new URL(request.url).searchParams.get("graduationYear"));
  const students=await prisma.user.findMany({
    where:{role:UserRole.STUDENT,...(Number.isInteger(year)&&year>0?{profile:{graduationYear:year}}:{})},
    select:{id:true,name:true,email:true,createdAt:true,profile:{select:{degree:true,specialization:true,graduationYear:true}},_count:{select:{analyses:true}}},
    orderBy:{createdAt:"desc"},take:100
  });
  return Response.json({students});
}
