"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Trash2 } from "lucide-react";
import { useState } from "react";

type Resume = {id:string;filename:string;fileType:string;createdAt:string;analyses:{id:string;status:string;createdAt:string}[]};

export function ResumeList({resumes}: {resumes:Resume[]}) {
  const [items,setItems]=useState(resumes);
  const [error,setError]=useState("");
  const router=useRouter();
  async function remove(id:string) {
    if(!window.confirm("Delete this resume and all associated analysis reports? This action cannot be undone."))return;
    const response=await fetch("/api/resumes",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok){setError(result.error??"Resume deletion failed.");return;}
    setItems((current)=>current.filter((resume)=>resume.id!==id));
    router.refresh();
  }
  if(!items.length)return <div className="card empty"><div className="empty-icon"><FileText size={18}/></div><strong style={{fontSize:13}}>No resumes saved yet</strong><p style={{fontSize:11}}>Your reports will be listed here after an analysis.</p><Link className="auth-link" href="/analyze">Analyze your resume →</Link></div>;
  return <div>{error&&<div className="error-box" role="alert" style={{marginBottom:15}}>{error}</div>}{items.map((resume)=><article className="card" key={resume.id} style={{marginBottom:13}}><div style={{display:"flex",justifyContent:"space-between",gap:15,alignItems:"center"}}><div style={{display:"flex",gap:12,alignItems:"center"}}><div className="stat-icon"><FileText size={17}/></div><div><strong style={{fontSize:13}}>{resume.filename}</strong><div className="field-help">{resume.fileType.toUpperCase()} · Added {resume.createdAt}</div></div></div><button className="btn btn-danger" onClick={()=>remove(resume.id)} aria-label={`Delete ${resume.filename}`}><Trash2 size={15}/>Delete</button></div>{resume.analyses.map((analysis)=><div className="list-row" key={analysis.id}><span>{analysis.status.toLowerCase()} · {analysis.createdAt}</span>{analysis.status==="COMPLETED"&&<Link className="auth-link" href={`/analysis/${analysis.id}`}>Open report →</Link>}</div>)}</article>)}</div>;
}
