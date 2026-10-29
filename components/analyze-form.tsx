"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, FileText, X } from "lucide-react";

export function AnalyzeForm({maxSizeMb}:{maxSizeMb:number}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [analysisType, setAnalysisType] = useState("GENERAL");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [durationWeeks, setDurationWeeks] = useState("4");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!consent) { setError("Please review and accept the data-processing notice to continue."); return; }
    if (!file && text.trim().length < 80) { setError("Paste at least 80 characters or choose a resume file."); return; }
    setBusy(true);
    try {
      const body = new FormData();
      if (file) body.append("file", file);
      else body.append("resumeText", text);
      body.append("analysisType", analysisType);
      body.append("targetRole", targetRole);
      body.append("jobDescription", jobDescription);
      body.append("durationWeeks", durationWeeks);
      body.append("consent", "true");
      const response = await fetch("/api/analyses", { method:"POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Analysis could not be completed.");
      router.push(`/analysis/${result.id}`);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Something went wrong. Your input remains available to retry.");
    } finally { setBusy(false); }
  }
  function chooseFile(selected: File | undefined) {
    setError("");
    if (!selected) return;
    if (selected.size > maxSizeMb * 1024 * 1024) { setError(`The upload limit is ${maxSizeMb} MB.`); return; }
    if (!/\.(pdf|docx|txt)$/i.test(selected.name)) { setError("Choose a PDF, DOCX, or TXT resume."); return; }
    setFile(selected);
    setText("");
  }

  return <form className="card form-card" onSubmit={submit}>
    <h2 className="section-title">1. Add your resume</h2>
    <p className="field-help">Upload a PDF, DOCX, or TXT file (up to 5 MB), or paste resume text below. Scanned PDFs without selectable text need OCR and cannot be analyzed yet.</p>
    <div className="file-drop" onDragOver={(event)=>event.preventDefault()} onDrop={(event)=>{event.preventDefault();chooseFile(event.dataTransfer.files[0]);}}>
      <div className="empty-icon"><FileUp size={19}/></div>
      {file ? <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,fontSize:12}}><FileText size={16}/><span>{file.name} · {(file.size/1024).toFixed(0)} KB</span><button type="button" className="btn btn-secondary" aria-label="Remove selected resume" onClick={()=>setFile(null)} style={{padding:5}}><X size={14}/></button></div> :
      <><div style={{fontWeight:650,fontSize:12}}>Drag your resume here or <button type="button" className="auth-link" onClick={()=>fileInput.current?.click()} style={{border:0,background:"none",cursor:"pointer"}}>browse files</button></div>      <div className="field-help" style={{marginTop:6}}>PDF, DOCX, or TXT · {maxSizeMb} MB maximum</div></>}
      <input ref={fileInput} type="file" accept=".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event)=>chooseFile(event.target.files?.[0])} hidden/>
    </div>
    {!file && <div className="field"><label htmlFor="resumeText">Or paste resume text</label><textarea id="resumeText" className="textarea" value={text} onChange={(event)=>setText(event.target.value)} maxLength={30000} placeholder="Paste your resume text here…" /><span className="field-help">{text.length.toLocaleString()} / 30,000 characters · At least 80 characters required</span></div>}
    <div style={{borderTop:"1px solid #edf0f4",marginTop:24,paddingTop:20}}>
      <h2 className="section-title">2. Choose your analysis context</h2>
      <div className="two-col">
        <div className="field"><label htmlFor="context">Review type</label><select className="select" id="context" value={analysisType} onChange={(event)=>setAnalysisType(event.target.value)}><option value="GENERAL">General resume review</option><option value="INTERNSHIP">Internship readiness</option><option value="ENTRY_LEVEL">Entry-level job readiness</option><option value="JOB_DESCRIPTION">Compare with a job description</option></select></div>
        <div className="field"><label htmlFor="targetRole">Target role (optional)</label><input id="targetRole" className="input" value={targetRole} maxLength={100} onChange={(event)=>setTargetRole(event.target.value)} placeholder="e.g., Frontend Developer"/></div>
      </div>
      {analysisType==="JOB_DESCRIPTION"&&<div className="field"><label htmlFor="jobDescription">Job description</label><textarea id="jobDescription" className="textarea" style={{minHeight:130}} maxLength={12000} value={jobDescription} onChange={(event)=>setJobDescription(event.target.value)} placeholder="Paste the role description. Embedded instructions are treated as untrusted text."/></div>}
      <div className="field"><label htmlFor="duration">Learning plan length</label><select id="duration" className="select" value={durationWeeks} onChange={(event)=>setDurationWeeks(event.target.value)}><option value="2">2 weeks</option><option value="4">4 weeks</option><option value="8">8 weeks</option></select></div>
    </div>
    <div className="notice" style={{marginTop:21}}><strong>Before you continue:</strong> Resume text is analyzed locally by CareerLens using keyword and section-heading rules; it is not sent to an external AI service. The report is saved in this app&apos;s local database. Only you can access your reports through this account; you can delete a resume and its reports from My resumes. Review all suggestions before acting.</div>
    <label style={{display:"flex",gap:10,alignItems:"flex-start",fontSize:12,color:"#46556b",margin:"15px 0 18px"}}><input type="checkbox" checked={consent} onChange={(event)=>setConsent(event.target.checked)} style={{accentColor:"#355fe5",marginTop:2}}/><span>I understand and consent to processing and saving this resume for educational feedback. I have read the <a className="auth-link" href="/privacy" target="_blank" rel="noreferrer">privacy notice</a>.</span></label>
    {error&&<div className="error-box" role="alert" style={{marginBottom:15}}>{error}</div>}
    <button className="btn btn-primary" type="submit" disabled={busy}>{busy?"Extracting text and generating report…":"Start analysis"}</button>
    {busy&&<p role="status" className="field-help" style={{marginTop:10}}>Your resume is being checked locally. Please keep this page open.</p>}
  </form>;
}
