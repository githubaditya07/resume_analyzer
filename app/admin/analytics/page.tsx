import { UserRole } from "@/generated/prisma/client";
import { redirect } from "next/navigation";
import { AdminAnalytics } from "@/components/admin-analytics";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/authorization";

export default async function AdminAnalyticsPage(){
  const auth=await requireUser(UserRole.ADMIN);
  if("error" in auth)redirect("/dashboard");
  return <AppShell active="/admin"><div className="page-heading"><div><h1>Aggregate analytics</h1><p>Trailing 30-day usage and learning trends. Students are not ranked.</p></div></div><AdminAnalytics/></AppShell>;
}
