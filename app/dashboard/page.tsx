import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowRight, BriefcaseBusiness, FileText, GraduationCap, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { DashboardCharts } from "@/components/dashboard-charts";
import { authOptions } from "@/lib/auth";
import { calculateLearningProgress } from "@/lib/job-catalog";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;
  const [analysesCount, history, plans, savedCount] = await Promise.all([
    prisma.resumeAnalysis.count({ where:{userId} }),
    prisma.resumeAnalysis.findMany({ where:{userId,status:"COMPLETED"}, orderBy:{createdAt:"desc"}, take:8, select:{id:true,createdAt:true,structuredResult:true,resume:{select:{originalFilename:true}}} }),
    prisma.learningPlan.findMany({ where:{userId}, include:{tasks:{select:{status:true}}}, orderBy:{createdAt:"desc"}, take:1 }),
    prisma.savedJobRole.count({where:{userId}})
  ]);
  const latest=history[0];
  type DashboardResult={skills?:{name:string;category:string}[];roleMatches?:{title:string;score:number}[];skillGaps?:{status:string}[]};
  const result = latest?.structuredResult as DashboardResult|null;
  const roleMatches = result?.roleMatches ?? [];
  const taskProgress = calculateLearningProgress(plans[0]?.tasks ?? []);
  const skillCountValue = result?.skills?.length ?? 0;
  const categoryCounts=new Map<string,number>();
  for(const skill of result?.skills??[])categoryCounts.set(skill.category,(categoryCounts.get(skill.category)??0)+1);
  const gapCounts=new Map<string,number>();
  for(const gap of result?.skillGaps??[])gapCounts.set(gap.status,(gapCounts.get(gap.status)??0)+1);
  const selectedRole=roleMatches[0]?.title??null;
  const scoreHistory=selectedRole?history.flatMap((analysis)=>{
    const report=analysis.structuredResult as DashboardResult|null;
    const match=report?.roleMatches?.find((item)=>item.title===selectedRole);
    return match?[{id:analysis.id,date:analysis.createdAt.toLocaleDateString(),score:match.score}]:[];
  }).reverse():[];
  return <AppShell active="/dashboard">
    <div className="page-heading"><div><h1>Welcome back, {session?.user?.name?.split(" ")[0] ?? "there"}</h1><p>Your next step starts with the evidence in your resume.</p></div><Link href="/analyze" className="btn btn-primary"><Sparkles size={15}/> Analyze resume</Link></div>
    <div className="grid stats-grid">
      {[
        {label:"Resume analyses",value:analysesCount,foot:"Saved to your account",Icon:FileText},
        {label:"Skills identified",value:skillCountValue,foot:"From your latest completed report",Icon:Sparkles},
        {label:"Saved roles",value:savedCount,foot:"Reference templates, not vacancies",Icon:BriefcaseBusiness},
        {label:"Roadmap progress",value:`${taskProgress}%`,foot:plans[0]?"Based on saved learning tasks":"Create a plan from an analysis",Icon:GraduationCap}
      ].map(({label,value,foot,Icon})=><div className="card" key={label}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span className="stat-label">{label}</span><span className="stat-icon"><Icon size={17}/></span></div><div className="stat-value">{value}</div><div className="stat-foot">{foot}</div></div>)}
    </div>
    <div className="grid dashboard-grid">
      <section className="card"><h2 className="section-title">Recent activity</h2>
        {latest ? <Link href={`/analysis/${latest.id}`} className="list-row"><span><strong>{latest.resume.originalFilename}</strong><br/><span className="muted" style={{fontSize:11}}>Completed {latest.createdAt.toLocaleDateString()}</span></span><span className="badge badge-green">View report <ArrowRight size={12}/></span></Link> : <div className="empty"><div className="empty-icon"><FileText size={18}/></div><strong style={{fontSize:13}}>Your first report starts here</strong><p style={{fontSize:11}}>Analyze resume text privately with the local rules engine.</p><Link className="auth-link" href="/analyze">Start an analysis →</Link></div>}
        <div style={{marginTop:20}}><h3 className="section-title">Recommended role matches</h3>{roleMatches.length ? roleMatches.slice(0,3).map((match)=><div className="list-row" key={match.title}><span>{match.title}</span><span className="badge">{match.score}% indicative match</span></div>) : <div className="muted" style={{fontSize:12}}>Complete an analysis to see evidence-based matches.</div>}</div>
      </section>
      <aside className="grid" style={{alignContent:"start"}}>
        <div className="card"><h2 className="section-title">Your next steps</h2><Link className="list-row" href="/jobs"><span>Explore role templates</span><ArrowRight size={15}/></Link><Link className="list-row" href="/learning-roadmap"><span>Continue your learning plan</span><ArrowRight size={15}/></Link><Link className="list-row" href="/my-resumes"><span>Manage your resume data</span><ArrowRight size={15}/></Link></div>
        <div className="notice">CareerLens AI provides educational suggestions only. Match scores are not hiring probabilities or guarantees of employment.</div>
      </aside>
    </div>
    <DashboardCharts categories={[...categoryCounts].map(([label,count])=>({label,count}))} gaps={[...gapCounts].map(([label,count])=>({label,count}))} roleTitle={selectedRole} scoreHistory={scoreHistory}/>
  </AppShell>;
}
