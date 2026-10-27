import {runContactResearch} from './research.ts';
import {safeUrl,publicIp} from './core.mjs';
const BASE=Deno.env.get('SUPABASE_URL')!,SERVICE=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,OWNER='78dfc218-78cd-43c7-9cc9-47885a5b2f82';
const ORIGIN='https://demo.infinitydigitaldev.com',UA='IDDContactResearch/1.0 (public professional business research; no outreach)';
const headers={'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Cache-Control':'no-store','Vary':'Origin'};
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function rpc(a:string,d:unknown={}){const r=await fetch(BASE+'/rest/v1/rpc/prospecting_contacts',{method:'POST',headers:{apikey:SERVICE,Authorization:'Bearer '+SERVICE,'Content-Type':'application/json'},body:JSON.stringify({a,d})});const v=await r.json();if(!r.ok)throw Error(v.message||'Research database error');return v;}
async function schedulerKey(){const r=await fetch(BASE+'/rest/v1/rpc/prospecting_scheduler_key',{method:'POST',headers:{apikey:SERVICE,Authorization:'Bearer '+SERVICE,'Content-Type':'application/json'},body:'{}'});if(!r.ok)throw Error('Scheduler unavailable');return await r.json();}
async function digest(v:string){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
async function dns(url:URL){let ips:string[]=[];for(const type of ['A','AAAA'] as const){try{ips.push(...await Deno.resolveDns(url.hostname,type));}catch{}}if(!ips.length||ips.some(ip=>!publicIp(ip)))throw Error('Website DNS is unavailable or resolves to a non-public address');}
async function readBody(r:Response,limit:number){const reader=r.body?.getReader();if(!reader)return '';let text='',bytes=0;const dec=new TextDecoder();while(true){const x=await reader.read();if(x.done)break;bytes+=x.value.length;if(bytes>limit){await reader.cancel();throw Error('Source exceeds size limit');}text+=dec.decode(x.value,{stream:true});}return text;}
async function requestUrl(value:string,host:string,follow=true){let u=safeUrl(value,host),attempts=0;for(let redirect=0;redirect<4;redirect++){
 await dns(u);let r:Response|undefined;
 for(let a=0;a<2;a++){attempts++;try{r=await fetch(u,{redirect:'manual',headers:{'User-Agent':UA,Accept:'text/html,text/plain,application/xhtml+xml'},signal:AbortSignal.timeout(8000)});if((r.status===429||r.status>=500)&&a===0){await r.body?.cancel();await sleep(1500);continue;}break;}catch(e){if(a===1)throw e;await sleep(1000);}}
 if(!r)throw Error('Source unavailable');if(follow&&r.status>=300&&r.status<400){const target=r.headers.get('location');await r.body?.cancel();if(!target)throw Error('Redirect without location');const next=safeUrl(new URL(target,u).href,host);if(u.protocol==='https:'&&next.protocol!=='https:')throw Error('HTTPS downgrade requires manual review');u=next;continue;}
 return {response:r,url:u.href,attempts};
 }throw Error('Too many redirects');}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{headers});if(req.method!=='POST')return Response.json({error:'POST required'},{status:405,headers});
 if(req.headers.get('origin')&&req.headers.get('origin')!==ORIGIN)return Response.json({error:'Origin not allowed'},{status:403,headers});
 try{const cron=req.headers.get('x-prospect-scheduler'),bearer=req.headers.get('authorization');let scheduled=false;
 if(cron){scheduled=await digest(cron)===await digest(await schedulerKey()||'');if(!scheduled)throw Error('Unauthorized');}
 else if(bearer){const r=await fetch(BASE+'/auth/v1/user',{headers:{apikey:SERVICE,Authorization:bearer}});const u=await r.json();if(!r.ok||u.id!==OWNER)throw Error('Unauthorized');}else throw Error('Unauthorized');
 const raw=await req.text();if(raw.length>2000)throw Error('Request too large');const d=JSON.parse(raw);if(d.action==='capabilities'&&!scheduled)return Response.json({website_research:true,licensed_search_provider:'OpenAI',hunter_key_present:!!Deno.env.get('HUNTER_API_KEY'),paid_email_enrichment_enabled:false},{headers});if(d.action!=='run')throw Error('Unsupported action');
 // One bounded job/request. Cron requests are authenticated and cannot enqueue or approve contacts.
 const result=await runContactResearch({rpc,requestUrl,readBody,sleep},!scheduled&&typeof d.id==='string'?d.id:undefined);return Response.json(result,{headers});
 }catch(e){return Response.json({error:e.message},{status:e.message==='Unauthorized'?401:400,headers});}
});
