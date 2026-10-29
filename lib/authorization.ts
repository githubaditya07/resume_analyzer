import { getServerSession } from "next-auth";
import { UserRole } from "@/generated/prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireUser(role?: UserRole) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: Response.json({ error: "Authentication required." }, { status: 401 }) } as const;
  const currentUser=await prisma.user.findUnique({where:{id:session.user.id},select:{role:true}});
  if(!currentUser)return {error:Response.json({error:"Authentication required."},{status:401})} as const;
  if(role&&currentUser.role!==role)return { error: Response.json({ error: "You are not authorized to perform this action." }, { status: 403 }) } as const;
  return { user: { ...session.user, role: currentUser.role } } as const;
}

export function genericError(message = "The request could not be completed. Please try again.") {
  return Response.json({ error: message }, { status: 400 });
}

export function requireSameOrigin(request:Request){
  const origin=request.headers.get("origin");
  if(!origin)return null;
  const expectedHost=request.headers.get("x-forwarded-host")??request.headers.get("host")??new URL(request.url).host;
  let originUrl:URL;
  try{originUrl=new URL(origin);}catch{return Response.json({error:"Cross-origin request rejected."},{status:403});}
  if(originUrl.host!==expectedHost)return Response.json({error:"Cross-origin request rejected."},{status:403});
  const forwardedProto=request.headers.get("x-forwarded-proto");
  if(forwardedProto&&originUrl.protocol!==`${forwardedProto.split(",")[0].trim()}:`)return Response.json({error:"Cross-origin request rejected."},{status:403});
  return null;
}
