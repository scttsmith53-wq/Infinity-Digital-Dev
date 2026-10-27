begin;
create table if not exists prospecting.contact_settings(
 campaign_id uuid primary key references prospecting.campaigns(id),worker_enabled boolean not null default false,
 budget_usd numeric not null default 0 check(budget_usd between 0 and 10),reserved_usd numeric not null default 0,
 daily_limit int not null default 120 check(daily_limit between 1 and 200),max_pages int not null default 6 check(max_pages between 1 and 6),
 model text not null default 'gpt-5.6-luna',search_enabled boolean not null default false,enrichment_enabled boolean not null default false,
 updated_at timestamptz not null default now()
);
insert into prospecting.contact_settings(campaign_id) values('eaad1c3e-038e-4f26-b4d9-eb3c9aa95485') on conflict do nothing;
alter table prospecting.contact_settings drop constraint if exists contact_settings_daily_limit_check;
alter table prospecting.contact_settings add constraint contact_settings_daily_limit_check check(daily_limit between 1 and 200);
alter table prospecting.contact_settings alter column daily_limit set default 120;
alter table prospecting.contact_settings add column if not exists search_attempts int not null default 0;
alter table prospecting.contact_settings add column if not exists search_limit int not null default 25;
create table if not exists prospecting.research_batches(
 id uuid primary key default gen_random_uuid(),campaign_id uuid not null references prospecting.campaigns(id),
 label text not null,selection_rule text not null,selected_ids jsonb not null default '[]',research_only boolean not null default true,
 created_by uuid references auth.users(id),created_at timestamptz not null default now()
);
create table if not exists prospecting.research_jobs(
 id uuid primary key default gen_random_uuid(),campaign_id uuid not null references prospecting.campaigns(id),
 batch_id uuid references prospecting.research_batches(id),legacy_lead_id bigint not null references public.lead_finder_leads(id),prospect_id uuid references prospecting.prospects(id),
 domain text not null,status text not null default 'queued' check(status in('queued','running','completed','manual_review','failed','blocked','budget_wait')),
 attempt_count int not null default 0,lease_token uuid,lease_until timestamptz,next_attempt_at timestamptz not null default now(),
 source_attempts jsonb not null default '[]',started_at timestamptz,completed_at timestamptz,error text,summary text,
 usage jsonb not null default '{}',cost_usd numeric not null default 0,model_reserved boolean not null default false,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(campaign_id,legacy_lead_id)
);
create index if not exists research_jobs_pending_idx on prospecting.research_jobs(campaign_id,status,next_attempt_at,created_at);
alter table prospecting.research_jobs add column if not exists allocated_usd numeric not null default 0;
create index if not exists research_jobs_batch_idx on prospecting.research_jobs(batch_id);
create unique index if not exists research_jobs_domain_lease_idx on prospecting.research_jobs(domain) where status='running';
create table if not exists prospecting.research_attempts(
 id uuid primary key default gen_random_uuid(),job_id uuid not null references prospecting.research_jobs(id),attempt_number int not null,
 status text not null default 'running',started_at timestamptz not null default now(),completed_at timestamptz,
 source_attempts jsonb not null default '[]',usage jsonb not null default '{}',cost_usd numeric not null default 0,error text,
 unique(job_id,attempt_number)
);
insert into prospecting.research_attempts(job_id,attempt_number,status,started_at,completed_at,source_attempts,usage,cost_usd,error)
select id,attempt_count,status,coalesce(started_at,created_at),completed_at,source_attempts,usage,cost_usd,error from prospecting.research_jobs where attempt_count>0 on conflict do nothing;
create table if not exists prospecting.contacts(
 id uuid primary key default gen_random_uuid(),campaign_id uuid not null references prospecting.campaigns(id),prospect_id uuid not null references prospecting.prospects(id),
 legacy_lead_id bigint not null references public.lead_finder_leads(id),research_job_id uuid references prospecting.research_jobs(id),
 full_name text not null,normalized_name text generated always as (lower(regexp_replace(full_name,'\s+',' ','g'))) stored,
 job_title text not null,company text not null,professional_email text,
 email_status text not null check(email_status in('published_company','third_party_provider','provider_deliverable','unverified','not_found')),
 deliverability_status text not null default 'not_checked' check(deliverability_status in('not_checked','deliverable','undeliverable','unknown')),
 linkedin_url text,identity_confidence numeric not null check(identity_confidence between 0 and 1),identity_status text not null,
 research_status text not null default 'needs_review' check(research_status in('needs_review','approved','rejected')),
 limitations text,last_verified_at timestamptz not null default now(),reviewed_by uuid references auth.users(id),reviewed_at timestamptz,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(legacy_lead_id,normalized_name)
);
create index if not exists contacts_campaign_status_idx on prospecting.contacts(campaign_id,research_status);
create index if not exists contacts_prospect_idx on prospecting.contacts(prospect_id);
create index if not exists contacts_job_idx on prospecting.contacts(research_job_id);
create table if not exists prospecting.contact_evidence(
 id uuid primary key default gen_random_uuid(),contact_id uuid not null references prospecting.contacts(id),research_job_id uuid not null references prospecting.research_jobs(id),
 source_type text not null,source_url text not null,excerpt text not null,excerpt_hash text generated always as(md5(excerpt)) stored,
 collected_at timestamptz not null default now(),verification_status text not null default 'company_source_supported',confidence numeric not null,
 unique(contact_id,source_url,excerpt_hash)
);
create index if not exists contact_evidence_job_idx on prospecting.contact_evidence(research_job_id);
create index if not exists research_jobs_legacy_idx on prospecting.research_jobs(legacy_lead_id);
create index if not exists research_jobs_prospect_idx on prospecting.research_jobs(prospect_id);
create index if not exists research_batches_campaign_idx on prospecting.research_batches(campaign_id,created_at desc);
create index if not exists research_batches_actor_idx on prospecting.research_batches(created_by);
create index if not exists contacts_reviewer_idx on prospecting.contacts(reviewed_by);
create table if not exists prospecting.contact_drafts(
 id uuid primary key default gen_random_uuid(),contact_id uuid not null references prospecting.contacts(id),
 subject text not null,body text not null,status text not null default 'draft' check(status in('draft','rejected')),
 created_at timestamptz not null default now(),unique(contact_id)
);
create table if not exists prospecting.enrichment_requests(
 id uuid primary key default gen_random_uuid(),contact_id uuid not null references prospecting.contacts(id),
 status text not null default 'awaiting_provider_approval',requested_by uuid references auth.users(id),created_at timestamptz not null default now(),unique(contact_id)
);
create index if not exists enrichment_requests_actor_idx on prospecting.enrichment_requests(requested_by);
create index if not exists activity_prospect_idx on prospecting.activity(prospect_id);
create index if not exists campaigns_owner_idx on prospecting.campaigns(owner_id);
create index if not exists collection_runs_source_idx on prospecting.collection_runs(source_id);
create index if not exists lead_screenings_legacy_idx on prospecting.lead_screenings(lead_id);
create index if not exists outreach_assessment_idx on prospecting.outreach(assessment_id);
create index if not exists outreach_reviewer_idx on prospecting.outreach(reviewed_by);
do $$ declare t text;begin foreach t in array array['contact_settings','research_batches','research_jobs','research_attempts','contacts','contact_evidence','contact_drafts','enrichment_requests'] loop execute format('alter table prospecting.%I enable row level security',t);execute format('revoke all on prospecting.%I from public,anon,authenticated',t);end loop;end $$;

create or replace function prospecting.contact_blocked(lid bigint) returns boolean language sql stable set search_path='' as $$
 select coalesce((select coalesce(l.do_not_contact,false) or l.dup_of is not null or coalesce(l.call_status,'') ~* 'dnc|do.?not.?contact|opt.?out|stop|wrong.?number'
 or exists(select 1 from public.lead_finder_leads x where (x.do_not_contact or coalesce(x.call_status,'') ~* 'dnc|do.?not.?contact|opt.?out|stop|wrong.?number') and prospecting.domain(x.website)<>'' and prospecting.domain(x.website)=prospecting.domain(l.website))
 or exists(select 1 from prospecting.prospects p where (p.legacy_lead_id=l.id or (prospecting.domain(p.website)<>'' and prospecting.domain(p.website)=prospecting.domain(l.website))) and (p.do_not_contact or p.stage='suppressed'))
 from public.lead_finder_leads l where l.id=lid),true);
$$;
create or replace function prospecting.contact_cost_total(cid uuid) returns numeric language sql stable set search_path='' as $$
 with calls as(select x->'usage' u,coalesce((x->>'search_calls')::numeric,0) searches from prospecting.research_attempts a join prospecting.research_jobs j on j.id=a.job_id cross join lateral jsonb_array_elements(case when a.usage?'calls' then a.usage->'calls' else jsonb_build_array(jsonb_build_object('usage',a.usage)) end)x where j.campaign_id=cid),
 tokens as(select coalesce((u->>'input_tokens')::numeric,0) input,coalesce((u->>'output_tokens')::numeric,0) output,coalesce((u->'input_tokens_details'->>'cached_tokens')::numeric,0) cached,coalesce((u->'input_tokens_details'->>'cache_write_tokens')::numeric,0) writes,searches from calls)
 select coalesce(sum((greatest(0,input-cached-writes)*(case when input>272000 then .4 else .2 end)+cached*(case when input>272000 then .04 else .02 end)+writes*(case when input>272000 then .5 else .25 end)+output*(case when input>272000 then 1.8 else 1.2 end))/1000000+searches*.01),0) from tokens;
$$;
create or replace function prospecting.contact_api(a text,d jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare cid constant uuid:='eaad1c3e-038e-4f26-b4d9-eb3c9aa95485';worker boolean:=coalesce(auth.jwt()->>'role','')='service_role';cfg prospecting.contact_settings%rowtype;
 j prospecting.research_jobs%rowtype;l public.lead_finder_leads%rowtype;c prospecting.contacts%rowtype;bid uuid;pid uuid;oid uuid;v jsonb;n int;ids jsonb;
begin
 if not worker and auth.uid() is distinct from(select owner_id from prospecting.campaigns where id=cid) then raise exception 'Owner sign-in required' using errcode='42501';end if;
 if d is null or jsonb_typeof(d)<>'object' or octet_length(d::text)>250000 then raise exception 'Invalid request';end if;
 if left(a,1)='_' and not worker then raise exception 'Worker only' using errcode='42501';end if;
 select * into cfg from prospecting.contact_settings where campaign_id=cid;
 if a='overview' then
 return jsonb_build_object('settings',to_jsonb(cfg),'metrics',jsonb_build_object(
 'awaiting',(select count(*) from prospecting.research_jobs where campaign_id=cid and status in('queued','running','budget_wait')),
 'checked',(select count(*) from prospecting.research_jobs where campaign_id=cid and completed_at is not null),
 'researched',(select count(*) from prospecting.research_jobs q where campaign_id=cid and exists(select 1 from jsonb_array_elements(q.source_attempts) s where s->>'status'='200' and s->>'kind' in('page','company_website','public_search_source'))),
 'named_contacts',(select count(*) from prospecting.contacts where campaign_id=cid and research_status<>'rejected'),
 'company_emails',(select count(*) from prospecting.contacts where campaign_id=cid and email_status='published_company' and research_status<>'rejected'),
 'deliverable',(select count(*) from prospecting.contacts where campaign_id=cid and deliverability_status='deliverable'),
 'manual_review',(select count(*) from prospecting.research_jobs where campaign_id=cid and status='manual_review'),
 'failed',(select count(*) from prospecting.research_jobs where campaign_id=cid and status='failed'),
 'cost',prospecting.contact_cost_total(cid)),
 'batches',coalesce((select jsonb_agg(x) from(select * from prospecting.research_batches where campaign_id=cid order by created_at desc limit 10)x),'[]'),
 'jobs',coalesce((select jsonb_agg(x) from(select r.*,lead.name,lead.city,lead.state,lead.niche,lead.website,lead.phone,lead.email original_email,lead.call_status,lead.last_called_at,lead.call_count,prospecting.contact_blocked(lead.id) blocked,(select count(*) from prospecting.contacts ct where ct.legacy_lead_id=lead.id and ct.research_status<>'rejected') contact_count from prospecting.research_jobs r join public.lead_finder_leads lead on lead.id=r.legacy_lead_id where r.campaign_id=cid order by r.created_at,r.legacy_lead_id limit 200)x),'[]'));
 elsif a='detail' then
 select * into j from prospecting.research_jobs where id=(d->>'id')::uuid and campaign_id=cid;if not found then raise exception 'Job not found';end if;
 return jsonb_build_object('job',to_jsonb(j),'attempt_history',coalesce((select jsonb_agg(x order by started_at desc) from prospecting.research_attempts x where job_id=j.id),'[]'),'business',(select to_jsonb(x) from(select id,name,website,phone,email,email_status,city,state,niche,call_status,call_count,last_called_at,follow_up,do_not_contact from public.lead_finder_leads where id=j.legacy_lead_id)x),'blocked',prospecting.contact_blocked(j.legacy_lead_id),
 'contacts',coalesce((select jsonb_agg(to_jsonb(ct) || jsonb_build_object('evidence',(select jsonb_agg(e order by collected_at desc) from prospecting.contact_evidence e where e.contact_id=ct.id),'draft',(select to_jsonb(o) from prospecting.contact_drafts o where o.contact_id=ct.id),'enrichment',(select to_jsonb(e) from prospecting.enrichment_requests e where e.contact_id=ct.id))) from prospecting.contacts ct where ct.legacy_lead_id=j.legacy_lead_id),'[]'));
 elsif a='enqueue' then
 perform pg_advisory_xact_lock(hashtextextended('contact-enqueue',0));n:=least(100,greatest(1,coalesce((d->>'limit')::int,10)));
 if (select count(*) from prospecting.research_jobs where campaign_id=cid and (created_at at time zone 'America/Denver')::date=(now() at time zone 'America/Denver')::date)+n>100 then raise exception 'Daily 100-business limit reached; choose a smaller batch';end if;
 insert into prospecting.research_batches(campaign_id,label,selection_rule,created_by) values(cid,case when n=100 then '100-business controlled pilot' else 'Controlled batch '||n end,'Ascending legacy ID; target niches; website; one normalized domain; exclude duplicates, suppression, prior jobs and verified named contacts. No outreach.',auth.uid()) returning id into bid;
 for l in select * from (select distinct on(prospecting.domain(z.website)) z.* from public.lead_finder_leads z where z.niche in('hvac','plumbing','electrical','roofing','dental','medical') and z.website ~* '^https?://' and z.dup_of is null and not coalesce(z.do_not_contact,false)
 and not exists(select 1 from prospecting.research_jobs where campaign_id=cid and (legacy_lead_id=z.id or domain=prospecting.domain(z.website)))
 and not exists(select 1 from prospecting.contacts where legacy_lead_id=z.id and identity_confidence>=0.8 and research_status<>'rejected')
 and coalesce(z.call_status,'') !~* 'dnc|do.?not.?contact|opt.?out|stop|wrong.?number' order by prospecting.domain(z.website),z.id) selected order by id limit n*3 loop
 if(select count(*) from prospecting.research_jobs where batch_id=bid)>=n then exit;end if;
 if prospecting.contact_blocked(l.id) then continue;end if;
 insert into prospecting.research_jobs(campaign_id,batch_id,legacy_lead_id,domain) values(cid,bid,l.id,prospecting.domain(l.website)) on conflict do nothing;
 end loop;
 select jsonb_agg(legacy_lead_id order by legacy_lead_id) into ids from prospecting.research_jobs where batch_id=bid;
 update prospecting.research_batches set selected_ids=coalesce(ids,'[]') where id=bid;return jsonb_build_object('batch_id',bid,'queued',coalesce(jsonb_array_length(ids),0));
 elsif a='retry' then
 select * into j from prospecting.research_jobs where id=(d->>'id')::uuid and campaign_id=cid for update;
 if not found or prospecting.contact_blocked(j.legacy_lead_id) then raise exception 'Job missing or do-not-contact';end if;
 if j.status in('queued','running') then return '{"status":"already_pending"}';end if;
 if j.attempt_count>=3 then raise exception 'Three-attempt limit reached; inspect the source error before expanding';end if;
 update prospecting.research_jobs set status='queued',next_attempt_at=now(),completed_at=null,error=null,updated_at=now() where id=j.id;return '{"status":"queued"}';
 elsif a='worker_setting' then
 update prospecting.contact_settings set worker_enabled=(d->>'enabled')::boolean,updated_at=now() where campaign_id=cid;return '{"status":"saved"}';
 elsif a in('contact_review','enrich','draft','verify_contact') then
 select * into c from prospecting.contacts where id=(d->>'id')::uuid and campaign_id=cid for update;
 if not found or prospecting.contact_blocked(c.legacy_lead_id) then raise exception 'Contact missing or do-not-contact';end if;
 if a='verify_contact' then
 if d->>'verified' is distinct from 'true' or d->>'source_url' !~ '^https://' or length(coalesce(d->>'excerpt','')) not between 15 and 3000 or position(lower(c.full_name) in lower(d->>'excerpt'))=0 or position(lower(c.job_title) in lower(d->>'excerpt'))=0 then raise exception 'Open a public source and provide an exact passage identifying this person and role';end if;
 insert into prospecting.contact_evidence(contact_id,research_job_id,source_type,source_url,excerpt,confidence,verification_status) values(c.id,c.research_job_id,'manual_professional_source',d->>'source_url',d->>'excerpt',0.9,'human_verified') on conflict(contact_id,source_url,excerpt_hash) do update set verification_status='human_verified',collected_at=now();
 update prospecting.contacts set identity_status='human_verified',identity_confidence=0.9,last_verified_at=now(),research_status='needs_review',reviewed_by=auth.uid(),reviewed_at=now() where id=c.id;
 elsif a='contact_review' then
 if d->>'status' not in('approved','rejected','needs_review') then raise exception 'Invalid review';end if;
 if d->>'status'='approved' and(c.identity_confidence<0.8 or c.identity_status not in('company_source_supported','human_verified') or c.last_verified_at<now()-interval '30 days') then raise exception 'Verify current company identity before approving this candidate';end if;
 update prospecting.contacts set research_status=d->>'status',reviewed_by=auth.uid(),reviewed_at=now(),updated_at=now() where id=c.id;
 if d->>'status'<>'approved' then update prospecting.contact_drafts set status='rejected' where contact_id=c.id;end if;
 elsif a='enrich' then
 insert into prospecting.enrichment_requests(contact_id,requested_by) values(c.id,auth.uid()) on conflict do nothing;
 else
 if c.research_status<>'approved' or c.last_verified_at<now()-interval '30 days' then raise exception 'Approve a current contact before preparing a draft';end if;
 insert into prospecting.contact_drafts(contact_id,subject,body) values(c.id,'Question about call coverage at '||c.company,'Hi '||split_part(c.full_name,' ',1)||', is improving incoming-call coverage or appointment scheduling relevant for '||c.company||' right now? If so, would a brief overview of our AI phone-agent service be useful?') on conflict(contact_id) do update set status='draft' returning id into oid;
 end if;
 insert into prospecting.activity(prospect_id,event_type,details) values(c.prospect_id,'contact_'||a,jsonb_build_object('contact_id',c.id,'actor',auth.uid(),'status',d->>'status'));
 return jsonb_build_object('status','saved','sent',false,'draft_id',oid);
 elsif a='_claim' then
 perform pg_advisory_xact_lock(hashtextextended('contact-claim',0));
 update prospecting.research_attempts set status='interrupted',completed_at=now(),error='Worker lease expired' where status='running' and job_id in(select id from prospecting.research_jobs where status='running' and lease_until<now());
 update prospecting.research_jobs set status=case when attempt_count<3 then 'queued' else 'failed' end,error='Worker lease expired; safely recovered',lease_token=null,lease_until=null,next_attempt_at=now(),updated_at=now() where campaign_id=cid and status='running' and lease_until<now();
 if not cfg.worker_enabled then return '{"claimed":false,"reason":"paused"}';end if;
 if(select count(*) from prospecting.research_attempts where (started_at at time zone 'America/Denver')::date=(now() at time zone 'America/Denver')::date)>=cfg.daily_limit then return '{"claimed":false,"reason":"daily_limit"}';end if;
 if(select count(*) from prospecting.research_jobs where campaign_id=cid and status='running')>=6 then return '{"claimed":false,"reason":"concurrency_limit"}';end if;
 select * into j from prospecting.research_jobs r where r.campaign_id=cid and r.status='queued' and r.next_attempt_at<=now() and r.attempt_count<3 and (d->>'id' is null or r.id=(d->>'id')::uuid) and not exists(select 1 from prospecting.research_jobs other where other.domain=r.domain and other.status='running') order by r.legacy_lead_id limit 1 for update skip locked;
 if not found then return '{"claimed":false,"reason":"empty"}';end if;
 if prospecting.contact_blocked(j.legacy_lead_id) then update prospecting.research_jobs set status='blocked',completed_at=now(),error='Suppression or duplicate restriction' where id=j.id;return '{"claimed":false,"reason":"blocked"}';end if;
 select * into l from public.lead_finder_leads where id=j.legacy_lead_id;
 pid:=prospecting.save_company(jsonb_build_object('campaign_id',cid,'company_name',l.name,'website',l.website,'industry',l.niche,'city',l.city,'state',l.state,'source','contact_research','source_url',l.website,'identity_key','legacy:'||l.id));
 update prospecting.research_jobs set status='running',attempt_count=attempt_count+1,allocated_usd=0,lease_token=gen_random_uuid(),lease_until=now()+interval '4 minutes',started_at=now(),prospect_id=pid,updated_at=now() where id=j.id returning * into j;
 insert into prospecting.research_attempts(job_id,attempt_number) values(j.id,j.attempt_count);
 return jsonb_build_object('claimed',true,'job',to_jsonb(j),'settings',to_jsonb(cfg),'business',jsonb_build_object('id',l.id,'name',l.name,'website',l.website,'city',l.city,'state',l.state,'industry',l.niche));
 elsif a in('_reserve','_search_reserve') then
 perform pg_advisory_xact_lock(hashtextextended('contact-budget',0));select * into cfg from prospecting.contact_settings where campaign_id=cid for update;
 select * into j from prospecting.research_jobs where id=(d->>'id')::uuid and lease_token=(d->>'lease_token')::uuid and status='running' and lease_until>now() for update;
 if not found or prospecting.contact_blocked(j.legacy_lead_id) then raise exception 'Lease missing or suppressed';end if;
 if a='_search_reserve' and(not cfg.search_enabled or cfg.search_attempts>=cfg.search_limit) then return '{"allowed":false,"reason":"search_limit_or_disabled"}';end if;
 if cfg.reserved_usd+(case when a='_search_reserve' then 0.5 else 0.02 end)>cfg.budget_usd then return '{"allowed":false,"reason":"budget_requires_approval"}';end if;
 update prospecting.contact_settings set reserved_usd=reserved_usd+case when a='_search_reserve' then 0.5 else 0.02 end,search_attempts=search_attempts+case when a='_search_reserve' then 1 else 0 end where campaign_id=cid;
 update prospecting.research_jobs set model_reserved=true,allocated_usd=allocated_usd+case when a='_search_reserve' then 0.5 else 0.02 end where id=j.id;return jsonb_build_object('allowed',true,'model',cfg.model);
 elsif a='_finish' then
 perform pg_advisory_xact_lock(hashtextextended('contact-budget',0));
 select * into j from prospecting.research_jobs where id=(d->>'id')::uuid and lease_token=(d->>'lease_token')::uuid and status='running' and lease_until>now() for update;
 if not found then raise exception 'Lease expired; stale worker cannot save';end if;
 if prospecting.contact_blocked(j.legacy_lead_id) then d:=d||'{"status":"blocked","contacts":[]}';end if;
 if d->>'status' not in('completed','manual_review','failed','blocked','budget_wait') then raise exception 'Invalid completion status';end if;
 for v in select * from jsonb_array_elements(coalesce(d->'contacts','[]')) loop
 if coalesce(v->>'full_name','')='' or coalesce(v->>'evidence','')='' or v->>'source_url' !~ '^https?://' then raise exception 'Contact evidence required';end if;
 insert into prospecting.contacts(campaign_id,prospect_id,legacy_lead_id,research_job_id,full_name,job_title,company,professional_email,email_status,deliverability_status,linkedin_url,identity_confidence,identity_status,limitations)
 values(cid,j.prospect_id,j.legacy_lead_id,j.id,v->>'full_name',v->>'job_title',v->>'company',v->>'professional_email',v->>'email_status','not_checked',v->>'linkedin_url',(v->>'identity_confidence')::numeric,v->>'identity_status',v->>'limitations')
 on conflict(legacy_lead_id,normalized_name) do update set research_job_id=j.id,job_title=excluded.job_title,professional_email=coalesce(excluded.professional_email,prospecting.contacts.professional_email),email_status=case when excluded.professional_email is not null then excluded.email_status else prospecting.contacts.email_status end,linkedin_url=coalesce(excluded.linkedin_url,prospecting.contacts.linkedin_url),identity_confidence=excluded.identity_confidence,identity_status=excluded.identity_status,limitations=excluded.limitations,last_verified_at=now(),research_status=case when prospecting.contacts.research_status='rejected' then 'rejected' else 'needs_review' end,updated_at=now() returning * into c;
 insert into prospecting.contact_evidence(contact_id,research_job_id,source_type,source_url,excerpt,confidence,verification_status) values(c.id,j.id,v->>'source_type',v->>'source_url',v->>'evidence',(v->>'identity_confidence')::numeric,v->>'identity_status') on conflict(contact_id,source_url,excerpt_hash) do update set collected_at=now(),verification_status=excluded.verification_status;
 if v->>'email_evidence' is not null then insert into prospecting.contact_evidence(contact_id,research_job_id,source_type,source_url,excerpt,confidence,verification_status) values(c.id,j.id,case when v->>'source_type'='company_website' then 'company_email' else 'third_party_professional_email' end,v->>'source_url',v->>'email_evidence',(v->>'identity_confidence')::numeric,v->>'identity_status') on conflict do nothing;end if;
 end loop;
 if coalesce((d->>'settle')::boolean,false) and j.allocated_usd>0 then
 perform pg_advisory_xact_lock(hashtextextended('contact-budget',0));
 update prospecting.contact_settings set reserved_usd=greatest(0,reserved_usd-j.allocated_usd+coalesce((d->>'cost_usd')::numeric,0)) where campaign_id=cid;
 end if;
 update prospecting.research_jobs set status=d->>'status',source_attempts=coalesce(d->'source_attempts','[]'),completed_at=now(),error=left(d->>'error',1000),summary=left(d->>'summary',2000),usage=coalesce(d->'usage','{}'),cost_usd=cost_usd+coalesce((d->>'cost_usd')::numeric,0),lease_token=null,lease_until=null,updated_at=now() where id=j.id;
 update prospecting.research_attempts set status=d->>'status',source_attempts=coalesce(d->'source_attempts','[]'),completed_at=now(),error=left(d->>'error',1000),usage=coalesce(d->'usage','{}'),cost_usd=coalesce((d->>'cost_usd')::numeric,0) where job_id=j.id and attempt_number=j.attempt_count;
 insert into prospecting.activity(prospect_id,event_type,details) values(j.prospect_id,'contact_research_completed',jsonb_build_object('job_id',j.id,'status',d->>'status','contacts',jsonb_array_length(coalesce(d->'contacts','[]'))));
 return jsonb_build_object('status',d->>'status','contacts',jsonb_array_length(coalesce(d->'contacts','[]')));
 else raise exception 'Unsupported contact action';end if;
end;$$;
create or replace function public.prospecting_contacts(a text,d jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select prospecting.contact_api(a,d);$$;
revoke all on function prospecting.contact_blocked(bigint),prospecting.contact_cost_total(uuid),prospecting.contact_api(text,jsonb),public.prospecting_contacts(text,jsonb) from public,anon,authenticated;
grant execute on function prospecting.contact_api(text,jsonb),public.prospecting_contacts(text,jsonb) to authenticated,service_role;
commit;
