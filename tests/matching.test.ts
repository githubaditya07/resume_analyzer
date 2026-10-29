import { describe, expect, it } from "vitest";
import { calculateLearningProgress, calculateMatch, calculateRequirementMatch, jobRoleCatalog } from "../lib/job-catalog";

describe("explainable role matching",()=>{
  const frontend=jobRoleCatalog.find((role)=>role.title==="Frontend Developer")!;
  it("calculates a bounded weighted score from evidence",()=>{
    const result=calculateMatch(frontend,[
      {name:"React",evidenceType:"PROJECT",confidence:0.9},
      {name:"JavaScript",evidenceType:"EXPERIENCE",confidence:1}
    ]);
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(100);
    expect(result.matchingSkills).toContain("JavaScript");
    expect(result.missingEvidenceSkills).toContain("CSS");
    expect(result.explanation).toContain("not mean you lack");
  });
  it("handles empty skill requirements without division errors",()=>{
    expect(calculateMatch({...frontend,requiredSkills:[],preferredSkills:[]},[]).score).toBe(0);
  });
  it("clamps confidence and reports zero for no evidence",()=>{
    expect(calculateMatch(frontend,[{name:"CSS",evidenceType:"INFERRED",confidence:8}]).score).toBeLessThanOrEqual(100);
    expect(calculateMatch(frontend,[]).score).toBe(0);
  });
  it("maps a programming language to a broad programming requirement",()=>{
    const backend=jobRoleCatalog.find((role)=>role.title==="Backend Developer")!;
    const result=calculateMatch(backend,[{name:"Python",evidenceType:"PROJECT",confidence:1}]);
    expect(result.matchingSkills).toContain("Programming");
  });
  it("calculates custom job-description match from explicit evidence states",()=>{
    const result=calculateRequirementMatch("Target",[
      {skill:"SQL",importance:"CRITICAL",status:"DEMONSTRATED"},
      {skill:"Dashboards",importance:"IMPORTANT",status:"PARTIAL"},
      {skill:"Cloud",importance:"OPTIONAL",status:"NOT_DEMONSTRATED"}
    ]);
    expect(result.score).toBe(67);
    expect(result.coverage).toBe(67);
  });
});

describe("learning progress",()=>{
  it("uses persisted task status and handles empty plans",()=>{
    expect(calculateLearningProgress([])).toBe(0);
    expect(calculateLearningProgress([{status:"DONE"},{status:"TODO"}])).toBe(50);
  });
});
