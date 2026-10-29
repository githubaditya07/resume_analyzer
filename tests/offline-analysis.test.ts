import { describe, expect, it } from "vitest";
import { analyzeResume } from "@/lib/ai/resume-analyzer";
import { analysisResultSchema } from "@/lib/validation";

describe("offline resume analysis", () => {
  it("creates a validated, evidence-based report without external services", async () => {
    const report = await analyzeResume({
      resumeText: [
        "EDUCATION",
        "Bachelor of Computer Science",
        "PROJECTS",
        "Built a React and TypeScript portfolio website with JavaScript.",
        "Improved page load time by 25 percent.",
        "SKILLS",
        "Git, HTML, CSS"
      ].join("\n"),
      analysisType: "GENERAL",
      targetRole: "Frontend Developer"
    });

    expect(analysisResultSchema.safeParse(report).success).toBe(true);
    expect(report.skills.map((skill) => skill.name)).toEqual(expect.arrayContaining(["React", "TypeScript", "JavaScript"]));
    expect(report.skills.find((skill) => skill.name === "React")?.evidenceType).toBe("PROJECT");
    expect(report.recommendedRoles.some((role) => role.title === "Frontend Developer")).toBe(true);
    expect(report.skillGaps.some((gap) => gap.skill === "Testing" && gap.status === "NOT_DEMONSTRATED")).toBe(true);
    expect(report.limitations.join(" ")).toContain("does not use a language model");
  });

  it("does not claim that a missing keyword means the person lacks a skill", async () => {
    const report = await analyzeResume({
      resumeText: "EDUCATION\nBachelor of Science\nEXPERIENCE\nWorked on a student team.",
      analysisType: "GENERAL"
    });

    expect(report.summary).toContain("does not determine your actual abilities");
    expect(report.limitations.join(" ")).toContain("does not mean you lack a skill");
  });
});
