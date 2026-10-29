import { z } from "zod";

export type JobRoleTemplate = {
  title: string;
  category: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  weights: Record<string, number>;
};

export const jobRoleTemplateSchema=z.object({
  title:z.string().min(1).max(100),
  category:z.string().min(1).max(80),
  description:z.string().min(10).max(500),
  requiredSkills:z.array(z.string().min(1).max(80)).min(1).max(20),
  preferredSkills:z.array(z.string().min(1).max(80)).max(20),
  weights:z.record(z.string(),z.number().min(0).max(10))
});

export function parseStoredJobRole(value:{title:string;category:string;description:string;requiredSkills:unknown;preferredSkills:unknown;skillWeights:unknown}){
  return jobRoleTemplateSchema.safeParse({
    title:value.title,
    category:value.category,
    description:value.description,
    requiredSkills:value.requiredSkills,
    preferredSkills:value.preferredSkills,
    weights:value.skillWeights
  });
}

export const jobRoleCatalog: JobRoleTemplate[] = [
  { title: "Frontend Developer", category: "Software Engineering", description: "Build accessible, responsive user interfaces for web applications.", requiredSkills: ["JavaScript", "HTML", "CSS", "React"], preferredSkills: ["TypeScript", "Git", "Testing"], weights: { JavaScript: 3, HTML: 2, CSS: 2, React: 3, TypeScript: 1, Git: 1, Testing: 1 } },
  { title: "Backend Developer", category: "Software Engineering", description: "Design APIs, data models, and reliable server-side application services.", requiredSkills: ["Programming", "API", "Database", "Git"], preferredSkills: ["Node.js", "Python", "Testing"], weights: { Programming: 3, API: 3, Database: 3, Git: 1, "Node.js": 2, Python: 1, Testing: 1 } },
  { title: "Full-Stack Developer", category: "Software Engineering", description: "Develop both user-facing features and the services that support them.", requiredSkills: ["JavaScript", "HTML", "CSS", "API", "Database"], preferredSkills: ["React", "Node.js", "Git"], weights: { JavaScript: 2, HTML: 1, CSS: 1, API: 2, Database: 2, React: 2, "Node.js": 2, Git: 1 } },
  { title: "Data Analyst", category: "Data & Analytics", description: "Turn datasets into clear insights using analysis and visualization.", requiredSkills: ["SQL", "Excel", "Data Analysis"], preferredSkills: ["Python", "Statistics", "Data Visualization"], weights: { SQL: 3, Excel: 2, "Data Analysis": 3, Python: 1, Statistics: 2, "Data Visualization": 2 } },
  { title: "Machine Learning Engineer", category: "Data & AI", description: "Build, evaluate, and integrate machine-learning systems.", requiredSkills: ["Python", "Statistics", "Machine Learning"], preferredSkills: ["SQL", "Git", "Data Analysis"], weights: { Python: 3, Statistics: 2, "Machine Learning": 3, SQL: 1, Git: 1, "Data Analysis": 1 } },
  { title: "QA Engineer", category: "Quality Engineering", description: "Improve product quality through structured manual and automated testing.", requiredSkills: ["Testing", "Programming", "Communication"], preferredSkills: ["Automation", "API", "Git"], weights: { Testing: 3, Programming: 2, Communication: 2, Automation: 2, API: 1, Git: 1 } },
  { title: "Cloud / DevOps Engineer", category: "Cloud & Infrastructure", description: "Help teams deploy and operate software reliably.", requiredSkills: ["Linux", "Cloud", "Networking"], preferredSkills: ["Docker", "CI/CD", "Scripting"], weights: { Linux: 2, Cloud: 3, Networking: 2, Docker: 2, "CI/CD": 2, Scripting: 1 } },
  { title: "Business Analyst", category: "Business & Product", description: "Translate business needs into clear requirements and measurable insights.", requiredSkills: ["Communication", "Data Analysis", "Requirements"], preferredSkills: ["SQL", "Excel", "Presentation"], weights: { Communication: 3, "Data Analysis": 2, Requirements: 3, SQL: 1, Excel: 1, Presentation: 2 } }
];

export type Evidence = { name: string; evidenceType: string; confidence: number };
export type MatchResult = {
  title: string;
  score: number;
  matchingSkills: string[];
  partialSkills: string[];
  missingEvidenceSkills: string[];
  explanation: string;
  coverage: number;
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9+#.]/g, "");

function evidenceFor(required: string, skills: Evidence[]) {
  const key = normalize(required);
  const synonyms:Record<string,string[]> = {
    programming:["programming languages","software development","coding","java","python","javascript","typescript","c","c++","c#","go","ruby","php"],
    api:["rest api","rest apis","api development","web api"],
    database:["databases","database management","postgresql","mysql","mongodb","sqlite"],
    cloud:["aws","azure","google cloud","gcp"],
    testing:["software testing","quality assurance","qa","unit testing","automated testing"],
    automation:["test automation","automated testing","automation testing"],
    "data analysis":["data analytics","data analytics tools"],
    "data visualization":["data visualisation","visualization","tableau","power bi"],
    "ci/cd":["continuous integration","continuous delivery","github actions"],
    communication:["written communication","verbal communication"],
    presentation:["presentations","presentation skills"]
  };
  return skills.find((skill)=>{
    const skillName=normalize(skill.name);
    return skillName===key||(synonyms[key]??[]).some((synonym)=>normalize(synonym)===skillName);
  });
}

export function calculateMatch(role: JobRoleTemplate, skills: Evidence[]): MatchResult {
  const weightedSkills = [...role.requiredSkills, ...role.preferredSkills];
  const factors = { EXPERIENCE: 1, PROJECT: 0.85, CERTIFICATION: 0.75, MENTIONED: 0.55, INFERRED: 0.3 };
  let weightedEvidence = 0;
  let totalWeight = 0;
  const matchingSkills: string[] = [];
  const partialSkills: string[] = [];
  const missingEvidenceSkills: string[] = [];

  for (const required of weightedSkills) {
    const weight = role.weights[required] ?? 1;
    totalWeight += weight;
    const evidence = evidenceFor(required, skills);
    if (!evidence) {
      missingEvidenceSkills.push(required);
      continue;
    }
    const factor = (factors[evidence.evidenceType as keyof typeof factors] ?? 0.3) * Math.max(0, Math.min(1, evidence.confidence));
    weightedEvidence += weight * factor;
    if (factor >= 0.65) matchingSkills.push(required);
    else partialSkills.push(required);
  }
  const score = totalWeight === 0 ? 0 : Math.round((100 * weightedEvidence) / totalWeight);
  const found = matchingSkills.length + partialSkills.length;
  return {
    title: role.title,
    score: Math.max(0, Math.min(100, score)),
    matchingSkills,
    partialSkills,
    missingEvidenceSkills,
    explanation: "Indicative resume-to-role evidence score; a missing mention does not mean you lack the skill.",
    coverage: weightedSkills.length === 0 ? 0 : Math.round((found / weightedSkills.length) * 100)
  };
}

export function calculateRequirementMatch(
  title:string,
  requirements:{skill:string;importance:"CRITICAL"|"IMPORTANT"|"OPTIONAL";status:"DEMONSTRATED"|"PARTIAL"|"NOT_DEMONSTRATED"}[]
):MatchResult{
  const weight={CRITICAL:3,IMPORTANT:2,OPTIONAL:1};
  const factor={DEMONSTRATED:1,PARTIAL:0.5,NOT_DEMONSTRATED:0};
  let total=0;let points=0;
  for(const item of requirements){const currentWeight=weight[item.importance];total+=currentWeight;points+=currentWeight*factor[item.status];}
  const matchingSkills=requirements.filter((item)=>item.status==="DEMONSTRATED").map((item)=>item.skill);
  const partialSkills=requirements.filter((item)=>item.status==="PARTIAL").map((item)=>item.skill);
  const missingEvidenceSkills=requirements.filter((item)=>item.status==="NOT_DEMONSTRATED").map((item)=>item.skill);
  return {
    title,
    score:total?Math.round(points/total*100):0,
    matchingSkills,
    partialSkills,
    missingEvidenceSkills,
    coverage:requirements.length?Math.round((matchingSkills.length+partialSkills.length)/requirements.length*100):0,
    explanation:"Indicative evidence-based comparison using the job description requirements identified in the report. Not a hiring probability."
  };
}

export function calculateLearningProgress(tasks: { status: string }[]) {
  return tasks.length === 0 ? 0 : Math.round((tasks.filter((task) => task.status === "DONE").length / tasks.length) * 100);
}
