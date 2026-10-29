import Link from "next/link";
import { ArrowRight, BarChart3, BriefcaseBusiness, CheckCircle2, FileSearch, GraduationCap, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";

const features = [
  { Icon: FileSearch, title: "Evidence-based resume review", text: "See what your resume demonstrates, where details are unclear, and how to make improvements without inventing accomplishments." },
  { Icon: BriefcaseBusiness, title: "Explainable role matches", text: "Compare evidence in your resume with entry-level role requirements. Scores are indicative—not hiring probabilities." },
  { Icon: GraduationCap, title: "A practical learning roadmap", text: "Turn priority skill gaps into manageable learning tasks and track your progress over time." }
];

export default function HomePage() {
  const demo = process.env.DEMO_MODE === "true";
  return <div className="public-page">
    <header className="public-nav">
      <Link href="/"><Brand /></Link>
      <div style={{ display:"flex",alignItems:"center",gap:18,fontSize:13 }}>
        <a href="#features" style={{color:"#64748b"}}>Features</a>
        <Link href="/demo" style={{color:"#526178"}}>Try demo</Link>
        <Link href="/login" style={{color:"#526178"}}>Sign in</Link>
        <Link href="/register" className="btn btn-primary" style={{padding:"10px 14px"}}>Get started <ArrowRight size={15}/></Link>
      </div>
    </header>
    <section className="hero">
      {demo && <div className="badge" style={{marginBottom:18}}>DEMO MODE · Real analysis requires AI configuration</div>}
      <h1>Turn Your Resume Into a Career Roadmap.</h1>
      <p>Get thoughtful resume feedback, discover roles that fit the experience you can show, and build a focused plan for what to learn next.</p>
      <div className="hero-actions"><Link href="/register" className="btn btn-primary" style={{padding:"13px 20px"}}>Analyze My Resume <ArrowRight size={16}/></Link><a href="#features" className="btn btn-secondary" style={{padding:"13px 20px"}}>Explore Features</a></div>
      <div className="preview">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:17}}><div><div style={{fontWeight:700,fontSize:14}}>Your career snapshot</div><div className="muted" style={{fontSize:11,marginTop:4}}>Evidence to next steps</div></div><div className="badge badge-green">Sample preview</div></div>
        <div className="two-col">
          <div style={{border:"1px solid #edf0f4",borderRadius:11,padding:15}}><div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,fontWeight:700}}><BarChart3 size={15} color="#355fe5"/> Role alignment</div><div style={{fontSize:24,fontWeight:750,margin:"13px 0 3px"}}>Frontend Developer</div><div className="muted" style={{fontSize:11}}>An indicative score is calculated from documented skill evidence.</div></div>
          <div style={{border:"1px solid #edf0f4",borderRadius:11,padding:15}}><div style={{fontSize:12,fontWeight:700}}>A clear next step</div><div style={{fontSize:13,fontWeight:650,marginTop:13}}>Add outcomes to project bullets</div><div className="muted" style={{fontSize:11,marginTop:5}}>Use verified results only. If numbers help, add them after you confirm them.</div></div>
        </div>
      </div>
    </section>
    <section id="features" className="grid feature-grid">{features.map(({Icon,title,text})=><article className="card" key={title}><div className="stat-icon"><Icon size={18}/></div><h2 style={{fontSize:15,margin:"15px 0 7px"}}>{title}</h2><p className="muted" style={{fontSize:12,lineHeight:1.75,margin:0}}>{text}</p></article>)}</section>
    <section style={{background:"#f7f9fc",padding:"25px 0"}}>
      <div style={{maxWidth:1000,margin:"0 auto",padding:"24px"}}>
        <h2 style={{textAlign:"center",fontSize:22,margin:"5px 0 25px"}}>A focused process, from resume to action</h2>
        <div className="grid steps">{[
          ["01","Upload or paste your resume","Your resume stays linked to your private account and can be deleted from your workspace."],
          ["02","Review your personalized analysis","Understand the evidence, role fit, skill gaps, and actionable resume feedback."],
          ["03","Build skills and prepare for roles","Follow a practical roadmap and track learning activities as you complete them."]
        ].map(([num,title,desc])=><div key={num}><div style={{color:"#355fe5",fontWeight:750,fontSize:12}}>{num}</div><h3 style={{fontSize:14,margin:"10px 0 6px"}}>{title}</h3><p className="muted" style={{fontSize:12,lineHeight:1.7,margin:0}}>{desc}</p></div>)}</div>
      </div>
    </section>
    <section style={{maxWidth:980,margin:"0 auto",padding:"48px 24px 58px",display:"flex",gap:13,alignItems:"flex-start"}}>
      <ShieldCheck size={19} color="#0e9488" style={{flexShrink:0}}/><p className="muted" style={{fontSize:12,lineHeight:1.7,margin:0}}><strong style={{color:"#26354b"}}>Private, local analysis.</strong> Resume text is reviewed by the app&apos;s local rules engine and is not sent to an external AI service. Reports are available to the student account and can be deleted. CareerLens offers educational suggestions, not hiring decisions. Verify recommendations and original job requirements.</p>
    </section>
    <footer className="public-footer"><span>© {new Date().getFullYear()} CareerLens AI</span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/privacy#contact">Contact your placement administrator</Link><CheckCircle2 size={14} color="#0e9488"/></footer>
  </div>;
}
