import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  CheckCircle2,
  FileCheck2,
  FileSearch,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Brand } from "@/components/brand";

const features = [
  {
    Icon: FileSearch,
    title: "Evidence-based resume analysis",
    text: "Review resume sections, skills, experience, and project evidence with transparent, locally run analysis.",
    href: "/analyze",
    link: "Analyze a resume",
  },
  {
    Icon: Sparkles,
    title: "Skills intelligence",
    text: "See which technical and transferable skills are named, with evidence from your own resume.",
    href: "/analyze",
    link: "Explore skill insights",
  },
  {
    Icon: BriefcaseBusiness,
    title: "Relevant role matches",
    text: "Compare documented skills with reference role templates—not live vacancies or hiring predictions.",
    href: "/analyze",
    link: "Find matching roles",
  },
  {
    Icon: Target,
    title: "Skill gap detection",
    text: "Spot skills you have not demonstrated yet and choose a practical area to develop next.",
    href: "/analyze",
    link: "Discover next steps",
  },
  {
    Icon: GraduationCap,
    title: "Personalized learning",
    text: "Turn suggested development areas into an organized learning roadmap you can follow.",
    href: "/analyze",
    link: "Build a roadmap",
  },
  {
    Icon: FileCheck2,
    title: "Clearer resume writing",
    text: "Find opportunities to improve clarity, structure, project descriptions, and resume readability.",
    href: "/analyze",
    link: "Improve your resume",
  },
];

const steps = [
  {
    number: "01",
    title: "Upload or paste your resume",
    text: "Start with a PDF, DOCX, TXT file, or resume text you paste into the analyzer.",
  },
  {
    number: "02",
    title: "Explore your insights",
    text: "Review documented skills, reference role matches, skill gaps, and actionable feedback.",
  },
  {
    number: "03",
    title: "Build your roadmap",
    text: "Choose practical learning activities and keep track of the progress you make.",
  },
];

const sampleSkills = ["JavaScript", "React", "HTML", "CSS", "Git"];
const sampleGaps = ["TypeScript", "Testing", "Accessibility"];

function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="cl-arrow-link" href={href}>
      {children}
      <ArrowRight size={15} aria-hidden="true" />
    </Link>
  );
}

function SampleSnapshot() {
  return (
    <aside className="cl-snapshot" aria-label="Illustrative career analysis preview">
      <div className="cl-snapshot-top">
        <div className="cl-snapshot-icon" aria-hidden="true">
          <Sparkles size={17} />
        </div>
        <span className="cl-sample-pill">
          <span aria-hidden="true" /> Illustrative demo
        </span>
      </div>
      <h2>Your Career Snapshot</h2>
      <p className="cl-snapshot-subtitle">A preview of resume insights and suggested next steps</p>
      <div className="cl-snapshot-divider" />
      <div className="cl-snapshot-stats">
        <div>
          <span className="cl-snapshot-label">Skills identified</span>
          <strong>05</strong>
          <span className="cl-snapshot-detail">Synthetic sample skills</span>
        </div>
        <span className="cl-stat-divider" aria-hidden="true" />
        <div>
          <span className="cl-snapshot-label">Role examples</span>
          <strong>03</strong>
          <span className="cl-snapshot-detail">Reference templates</span>
        </div>
      </div>
      <div className="cl-snapshot-insight">
        <div className="cl-insight-heading">
          <Target size={15} aria-hidden="true" />
          <span>Example focus area</span>
        </div>
        <strong>Testing fundamentals</strong>
        <p>A sample suggestion—not a result from your resume.</p>
      </div>
      <div className="cl-snapshot-next">
        <BookOpenCheck size={17} aria-hidden="true" />
        <span>
          <strong>A suggested next step</strong>
          <span>Explore a beginner testing exercise.</span>
        </span>
        <ArrowRight size={15} aria-hidden="true" />
      </div>
      <Link href="/demo" className="cl-snapshot-button">
        View Sample Report
        <ArrowRight size={15} aria-hidden="true" />
      </Link>
      <p className="cl-snapshot-disclaimer">
        All values are illustrative demo data. This is not a real or personalized report.
      </p>
    </aside>
  );
}

function CareerPreview() {
  return (
    <section className="cl-preview-section" aria-labelledby="cl-preview-title">
      <div className="cl-section-shell cl-preview-layout">
        <div className="cl-preview-copy">
          <span className="cl-eyebrow cl-eyebrow-light">
            <BarChart3 size={15} aria-hidden="true" />
            A clearer view of your next step
          </span>
          <h2 id="cl-preview-title">From what you know to where you can grow.</h2>
          <p>
            Bring your skills, reference role matches, and learning ideas together in
            one thoughtful view. Your actual report is built from your resume—not
            from this example.
          </p>
          <ArrowLink href="/analyze">Explore your resume insights</ArrowLink>
        </div>
        <div className="cl-dashboard-card">
          <div className="cl-dashboard-head">
            <div>
              <span className="cl-dashboard-overline">CAREER READINESS PREVIEW</span>
              <h3>A fictional student profile</h3>
            </div>
            <span className="cl-demo-tag">Demo data</span>
          </div>
          <div className="cl-dashboard-grid">
            <section className="cl-dashboard-panel cl-skills-panel">
              <div className="cl-panel-heading">
                <span>Skills in the example</span>
                <span>Illustrative</span>
              </div>
              <div className="cl-skill-bars">
                <div>
                  <span>Web development</span>
                  <span className="cl-skill-track"><span style={{ width: "76%" }} /></span>
                </div>
                <div>
                  <span>Programming</span>
                  <span className="cl-skill-track"><span style={{ width: "60%" }} /></span>
                </div>
                <div>
                  <span>Collaboration</span>
                  <span className="cl-skill-track"><span style={{ width: "48%" }} /></span>
                </div>
              </div>
              <div className="cl-skill-chips">
                {sampleSkills.slice(0, 4).map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </section>
            <section className="cl-dashboard-panel">
              <div className="cl-panel-heading">
                <span>Reference role examples</span>
                <BriefcaseBusiness size={14} aria-hidden="true" />
              </div>
              {["Frontend Developer", "Web Developer", "QA Engineer"].map((role, index) => (
                <div className="cl-role-row" key={role}>
                  <span className="cl-role-number">0{index + 1}</span>
                  <span>{role}</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </div>
              ))}
            </section>
            <section className="cl-dashboard-panel">
              <div className="cl-panel-heading">
                <span>Areas to explore</span>
                <Target size={14} aria-hidden="true" />
              </div>
              <div className="cl-gap-list">
                {sampleGaps.map((gap) => (
                  <span key={gap}>
                    <span aria-hidden="true" />
                    {gap}
                  </span>
                ))}
              </div>
            </section>
            <section className="cl-dashboard-panel cl-roadmap-panel">
              <div className="cl-panel-heading">
                <span>Learning roadmap example</span>
                <BookOpenCheck size={14} aria-hidden="true" />
              </div>
              <p>Example progress starts at zero</p>
              <div className="cl-roadmap-track"><span /></div>
              <div className="cl-roadmap-foot">
                <span>Sample learning plan</span>
                <span>0% · illustrative</span>
              </div>
            </section>
          </div>
          <p className="cl-dashboard-disclaimer">
            Synthetic demonstration only. No sample values are connected to student accounts.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const demoMode = process.env.DEMO_MODE === "true";

  return (
    <main className="cl-landing">
      <section className="cl-hero" aria-labelledby="cl-hero-title">
        <div className="cl-hero-frame">
          <header className="cl-header">
            <Link href="/" className="cl-brand" aria-label="CareerLens AI home">
              <Brand />
            </Link>
            <nav className="cl-desktop-nav" aria-label="Main navigation">
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#students">For Students</a>
              <a href="#about">About</a>
              <Link href="/analyze" className="cl-nav-cta">
                Analyze Resume <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </nav>
            <details className="cl-mobile-menu">
              <summary aria-label="Open navigation menu">
                <span>Menu</span>
                <span className="cl-menu-icon" aria-hidden="true">
                  <span />
                  <span />
                </span>
              </summary>
              <nav aria-label="Mobile navigation">
                <a href="#features">Features</a>
                <a href="#how-it-works">How It Works</a>
                <a href="#students">For Students</a>
                <a href="#about">About</a>
                <Link href="/analyze">Analyze Resume <ArrowRight size={15} /></Link>
                <Link href="/login">Sign in</Link>
              </nav>
            </details>
          </header>

          <div className="cl-hero-main">
            <div className="cl-hero-copy">
              {demoMode && <span className="cl-demo-mode">DEMO MODE · Local resume analysis</span>}
              <span className="cl-eyebrow">
                <span className="cl-eyebrow-dot" aria-hidden="true" />
                A thoughtful start to your next chapter
              </span>
              <h1 id="cl-hero-title">
                Your Resume.
                <span>Your Potential.</span>
                Your Future.
              </h1>
              <p className="cl-hero-description">
                Discover your strengths, uncover skill gaps, and explore career paths
                that match your experience. Turn your resume into a practical roadmap
                for what comes next.
              </p>
              <div className="cl-hero-actions">
                <Link href="/analyze" className="cl-button-primary">
                  Analyze My Resume <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <a href="#features" className="cl-button-secondary">
                  Explore Features <ArrowDown size={16} aria-hidden="true" />
                </a>
              </div>
              <div className="cl-trust-note">
                <ShieldCheck size={16} aria-hidden="true" />
                Private, local analysis. Your resume text is not sent to an AI service.
              </div>
            </div>
            <SampleSnapshot />
          </div>

          <div className="cl-hero-bottom" id="students">
            <p>Built to help students prepare smarter for their next opportunity.</p>
            <ul aria-label="Career preparation features">
              <li><Sparkles size={15} aria-hidden="true" /> Skill Insights</li>
              <li><BriefcaseBusiness size={15} aria-hidden="true" /> Career Matches</li>
              <li><GraduationCap size={16} aria-hidden="true" /> Learning Roadmaps</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="cl-features-section" id="features" aria-labelledby="cl-features-title">
        <div className="cl-section-shell">
          <div className="cl-section-heading">
            <span className="cl-eyebrow cl-eyebrow-dark">A little more clarity goes a long way</span>
            <h2 id="cl-features-title">Everything You Need to Become Career-Ready</h2>
            <p>
              Go beyond a quick resume check with evidence-led insights designed to
              help you prepare for the roles you want.
            </p>
          </div>
          <div className="cl-feature-grid">
            {features.map(({ Icon, title, text, href, link }, index) => (
              <article className="cl-feature-card" key={title}>
                <span className="cl-feature-index">0{index + 1}</span>
                <span className="cl-feature-icon"><Icon size={20} aria-hidden="true" /></span>
                <h3>{title}</h3>
                <p>{text}</p>
                <ArrowLink href={href}>{link}</ArrowLink>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cl-steps-section" id="how-it-works" aria-labelledby="cl-steps-title">
        <div className="cl-section-shell">
          <div className="cl-section-heading cl-steps-heading">
            <span className="cl-eyebrow cl-eyebrow-dark">Simple, focused, yours</span>
            <h2 id="cl-steps-title">A clear path from resume to action.</h2>
          </div>
          <div className="cl-steps-grid">
            {steps.map(({ number, title, text }, index) => (
              <article className="cl-step" key={number}>
                <span className="cl-step-number">{number}</span>
                {index < steps.length - 1 && <span className="cl-step-line" aria-hidden="true" />}
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <Link href="/analyze" className="cl-text-link">
            Begin with your resume <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <CareerPreview />

      <section className="cl-about-section" id="about">
        <div className="cl-about-icon"><ShieldCheck size={22} aria-hidden="true" /></div>
        <div>
          <span className="cl-eyebrow cl-eyebrow-dark">Guidance, not guesswork</span>
          <h2>Built to help you prepare—not to make decisions for you.</h2>
          <p>
            CareerLens runs resume analysis locally using keyword and section-heading
            rules. Role matches are based on reference templates; they are not job
            listings, hiring predictions, or a measure of your potential. Your resume
            deserves thoughtful human judgment, too.
          </p>
          <Link className="cl-inline-link" href="/privacy">Read our privacy notice <ArrowRight size={14} /></Link>
        </div>
      </section>

      <section className="cl-final-cta">
        <div className="cl-cta-orb cl-cta-orb-one" aria-hidden="true" />
        <div className="cl-cta-orb cl-cta-orb-two" aria-hidden="true" />
        <div className="cl-cta-content">
          <span className="cl-eyebrow"><TrendingUp size={15} aria-hidden="true" /> Your next step starts here</span>
          <h2>Your Next Opportunity Starts With Preparation.</h2>
          <p>
            Understand your strengths, work on your skill gaps, and take a thoughtful
            next step toward your career goals.
          </p>
          <Link href="/analyze" className="cl-button-primary">
            Start Your Resume Analysis <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <footer className="cl-footer">
        <div className="cl-footer-main">
          <div className="cl-footer-brand">
            <Link href="/" aria-label="CareerLens AI home"><Brand /></Link>
            <p>
              Resume insights and practical career guidance to help you take your
              next step with confidence.
            </p>
          </div>
          <nav className="cl-footer-nav" aria-label="Footer navigation">
            <div>
              <span>Explore</span>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <Link href="/demo">Sample Report</Link>
            </div>
            <div>
              <span>Get started</span>
              <Link href="/analyze">Analyze Resume</Link>
              <Link href="/login">Sign in</Link>
              <Link href="/register">Create account</Link>
            </div>
            <div>
              <span>Information</span>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Use</Link>
            </div>
          </nav>
        </div>
        <div className="cl-footer-bottom">
          <span>© {new Date().getFullYear()} CareerLens AI</span>
          <span>Thoughtful tools for your next chapter.</span>
          <span><CheckCircle2 size={14} aria-hidden="true" /> Educational guidance only</span>
        </div>
      </footer>
    </main>
  );
}
