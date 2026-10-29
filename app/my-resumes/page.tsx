import { getServerSession } from "next-auth";
import { AppShell } from "@/components/app-shell";
import { ResumeList } from "@/components/resume-list";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MyResumesPage() {
  const session = await getServerSession(authOptions);
  const resumes = await prisma.resume.findMany({
    where:{userId:session!.user.id},
    include:{analyses:{select:{id:true,status:true,createdAt:true},orderBy:{createdAt:"desc"}}},
    orderBy:{createdAt:"desc"}
  });
  return <AppShell active="/my-resumes"><div className="page-heading"><div><h1>My resumes</h1><p>Review your analysis history or delete stored resume data and reports.</p></div></div><ResumeList resumes={resumes.map((resume)=>({id:resume.id,filename:resume.originalFilename,fileType:resume.fileType,createdAt:resume.createdAt.toLocaleDateString(),analyses:resume.analyses.map((analysis)=>({id:analysis.id,status:analysis.status,createdAt:analysis.createdAt.toLocaleDateString()}))}))}/></AppShell>;
}
