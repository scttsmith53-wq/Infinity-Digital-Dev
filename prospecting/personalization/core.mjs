import {normalize,companyMatch} from './research-core.mjs';
export const fields=['custom_subject','custom_observation','custom_problem_question','custom_solution','custom_cta','custom_followup_1','custom_followup_2'];
export const services=['AI phone receptionists','After-hours call answering','Appointment scheduling','Missed-call follow-up','Customer intake automation','Lead qualification','Quote request automation','Customer support automation','CRM integration','Workflow automation'];
export const footer='Scott\nInfinity Digital Development\nBusiness solicitation\n2256 Park Centre Dr, Suite 101\nWestminster, CO 80234';
export const master='Hi {{first_name}},\n\n{{custom_observation}}\n\n{{custom_problem_question}}\n\n{{custom_solution}}\n\n{{custom_cta}}\n\n'+footer+'\n%unsubscribe-text%';
export function assemble(v,first='there'){return 'Hi '+first+',\n\n'+fields.slice(1,5).map(k=>v[k]||'').join('\n\n')+'\n\n'+footer;}
export function parseCSV(s){const rows=[];let row=[],v='',quoted=false;for(let i=0;i<s.length;i++){const c=s[i];if(c==='"'){if(quoted&&s[i+1]==='"'){v+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(v);v='';}else if(c==='\n'&&!quoted){row.push(v.replace(/\r$/,''));rows.push(row);row=[];v='';}else v+=c;}if(v||row.length){row.push(v.replace(/\r$/,''));rows.push(row);}const h=rows.shift()||[];return rows.filter(r=>r.length===h.length).map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]])));}
export function csv(rows,keys){const q=v=>{let s=String(v??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};return keys.map(q).join(',')+'\r\n'+rows.map(r=>keys.map(k=>q(r[k])).join(',')).join('\r\n');}
export function validate(result,pages,business,first='there'){
 const errors=[],v=result.variables||{},facts=result.findings||[];if(!services.includes(result.service))errors.push('Select one supported service');
 if(!companyMatch(business.name,pages))errors.push('Company identity needs manual confirmation');
 if(!facts.length)errors.push('No source-backed findings');
 for(const f of facts){const p=pages.find(p=>p.url===f.source_url);if(!p||normalize(f.excerpt).length<20||normalize(f.excerpt).length>900||!normalize(p.text).toLowerCase().includes(normalize(f.excerpt).toLowerCase()))errors.push('Finding does not match an exact retrieved passage');if(Number(f.confidence)<.7)errors.push('Evidence confidence below review threshold');}
 for(const k of fields)if(typeof v[k]!=='string'||!v[k].trim()||v[k].length>(k==='custom_subject'?100:1000)||/[{}<>\x00-\x08]/.test(v[k]))errors.push('Missing or malformed '+k);
 const initial=assemble(v,first),words=initial.trim().split(/\s+/).length;
 if(words<60||words>100)errors.push('Initial email must contain 60–100 words including sender footer');
 if((initial.match(/\?/g)||[]).length!==1||!v.custom_problem_question?.endsWith('?'))errors.push('Use one low-pressure question in the question section');
 const all=fields.map(k=>v[k]||'').join(' ');
 if(/losing (customers|revenue|leads)|you (miss|are missing|struggle)|your missed calls|guarantee|save \d|increase .{0,15}\d|revolution|game.chang|as (we|you) discussed|following (our|up on our)|spoke (with|to) you|our (call|conversation)|I (noticed|saw) you (struggl|miss)|I use your|loved (your|my) (visit|service)/i.test(all))errors.push('Unsupported problem, promise, or prior familiarity');
 if(/following up|circling back|reaching out again|did you (see|read) my|just checking in/i.test([v.custom_followup_1,v.custom_followup_2].join(' ')))errors.push('Followups must not imply prior sending or contact');
 if(/\bScott\s*(\n|\|)|\b\d{1,6}\s+[A-Za-z][^\n]{0,50}\b(Road|Rd|Street|St|Drive|Dr|Avenue|Ave|Boulevard|Blvd)\b/i.test([v.custom_followup_1,v.custom_followup_2].join('\n')))errors.push('Followup includes a signature or street address; sender footer must come only from the approved master');
 if(Number(result.confidence)<.7)errors.push('Overall confidence below review threshold');
 if(result.claims_supported!==true||result.solution_fits!==true)errors.push('Semantic self-check failed');
 if(!result.observation||!result.hypothesis||!result.explanation)errors.push('Observation, hypothesis and fit explanation are required');
 return {status:errors.length?'needs_revision':'approved_for_review',errors:[...new Set(errors)],word_count:words,email:initial,variables:v};
}
const str={type:'string'};
export const schema={type:'object',additionalProperties:false,required:['observation','hypothesis','service','explanation','confidence','score','findings','variables','claims_supported','solution_fits'],properties:{observation:str,hypothesis:str,service:{type:'string',enum:services},explanation:str,confidence:{type:'number',minimum:0,maximum:1},score:{type:'integer',minimum:0,maximum:100},claims_supported:{type:'boolean'},solution_fits:{type:'boolean'},findings:{type:'array',minItems:1,maxItems:3,items:{type:'object',additionalProperties:false,required:['source_url','excerpt','confidence'],properties:{source_url:str,excerpt:str,confidence:{type:'number',minimum:0,maximum:1}}}},variables:{type:'object',additionalProperties:false,required:fields,properties:Object.fromEntries(fields.map(k=>[k,str]))}}};
