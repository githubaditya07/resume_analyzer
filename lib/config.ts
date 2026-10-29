function boundedInteger(value:string|undefined,fallback:number,min:number,max:number){
  const parsed=Number.parseInt(value??"",10);
  return Number.isInteger(parsed)?Math.min(max,Math.max(min,parsed)):fallback;
}

export const getUploadMaxSizeMb=()=>boundedInteger(process.env.UPLOAD_MAX_SIZE_MB,5,1,20);
export const getAnalysisRateLimitPerHour=()=>boundedInteger(process.env.ANALYSIS_RATE_LIMIT_PER_HOUR,5,1,1000);
