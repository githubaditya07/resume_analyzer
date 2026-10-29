import { calculateMatch, jobRoleCatalog } from "@/lib/job-catalog";
import { analysisResultSchema, type AnalysisResult } from "@/lib/validation";

type SkillDefinition = {
  name: string;
  category: string;
  terms?: string[];
};

const skillDefinitions: SkillDefinition[] = [
  { name: "JavaScript", category: "Programming", terms: ["javascript", "js"] },
  { name: "TypeScript", category: "Programming", terms: ["typescript", "ts"] },
  { name: "Python", category: "Programming" },
  { name: "Java", category: "Programming" },
  { name: "C++", category: "Programming" },
  { name: "C#", category: "Programming" },
  { name: "HTML", category: "Web development" },
  { name: "CSS", category: "Web development" },
  { name: "React", category: "Web development" },
  { name: "Next.js", category: "Web development", terms: ["next.js", "nextjs"] },
  { name: "Node.js", category: "Web development", terms: ["node.js", "nodejs"] },
  { name: "SQL", category: "Data" },
  { name: "PostgreSQL", category: "Data" },
  { name: "MySQL", category: "Data" },
  { name: "MongoDB", category: "Data" },
  { name: "SQLite", category: "Data" },
  { name: "Excel", category: "Data", terms: ["excel", "microsoft excel"] },
  { name: "Power BI", category: "Data" },
  { name: "Tableau", category: "Data" },
  { name: "Data Analysis", category: "Data", terms: ["data analysis", "data analytics"] },
  { name: "Statistics", category: "Data" },
  { name: "Machine Learning", category: "Data", terms: ["machine learning", "ml"] },
  { name: "Git", category: "Tools" },
  { name: "Docker", category: "Tools" },
  { name: "Linux", category: "Tools" },
  { name: "AWS", category: "Cloud", terms: ["aws", "amazon web services"] },
  { name: "Azure", category: "Cloud", terms: ["azure", "microsoft azure"] },
  { name: "Google Cloud", category: "Cloud", terms: ["google cloud", "gcp"] },
  { name: "REST API", category: "Backend", terms: ["rest api", "restful api", "api development"] },
  { name: "Testing", category: "Engineering", terms: ["testing", "unit tests", "software testing", "quality assurance"] },
  { name: "Automation", category: "Engineering", terms: ["automation", "test automation"] },
  { name: "Communication", category: "Professional", terms: ["communication", "presentations"] },
  { name: "Project Management", category: "Professional" },
  { name: "Figma", category: "Design" },
  { name: "Accessibility", category: "Web development" }
];

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function findEvidenceLine(text: string, terms: string[]) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (const line of lines) {
    if (terms.some((term) => new RegExp(`(^|[^a-z0-9])${escapeRegex(term).replace(/\s+/g, "\\s+")}(?=$|[^a-z0-9])`, "i").test(line))) {
      return line.slice(0, 220);
    }
  }
  return "";
}

function getEvidenceType(line: string): AnalysisResult["skills"][number]["evidenceType"] {
  if (/\b(certified|certification|certificate)\b/i.test(line)) return "CERTIFICATION";
  if (/\b(project|built|implemented|developed|created|designed)\b/i.test(line)) return "PROJECT";
  if (/\b(experience|worked|employment|intern|company|role)\b/i.test(line)) return "EXPERIENCE";
  return "MENTIONED";
}

function extractSection(text: string, heading: RegExp) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const start = lines.findIndex((line) => heading.test(line));
  if (start < 0) return "";
  const section = lines.slice(start + 1, start + 7).filter((line) => !/^(education|experience|work history|employment|projects?|skills|certifications?|summary|objective)\s*:?\s*$/i.test(line));
  return section.join(" ").slice(0, 450);
}

function makeLearningSuggestions(gaps: AnalysisResult["skillGaps"]) {
  return gaps
    .filter((gap) => gap.status !== "DEMONSTRATED")
    .slice(0, 6)
    .map((gap, index) => ({
      skill: gap.skill,
      reason: `The resume does not yet show strong evidence of ${gap.skill} for the ${gap.role} role.`,
      targetOutcome: `Demonstrate a practical ${gap.skill} skill`,
      project: `Complete a small portfolio exercise that uses ${gap.skill} in a realistic ${gap.role} task.`,
      completionCriteria: `Document the work, your contribution, and one verifiable result without adding unsupported claims.`,
      estimatedHours: 4 + index * 2,
      week: index + 1
    }));
}

export async function analyzeResume(input: {
  resumeText: string;
  analysisType: string;
  targetRole?: string;
  jobDescription?: string;
  preferences?: {
    degree?: string | null;
    specialization?: string | null;
    experienceLevel?: string | null;
    preferredRoles?: string[];
    preferredIndustries?: string[];
    preferredLocations?: string[];
    workMode?: string | null;
    learningPace?: string | null;
  };
}): Promise<AnalysisResult> {
  const resumeText = input.resumeText.slice(0, 30_000);
  const skills = skillDefinitions.flatMap((definition) => {
    const terms = [definition.name, ...(definition.terms ?? [])];
    const evidence = findEvidenceLine(resumeText, terms);
    if (!evidence) return [];
    const evidenceType = getEvidenceType(evidence);
    return [{
      name: definition.name,
      category: definition.category,
      evidenceType,
      evidence,
      confidence: evidenceType === "MENTIONED" ? 0.68 : 0.88,
      nextAction: `Add a specific, truthful example showing how you used ${definition.name}.`
    }];
  });

  const rankedRoles = jobRoleCatalog
    .map((role) => ({ role, match: calculateMatch(role, skills) }))
    .sort((left, right) => right.match.score - left.match.score);
  const selectedRole = rankedRoles.find(({ role }) => role.title.toLowerCase() === input.targetRole?.toLowerCase())
    ?? rankedRoles[0];
  const descriptionSkills = input.jobDescription
    ? skillDefinitions.filter((definition) => findEvidenceLine(input.jobDescription!, [definition.name, ...(definition.terms ?? [])]))
    : [];
  const requiredSkills = descriptionSkills.length
    ? descriptionSkills.map((definition) => definition.name)
    : [...selectedRole.role.requiredSkills, ...selectedRole.role.preferredSkills];
  const skillGaps = [...new Set(requiredSkills)].slice(0, 20).map((skill) => {
    const found = skills.find((item) => item.name.toLowerCase() === skill.toLowerCase());
    const important = selectedRole.role.requiredSkills.some((required) => required.toLowerCase() === skill.toLowerCase());
    return {
      role: input.targetRole || selectedRole.role.title,
      skill,
      importance: important ? "IMPORTANT" as const : "OPTIONAL" as const,
      status: !found ? "NOT_DEMONSTRATED" as const : found.evidenceType === "MENTIONED" ? "PARTIAL" as const : "DEMONSTRATED" as const,
      whyItMatters: `${skill} is listed in the role requirements. This describes resume evidence, not your ability.`,
      learningActivity: `Build or document a practical example that demonstrates ${skill}.`,
      effortHours: "4-8 hours"
    };
  });

  const education = extractSection(resumeText, /^education\b/i)
    || (/\b(bachelor|master|b\.?tech|b\.?sc|b\.?e|diploma|university|college)\b/i.test(resumeText)
      ? "Education-related details are present in the resume text."
      : "No education details were identified in the supplied text.");
  const experience = extractSection(resumeText, /^(experience|work history|employment)\b/i)
    || "No clearly labeled work-experience section was identified in the supplied text.";
  const projects = extractSection(resumeText, /^projects?\b/i)
    || (/\b(project|built|implemented|developed)\b/i.test(resumeText)
      ? "Project-related work is mentioned; a clearly labeled project section was not identified."
      : "No project details were identified in the supplied text.");
  const strengths: AnalysisResult["strengths"] = [];
  if (skills.length) {
    strengths.push({
      title: "Relevant skills are named",
      evidence: `The resume text explicitly mentions ${skills.slice(0, 5).map((skill) => skill.name).join(", ")}.`,
      action: "Keep these skills connected to concrete projects or work examples."
    });
  }
  if (/\b(project|built|implemented|developed|created)\b/i.test(resumeText)) {
    strengths.push({
      title: "Practical work is described",
      evidence: "The resume text includes project or implementation language.",
      action: "Clarify your individual contribution and the outcome for each example."
    });
  }
  if (/\b\d+(\.\d+)?\s*(%|percent|users|customers|hours|days|weeks)\b/i.test(resumeText)) {
    strengths.push({
      title: "Some outcomes are quantified",
      evidence: "The resume text includes at least one number or measurable unit.",
      action: "Retain only figures you can explain and verify."
    });
  }
  if (!strengths.length) {
    strengths.push({
      title: "A starting point for review is available",
      evidence: "Resume text was provided for a structured review.",
      action: "Add clear section headings and specific examples to make your experience easier to understand."
    });
  }

  const improvementAreas: AnalysisResult["improvementAreas"] = [];
  if (!/^projects?\b/im.test(resumeText)) {
    improvementAreas.push({
      section: "Projects",
      priority: "MEDIUM",
      issue: "A clearly labeled projects section was not identified.",
      whyItMatters: "A dedicated section can make practical experience easier to find.",
      recommendation: "If you have relevant projects, list each with your contribution, tools, and outcome.",
      exampleRewrite: null
    });
  }
  if (!/\b\d+(\.\d+)?\s*(%|percent|users|customers|hours|days|weeks)\b/i.test(resumeText)) {
    improvementAreas.push({
      section: "Evidence",
      priority: "LOW",
      issue: "The supplied text contains few measurable outcomes.",
      whyItMatters: "Specific results can help readers understand the scope of your work.",
      recommendation: "Where accurate and verifiable, add scale, time saved, or another relevant result.",
      exampleRewrite: null
    });
  }
  if (!improvementAreas.length) {
    improvementAreas.push({
      section: "Role alignment",
      priority: "LOW",
      issue: "Some role requirements are not clearly demonstrated in the supplied text.",
      whyItMatters: "Readers can only assess the evidence that appears in the resume.",
      recommendation: "Add relevant examples only when they reflect work you have actually done.",
      exampleRewrite: null
    });
  }

  const roleRecommendations = rankedRoles.slice(0, 4).map(({ role, match }) => ({
    title: role.title,
    whyRelevant: `${match.coverage}% of this reference role's skills have some resume evidence. This is an indicative comparison, not a hiring prediction.`,
    preparationSteps: (match.missingEvidenceSkills.length
      ? match.missingEvidenceSkills.slice(0, 3).map((skill) => `If accurate, add an example demonstrating ${skill}.`)
      : ["Keep the evidence current and prepare to discuss your examples."])
  }));
  const result = {
    summary: `This offline, rules-based review found ${skills.length} explicitly named skills and ${skillGaps.filter((gap) => gap.status !== "DEMONSTRATED").length} areas with limited or missing resume evidence. It does not determine your actual abilities.`,
    profileOverview: {
      education,
      experience,
      projects,
      relevantDomains: [...new Set(skills.map((skill) => skill.category))].slice(0, 8),
      missingInformation: [
        ...(!/^education\b/im.test(resumeText) ? ["A clearly labeled education section"] : []),
        ...(!/^(experience|work history|employment)\b/im.test(resumeText) ? ["A clearly labeled work-experience section"] : []),
        ...(!/^projects?\b/im.test(resumeText) ? ["A clearly labeled projects section"] : [])
      ].slice(0, 8)
    },
    skills,
    strengths: strengths.slice(0, 10),
    improvementAreas: improvementAreas.slice(0, 12),
    recommendedRoles: roleRecommendations,
    skillGaps,
    learningSuggestions: makeLearningSuggestions(skillGaps),
    atsReview: {
      summary: "This local check looks for readable text, common section headings, and explicit skill keywords. It is not a commercial ATS simulation.",
      concerns: [
        ...(!/^education\b/im.test(resumeText) ? ["Consider using a clear Education heading if relevant."] : []),
        ...(!/^skills\b/im.test(resumeText) ? ["A clearly labeled Skills section was not identified."] : []),
        ...(!/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(resumeText) ? ["No email address was identified in the supplied text."] : [])
      ]
    },
    priorityActions: [
      "Review every observation and correct anything that does not match your experience.",
      ...makeLearningSuggestions(skillGaps).slice(0, 3).map((suggestion) => suggestion.targetOutcome)
    ].slice(0, 5),
    limitations: [
      "This report is generated locally using keyword and section-heading rules; it does not use a language model or send resume text to an external analysis service.",
      "Keyword matching can miss synonyms, context, formatting, and skills that are not explicitly named.",
      "A missing resume mention does not mean you lack a skill. Verify all suggestions and never add unsupported claims."
    ]
  };
  return analysisResultSchema.parse(result);
}
