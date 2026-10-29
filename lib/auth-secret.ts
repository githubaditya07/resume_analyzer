import { randomBytes } from "node:crypto";
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const secretPath = resolve(process.cwd(), ".local-data", "session-secret");

export function getAuthSecret() {
  const configuredSecret = process.env.NEXTAUTH_SECRET?.trim();
  if (configuredSecret) return configuredSecret;

  mkdirSync(resolve(process.cwd(), ".local-data"), { recursive: true });
  if (existsSync(secretPath)) return readFileSync(secretPath, "utf8").trim();

  const secret = randomBytes(32).toString("base64url");
  let descriptor: number;
  try {
    descriptor = openSync(secretPath, "wx", 0o600);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "EEXIST") {
      return readFileSync(secretPath, "utf8").trim();
    }
    throw error;
  }
  try {
    writeFileSync(descriptor, secret, "utf8");
  } finally {
    closeSync(descriptor);
  }
  return secret;
}
