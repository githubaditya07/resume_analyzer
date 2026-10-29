"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

export function RoadmapDuration({planId,currentWeeks}:{planId:string;currentWeeks:number}){
  const [weeks,setWeeks]=useState(String(currentWeeks));const [error,setError]=useState("");const [busy,setBusy]=useState(false);const router=useRouter();
  async function save(){setError("");setBusy(true);const response=await fetch(`/api/learning-plans/${planId}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({durationWeeks:Number(weeks)})});const body=await response.json().catch(()=>({}));if(!response.ok){setError(body.error??"Could not update roadmap.");setBusy(false);return;}router.refresh();setBusy(false);}
  return <div><label className="field-help" htmlFor="plan-duration">Plan length</label><div style={{display:"flex",gap:6,marginTop:4}}><select id="plan-duration" className="select" value={weeks} onChange={(event)=>setWeeks(event.target.value)} style={{width:110,padding:7}}><option value="2">2 weeks</option><option value="4">4 weeks</option><option value="8">8 weeks</option></select><button className="btn btn-secondary" style={{padding:"7px 10px"}} onClick={save} disabled={busy||Number(weeks)===currentWeeks}>{busy?"Saving…":"Update"}</button></div>{error&&<div className="error-box" role="alert" style={{marginTop:5}}>{error}</div>}</div>;
}
