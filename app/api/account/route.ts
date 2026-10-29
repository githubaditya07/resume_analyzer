import { compare } from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireSameOrigin } from "@/lib/authorization";

export async function DELETE(request:Request){
  const originError=requireSameOrigin(request);
  if(originError)return originError;
  const session=await getServerSession(authOptions);
  if(!session?.user?.id)return Response.json({error:"Authentication required."},{status:401});
  const body=await request.json().catch(()=>null);
  if(!body||typeof body.password!=="string"||body.confirm!=="DELETE")return Response.json({error:"Enter your password and type DELETE to confirm."},{status:400});
  const user=await prisma.user.findUnique({where:{id:session.user.id},select:{passwordHash:true}});
  if(!user||!(await compare(body.password,user.passwordHash)))return Response.json({error:"The password is incorrect."},{status:403});
  await prisma.user.delete({where:{id:session.user.id}});
  return Response.json({ok:true});
}
