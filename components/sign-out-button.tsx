"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return <button aria-label="Sign out" onClick={() => signOut({ callbackUrl: "/" })} className="btn btn-secondary" style={{padding:"8px",border:"0"}}><LogOut size={15} /></button>;
}
