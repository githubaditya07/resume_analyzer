import { getServerSession } from "next-auth";
import { AppShell } from "@/components/app-shell";
import { LearningTasks } from "@/components/learning-tasks";
import { RoadmapDuration } from "@/components/roadmap-duration";
import { authOptions } from "@/lib/auth";
import { calculateLearningProgress } from "@/lib/job-catalog";
import { prisma } from "@/lib/prisma";

export default async function LearningRoadmapPage() {
  const session = await getServerSession(authOptions);
  const plans = await prisma.learningPlan.findMany({
    where:{userId:session!.user.id},
    include:{tasks:{orderBy:[{weekNumber:"asc"},{id:"asc"}]}},
    orderBy:{createdAt:"desc"}
  });
  const plan = plans[0];
  const tasks = plan?.tasks ?? [];
  const progress = calculateLearningProgress(tasks);
  return <AppShell active="/learning-roadmap">
    <div className="page-heading"><div><h1>Learning roadmap</h1><p>Small, evidence-led steps. Estimated effort is a guide, not a completion guarantee.</p></div></div>
    {!plan?<div className="card empty"><div className="empty-icon">✦</div><strong style={{fontSize:14}}>Your roadmap is waiting for an analysis</strong><p style={{fontSize:12}}>Analyze a resume locally to create a suggested learning plan.</p><a className="auth-link" href="/analyze">Analyze your resume →</a></div>:
    <><section className="card" style={{marginBottom:16}}><div style={{display:"flex",justifyContent:"space-between",gap:15,alignItems:"center"}}><div><h2 className="section-title" style={{marginBottom:6}}>{plan.title}</h2><span className="muted" style={{fontSize:11}}>{plan.durationWeeks}-week plan · {tasks.length} learning activities</span></div><div style={{display:"flex",alignItems:"center",gap:18}}><RoadmapDuration planId={plan.id} currentWeeks={plan.durationWeeks}/><strong style={{fontSize:23,color:"#0e9488"}}>{progress}%</strong></div></div><div className="progress-track" style={{marginTop:16}}><div className="progress-fill" style={{width:`${progress}%`}}/></div><div className="field-help" style={{marginTop:8}}>Progress is saved to your account when you mark a task complete.</div></section><LearningTasks tasks={tasks.map(({id,title,skill,description,estimatedHours,weekNumber,status,resourceUrl})=>({id,title,skill,description,estimatedHours,weekNumber,status,resourceUrl}))}/></>}
  </AppShell>;
}
