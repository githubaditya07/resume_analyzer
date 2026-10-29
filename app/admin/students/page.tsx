import { UserRole } from "@/generated/prisma/client";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/authorization";
import { redirect } from "next/navigation";
import { StudentDirectory } from "@/components/student-directory";

export default async function AdminStudentsPage(){
  const auth=await requireUser(UserRole.ADMIN);
  if("error" in auth)redirect("/dashboard");
  return <AppShell active="/admin/students"><div className="page-heading"><div><h1>Student directory</h1><p>Authorized directory information only. Resume contents and detailed reports are not exposed here.</p></div></div><StudentDirectory/></AppShell>;
}
