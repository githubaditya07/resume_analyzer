import { AppShell } from "@/components/app-shell";
import { AnalyzeForm } from "@/components/analyze-form";
import { getUploadMaxSizeMb } from "@/lib/config";

export default function AnalyzePage() {
  return <AppShell active="/analyze"><div className="page-heading"><div><h1>Analyze your resume</h1><p>Get evidence-based feedback and a practical plan tailored to your goals.</p></div></div><AnalyzeForm maxSizeMb={getUploadMaxSizeMb()}/></AppShell>;
}
