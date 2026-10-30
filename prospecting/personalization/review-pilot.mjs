import fs from 'node:fs';
import {validate,fields,master,footer,csv} from './core.mjs';
const root=process.argv[2],rows=JSON.parse(fs.readFileSync(root+'/pilot-research-snapshots.json','utf8'));
const notes={
335:'Revision required: the company page links to an external appointment tool, but the adjacent form is a VIP/marketing signup. Replace the appointment-form claim with the observed scheduling link.',
356:'Opened the service-center page. Auto, home, claims and billing options are present. Need remains a hypothesis; recipient identity is not verified.',
572:'Opened the company page. Residential coverage, listed service areas and call/text/online-booking options support the observation.',
1206:'Opened the services page. Vacant-property inspections, freeze-risk checks, security checks and photo reports are explicitly listed.',
2376:'Reviewed the retrieved company-source snapshot: drone inspection, findings review and quote are explicit. Independent web re-fetch timed out; retained that limitation.',
4701:'Opened the company homepage. 24/7 emergency assistance and free same-day estimates are explicit. No claim that their existing coverage fails.',
4931:'Opened the company homepage. Repair/tire services and weekday/weekend hours are explicit. After-hours handling is asked about, not asserted.',
6161:'Opened the contact page: quote form and service areas are present. Automated exact-quote failure remains unresolved; do not export until revised.',
6236:'Opened the company page: this is a plumbing/heating/irrigation supply store, not assumed to be an on-site plumbing service. Inventory and advice claims are supported, but a joined non-continuous quote fails QA.',
7693:'Opened the leasing form. Unit type, household size, move-in date and pets fields are present. Workflow offer concerns inquiry handling only, not automated rental eligibility decisions.',
7972:'Opened the Mesa location page. Facility drop-off and mobile home/office detailing are explicit.',
8152:'Reviewed the permitted company homepage/services snapshots. Listed electrical services including EV outlets, cameras and new construction match. Independent web re-fetch was unavailable.',
8392:'Opened the contact page. Arizona coverage, appointment-only hours and free-assessment fields are explicit.',
8871:'Opened the company homepage and reviewed the retrieved contact snapshot. Residential/commercial HVAC services and public booking path are present.',
8934:'Opened the company homepage. 24-hour emergency availability, residential/commercial work and named service areas are explicit.',
9847:'Opened the fleet-services page. Coordination with fleet managers and maintenance records are explicit; the quote contains a source encoding character.',
10409:'Opened the contact page and reviewed retrieved home/about text. Family ownership, remodel services, phone and form instructions match.',
10753:'Reviewed retrieved company homepage/services snapshots. Residential/commercial work, cities, installation, renovations and HOA maintenance are explicit. Independent services re-fetch returned 406; no bypass.',
12041:'Opened the services page and reviewed homepage/service-area snapshots. Free photo/video inspections and Greater Houston/Corpus Christi coverage are explicit.',
12265:'Opened the company homepage. Automotive/body services are supported. Follow-up 2 incorrectly appends the prospect address as Scott’s sender footer; blocked by strengthened QA.',
13100:'Opened the company homepage. The listed insurance lines support the observation. No inferred personal greeting from the agency name or mailbox.',
13477:'Opened the company homepage. RV washing/detailing and Houston/San Antonio call options support the observation.',
13659:'Opened the company homepage and reviewed its contact snapshot. Service areas and field-work note are supported, but a quote mismatch and generated signature require revision.',
13705:'Reviewed the retrieved company contact/FAQ/service snapshots after fixing the repeated-wildcard robots matcher. Quotes and offer were checked against these permitted sources.',
14367:'Opened the company homepage and reviewed the current retrieved snapshot. Houston/Galveston buying/selling/renting and weekday office hours are explicit. No claim that inquiries are being lost.'
};
const validated=[];
for(const row of rows){
 if(!row.version){validated.push({...row,validation:{status:'needs_research',errors:['No source-backed draft generated'],notes:notes[row.lead_id]}});continue;}
 const v=row.version,qa=validate(v.research,row.pages||[],{name:row.name},v.first_name);
 if(row.lead_id===335){qa.errors.push('Manual source review: external appointment link was confused with adjacent marketing signup form');qa.status='needs_revision';}
 const result={...v.research,manual_validation:{checked_at:new Date().toISOString(),method:'Agent read captured permitted source text and independently opened public source pages where available; separate from owner approval',notes:notes[row.lead_id],claims_checked:true},qa_version:'idd-review-2',source_version_id:v.id};
 validated.push({...row,validation:{...qa,notes:notes[row.lead_id]},revised:{lead_id:row.lead_id,input_hash:v.input_hash+'-review-2',recipient:v.recipient,first_name:v.first_name,first_name_verified:v.first_name_verified,research:result,qa_status:qa.status,qa_errors:qa.errors,email_body:qa.email,usage:{reused_provider_usage:v.usage,source_version_id:v.id},cost_usd:0}});
}
const compact=validated.map(r=>({lead_id:r.lead_id,business_name:r.name,website:r.website,industry:r.niche,state:r.state,original_shortlist_rank:r.rank,original_lead_score:r.original_score,review_recipient:r.email,first_name:r.version?.first_name||'there',verified_first_name:r.version?.first_name_verified||false,available_contacts:r.contacts,opportunity:r.version?.research.service,opportunity_score:r.version?.research.score,confidence:r.version?.research.confidence,observed_fact:r.version?.research.observation,potential_need_hypothesis:r.version?.research.hypothesis,fit_explanation:r.version?.research.explanation,...r.version?.research.variables,email_preview:r.validation.email,qa_status:r.validation.status,qa_errors:r.validation.errors,owner_approval:'pending',export_ready:false,source_evidence:(r.version?.research.findings||[]).map(f=>({...f,excerpt:f.excerpt.split(/\s+/).slice(0,Math.floor(24/Math.max(1,r.version.research.findings.filter(x=>x.source_url===f.source_url).length))).join(' '),excerpt_note:'Short excerpt; full exact passage retained privately in the review app'})),manual_validation:r.validation.notes,settled_ai_cost_usd:Number(r.job.cost_usd),source_attempts:r.job.attempts_log.map(a=>a.sources).flat()}));
fs.writeFileSync(root+'/pilot-review.json',JSON.stringify(compact,null,2));
fs.writeFileSync(root+'/pilot-review.csv',csv(compact.map(r=>({...r,qa_errors:r.qa_errors.join('; '),source_urls:r.source_evidence.map(e=>e.source_url).join(' | ')})),['lead_id','business_name','website','industry','state','original_shortlist_rank','review_recipient','first_name','verified_first_name','opportunity','opportunity_score','confidence','observed_fact','potential_need_hypothesis',...fields,'email_preview','qa_status','qa_errors','owner_approval','export_ready','source_urls','manual_validation','settled_ai_cost_usd']));
fs.writeFileSync(root+'/validated-versions.json',JSON.stringify(validated.filter(r=>r.revised).map(r=>r.revised)));
fs.writeFileSync(root+'/Smartlead-Master-and-Mapping.txt','Subject: {{custom_subject}}\n\n'+master+'\n\nFollow-up 1:\n{{custom_followup_1}}\n\n'+footer+'\n%unsubscribe-text%\n\nFollow-up 2:\n{{custom_followup_2}}\n\n'+footer+'\n%unsubscribe-text%\n\nMap email (import-ready CSV only), first_name, company_name, website and the seven exact custom_* column names. Review CSV uses review_recipient instead of email to avoid accidental import. Custom field names are case-sensitive. Do not use a review-only file in a live campaign.');
console.log(JSON.stringify({businesses:rows.length,with_drafts:compact.filter(r=>r.email_preview).length,qa:compact.reduce((a,r)=>(a[r.qa_status]=(a[r.qa_status]||0)+1,a),{}),settled_cost:compact.reduce((s,r)=>s+r.settled_ai_cost_usd,0)}));
