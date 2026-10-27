export function plain(html='') {
 let s=String(html);for(let i=0;i<2;i++)s=s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&amp;/g,'&').replace(/&nbsp;/g,' ');
 return s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(+n)).replace(/\s+/g,' ').trim();
}
export function classifyJob(job,source,settings) {
 const title=plain(job.title),location=job.location?.name||'';
 const geography=settings.locations.some(x=>x==='*'||new RegExp('(^|[^a-z])'+x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'([^a-z]|$)','i').test(location));
 const keyword=settings.keywords.some(x=>title.toLowerCase().includes(x.toLowerCase()));
 const industry=settings.industries.includes(source.industry);
 // Technician and administrative roles have different implications; titles drive the initial gate.
 return {relevant:geography&&keyword&&industry,title,location,excerpt:plain(job.content).slice(0,12000)};
}
export function validateAssessment(value,signals) {
 const norm=s=>String(s).replace(/\s+/g,' ').trim();
 const supported=[];
 for(const e of value.evidence||[]){const s=signals.find(x=>x.id===e.signal_id);if(!s||!e.quote||!norm(s.source_excerpt).includes(norm(e.quote)))throw Error('AI cited unsupported evidence');supported.push({signal_id:s.id,quote:e.quote,url:s.source_url,source_date:s.posted_at||null,observed_at:s.observed_at});}
 for(const k of ['fit','need','intent'])if(!Number.isInteger(value[k])||value[k]<0||value[k]>100)throw Error('Invalid component score');
 if(!supported.length){value.need=0;value.intent=0;value.confidence=Math.min(value.confidence,.3);}
 // Hiring is an operational signal only. Never turn it into inferred purchase intent.
 if(!signals.some(s=>s.signal_type==='buying_intent_verified'))value.intent=0;
 if(/future.dated|dates are future|dates.*in the future/i.test(value.reasoning||'')&&!signals.some(s=>s.posted_at&&Date.parse(s.posted_at)>Date.now()+86400000))throw Error('AI made an unsupported source-date claim');
 if(signals.some(s=>!s.posted_at)||signals.every(s=>Date.now()-Date.parse(s.posted_at)>90*86400000))value.confidence=Math.min(value.confidence,.5);
 if(typeof value.reasoning!=='string'||value.reasoning.length<30||typeof value.next_action!=='string')throw Error('Missing explanation');
 if(!Number.isFinite(value.confidence)||value.confidence<0||value.confidence>1)throw Error('Invalid confidence');
 if(!Array.isArray(value.drafts)||value.drafts.length!==4||new Set(value.drafts.map(x=>x.kind)).size!==4)throw Error('Four distinct draft types required');
 for(const d of value.drafts)if(!['intro_email','linkedin','followup_email','phone_points'].includes(d.kind)||!d.body||d.body.length>2000)throw Error('Invalid draft');
 value.evidence=supported;return value;
}
export async function withRetries(fn,{sleep=ms=>new Promise(r=>setTimeout(r,ms)),attempts=3}={}) {
 let last;for(let i=0;i<attempts;i++){try{const r=await fn();if(r.status===429||r.status>=500){await r.body?.cancel?.();last=Error('Source HTTP '+r.status);if(i<attempts-1){await sleep(Math.min(5000,1000*2**i));continue;}throw last;}return {response:r,attempts:i+1};}catch(e){last=e;if(e.message?.startsWith('Source HTTP')||i===attempts-1)throw e;await sleep(1000*2**i);}}throw last;
}
export const assessmentSchema={type:'object',additionalProperties:false,required:['fit','need','intent','confidence','reasoning','next_action','evidence','drafts'],properties:{fit:{type:'integer'},need:{type:'integer'},intent:{type:'integer'},confidence:{type:'number'},reasoning:{type:'string'},next_action:{type:'string'},evidence:{type:'array',items:{type:'object',additionalProperties:false,required:['signal_id','quote'],properties:{signal_id:{type:'string'},quote:{type:'string'}}}},drafts:{type:'array',items:{type:'object',additionalProperties:false,required:['kind','subject','body'],properties:{kind:{type:'string',enum:['intro_email','linkedin','followup_email','phone_points']},subject:{type:'string'},body:{type:'string'}}}}}};
