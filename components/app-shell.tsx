import Link from "next/link";
import { getServerSession } from "next-auth";
import { Activity, BriefcaseBusiness, FileChartColumn, FilePlus2, GraduationCap, LayoutDashboard, Settings2, Users, Briefcase, Shield, UserRound } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";

const links = [
  { href: "/dashboard", label: "Overview", Icon: LayoutDashboard },
  { href: "/analyze", label: "Analyze resume", Icon: FilePlus2 },
  { href: "/my-resumes", label: "My resumes", Icon: FileChartColumn },
  { href: "/jobs", label: "Explore roles", Icon: BriefcaseBusiness },
  { href: "/learning-roadmap", label: "Learning roadmap", Icon: GraduationCap },
  { href: "/profile", label: "Profile", Icon: UserRound }
];

export async function AppShell({ children, active }: { children: React.ReactNode; active: string }) {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name ?? "Student";
  const role = session?.user?.role;
  return <div className="shell">
    <aside className="sidebar">
      <Link href="/dashboard"><Brand /></Link>
      <nav className="nav-group" aria-label="Main navigation">
        <div className="nav-label">Workspace</div>
        {links.map(({ href, label, Icon }) => <Link key={href} href={href} className={`nav-link ${active === href ? "active" : ""}`}><Icon size={17} />{label}</Link>)}
      </nav>
      {role === "ADMIN" && <nav className="nav-group" aria-label="Administration">
        <div className="nav-label">Placement team</div>
        <Link href="/admin" className={`nav-link ${active === "/admin" ? "active" : ""}`}><Activity size={17} />Admin analytics</Link>
        <Link href="/admin/students" className={`nav-link ${active === "/admin/students" ? "active" : ""}`}><Users size={17} />Student directory</Link>
        <Link href="/admin/jobs" className={`nav-link ${active === "/admin/jobs" ? "active" : ""}`}><Briefcase size={17} />Job templates</Link>
        <Link href="/admin/settings" className={`nav-link ${active === "/admin/settings" ? "active" : ""}`}><Shield size={17} />Platform settings</Link>
      </nav>}
      <div className="nav-group sidebar-bottom">
        <div className="nav-label">Account</div>
        <Link href="/settings" className="nav-link"><Settings2 size={17} />Privacy & settings</Link>
      </div>
    </aside>
    <div className="shell-main">
      <header className="topbar">
        <div className="mobile-brand"><Link href="/dashboard"><Brand small /></Link></div>
        <span className="topbar-title">Student career workspace</span>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}><span style={{fontSize:12,color:"#5f6d82"}}>{name}</span><span className="avatar">{name.slice(0,1).toUpperCase()}</span><SignOutButton /></div>
      </header>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {links.map(({href,label})=><Link key={href} href={href} className={active===href?"active":""}>{label}</Link>)}
        {role==="ADMIN"&&<><Link href="/admin" className={active==="/admin"?"active":""}>Admin</Link><Link href="/admin/students">Students</Link><Link href="/admin/jobs">Templates</Link><Link href="/admin/settings">Admin settings</Link></>}
      </nav>
      <main className="main-content">{children}</main>
    </div>
  </div>;
}
