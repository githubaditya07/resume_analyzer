"use client";

import { useState } from "react";

type Profile={degree:string;specialization:string;graduationYear:number|string;experienceLevel:string;workMode:string;learningPace:string;preferredRoles:string;preferredIndustries:string;preferredLocations:string};
const split=(value:string)=>value.split(",").map((part)=>part.trim()).filter(Boolean).slice(0,10);

export function ProfileForm({initial}:{initial:Profile}){
  const [values,setValues]=useState(initial);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  function update(key:keyof Profile,value:string){setValues((current)=>({...current,[key]:value}));}
  async function submit(event:React.FormEvent){
    event.preventDefault();setBusy(true);setError("");setMessage("");
    const body={degree:values.degree||null,specialization:values.specialization||null,graduationYear:values.graduationYear?Number(values.graduationYear):null,experienceLevel:values.experienceLevel||null,workMode:values.workMode||null,learningPace:values.learningPace||null,preferredRoles:split(values.preferredRoles),preferredIndustries:split(values.preferredIndustries),preferredLocations:split(values.preferredLocations)};
    const response=await fetch("/api/profile",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const result=await response.json().catch(()=>({}));
    if(!response.ok)setError(result.error??"Could not save your profile.");else setMessage("Profile preferences saved.");
    setBusy(false);
  }
  const fields:[keyof Profile,string,string][]=[["degree","Degree","e.g., B.Tech"],["specialization","Specialization","e.g., Computer Science"],["experienceLevel","Experience level","e.g., Student / graduate"],["preferredRoles","Preferred roles","Comma-separated"],["preferredIndustries","Preferred industries","Comma-separated"],["preferredLocations","Preferred locations","Comma-separated"]];
  return <form className="card" style={{maxWidth:760}} onSubmit={submit}><div className="two-col">{fields.map(([key,label,placeholder])=><div className="field" key={key}><label htmlFor={key}>{label}</label><input id={key} className="input" value={values[key]} onChange={(event)=>update(key,event.target.value)} placeholder={placeholder} maxLength={240}/></div>)}<div className="field"><label htmlFor="graduationYear">Graduation year (optional)</label><input id="graduationYear" type="number" min="1950" max="2100" className="input" value={values.graduationYear} onChange={(event)=>update("graduationYear",event.target.value)}/></div><div className="field"><label htmlFor="workMode">Preferred work mode</label><select id="workMode" className="select" value={values.workMode} onChange={(event)=>update("workMode",event.target.value)}><option value="">No preference</option><option>Remote</option><option>Hybrid</option><option>On-site</option></select></div><div className="field"><label htmlFor="learningPace">Learning pace</label><select id="learningPace" className="select" value={values.learningPace} onChange={(event)=>update("learningPace",event.target.value)}><option value="">No preference</option><option>Light</option><option>Moderate</option><option>Intensive</option></select></div></div>{error&&<div className="error-box" role="alert">{error}</div>}{message&&<div className="notice" role="status">{message}</div>}<button disabled={busy} className="btn btn-primary" style={{marginTop:16}}>Save preferences</button></form>;
}
