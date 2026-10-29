import { AnalysisStatus } from "@/generated/prisma/client";
import { analyzeResume } from "@/lib/ai/resume-analyzer";
import { requireSameOrigin, requireUser } from "@/lib/authorization";
import { calculateMatch, calculateRequirementMatch, jobRoleCatalog, jobRoleTemplateSchema } from "@/lib/job-catalog";
import { getAnalysisRateLimitPerHour } from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { analysisRequestSchema } from "@/lib/validation";
import { getStringList } from "@/lib/profile-preferences";

export const runtime="nodejs";
export const maxDuration=60;

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const originError=requireSameOrigin(request);
  if(originError)return originError;
  const auth=await requireUser();
  if("error" in auth)return auth.error;
  const {id}=await params;
  const body=await request.json().catch(()=>null);
  const durationWeeks=body&&typeof body==="object"&&"durationWeeks" in body?body.durationWeeks:4;
  const requestCheck=analysisRequestSchema.safeParse({resumeText:"x".repeat(80),consent:true,durationWeeks});
  if(!requestCheck.success)return Response.json({error:"Choose a roadmap length of 2, 4, or 8 weeks."},{status:400});
  const analysis=await prisma.resumeAnalysis.findFirst({
    where:{id,userId:auth.user.id,status:AnalysisStatus.FAILED},
    select:{id:true,analysisType:true,targetRole:true,jobDescription:true,resume:{select:{extractedText:true,originalFilename:true}}}
  });
  if(!analysis)return Response.json({error:"A failed analysis for this account could not be found."},{status:404});
  const recent=await prisma.auditEvent.count({where:{actorId:auth.user.id,action:"ANALYSIS_REQUESTED",timestamp:{gte:new Date(Date.now()-60*60*1000)}}});
  if(recent>=getAnalysisRateLimitPerHour())return Response.json({error:"You've reached the hourly analysis limit."},{status:429});
  const claimed=await prisma.resumeAnalysis.updateMany({where:{id,userId:auth.user.id,status:AnalysisStatus.FAILED},data:{status:AnalysisStatus.PROCESSING,errorCode:null,completedAt:null}});
  if(!claimed.count)return Response.json({error:"This analysis is already being retried or is no longer available."},{status:409});
  try{
    await prisma.auditEvent.create({data:{actorId:auth.user.id,action:"ANALYSIS_REQUESTED",resourceType:"ResumeAnalysis"}});
    const profile=await prisma.studentProfile.findUnique({where:{userId:auth.user.id},select:{degree:true,specialization:true,experienceLevel:true,preferredRoles:true,preferredIndustries:true,preferredLocations:true,workMode:true,learningPace:true}});
    const result=await analyzeResume({resumeText:analysis.resume.extractedText,analysisType:analysis.analysisType,targetRole:analysis.targetRole??undefined,jobDescription:analysis.jobDescription??undefined,preferences:profile?{
      degree:profile.degree,
      specialization:profile.specialization,
      experienceLevel:profile.experienceLevel,
      preferredRoles:getStringList(profile.preferredRoles),
      preferredIndustries:getStringList(profile.preferredIndustries),
      preferredLocations:getStringList(profile.preferredLocations),
      workMode:profile.workMode,
      learningPace:profile.learningPace
    }:undefined});
    const activeRoleRecords=await prisma.jobRole.findMany({where:{isActive:true}});
    const activeRoles=activeRoleRecords.flatMap((record)=>{
      const parsed=jobRoleTemplateSchema.safeParse({title:record.title,category:record.category,description:record.description,requiredSkills:record.requiredSkills,preferredSkills:record.preferredSkills,weights:record.skillWeights});
      return parsed.success?[parsed.data]:[];
    });
    const roleCatalog=activeRoles.length?activeRoles:jobRoleCatalog;
    const scoredRoles=roleCatalog.map((role)=>({role,match:calculateMatch(role,result.skills)})).sort((a,b)=>b.match.score-a.match.score);
    const roleMatches=scoredRoles.filter(({match})=>match.score>0).slice(0,4).map(({role,match})=>({...match,description:role.description,category:role.category}));
    const jobDescriptionMatch=analysis.jobDescription?calculateRequirementMatch(analysis.targetRole??"Provided job description",result.skillGaps):null;
    const targetScore=analysis.targetRole?scoredRoles.find(({role})=>role.title.toLowerCase()===analysis.targetRole!.toLowerCase()):undefined;
    const targetRoleMatch=targetScore?{...targetScore.match,description:targetScore.role.description,category:targetScore.role.category}:null;
    const suggestionsForPlan=result.learningSuggestions.slice(0,12).map((suggestion,index,all)=>({...suggestion,week:all.length?Math.ceil((index+1)*durationWeeks/all.length):1}));
    const savedRoles=await Promise.all(roleMatches.map(async(match)=>{
      const template=roleCatalog.find((role)=>role.title===match.title&&role.category===match.category)!;
      return prisma.jobRole.upsert({where:{title_category:{title:template.title,category:template.category}},create:{title:template.title,category:template.category,description:template.description,requiredSkills:template.requiredSkills,preferredSkills:template.preferredSkills,skillWeights:template.weights},update:{}});
    }));
    const weeks=durationWeeks as 2|4|8;
    await prisma.$transaction([
      prisma.resumeAnalysis.update({where:{id},data:{status:AnalysisStatus.COMPLETED,structuredResult:{...result,learningSuggestions:suggestionsForPlan,roleMatches,targetRoleMatch,jobDescriptionMatch,planDurationWeeks:weeks},modelIdentifier:"local-rules-v1",completedAt:new Date()}}),
      ...roleMatches.map((match,index)=>prisma.jobRecommendation.upsert({
        where:{analysisId_jobRoleId:{analysisId:id,jobRoleId:savedRoles[index].id}},
        create:{analysisId:id,jobRoleId:savedRoles[index].id,matchScore:match.score,explanation:match.explanation,matchingSkills:match.matchingSkills,partialSkills:match.partialSkills,missingEvidenceSkills:match.missingEvidenceSkills},
        update:{matchScore:match.score,explanation:match.explanation,matchingSkills:match.matchingSkills,partialSkills:match.partialSkills,missingEvidenceSkills:match.missingEvidenceSkills}
      })),
      prisma.learningPlan.create({data:{userId:auth.user.id,analysisId:id,title:`Career preparation plan — ${analysis.resume.originalFilename}`,durationWeeks:weeks,tasks:{create:suggestionsForPlan.map((suggestion,index)=>({title:suggestion.targetOutcome,skill:suggestion.skill,description:`${suggestion.reason} Project: ${suggestion.project} Completion: ${suggestion.completionCriteria}`,estimatedHours:suggestion.estimatedHours,priority:index<3?"HIGH":"MEDIUM",weekNumber:suggestion.week}))}}})
    ]);
    return Response.json({id});
  }catch(error){
    await prisma.resumeAnalysis.update({where:{id},data:{status:AnalysisStatus.FAILED,errorCode:"LOCAL_ANALYSIS_FAILED",completedAt:new Date()}});
    console.error("Analysis retry failed",{analysisId:id,errorType:error instanceof Error?error.name:"UnknownError"});
    return Response.json({error:"The local analysis could not be completed. Please retry."},{status:503});
  }
}
