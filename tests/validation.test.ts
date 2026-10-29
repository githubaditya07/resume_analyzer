import { describe, expect, it } from "vitest";
import { analysisRequestSchema, analysisResultSchema } from "../lib/validation";

describe("analysis request validation",()=>{
  it("rejects short resume text and missing consent",()=>{
    expect(analysisRequestSchema.safeParse({resumeText:"short",consent:true}).success).toBe(false);
    expect(analysisRequestSchema.safeParse({resumeText:"A".repeat(90)}).success).toBe(false);
  });
  it("requires a job description in job-specific mode",()=>{
    expect(analysisRequestSchema.safeParse({resumeText:"A".repeat(90),consent:true,analysisType:"JOB_DESCRIPTION"}).success).toBe(false);
  });
});

describe("AI response validation",()=>{
  it("rejects missing report fields and invalid confidence",()=>{
    expect(analysisResultSchema.safeParse({summary:"Resume summary"}).success).toBe(false);
    const minimal={
      summary:"A factual summary.",profileOverview:{education:"Not stated",experience:"Not stated",projects:"Not stated",relevantDomains:[],missingInformation:[]},
      skills:[{name:"Python",category:"Programming",evidenceType:"MENTIONED",evidence:"Skills section",confidence:1.2,nextAction:"Add context."}],
      strengths:[],improvementAreas:[],recommendedRoles:[],skillGaps:[],learningSuggestions:[],atsReview:{summary:"Text review.",concerns:[]},priorityActions:[],limitations:[]
    };
    expect(analysisResultSchema.safeParse(minimal).success).toBe(false);
  });
});
