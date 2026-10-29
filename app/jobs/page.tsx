import { AppShell } from "@/components/app-shell";
import { JobExplorer } from "@/components/job-explorer";

export default function JobsPage(){return <AppShell active="/jobs"><div className="page-heading"><div><h1>Explore roles</h1><p>Reference role templates to discover requirements—not live job listings.</p></div></div><JobExplorer/></AppShell>;}
