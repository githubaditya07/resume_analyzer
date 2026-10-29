import { UserRole } from "@/generated/prisma/client";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/authorization";

export default async function AdminSettingsPage(){
  const auth=await requireUser(UserRole.ADMIN);
  if("error" in auth)redirect("/dashboard");
  return <AppShell active="/admin/settings"><div className="page-heading"><div><h1>Platform settings</h1><p>Operational configuration for this local installation.</p></div></div><div className="grid" style={{maxWidth:760}}><section className="card"><h2 className="section-title">Data retention and privacy</h2><p className="muted" style={{fontSize:12,lineHeight:1.75}}>Uploaded binaries are not stored. Extracted resume text and structured reports remain in the local SQLite database until a student deletes them or an account is deleted. Resume analysis runs locally and does not call an external AI provider.</p><div className="list-row"><span>Database</span><strong>Local SQLite</strong></div><div className="list-row"><span>Analysis engine</span><strong>Local rules (offline)</strong></div><div className="list-row"><span>Upload size limit</span><strong>{process.env.UPLOAD_MAX_SIZE_MB??"5"} MB</strong></div><div className="list-row"><span>Analysis requests per user per hour</span><strong>{process.env.ANALYSIS_RATE_LIMIT_PER_HOUR??"5"}</strong></div></section><div className="notice">This installation stores its database and generated session secret in the .local-data folder. Keep backups private and remove that folder only after exporting any data you need.</div></div></AppShell>;
}
