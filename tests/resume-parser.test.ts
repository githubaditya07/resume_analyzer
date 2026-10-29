import { describe,expect,it } from "vitest";
import { extractResumeText } from "../lib/resume-parser";

describe("resume extraction guards",()=>{
  it("rejects unsupported extensions",async()=>{
    const file=new File(["some text"],"resume.rtf",{type:"application/rtf"});
    await expect(extractResumeText(file)).rejects.toThrow("Unsupported file");
  });
  it("rejects empty or too-short text instead of analyzing empty content",async()=>{
    const empty=new File([],"empty.txt",{type:"text/plain"});
    await expect(extractResumeText(empty)).rejects.toThrow("empty");
    const short=new File(["Too short"],"resume.txt",{type:"text/plain"});
    await expect(extractResumeText(short)).rejects.toThrow("enough text");
  });
  it("normalizes and hashes valid text resumes",async()=>{
    const text=`Jordan Example\nSoftware engineering student\n\nProjects\nBuilt a small application using JavaScript, React, and PostgreSQL.`;
    const result=await extractResumeText(new File([text],"resume.txt",{type:"text/plain"}));
    expect(result.text).toContain("Projects");
    expect(result.hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
