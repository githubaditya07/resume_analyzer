"use client";

import { useState } from "react";

type Task = {id:string;title:string;skill:string;description:string;estimatedHours:number;weekNumber:number;status:string;resourceUrl:string|null};

export function LearningTasks({tasks}: {tasks:Task[]}) {
  const [items,setItems] = useState(tasks);
  const [error,setError] = useState("");
  async function toggle(id:string,completed:boolean) {
    setError("");
    const response=await fetch(`/api/learning-tasks/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({completed})});
    if(!response.ok){const body=await response.json().catch(()=>({}));setError(body.error??"Could not save your progress.");return;}
    setItems((current)=>current.map((item)=>item.id===id?{...item,status:completed?"DONE":"TODO"}:item));
  }
  const weeks=[...new Set(items.map((task)=>task.weekNumber))];
  return <div>{error&&<div className="error-box" role="alert" style={{marginBottom:15}}>{error}</div>}{weeks.map((week)=><section className="card" key={week} style={{marginBottom:15}}><h2 className="section-title">Week {week}</h2>{items.filter((task)=>task.weekNumber===week).map((task)=><label className="task" key={task.id}><input type="checkbox" checked={task.status==="DONE"} onChange={(event)=>toggle(task.id,event.target.checked)}/><span><span className="task-title">{task.title}</span><span className="chip">{task.skill}</span><div className="task-desc">{task.description}</div><div className="field-help" style={{marginTop:5}}>Approximately {task.estimatedHours} study hours{task.resourceUrl&&<> · <a href={task.resourceUrl} target="_blank" rel="noopener noreferrer" className="auth-link">Learning resource</a></>}</div></span></label>)}</section>)}</div>;
}
