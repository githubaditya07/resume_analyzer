import { UserRole } from "@/generated/prisma/client";
import { requireUser } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

type SummaryResult = {skills?:{name:string}[];skillGaps?:{skill:string;status:string}[];roleMatches?:{category:string;title:string}[]};

export async function GET(request:Request){
  const auth=await requireUser(UserRole.ADMIN);
  if("error" in auth)return auth.error;
  const params=new URL(request.url).searchParams;
  const rawDays=Number(params.get("days")??30);
  const days=Number.isInteger(rawDays)?Math.min(365,Math.max(7,rawDays)):30;
  const since=new Date(Date.now()-days*24*60*60*1000);
  const [students,analyses,completed,failed,records,plans,tasksDone,tasksTotal]=await Promise.all([
    prisma.user.count({where:{role:UserRole.STUDENT}}),
    prisma.resumeAnalysis.count({where:{createdAt:{gte:since}}}),
    prisma.resumeAnalysis.count({where:{createdAt:{gte:since},status:"COMPLETED"}}),
    prisma.resumeAnalysis.count({where:{createdAt:{gte:since},status:"FAILED"}}),
    prisma.resumeAnalysis.findMany({where:{createdAt:{gte:since},status:"COMPLETED"},select:{structuredResult:true}}),
    prisma.learningPlan.count({where:{createdAt:{gte:since}}}),
    prisma.learningTask.count({where:{status:"DONE",learningPlan:{createdAt:{gte:since}}}}),
    prisma.learningTask.count({where:{learningPlan:{createdAt:{gte:since}}}})
  ]);
  const skills=new Map<string,number>();const gaps=new Map<string,number>();const categories=new Map<string,number>();
  for(const record of records){
    const result=record.structuredResult as SummaryResult|null;
    for(const skill of result?.skills??[])skills.set(skill.name,(skills.get(skill.name)??0)+1);
    for(const gap of result?.skillGaps??[])if(gap.status==="NOT_DEMONSTRATED")gaps.set(gap.skill,(gaps.get(gap.skill)??0)+1);
    for(const role of result?.roleMatches??[])categories.set(role.category,(categories.get(role.category)??0)+1);
  }
  const top=(values:Map<string,number>)=>[...values.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([label,count])=>({label,count}));
  return Response.json({
    periodDays:days,
    population:"Registered student accounts; analysis activity in the selected trailing period",
    students,
    analyses:{total:analyses,completed,failed,completionRate:analyses?Math.round(completed/analyses*100):0},
    learningPlans:plans,
    learningTaskCompletion:{completed:tasksDone,total:tasksTotal,rate:tasksTotal?Math.round(tasksDone/tasksTotal*100):0},
    commonSkills:top(skills),commonGaps:top(gaps),roleCategories:top(categories)
  });
}
