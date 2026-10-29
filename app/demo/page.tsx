import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, CheckCircle2 } from "lucide-react";
import { Brand } from "@/components/brand";

const syntheticSkills=["JavaScript","React","HTML","CSS","Git"];
const demoGaps=["TypeScript","Testing","Accessibility"];

export default function DemoPage(){
  return <main className="public-page" style={{minHeight:"100vh"}}>
    <header className="public-nav"><Link href="/"><Brand/></Link><Link href="/" className="btn btn-secondary"><ArrowLeft size={14}/> Back</Link></header>
    <div className="main-content">
      <div className="notice" style={{marginBottom:18}}><strong>DEMO · Synthetic sample only.</strong> This sample is not a real student&apos;s report, not personalized to your account, and not generated from an uploaded resume. It does not create stored user data.</div>
      <div className="page-heading"><div><h1>Sample career snapshot</h1><p>Example resume: a fictional student project profile used to preview the product.</p></div><Link href="/register" className="btn btn-primary">Create your account</Link></div>
      <div className="grid stats-grid"><div className="card"><span className="stat-label">Evidence items</span><div className="stat-value">5</div><span className="stat-foot">Synthetic sample skills</span></div><div className="card"><span className="stat-label">Sample target role</span><div style={{fontWeight:700,fontSize:15,margin:"13px 0"}}>Frontend Developer</div><span className="stat-foot">Role template, not a vacancy</span></div><div className="card"><span className="stat-label">Next focus</span><div style={{fontWeight:700,fontSize:15,margin:"13px 0"}}>Testing fundamentals</div><span className="stat-foot">A suggested learning area</span></div><div className="card"><span className="stat-label">Roadmap</span><div className="stat-value">0%</div><span className="stat-foot">Sample progress starts at zero</span></div></div>
      <div className="grid dashboard-grid"><section className="card"><h2 className="section-title">Evidence shown in the sample</h2>{syntheticSkills.map((skill,index)=><div className="list-row" key={skill}><span>{skill}<br/><span className="muted">Synthetic project evidence example</span></span><span className="badge badge-green">{index<3?"Demonstrated":"Mentioned"}</span></div>)}<h2 className="section-title" style={{marginTop:20}}>Suggested learning areas</h2>{demoGaps.map((gap)=><div key={gap} className="list-row"><span>{gap}</span><span className="badge badge-amber">Not shown in sample</span></div>)}</section><aside className="card"><h2 className="section-title"><BriefcaseBusiness size={15}/> What this demo illustrates</h2><p className="muted" style={{fontSize:12,lineHeight:1.75}}>The real application extracts skills from your own submitted resume, validates structured AI output, calculates role matches from a transparent weighted catalog, and persists reports and roadmap tasks to your account.</p><div className="notice"><CheckCircle2 size={15}/> No universal score and no guarantee of employment.</div></aside></div>
    </div>
  </main>;
}
