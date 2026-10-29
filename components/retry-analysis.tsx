"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

export function RetryAnalysis({id}:{id:string}){
  const [busy,setBusy]=useState(false);const [error,setError]=useState("");const router=useRouter();
  async function retry(){setBusy(true);setError("");const response=await fetch(`/api/analyses/${id}/retry`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({durationWeeks:4})});const body=await response.json().catch(()=>({}));if(!response.ok){setError(body.error??"Retry failed.");setBusy(false);return;}router.refresh();setBusy(false);}
  return <div><button className="btn btn-primary" onClick={retry} disabled={busy}>{busy?"Retrying analysis…":"Retry analysis"}</button>{error&&<div className="error-box" role="alert" style={{marginTop:10}}>{error}</div>}</div>;
}
