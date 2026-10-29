import { UserRole } from "@/generated/prisma/client";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AdminJobRoles } from "@/components/admin-job-roles";
import { requireUser } from "@/lib/authorization";

export default async function AdminJobsPage(){
  const auth=await requireUser(UserRole.ADMIN);
  if("error" in auth)redirect("/dashboard");
  return <AppShell active="/admin/jobs"><div className="page-heading"><div><h1>Job-role templates</h1><p>Manage reference role requirements. These templates are not live vacancies.</p></div></div><AdminJobRoles/></AppShell>;
}
