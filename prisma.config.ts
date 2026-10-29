import "dotenv/config";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "prisma/config";

mkdirSync(resolve(process.cwd(), ".local-data"), { recursive: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts"
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "file:./.local-data/careerlens.db"
  }
});
