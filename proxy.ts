import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { getAuthSecret } from "@/lib/auth-secret";

export async function proxy(request:NextRequest){
  const token=await getToken({req:request,secret:getAuthSecret()});
  if(token)return NextResponse.next();
  const loginUrl=new URL("/login",request.url);
  loginUrl.searchParams.set("callbackUrl",`${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/analyze/:path*", "/analysis/:path*", "/my-resumes/:path*", "/jobs/:path*", "/learning-roadmap/:path*", "/profile/:path*", "/settings/:path*", "/admin/:path*"]
};
