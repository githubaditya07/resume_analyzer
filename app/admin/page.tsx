import { UserRole } from "@/generated/prisma/client";
import { AppShell } from "@/components/app-shell";
import { AdminAnalytics } from "@/components/admin-analytics";
import { requireUser } from "@/lib/authorization";
import { redirect } from "next/navigation";

export default async function AdminPage(){
  const auth=await requireUser(UserRole.ADMIN);
  if("error" in auth)redirect("/dashboard");
  return <AppShell active="/admin"><div className="page-heading"><div><h1>Placement overview</h1><p>Aggregate usage and skill trends from the last 30 days. This is not a student ranking.</p></div></div><AdminAnalytics/></AppShell>;
}
