import { z } from "zod";

export const registrationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(10).max(128)
});

export const analysisRequestSchema = z.object({
  resumeText: z.string().trim().min(80, "Please provide at least 80 characters of resume text.").max(30000),
  filename: z.string().trim().min(1).max(120).default("Pasted resume"),
  analysisType: z.enum(["GENERAL", "INTERNSHIP", "ENTRY_LEVEL", "JOB_DESCRIPTION"]).default("GENERAL"),
  targetRole: z.string().trim().max(100).optional(),
  jobDescription: z.string().trim().max(12000).optional(),
  durationWeeks: z.union([z.literal(2), z.literal(4), z.literal(8)]).default(4),
  consent: z.literal(true, { error: "Consent is required to analyze and save this resume." })
}).refine((value) => value.analysisType !== "JOB_DESCRIPTION" || !!value.jobDescription, {
  path: ["jobDescription"],
  message: "Add the job description for a job-specific analysis."
});

const text = (max = 500) => z.string().trim().min(1).max(max);

export const analysisResultSchema = z.object({
  summary: text(1200),
  profileOverview: z.object({
    education: text(500),
    experience: text(500),
    projects: text(500),
    relevantDomains: z.array(text(80)).max(8),
    missingInformation: z.array(text(180)).max(8)
  }),
  skills: z.array(z.object({
    name: text(80),
    category: text(60),
    evidenceType: z.enum(["MENTIONED", "PROJECT", "EXPERIENCE", "CERTIFICATION", "INFERRED"]),
    evidence: text(240),
    confidence: z.number().min(0).max(1),
    nextAction: text(240)
  })).max(40),
  strengths: z.array(z.object({ title: text(100), evidence: text(240), action: text(240) })).max(10),
  improvementAreas: z.array(z.object({
    section: text(80),
    priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
    issue: text(240),
    whyItMatters: text(240),
    recommendation: text(300),
    exampleRewrite: z.string().max(400).nullable()
  })).max(12),
  recommendedRoles: z.array(z.object({
    title: text(100),
    whyRelevant: text(300),
    preparationSteps: z.array(text(200)).max(5)
  })).max(8),
  skillGaps: z.array(z.object({
    role: text(100),
    skill: text(80),
    importance: z.enum(["CRITICAL", "IMPORTANT", "OPTIONAL"]),
    status: z.enum(["DEMONSTRATED", "PARTIAL", "NOT_DEMONSTRATED"]),
    whyItMatters: text(240),
    learningActivity: text(240),
    effortHours: z.string().max(40)
  })).max(30),
  learningSuggestions: z.array(z.object({
    skill: text(80),
    reason: text(240),
    targetOutcome: text(240),
    project: text(240),
    completionCriteria: text(240),
    estimatedHours: z.number().int().min(1).max(500),
    week: z.number().int().min(1).max(8)
  })).max(12),
  atsReview: z.object({
    summary: text(300),
    concerns: z.array(text(200)).max(10)
  }),
  priorityActions: z.array(text(240)).max(5),
  limitations: z.array(text(200)).max(8)
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;
