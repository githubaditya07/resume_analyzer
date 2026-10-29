"use client";

import { Download, Printer } from "lucide-react";
import type { AnalysisResult } from "@/lib/validation";
import { useState } from "react";

type RoleMatch={title:string;score:number;matchingSkills:string[];partialSkills:string[];missingEvidenceSkills:string[]};
type JobDescriptionMatch=RoleMatch&{coverage:number;explanation:string};

export function ReportActions({ filename, report, matches, jobDescriptionMatch, generatedAt }: { analysisId: string; filename:string; report:AnalysisResult; matches:RoleMatch[]; jobDescriptionMatch:JobDescriptionMatch|null; generatedAt:string }) {
  const [error,setError]=useState("");
  async function exportPdf() {
    setError("");
    try {
    const { jsPDF } = await import("jspdf");
    const pdf=new jsPDF({unit:"mm",format:"a4"});
    let y=18;
    const left=18;
    const maxY=278;
    function ensureRoom(height:number){if(y+height>maxY){pdf.addPage();y=18;}}
    function section(title:string,lines:string[]){
      ensureRoom(16);
      pdf.setTextColor(25,45,82);pdf.setFont("helvetica","bold");pdf.setFontSize(13);pdf.text(title,left,y);y+=7;
      pdf.setFont("helvetica","normal");pdf.setFontSize(9);pdf.setTextColor(63,77,99);
      for(const line of lines){
        const wrapped=pdf.splitTextToSize(line,174) as string[];
        ensureRoom(wrapped.length*4.5+3);
        pdf.text(wrapped,left,y);y+=wrapped.length*4.5+2;
      }
      y+=4;
    }
    pdf.setTextColor(23,45,86);pdf.setFont("helvetica","bold");pdf.setFontSize(19);pdf.text("CareerLens AI",left,y);y+=8;
    pdf.setFontSize(14);pdf.text("Resume feedback report",left,y);y+=7;
    pdf.setFont("helvetica","normal");pdf.setFontSize(9);pdf.setTextColor(94,108,130);
    pdf.text(pdf.splitTextToSize(`${filename} · Generated ${generatedAt}`,174),left,y);y+=10;
    section("Resume summary",[report.summary]);
    section("Profile overview",[
      `Education: ${report.profileOverview.education}`,
      `Experience: ${report.profileOverview.experience}`,
      `Projects: ${report.profileOverview.projects}`,
      `Relevant domains: ${report.profileOverview.relevantDomains.join(", ")||"Not identified"}`,
      `Information to clarify: ${report.profileOverview.missingInformation.join("; ")||"None noted"}`
    ]);
    section("Skills",report.skills.map((skill)=>`${skill.name} (${skill.category}; ${skill.evidenceType.toLowerCase().replaceAll("_"," ")}; confidence ${Math.round(skill.confidence*100)}%): ${skill.evidence} Next: ${skill.nextAction}`));
    section("Indicative role matches",matches.map((role)=>`${role.title}: ${role.score}% indicative resume-to-role match. Evidence: ${role.matchingSkills.join(", ")||"none identified"}. Partial: ${role.partialSkills.join(", ")||"none"}. Not demonstrated in resume: ${role.missingEvidenceSkills.join(", ")||"none"}.`));
    if(jobDescriptionMatch)section("Job description match",[
      `${jobDescriptionMatch.title}: ${jobDescriptionMatch.score}% indicative match; evidence coverage ${jobDescriptionMatch.coverage}%.`,
      jobDescriptionMatch.explanation,
      `Demonstrated: ${jobDescriptionMatch.matchingSkills.join(", ")||"none"}`,
      `Partially evidenced: ${jobDescriptionMatch.partialSkills.join(", ")||"none"}`,
      `Not demonstrated in the current resume: ${jobDescriptionMatch.missingEvidenceSkills.join(", ")||"none"}`
    ]);
    section("Strengths",report.strengths.map((item)=>`${item.title}: ${item.evidence} Next step: ${item.action}`));
    section("Improvement areas",report.improvementAreas.map((item)=>`${item.priority} · ${item.section}: ${item.issue} Why it matters: ${item.whyItMatters} Suggested action: ${item.recommendation}${item.exampleRewrite?` Example rewrite: ${item.exampleRewrite}`:""}`));
    section("Skill gaps",report.skillGaps.map((gap)=>`${gap.role} · ${gap.skill} (${gap.importance}; ${gap.status.toLowerCase().replaceAll("_"," ")} in the current resume): ${gap.whyItMatters} Suggested learning: ${gap.learningActivity} Approximate effort: ${gap.effortHours}`));
    section("Learning suggestions",report.learningSuggestions.map((item)=>`Week ${item.week} · ${item.skill} (${item.estimatedHours} estimated hours): ${item.targetOutcome} Project: ${item.project} Completion criteria: ${item.completionCriteria}`));
    section("ATS readability",[
      report.atsReview.summary,
      ...report.atsReview.concerns,
      "ATS behavior varies by system and employer. This review cannot guarantee a resume will pass automated screening."
    ]);
    section("Priority actions",report.priorityActions.map((action,index)=>`${index+1}. ${action}`));
    section("Important limitations",[
      ...report.limitations,
      "CareerLens AI provides educational suggestions only. AI results may be incomplete or inaccurate. Match scores are not hiring probabilities or guarantees of employment."
    ]);
    const pages=pdf.getNumberOfPages();
    for(let page=1;page<=pages;page++){pdf.setPage(page);pdf.setFontSize(8);pdf.setTextColor(130,140,155);pdf.text(`Page ${page} of ${pages}`,190,287,{align:"right"});}
    pdf.save(`${filename.replace(/[^a-z0-9-_]/gi,"_").slice(0,60)}-careerlens-report.pdf`);
    } catch {
      setError("PDF export failed. Use the print button and choose Save as PDF, or try again.");
    }
  }
  return <div><div style={{display:"flex",gap:8}}><button className="btn btn-secondary" onClick={()=>void exportPdf()}><Download size={15}/>Export PDF</button><button className="btn btn-secondary" onClick={()=>window.print()} aria-label="Print report"><Printer size={15}/></button></div>{error&&<div className="error-box" role="alert" style={{marginTop:8}}>{error}</div>}</div>;
}
