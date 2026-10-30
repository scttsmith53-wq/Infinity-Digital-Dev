import {run} from './worker.ts';
import {parseCSV,csv,fields,master} from './core.mjs';
import {safeUrl,publicIp} from './research-core.mjs';
const BASE=Deno.env.get('SUPABASE_URL')!,SERVICE=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,OWNER='78dfc218-78cd-43c7-9cc9-47885a5b2f82';
const ORIGIN='https://demo.infinitydigitaldev.com',UA='IDDContactResearch/1.0 (public professional business research; no outreach)';
const headers={'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Cache-Control':'no-store','Vary':'Origin'};
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function rpc(a:string,d:unknown={}){const r=await fetch(BASE+'/rest/v1/rpc/prospecting_personalization',{method:'POST',headers:{apikey:SERVICE,Authorization:'Bearer '+SERVICE,'Content-Type':'application/json'},body:JSON.stringify({a,d})});const v=await r.json();if(!r.ok)throw Error(v.message||'Research database error');return v;}
async function dns(url:URL){let ips:string[]=[];for(const type of ['A','AAAA'] as const){try{ips.push(...await Deno.resolveDns(url.hostname,type));}catch{}}if(!ips.length||ips.some(ip=>!publicIp(ip)))throw Error('Website DNS is unavailable or resolves to a non-public address');}
async function readBody(r:Response,limit:number){const reader=r.body?.getReader();if(!reader)return '';let text='',bytes=0;const dec=new TextDecoder();while(true){const x=await reader.read();if(x.done)break;bytes+=x.value.length;if(bytes>limit){await reader.cancel();throw Error('Source exceeds size limit');}text+=dec.decode(x.value,{stream:true});}return text;}
async function requestUrl(value:string,host:string,follow=true){let u=safeUrl(value,host),attempts=0;for(let redirect=0;redirect<4;redirect++){
 await dns(u);let r:Response|undefined;
 for(let a=0;a<2;a++){attempts++;try{r=await fetch(u,{redirect:'manual',headers:{'User-Agent':UA,Accept:'text/html,text/plain,application/xhtml+xml'},signal:AbortSignal.timeout(8000)});if((r.status===429||r.status>=500)&&a===0){await r.body?.cancel();await sleep(1500);continue;}break;}catch(e){if(a===1)throw e;await sleep(1000);}}
 if(!r)throw Error('Source unavailable');if(follow&&r.status>=300&&r.status<400){const target=r.headers.get('location');await r.body?.cancel();if(!target)throw Error('Redirect without location');const next=safeUrl(new URL(target,u).href,host);if(u.protocol==='https:'&&next.protocol!=='https:')throw Error('HTTPS downgrade requires manual review');u=next;continue;}
 return {response:r,url:u.href,attempts};
 }throw Error('Too many redirects');}

export async function handler(req:Request){
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.method!=='POST')return Response.json({error:'POST required'},{status:405,headers});
 if(req.headers.get('origin')&&req.headers.get('origin')!==ORIGIN)return Response.json({error:'Origin not allowed'},{status:403,headers});
 try{
 const bearer=req.headers.get('authorization');if(!bearer)throw Error('Unauthorized');
 const auth=await fetch(BASE+'/auth/v1/user',{headers:{apikey:SERVICE,Authorization:bearer}});const user=await auth.json();if(!auth.ok||user.id!==OWNER)throw Error('Unauthorized');
 const raw=await req.text();if(raw.length>500000)throw Error('Request too large');const d=JSON.parse(raw);
 // All public actions retain the user's bearer so DB ownership checks and actor history apply.
 async function ownerRpc(a:string,data:any={}){const r=await fetch(BASE+'/rest/v1/rpc/prospecting_personalization',{method:'POST',headers:{apikey:SERVICE,Authorization:bearer!,'Content-Type':'application/json'},body:JSON.stringify({a,d:data})});const v=await r.json();if(!r.ok)throw Error(v.message||'Database error');return v;}
 let result;
 if(d.action==='run')result=await run({rpc,requestUrl,readBody,sleep},d.id);
 else if(d.action==='bootstrap'){
 const overview=await ownerRpc('overview');if(overview.shortlist_count===2000)result={count:2000,cached:true};else {
 const path='smartlead/2026-10-27/smartlead-top2000-ALL.csv';const r=await fetch(BASE+'/storage/v1/object/authenticated/exports/'+path,{headers:{apikey:SERVICE,Authorization:'Bearer '+SERVICE}});if(!r.ok)throw Error('Original shortlist unavailable; ranking will not be replaced');
 const rows=parseCSV(await r.text());result=await rpc('_snapshot',{source_path:path,rows:rows.map(r=>({lead_id:r.lead_id,lead_score:r.lead_score}))});}
 }
 else if(d.action==='capabilities')result={smartlead_api_configured:!!Deno.env.get('SMARTLEAD_API_KEY'),smartlead_campaign_configured:!!Deno.env.get('SMARTLEAD_CAMPAIGN_ID'),enrollment_enabled:false,automatic_sending:false,master,model:'gpt-5.6-luna',external_search_enabled:false,paid_enrichment_enabled:false};
 else if(d.action==='smartlead_sync'){
 const key=Deno.env.get('SMARTLEAD_API_KEY'),campaign=Deno.env.get('SMARTLEAD_CAMPAIGN_ID');if(!key||!campaign)throw Error('Smartlead API is not configured. Import a current complete suppression snapshot manually.');
 // Read-only integration. No lead upload, campaign edit, or sending endpoint exists here.
 const r=await fetch('https://server.smartlead.ai/api/v1/campaigns/'+encodeURIComponent(campaign)+'/leads-export?api_key='+encodeURIComponent(key),{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error('Smartlead read-only synchronization HTTP '+r.status);
 const rows=parseCSV(await r.text()),items=rows.filter(x=>/true|1/i.test(x.is_unsubscribed||'')||/bounc|unsubscr|not.interested|blocked/i.test(x.status||'')).map(x=>({value:x.email,kind:'email',reason:x.is_unsubscribed==='true'?'unsubscribed':x.status}));
 // A campaign snapshot alone cannot prove global blocklist coverage. Merge restrictions but retain export gate.
 await rpc('_campaign_suppression_sync',{items,complete:false,source:'Read-only campaign suppression import '+campaign+'; owner must separately confirm global blocklist coverage'});
 // Clear readiness until complete global suppression data is independently attested.
 await rpc('_clear_suppression_readiness');result={imported:items.length,complete:false,reason:'Campaign data imported. A complete global blocklist snapshot is still required.'};
 }
 else if(d.action==='export'){
 result=await ownerRpc('export',d.filters||{});
 const production=result.production,rows=result.rows.map((v:any)=>({email:production?v.recipient:undefined,review_recipient:production?undefined:v.recipient,first_name:v.first_name,company_name:v.company_name,website:v.website,lead_id:v.lead_id,industry:v.industry,state:v.state,...v.research.variables,version_id:v.id,qa_status:v.qa_status,human_status:v.human_status,export_ready:production,opportunity:v.research.service,opportunity_score:v.research.score,evidence_urls:(v.research.findings||[]).map((f:any)=>f.source_url).join(' | '),email_preview:v.email_body}));
 const keys=[production?'email':'review_recipient','first_name','company_name','website','lead_id','industry','state',...fields,'version_id','qa_status','human_status','export_ready','opportunity','opportunity_score','evidence_urls','email_preview'];
 result={...result,csv:csv(rows,keys),rows:rows.length,filename:(production?'smartlead-approved-':'REVIEW-ONLY-do-not-import-')+result.export_id+'.csv'};
 }
 else if(['overview','list','detail','enqueue_pilot','settings','review','suppression_sync','retry','recover'].includes(d.action))result=await ownerRpc(d.action,d.data||{});
 else throw Error('Unsupported action');
 return Response.json(result,{headers});
 }catch(e){return Response.json({error:e.message},{status:e.message==='Unauthorized'?401:400,headers});}
}
Deno.serve(handler);
