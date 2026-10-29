import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registrationSchema } from "@/lib/validation";
import { requireSameOrigin } from "@/lib/authorization";

export async function POST(request: Request) {
  const originError=requireSameOrigin(request);
  if(originError)return originError;
  if(Number(request.headers.get("content-length")??0)>16_384)return Response.json({error:"Registration request is too large."},{status:413});
  const parsed = registrationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Enter a valid name, email, and password with at least 10 characters." }, { status: 400 });
  try {
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: await hash(parsed.data.password, 12),
        profile: { create: { preferredRoles: [], preferredIndustries: [], preferredLocations: [] } }
      },
      select: { id: true }
    });
    await prisma.auditEvent.create({ data: { actorId: user.id, action: "ACCOUNT_CREATED", resourceType: "User" } });
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return Response.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    console.error("Account registration failed", { errorType: error instanceof Error ? error.name : "UnknownError" });
    return Response.json({ error: "Registration is temporarily unavailable." }, { status: 503 });
  }
}
