import { getServerSession } from "next-auth";
import { AppShell } from "@/components/app-shell";
import { ProfileForm } from "@/components/profile-form";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStringList } from "@/lib/profile-preferences";

export default async function ProfilePage(){
  const session=await getServerSession(authOptions);
  const profile=await prisma.studentProfile.findUnique({where:{userId:session!.user.id}});
  return <AppShell active="/profile"><div className="page-heading"><div><h1>Your profile</h1><p>Optional preferences can help contextualize career guidance. You can update or remove them anytime.</p></div></div><ProfileForm initial={{degree:profile?.degree??"",specialization:profile?.specialization??"",graduationYear:profile?.graduationYear??"",experienceLevel:profile?.experienceLevel??"",workMode:profile?.workMode??"",learningPace:profile?.learningPace??"",preferredRoles:getStringList(profile?.preferredRoles).join(", "),preferredIndustries:getStringList(profile?.preferredIndustries).join(", "),preferredLocations:getStringList(profile?.preferredLocations).join(", ")}}/></AppShell>;
}
