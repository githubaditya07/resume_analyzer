import { AnalysisStatus } from "@/generated/prisma/client";
import { analyzeResume } from "@/lib/ai/resume-analyzer";
import { requireSameOrigin, requireUser } from "@/lib/authorization";
import { jobRoleCatalog, jobRoleTemplateSchema, calculateMatch, calculateRequirementMatch } from "@/lib/job-catalog";
import { getAnalysisRateLimitPerHour, getUploadMaxSizeMb } from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { extractResumeText, ResumeInputError } from "@/lib/resume-parser";
import { analysisRequestSchema } from "@/lib/validation";
import { getStringList } from "@/lib/profile-preferences";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const analyses = await prisma.resumeAnalysis.findMany({
    where: { userId: auth.user.id },
    select: { id: true, status: true, analysisType: true, targetRole: true, createdAt: true, completedAt: true, resume: { select: { originalFilename: true } } },
    orderBy: { createdAt: "desc" },
    take: 30
  });
  return Response.json({ analyses });
}

export async function POST(request: Request) {
  const originError=requireSameOrigin(request);
  if(originError)return originError;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const hourlyLimit = getAnalysisRateLimitPerHour();
  const recent = await prisma.auditEvent.count({
    where: { actorId: auth.user.id, action: "ANALYSIS_REQUESTED", timestamp: { gte: new Date(Date.now() - 60 * 60 * 1000) } }
  });
  if (recent >= hourlyLimit) return Response.json({ error: "You've reached the hourly analysis limit. Please try again later." }, { status: 429 });
  const maxBytes=getUploadMaxSizeMb()*1024*1024+128*1024;
  const contentLength=Number(request.headers.get("content-length")??0);
  if(contentLength>maxBytes)return Response.json({error:"The upload exceeds the configured request size limit."},{status:413});
  if(!(request.headers.get("content-type")??"").includes("multipart/form-data")&&contentLength>160_000)return Response.json({error:"Pasted resume requests must be 160 KB or smaller."},{status:413});

  let payload: Record<string, unknown> | null = null;
  let resumeText = "";
  let fileName = "Pasted resume";
  let fileType = "text";
  let hash: string;
  try {
    const type = request.headers.get("content-type") ?? "";
    if (type.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (file instanceof File) {
        const extracted = await extractResumeText(file);
        resumeText = extracted.text;
        fileName = file.name.replace(/[\\/\0]/g, "_").slice(0, 120);
        fileType = file.name.split(".").pop()?.toLowerCase() ?? "unknown";
        hash = extracted.hash;
      } else {
        const pastedText = form.get("resumeText");
        if (typeof pastedText !== "string") return Response.json({ error: "Paste resume text or choose a resume file." }, { status: 400 });
        resumeText = pastedText;
        const { createHash } = await import("node:crypto");
        hash = createHash("sha256").update(resumeText).digest("hex");
      }
      payload = {
        resumeText,
        filename: fileName,
        analysisType: form.get("analysisType"),
        targetRole: form.get("targetRole") || undefined,
        jobDescription: form.get("jobDescription") || undefined,
        durationWeeks: Number(form.get("durationWeeks") || 4),
        consent: form.get("consent") === "true"
      };
    } else {
      try { payload = await request.json(); } catch { return Response.json({error:"The analysis request body is not valid JSON."},{status:400}); }
      const data = analysisRequestSchema.safeParse(payload);
      if (!data.success) return Response.json({ error: data.error.issues[0]?.message ?? "Invalid analysis request." }, { status: 400 });
      resumeText = data.data.resumeText;
      fileName = data.data.filename;
      const { createHash } = await import("node:crypto");
      hash = createHash("sha256").update(resumeText).digest("hex");
    }

    const parsed = analysisRequestSchema.safeParse(payload);
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid analysis request." }, { status: 400 });

    const resume = await prisma.resume.create({
      data: { userId: auth.user.id, originalFilename: fileName, fileType, extractedText: resumeText, contentHash: hash! }
    });
    const analysis = await prisma.resumeAnalysis.create({
      data: {
        userId: auth.user.id,
        resumeId: resume.id,
        status: AnalysisStatus.PROCESSING,
        analysisType: parsed.data.analysisType,
        targetRole: parsed.data.targetRole,
        jobDescription: parsed.data.jobDescription
      }
    });
    await prisma.auditEvent.create({ data: { actorId: auth.user.id, action: "ANALYSIS_REQUESTED", resourceType: "ResumeAnalysis" } });

    try {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: auth.user.id },
        select: { degree: true, specialization: true, experienceLevel: true, preferredRoles: true, preferredIndustries: true, preferredLocations: true, workMode: true, learningPace: true }
      });
      const result = await analyzeResume({
        resumeText,
        analysisType: parsed.data.analysisType,
        targetRole: parsed.data.targetRole,
        jobDescription: parsed.data.jobDescription,
        preferences: profile ? {
          degree: profile.degree,
          specialization: profile.specialization,
          experienceLevel: profile.experienceLevel,
          preferredRoles: getStringList(profile.preferredRoles),
          preferredIndustries: getStringList(profile.preferredIndustries),
          preferredLocations: getStringList(profile.preferredLocations),
          workMode: profile.workMode,
          learningPace: profile.learningPace
        } : undefined
      });
      const activeRoleRecords=await prisma.jobRole.findMany({where:{isActive:true}});
      const activeRoles=activeRoleRecords.flatMap((record)=>{
        const parsed=jobRoleTemplateSchema.safeParse({title:record.title,category:record.category,description:record.description,requiredSkills:record.requiredSkills,preferredSkills:record.preferredSkills,weights:record.skillWeights});
        return parsed.success?[{...parsed.data,source:record.source}]:[];
      });
      const availableRoles=activeRoles.length?activeRoles:jobRoleCatalog;
      const scoredRoles = availableRoles
        .map((role) => ({ role, match: calculateMatch(role, result.skills) }))
        .sort((a, b) => b.match.score - a.match.score)
      const roleMatches = scoredRoles
        .filter(({match})=>match.score>0)
        .slice(0, 4)
        .map(({ role, match }) => ({ ...match, description: role.description, category: role.category }));
      const jobDescriptionMatch=parsed.data.jobDescription
        ? calculateRequirementMatch(parsed.data.targetRole??"Provided job description",result.skillGaps)
        : null;
      const weeks = parsed.data.durationWeeks;
      const suggestionsForPlan=result.learningSuggestions.slice(0,12).map((suggestion,index,all)=>({
        ...suggestion,
        week:all.length?Math.ceil((index+1)*weeks/all.length):1
      }));
      const targetScore=parsed.data.targetRole
        ?scoredRoles.find(({role})=>role.title.toLowerCase()===parsed.data.targetRole!.toLowerCase())
        :undefined;
      const targetRoleMatch=targetScore?{...targetScore.match,description:targetScore.role.description,category:targetScore.role.category}:null;
      const report = { ...result, learningSuggestions:suggestionsForPlan, roleMatches, targetRoleMatch, jobDescriptionMatch, planDurationWeeks: weeks };
      const savedRoles = await Promise.all(roleMatches.map(async (match) => {
        const role = availableRoles.find((item) => item.title === match.title && item.category === match.category)!;
        return prisma.jobRole.upsert({
          where: { title_category: { title: role.title, category: role.category } },
          create: { title: role.title, category: role.category, description: role.description, requiredSkills: role.requiredSkills, preferredSkills: role.preferredSkills, skillWeights: role.weights },
          update: {}
        });
      }));
      await prisma.$transaction([
        prisma.resumeAnalysis.update({
          where: { id: analysis.id },
          data: { status: AnalysisStatus.COMPLETED, structuredResult: report, modelIdentifier: "local-rules-v1", completedAt: new Date() }
        }),
        ...roleMatches.map((match, index) => prisma.jobRecommendation.upsert({
          where: { analysisId_jobRoleId: { analysisId: analysis.id, jobRoleId: savedRoles[index].id } },
          create: {
            analysisId: analysis.id,
            jobRoleId: savedRoles[index].id,
            matchScore: match.score,
            explanation: match.explanation,
            matchingSkills: match.matchingSkills,
            partialSkills: match.partialSkills,
            missingEvidenceSkills: match.missingEvidenceSkills
          },
          update: { matchScore: match.score, explanation: match.explanation, matchingSkills: match.matchingSkills, partialSkills: match.partialSkills, missingEvidenceSkills: match.missingEvidenceSkills }
        })),
        prisma.learningPlan.create({
          data: {
            userId: auth.user.id,
            analysisId: analysis.id,
            title: `Career preparation plan — ${fileName}`,
            durationWeeks: weeks,
            tasks: {
              create: suggestionsForPlan.map((suggestion, index) => ({
                title: suggestion.targetOutcome,
                skill: suggestion.skill,
                description: `${suggestion.reason} Project: ${suggestion.project} Completion: ${suggestion.completionCriteria}`,
                estimatedHours: suggestion.estimatedHours,
                priority: index < 3 ? "HIGH" : "MEDIUM",
                weekNumber: suggestion.week
              }))
            }
          }
        })
      ]);
      return Response.json({ id: analysis.id }, { status: 201 });
    } catch (error) {
      await prisma.resumeAnalysis.update({
        where: { id: analysis.id },
        data: { status: AnalysisStatus.FAILED, errorCode: "LOCAL_ANALYSIS_FAILED", completedAt: new Date() }
      });
      console.error("Analysis processing failed", { analysisId: analysis.id, errorType: error instanceof Error ? error.name : "UnknownError" });
      return Response.json({ error: "The local analysis couldn't be completed. Your resume is saved; please retry." }, { status: 502 });
    }
  } catch (error) {
    if(error instanceof ResumeInputError)return Response.json({error:error.message},{status:400});
    console.error("Analysis request failed", { errorType: error instanceof Error ? error.name : "UnknownError" });
    return Response.json({ error: "Analysis is temporarily unavailable." }, { status: 503 });
  }
}
