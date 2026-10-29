"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export function AccountDeletion(){
  const [password,setPassword]=useState("");const [confirm,setConfirm]=useState("");const [error,setError]=useState("");const [busy,setBusy]=useState(false);
  async function remove(){
    if(confirm!=="DELETE"){setError("Type DELETE exactly to confirm.");return;}
    if(!window.confirm("Permanently delete your account and associated records?"))return;
    setBusy(true);setError("");
    const response=await fetch("/api/account",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({password,confirm})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok){setError(result.error??"Account deletion failed.");setBusy(false);return;}
    await signOut({callbackUrl:"/"});
  }
  return <section className="card" style={{borderColor:"#f2d3d0"}}><h2 className="section-title" style={{color:"#a33c32"}}>Delete account and associated data</h2><p className="field-help">This deletes your profile, resume text, analyses, saved roles, and learning plans. Backups may expire later under the operator&apos;s retention policy.</p><div className="field"><label htmlFor="delete-password">Confirm your password</label><input id="delete-password" className="input" type="password" autoComplete="current-password" value={password} onChange={(event)=>setPassword(event.target.value)}/></div><div className="field"><label htmlFor="delete-confirm">Type DELETE to confirm</label><input id="delete-confirm" className="input" value={confirm} onChange={(event)=>setConfirm(event.target.value)}/></div>{error&&<div className="error-box" role="alert">{error}</div>}<button className="btn btn-danger" disabled={busy} onClick={remove}>Permanently delete account</button></section>;
}
