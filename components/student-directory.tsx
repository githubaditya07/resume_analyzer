"use client";

import {useEffect,useState} from "react";

type Student={id:string;name:string;email:string;createdAt:string;profile:{degree:string|null;specialization:string|null;graduationYear:number|null}|null;_count:{analyses:number}};
export function StudentDirectory(){
  const [students,setStudents]=useState<Student[]>([]);const [year,setYear]=useState("");const [error,setError]=useState("");
  useEffect(()=>{const query=year?`?graduationYear=${encodeURIComponent(year)}`:"";fetch(`/api/admin/students${query}`).then(async(response)=>{const data=await response.json();if(!response.ok)throw new Error(data.error);setStudents(data.students);}).catch((reason)=>setError(reason instanceof Error?reason.message:"Student directory unavailable."));},[year]);
  return <div className="card"><label className="field" style={{maxWidth:280}}><span className="field-help">Filter by graduation year</span><input type="number" className="input" value={year} onChange={(event)=>setYear(event.target.value)} placeholder="Any year"/></label>{error&&<div className="error-box">{error}</div>}{students.map((student)=><div className="list-row" key={student.id}><span><strong>{student.name}</strong><br/><span className="muted">{student.email}</span><br/><span className="muted">{[student.profile?.degree,student.profile?.specialization,student.profile?.graduationYear].filter(Boolean).join(" · ")||"Profile details not provided"}</span></span><span className="badge">{student._count.analyses} analyses</span></div>)}{!students.length&&!error&&<div className="empty">No student accounts found.</div>}</div>;
}
