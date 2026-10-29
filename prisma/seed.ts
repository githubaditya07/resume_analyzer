import "dotenv/config";
import { PrismaClient, UserRole } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hash } from "bcryptjs";
import { jobRoleCatalog } from "../lib/job-catalog";

const databaseUrl=process.env.DATABASE_URL??"file:./.local-data/careerlens.db";
const prisma=new PrismaClient({adapter:new PrismaBetterSqlite3({url:databaseUrl})});

async function main(){
  for(const role of jobRoleCatalog){
    await prisma.jobRole.upsert({
      where:{title_category:{title:role.title,category:role.category}},
      create:{title:role.title,category:role.category,description:role.description,requiredSkills:role.requiredSkills,preferredSkills:role.preferredSkills,skillWeights:role.weights,source:"REFERENCE_TEMPLATE"},
      update:{description:role.description,requiredSkills:role.requiredSkills,preferredSkills:role.preferredSkills,skillWeights:role.weights,isActive:true}
    });
  }
  const email=process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password=process.env.ADMIN_PASSWORD;
  if(email&&password){
    if(password.length<16)throw new Error("ADMIN_PASSWORD must contain at least 16 characters.");
    await prisma.user.upsert({
      where:{email},
      create:{email,name:process.env.ADMIN_NAME?.trim()||"Placement administrator",passwordHash:await hash(password,12),role:UserRole.ADMIN},
      update:{role:UserRole.ADMIN}
    });
    console.log("Seeded the configured administrator account.");
  }else{
    console.log("No admin account created. Set ADMIN_EMAIL and ADMIN_PASSWORD for explicit development provisioning.");
  }
  console.log(`Seeded ${jobRoleCatalog.length} reference job-role templates.`);
}

main().catch((error)=>{console.error("Database seed failed",error);process.exitCode=1;}).finally(async()=>prisma.$disconnect());
