"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/brand";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    try {
      if (isRegister) {
        const response = await fetch("/api/register", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({name:form.get("name"),email,password}) });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Registration failed.");
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (!result?.ok) throw new Error("Email or password is incorrect.");
      router.push("/dashboard");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Something went wrong. Please try again.");
    } finally { setBusy(false); }
  }
  return <div className="auth-wrap"><div className="auth-card">
    <Link href="/"><Brand /></Link>
    <h1>{isRegister ? "Create your student account" : "Welcome back"}</h1>
    <p>{isRegister ? "Start building a more focused career plan." : "Sign in to continue to your career workspace."}</p>
    <form onSubmit={submit}>
      {isRegister && <div className="field"><label htmlFor="name">Full name</label><input id="name" name="name" className="input" autoComplete="name" required minLength={2} maxLength={80}/></div>}
      <div className="field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" className="input" autoComplete="email" required maxLength={254}/></div>
      <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" className="input" autoComplete={isRegister ? "new-password" : "current-password"} required minLength={isRegister ? 10 : 1} maxLength={128}/>{isRegister&&<span className="field-help">Use at least 10 characters.</span>}</div>
      {error&&<div className="error-box" role="alert">{error}</div>}
      <button className="btn btn-primary" style={{width:"100%",marginTop:14}} disabled={busy}>{busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}</button>
    </form>
    <p style={{marginTop:18,textAlign:"center"}}>{isRegister?"Already have an account?":"New to CareerLens?"} <Link className="auth-link" href={isRegister?"/login":"/register"}>{isRegister?"Sign in":"Create an account"}</Link></p>
  </div></div>;
}
