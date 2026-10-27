begin;
alter table prospecting.campaigns add column if not exists owner_id uuid references auth.users(id) default '78dfc218-78cd-43c7-9cc9-47885a5b2f82';
alter table prospecting.prospects add column if not exists notes text;
alter table prospecting.prospects add column if not exists linkedin_url text;
alter table prospecting.signals add column if not exists source_key text;
alter table prospecting.signals add column if not exists posted_at timestamptz;
alter table prospecting.signals add column if not exists metadata jsonb not null default '{}';
create unique index if not exists signals_source_key_idx on prospecting.signals(source_key) where source_key is not null;
alter table prospecting.assessments add column if not exists need_score int check(need_score between 0 and 100);
alter table prospecting.assessments add column if not exists confidence numeric check(confidence between 0 and 1);
alter table prospecting.assessments add column if not exists evidence jsonb not null default '[]';
alter table prospecting.assessments add column if not exists next_action text;
alter table prospecting.assessments add column if not exists review_required boolean not null default true;
alter table prospecting.assessments add column if not exists input_hash text;
alter table prospecting.assessments add column if not exists usage jsonb not null default '{}';
alter table prospecting.assessments add column if not exists cost_usd numeric not null default 0;
create unique index if not exists assessments_input_hash_idx on prospecting.assessments(prospect_id,input_hash) where input_hash is not null;
alter table prospecting.outreach add column if not exists kind text default 'intro_email';
alter table prospecting.outreach add column if not exists assessment_id uuid references prospecting.assessments(id);
alter table prospecting.outreach add column if not exists evidence jsonb not null default '[]';
alter table prospecting.outreach add column if not exists reviewed_by uuid references auth.users(id);
create unique index if not exists outreach_assessment_kind_idx on prospecting.outreach(prospect_id,assessment_id,kind) where assessment_id is not null;

create table if not exists prospecting.engine_settings(
 campaign_id uuid primary key references prospecting.campaigns(id),
 weights jsonb not null default '{"fit":40,"need":35,"intent":25}',
 locations text[] not null default array['Denver','Aurora','Lakewood','Thornton','Boulder','Fort Collins','Colorado Springs','Colorado','CO'],
 industries text[] not null default array['hvac','plumbing','electrical','dental','medical','roofing','property management'],
 keywords text[] not null default array['receptionist','front desk','front office','dispatch','scheduler','customer service','administrative coordinator','patient care coordinator'],
 automation_enabled boolean not null default false,
 auto_ai boolean not null default false,
 ai_budget_usd numeric not null default 0 check(ai_budget_usd between 0 and 10),
 ai_reserved_usd numeric not null default 0,
 last_daily_date date,
 model text not null default 'gpt-5.6-luna',
 updated_at timestamptz not null default now(),
 last_dispatch_id bigint,last_dispatch_at timestamptz,dispatch_attempts int not null default 0,collection_verified_at timestamptz
);
alter table prospecting.engine_settings add column if not exists last_dispatch_id bigint;
alter table prospecting.engine_settings add column if not exists last_dispatch_at timestamptz;
alter table prospecting.engine_settings add column if not exists dispatch_attempts int not null default 0;
alter table prospecting.engine_settings add column if not exists collection_verified_at timestamptz;
create table if not exists prospecting.sources(
 id uuid primary key default gen_random_uuid(),campaign_id uuid not null references prospecting.campaigns(id),
 kind text not null check(kind in ('greenhouse')),token text not null check(token ~ '^[a-zA-Z0-9_-]{1,80}$'),
 company_name text not null,website text not null,industry text not null,city text,state text,
 enabled boolean not null default false,compliance_approved boolean not null default false,
 compliance_url text not null default 'https://docs.greenhouse.io/job-board',
 compliance_note text not null default 'Documented public GET job-board endpoint; no applicant data, applications or LinkedIn collection.',
 approved_at timestamptz,last_success_at timestamptz,last_attempt_at timestamptz,next_attempt_at timestamptz,
 failures int not null default 0,last_error text,
 unique(campaign_id,kind,token)
);
create table if not exists prospecting.collection_runs(
 id uuid primary key default gen_random_uuid(),campaign_id uuid not null references prospecting.campaigns(id),
 source_id uuid references prospecting.sources(id),status text not null check(status in ('running','succeeded','failed','skipped')),
 started_at timestamptz not null default now(),finished_at timestamptz,items_seen int not null default 0,
 signals_found int not null default 0,error text,attempts int not null default 0
);
create index if not exists runs_campaign_time_idx on prospecting.collection_runs(campaign_id,started_at desc);
create table if not exists prospecting.source_documents(
 id uuid primary key default gen_random_uuid(),source_id uuid not null references prospecting.sources(id),
 external_id text not null,title text not null,url text not null,location text,excerpt text not null,
 posted_at timestamptz,updated_at_source timestamptz,discovered_at timestamptz not null default now(),
 last_seen_at timestamptz not null default now(),content_hash text not null,status text not null default 'current',
 unique(source_id,external_id)
);
create table if not exists prospecting.lead_screenings(
 campaign_id uuid not null references prospecting.campaigns(id),lead_id bigint not null references public.lead_finder_leads(id),
 outcome text not null,details text not null,screened_at timestamptz not null default now(),
 primary key(campaign_id,lead_id)
);
alter table prospecting.engine_settings enable row level security;
alter table prospecting.sources enable row level security;
alter table prospecting.collection_runs enable row level security;
alter table prospecting.source_documents enable row level security;
alter table prospecting.lead_screenings enable row level security;
insert into prospecting.engine_settings(campaign_id) values('eaad1c3e-038e-4f26-b4d9-eb3c9aa95485') on conflict do nothing;

create or replace function prospecting.domain(v text) returns text language sql immutable set search_path='' as $$
select lower(regexp_replace(split_part(split_part(regexp_replace(coalesce(v,''),'^http://','https://','i'),'://',2),'/',1),'^www\.',''));
$$;
create or replace function prospecting.norm(v text) returns text language sql immutable set search_path='' as $$select regexp_replace(lower(coalesce(v,'')),'[^a-z0-9]','','g');$$;
create or replace function prospecting.blocked(pid uuid) returns boolean language sql stable set search_path='' as $$
select coalesce((select p.do_not_contact or p.stage='suppressed' or coalesce(l.do_not_contact,false)
 or coalesce(l.call_status,'') ~* 'dnc|do.?not.?contact|opt.?out|stop|wrong.?number'
 or exists(select 1 from public.lead_finder_leads z where (z.do_not_contact or coalesce(z.call_status,'') ~* 'dnc|do.?not.?contact|opt.?out|stop|wrong.?number') and
  ((prospecting.domain(p.website)<>'' and prospecting.domain(z.website)=prospecting.domain(p.website)) or (prospecting.norm(z.name)=prospecting.norm(p.company_name) and lower(coalesce(z.city,''))=lower(coalesce(p.city,'')))))
 or exists(select 1 from prospecting.prospects q where q.do_not_contact and
  (q.legacy_lead_id=p.legacy_lead_id or (prospecting.domain(q.website)<>'' and prospecting.domain(q.website)=prospecting.domain(p.website))))
 from prospecting.prospects p left join public.lead_finder_leads l on l.id=p.legacy_lead_id where p.id=pid),true);
$$;

create or replace function prospecting.assessment_current(pid uuid) returns boolean language sql stable set search_path='' as $$
 select coalesce((select jsonb_array_length(a.evidence)>0 and not exists(
  select 1 from jsonb_array_elements(a.evidence) ev left join prospecting.signals s on s.id::text=ev->>'signal_id' and s.prospect_id=pid
  where s.id is null or coalesce(s.metadata->>'status','manual') in ('closed','irrelevant') or s.observed_at<now()-interval '30 days' or position(ev->>'quote' in s.source_excerpt)=0
 ) from prospecting.assessments a where a.prospect_id=pid order by a.created_at desc limit 1),false);
$$;
create or replace function prospecting.save_company(d jsonb) returns uuid language plpgsql set search_path='' as $$
declare p prospecting.prospects%rowtype;l public.lead_finder_leads%rowtype;hits bigint[];cid uuid:=(d->>'campaign_id')::uuid;dom text:=prospecting.domain(d->>'website');
begin
 if nullif(btrim(d->>'company_name'),'') is null then raise exception 'Company name required'; end if;
 perform pg_advisory_xact_lock(hashtextextended('prospecting-intake:'||cid::text,0));
 select array_agg(id order by id) into hits from public.lead_finder_leads where dup_of is null and
 ((dom<>'' and prospecting.domain(website)=dom) or (prospecting.norm(name)=prospecting.norm(d->>'company_name') and lower(coalesce(city,''))=lower(coalesce(d->>'city',''))));
 if cardinality(hits)=1 then select * into l from public.lead_finder_leads where id=hits[1]; end if;
 select * into p from prospecting.prospects where campaign_id=cid and
 ((l.id is not null and legacy_lead_id=l.id) or identity_key=d->>'identity_key' or
  (dom<>'' and prospecting.domain(website)=dom) or (prospecting.norm(company_name)=prospecting.norm(d->>'company_name') and lower(coalesce(city,''))=lower(coalesce(d->>'city','')))) order by created_at limit 1 for update;
 if p.id is not null then
  if p.legacy_lead_id is null and l.id is not null and not exists(select 1 from prospecting.prospects where legacy_lead_id=l.id) then update prospecting.prospects set legacy_lead_id=l.id where id=p.id; end if;
  return p.id;
 end if;
 if l.id is not null and exists(select 1 from prospecting.prospects where legacy_lead_id=l.id) then raise exception 'Existing legacy lead is in another campaign; review before linking'; end if;
 insert into prospecting.prospects(campaign_id,legacy_lead_id,identity_key,company_name,website,industry,city,state,contact_email,source,source_url,linkedin_url,notes,do_not_contact,stage)
 values(cid,l.id,d->>'identity_key',coalesce(l.name,d->>'company_name'),coalesce(l.website,nullif(d->>'website','')),coalesce(l.niche,d->>'industry'),coalesce(l.city,d->>'city'),coalesce(l.state,d->>'state'),l.email,d->>'source',d->>'source_url',d->>'linkedin_url',d->>'notes',coalesce(l.do_not_contact,false),case when coalesce(l.do_not_contact,false) then 'suppressed' else 'new' end) returning * into p;
 insert into prospecting.activity(prospect_id,event_type,details) values(p.id,'engine_intake',jsonb_build_object('legacy_lead_id',l.id,'ambiguous_legacy_matches',coalesce(cardinality(hits),0)>1));
 return p.id;
end;$$;

create or replace function prospecting.engine_api(a text,d jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare cid constant uuid:='eaad1c3e-038e-4f26-b4d9-eb3c9aa95485'; worker boolean:=coalesce(auth.jwt()->>'role','')='service_role';
 cfg prospecting.engine_settings%rowtype; src prospecting.sources%rowtype; p prospecting.prospects%rowtype; ass prospecting.assessments%rowtype;
 pid uuid; rid uuid; lid bigint; docid uuid; result jsonb;score int;old_count int;url text;draft jsonb;rowid uuid;claimed boolean;
begin
 if not worker and auth.uid() is distinct from (select owner_id from prospecting.campaigns where id=cid) then raise exception 'Owner sign-in required' using errcode='42501'; end if;
 if d is null or jsonb_typeof(d)<>'object' or octet_length(d::text)>2000000 then raise exception 'Invalid request';end if;
 if left(a,1)='_' and not worker then raise exception 'Worker-only operation' using errcode='42501';end if;
 select * into cfg from prospecting.engine_settings where campaign_id=cid;
 if a='overview' then
  return jsonb_build_object('settings',to_jsonb(cfg),'scheduler',(select jsonb_build_object('http_status',status_code,'timed_out',timed_out,'error',error_msg) from net._http_response where id=cfg.last_dispatch_id),'campaign',(select to_jsonb(c) from prospecting.campaigns c where id=cid),
   'counts',(select jsonb_build_object('businesses',count(*),'qualified',count(*) filter(where stage='qualified'),'review',count(*) filter(where stage in ('new','research','review')),'high_priority',count(*) filter(where (select priority_score from prospecting.assessments where prospect_id=q.id order by created_at desc limit 1)>=70),'replies',count(*) filter(where stage='replied'),'meetings',count(*) filter(where stage='meeting'),'customers',count(*) filter(where stage='won')) from prospecting.prospects q where campaign_id=cid),
   'drafts',(select count(*) from prospecting.outreach o join prospecting.prospects q on q.id=o.prospect_id where q.campaign_id=cid and o.status='draft' and prospecting.assessment_current(q.id)),
   'screened',(select count(*) from prospecting.lead_screenings where campaign_id=cid),
   'sources',coalesce((select jsonb_agg(to_jsonb(s) order by company_name) from prospecting.sources s where campaign_id=cid),'[]'),
   'runs',coalesce((select jsonb_agg(to_jsonb(r) order by started_at desc) from (select * from prospecting.collection_runs where campaign_id=cid order by started_at desc limit 30)r),'[]'),
   'prospects',coalesce((select jsonb_agg(to_jsonb(r) order by created_at desc) from (select q.*,l.phone,l.call_status,l.last_called_at,l.call_count,l.follow_up,prospecting.blocked(q.id) blocked,prospecting.assessment_current(q.id) assessment_current,
    (select to_jsonb(x) from prospecting.assessments x where prospect_id=q.id order by created_at desc limit 1) assessment,
    (select title from prospecting.source_documents sd join prospecting.signals s on s.source_key=sd.source_id::text||':'||sd.external_id where s.prospect_id=q.id and coalesce(s.metadata->>'status','manual') not in ('closed','irrelevant') order by sd.last_seen_at desc limit 1) buying_signal
    from prospecting.prospects q left join public.lead_finder_leads l on l.id=q.legacy_lead_id where campaign_id=cid order by q.created_at desc limit 500)r),'[]'));
 elsif a in ('detail','_context') then
  select * into p from prospecting.prospects where id=(d->>'id')::uuid and campaign_id=cid;
  if not found then raise exception 'Prospect not found';end if;
  return jsonb_build_object('prospect',to_jsonb(p),'blocked',prospecting.blocked(p.id),'assessment_current',prospecting.assessment_current(p.id),
   'legacy',(select jsonb_build_object('id',l.id,'phone',l.phone,'email',l.email,'do_not_contact',l.do_not_contact,'call_status',l.call_status,'notes',case when a='detail' then l.notes else null end,'call_count',l.call_count,'last_called_at',l.last_called_at,'follow_up',l.follow_up) from public.lead_finder_leads l where l.id=p.legacy_lead_id),
   'signals',coalesce((select jsonb_agg(to_jsonb(s) order by created_at desc) from prospecting.signals s where prospect_id=p.id),'[]'),
   'assessments',coalesce((select jsonb_agg(to_jsonb(x) order by created_at desc) from prospecting.assessments x where prospect_id=p.id),'[]'),
   'outreach',coalesce((select jsonb_agg(to_jsonb(o) order by created_at desc) from prospecting.outreach o where prospect_id=p.id),'[]'),
   'activity',coalesce((select jsonb_agg(to_jsonb(x) order by created_at desc) from prospecting.activity x where prospect_id=p.id),'[]'));
 elsif a='manual' then
  url:=btrim(d->>'linkedin_url');
  if url !~* '^https://((www|[a-z]{2,3})\.)?linkedin\.com/(in|company|posts|feed/update)/[a-z0-9_:.%-]+/?([?#].*)?$' then raise exception 'Use a LinkedIn profile, company, or post HTTPS URL';end if;
  if d->>'manual_confirmed' is distinct from 'true' then raise exception 'Confirm manual business-data collection';end if;
  pid:=prospecting.save_company(d||jsonb_build_object('campaign_id',cid,'source','linkedin_manual','source_url',url,'linkedin_url',url,'identity_key','linkedin:'||lower(regexp_replace(url,'[?#].*$',''))));
  return jsonb_build_object('id',pid,'status','saved_or_matched');
 elsif a='source_save' then
  if d->>'token' !~ '^[a-zA-Z0-9_-]{1,80}$' or nullif(d->>'company_name','') is null or d->>'website' !~ '^https://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/?$' then raise exception 'Valid board token, company and HTTPS website required';end if;
  if d->>'compliance_approved' is distinct from 'true' then raise exception 'Review public API source compliance first';end if;
  insert into prospecting.sources(campaign_id,kind,token,company_name,website,industry,city,state,enabled,compliance_approved,approved_at)
   values(cid,'greenhouse',d->>'token',d->>'company_name',d->>'website',d->>'industry',d->>'city',d->>'state',true,true,now())
   on conflict(campaign_id,kind,token) do update set company_name=excluded.company_name,website=excluded.website,industry=excluded.industry,city=excluded.city,state=excluded.state,enabled=true,compliance_approved=true,approved_at=now();
  return '{"status":"saved"}';
 elsif a='source_toggle' then
  update prospecting.sources set enabled=(d->>'enabled')::boolean where id=(d->>'id')::uuid and campaign_id=cid and compliance_approved;
  return '{"status":"saved"}';
 elsif a='automation' then
  if (d->>'enabled')::boolean and cfg.collection_verified_at is null then raise exception 'Collection tests must pass before enabling unattended runs';end if;
  update prospecting.engine_settings set automation_enabled=(d->>'enabled')::boolean,updated_at=now() where campaign_id=cid;return '{"status":"saved"}';
 elsif a='settings' then
  if (d->'weights'->>'fit')::int+(d->'weights'->>'need')::int+(d->'weights'->>'intent')::int<>100 or (d->'weights'->>'fit')::int not between 0 and 100 or (d->'weights'->>'need')::int not between 0 and 100 or (d->'weights'->>'intent')::int not between 0 and 100 then raise exception 'Weights must total 100';end if;
  if jsonb_array_length(d->'locations')<1 or jsonb_array_length(d->'industries')<1 or jsonb_array_length(d->'keywords')<1 then raise exception 'Targeting lists cannot be empty';end if;
  update prospecting.engine_settings set weights=d->'weights',locations=array(select jsonb_array_elements_text(d->'locations')),industries=array(select jsonb_array_elements_text(d->'industries')),keywords=array(select jsonb_array_elements_text(d->'keywords')),updated_at=now() where campaign_id=cid;
  return '{"status":"saved"}';
 elsif a='evidence' then
  select * into p from prospecting.prospects where id=(d->>'id')::uuid and campaign_id=cid for update;
  if not found or prospecting.blocked(p.id) then raise exception 'Prospect missing or do-not-contact';end if;
  if d->>'verified' is distinct from 'true' or length(coalesce(d->>'excerpt',''))<15 or length(d->>'excerpt')>4000 or d->>'source_url' !~ '^https://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(/[^[:space:]]*)?$' then raise exception 'Verified public HTTPS evidence required';end if;
  if d->>'signal_type' not in ('manual_operational','buying_intent_verified') then raise exception 'Choose a valid evidence type';end if;
  if nullif(d->>'posted_at','')::date>current_date then raise exception 'Source date cannot be in the future';end if;
  insert into prospecting.signals(prospect_id,signal_type,source_url,source_excerpt,observed_at,posted_at,confidence,metadata) values(p.id,d->>'signal_type',d->>'source_url',d->>'excerpt',now(),nullif(d->>'posted_at','')::timestamptz,case when nullif(d->>'posted_at','') is null then .5 else .8 end,jsonb_build_object('manual_verified',true,'actor',auth.uid(),'status','current'));
  insert into prospecting.activity(prospect_id,event_type,details) values(p.id,'manual_evidence_verified',jsonb_build_object('actor',auth.uid()));
  return '{"status":"saved"}';
 elsif a='note' then
  update prospecting.prospects set notes=left(d->>'notes',5000),updated_at=now() where id=(d->>'id')::uuid and campaign_id=cid returning id into pid;
  if pid is null then raise exception 'Prospect not found';end if;
  insert into prospecting.activity(prospect_id,event_type,details) values(pid,'note_updated',jsonb_build_object('actor',auth.uid()));return '{"status":"saved"}';
 elsif a='decision' then
  select * into p from prospecting.prospects where id=(d->>'id')::uuid and campaign_id=cid for update;
  if not found then raise exception 'Prospect not found';end if;
  if d->>'stage' not in ('review','qualified','suppressed') then raise exception 'Invalid review decision';end if;
  if d->>'stage'<>'suppressed' and prospecting.blocked(p.id) then raise exception 'Do-not-contact restriction blocks this action';end if;
  if d->>'stage'='qualified' and (not prospecting.assessment_current(p.id) or not exists(select 1 from prospecting.assessments where id=(select id from prospecting.assessments where prospect_id=p.id order by created_at desc limit 1) and need_score>=40 and confidence>=0.6)) then raise exception 'Qualification requires a current supported assessment and confidence';end if;
  update prospecting.prospects set stage=d->>'stage',do_not_contact=do_not_contact or d->>'stage'='suppressed',updated_at=now() where id=p.id;
  if d->>'stage'='suppressed' then update prospecting.outreach set status='cancelled',approved_at=null where prospect_id=p.id and status in ('draft','approved');end if;
  insert into prospecting.activity(prospect_id,event_type,details) values(p.id,'human_decision',jsonb_build_object('stage',d->>'stage','actor',auth.uid(),'reason',left(d->>'reason',1000)));return '{"status":"saved"}';
 elsif a='draft_review' then
  select p2.* into p from prospecting.prospects p2 join prospecting.outreach o on o.prospect_id=p2.id where o.id=(d->>'id')::uuid and p2.campaign_id=cid for update of p2;
  if not found or prospecting.blocked(p.id) then raise exception 'Do-not-contact restriction blocks drafting or approval';end if;
  if d->>'status' not in ('approved','cancelled','draft') then raise exception 'Invalid draft status; sending is not supported';end if;
  if d->>'status'='approved' and not prospecting.assessment_current(p.id) then raise exception 'Evidence expired or changed; verify and reassess before approval';end if;
  if d->>'status'='approved' and (select assessment_id from prospecting.outreach where id=(d->>'id')::uuid) is distinct from (select id from prospecting.assessments where prospect_id=p.id order by created_at desc limit 1) then raise exception 'This draft was superseded; review the latest assessment';end if;
  update prospecting.outreach set status=d->>'status',approved_at=case when d->>'status'='approved' then now() else null end,reviewed_by=auth.uid() where id=(d->>'id')::uuid and status<>'sent';
  insert into prospecting.activity(prospect_id,event_type,details) values(p.id,'draft_reviewed',jsonb_build_object('actor',auth.uid(),'outreach_id',d->>'id','status',d->>'status'));return '{"status":"saved","sent":false}';
 elsif a='_bootstrap' then
  return jsonb_build_object('settings',to_jsonb(cfg),'sources',coalesce((select jsonb_agg(to_jsonb(s)) from prospecting.sources s where campaign_id=cid and enabled and compliance_approved),'[]'));
 elsif a='_claim_source' then
  select * into src from prospecting.sources where id=(d->>'id')::uuid and campaign_id=cid for update;
  if not found or not src.enabled or not src.compliance_approved then return '{"claimed":false}';end if;
  if src.last_attempt_at>now()-interval '2 minutes' or src.next_attempt_at>now() then return '{"claimed":false}';end if;
  update prospecting.collection_runs set status='failed',finished_at=now(),error='Stale worker lease expired' where source_id=src.id and status='running' and started_at<now()-interval '10 minutes';
  update prospecting.sources set last_attempt_at=now() where id=src.id;
  insert into prospecting.collection_runs(campaign_id,source_id,status) values(cid,src.id,'running') returning id into rid;
  return jsonb_build_object('claimed',true,'run_id',rid,'source',to_jsonb(src));
 elsif a='_document' then
  select * into src from prospecting.sources where id=(d->>'source_id')::uuid and campaign_id=cid and enabled and compliance_approved;
  if not found then raise exception 'Source disabled';end if;
  if d->>'url' !~ '^https://(job-boards|boards)\.greenhouse\.io/' then raise exception 'Unapproved evidence URL';end if;
  insert into prospecting.source_documents(source_id,external_id,title,url,location,excerpt,posted_at,updated_at_source,content_hash)
   values(src.id,d->>'external_id',left(d->>'title',500),d->>'url',d->>'location',left(d->>'excerpt',12000),(d->>'posted_at')::timestamptz,(d->>'updated_at_source')::timestamptz,d->>'content_hash')
   on conflict(source_id,external_id) do update set last_seen_at=now(),status='current',content_hash=excluded.content_hash,excerpt=excluded.excerpt,title=excluded.title,url=excluded.url,location=excluded.location,posted_at=excluded.posted_at,updated_at_source=excluded.updated_at_source returning id into docid;
  if coalesce((d->>'relevant')::boolean,false) then
   pid:=prospecting.save_company(jsonb_build_object('campaign_id',cid,'company_name',src.company_name,'website',src.website,'industry',src.industry,'city',src.city,'state',src.state,'source','greenhouse','source_url',d->>'url','identity_key','domain:'||prospecting.domain(src.website)));
   if prospecting.blocked(pid) then return jsonb_build_object('id',pid,'blocked',true);end if;
   insert into prospecting.signals(prospect_id,signal_type,source_url,source_excerpt,observed_at,confidence,source_key,posted_at,metadata)
    values(pid,'hiring_operational',d->>'url',left(d->>'excerpt',5000),now(),0.9,src.id::text||':'||(d->>'external_id'),(d->>'posted_at')::timestamptz,jsonb_build_object('document_id',docid,'source_id',src.id,'title',d->>'title','posted_date_known',d->>'posted_at' is not null,'content_hash',d->>'content_hash','status','current'))
    on conflict(source_key) where source_key is not null do update set source_excerpt=excluded.source_excerpt,source_url=excluded.source_url,posted_at=excluded.posted_at,observed_at=now(),metadata=excluded.metadata;
   update prospecting.prospects set stage=case when stage='new' then 'research' else stage end,updated_at=now() where id=pid;
  else
   update prospecting.signals set metadata=metadata||'{"status":"irrelevant"}' where source_key=src.id::text||':'||(d->>'external_id');
  end if;
  return jsonb_build_object('document_id',docid,'prospect_id',pid);
 elsif a='_finish_source' then
  select * into src from prospecting.sources where id=(d->>'source_id')::uuid and campaign_id=cid for update;
  if d->>'status' not in ('succeeded','failed') then raise exception 'Invalid run status';end if;
  update prospecting.collection_runs set status=d->>'status',finished_at=now(),items_seen=coalesce((d->>'items_seen')::int,0),signals_found=coalesce((d->>'signals_found')::int,0),attempts=coalesce((d->>'attempts')::int,1),error=left(d->>'error',1000) where id=(d->>'run_id')::uuid and source_id=src.id;
  update prospecting.sources set last_success_at=case when d->>'status'='succeeded' then now() else last_success_at end,failures=case when d->>'status'='succeeded' then 0 else failures+1 end,last_error=d->>'error',next_attempt_at=now()+case when d->>'status'='succeeded' then ((((now() at time zone 'America/Denver')::date+1+time '07:00') at time zone 'America/Denver')-now()) else least(1440,power(2,least(src.failures,10))::int*5)*interval '1 minute' end where id=src.id;
  if d->>'status'='succeeded' then
   update prospecting.source_documents set status='closed' where source_id=src.id and not(external_id=any(array(select jsonb_array_elements_text(d->'seen_ids'))));
   update prospecting.signals s set metadata=s.metadata||'{"status":"closed"}' where metadata->>'source_id'=src.id::text and not exists(select 1 from prospecting.source_documents sd where sd.source_id=src.id and src.id::text||':'||sd.external_id=s.source_key and sd.status='current');
  end if;
  return '{"status":"saved"}';
 elsif a='_ai_failed' then
  select * into p from prospecting.prospects where id=(d->>'id')::uuid and campaign_id=cid;
  if not found then raise exception 'Prospect not found';end if;
  insert into prospecting.activity(prospect_id,event_type,details) values(p.id,'ai_failed',jsonb_build_object('reason',left(d->>'reason',500)));
  return '{"status":"logged"}';
 elsif a='_ai_reserve' then
  perform pg_advisory_xact_lock(hashtextextended('prospecting-ai-budget:'||cid::text,0));
  select * into cfg from prospecting.engine_settings where campaign_id=cid for update;
  select * into p from prospecting.prospects where id=(d->>'id')::uuid and campaign_id=cid for update;
  if not found or prospecting.blocked(p.id) then raise exception 'Prospect missing or do-not-contact';end if;
  if exists(select 1 from prospecting.assessments where prospect_id=p.id and input_hash=d->>'input_hash') then return '{"allowed":false,"reason":"unchanged"}';end if;
  if exists(select 1 from prospecting.activity where prospect_id=p.id and event_type='ai_reserved' and created_at>now()-interval '3 minutes') then return '{"allowed":false,"reason":"already_running"}';end if;
  if cfg.ai_reserved_usd+0.02>cfg.ai_budget_usd then return '{"allowed":false,"reason":"budget_requires_approval"}';end if;
  update prospecting.engine_settings set ai_reserved_usd=ai_reserved_usd+0.02 where campaign_id=cid;
  insert into prospecting.activity(prospect_id,event_type,details) values(p.id,'ai_reserved',jsonb_build_object('input_hash',d->>'input_hash','maximum_usd',0.02));
  return jsonb_build_object('allowed',true,'model',cfg.model,'weights',cfg.weights);
 elsif a='_assessment' then
  select * into p from prospecting.prospects where id=(d->>'id')::uuid and campaign_id=cid for update;
  if not found or prospecting.blocked(p.id) then raise exception 'Prospect missing or do-not-contact';end if;
  score:=round(((d->>'fit')::numeric*(cfg.weights->>'fit')::numeric+(d->>'need')::numeric*(cfg.weights->>'need')::numeric+(d->>'intent')::numeric*(cfg.weights->>'intent')::numeric)/100);
  insert into prospecting.assessments(prospect_id,fit_score,need_score,intent_score,priority_score,reasoning,model_name,confidence,evidence,next_action,review_required,input_hash,usage,cost_usd)
  values(p.id,(d->>'fit')::int,(d->>'need')::int,(d->>'intent')::int,score,d->>'reasoning',cfg.model,(d->>'confidence')::numeric,d->'evidence',d->>'next_action',true,d->>'input_hash',d->'usage',(d->>'cost_usd')::numeric)
  on conflict(prospect_id,input_hash) where input_hash is not null do nothing returning * into ass;
  if ass.id is null then return '{"status":"unchanged"}';end if;
  update prospecting.outreach set status='cancelled',approved_at=null where prospect_id=p.id and status in ('draft','approved') and assessment_id is distinct from ass.id;
  update prospecting.prospects set stage='review',updated_at=now() where id=p.id and stage in ('new','research','review');
  for draft in select * from jsonb_array_elements(d->'drafts') loop
   insert into prospecting.outreach(prospect_id,channel,kind,subject,body,assessment_id,evidence,status)
   values(p.id,case draft->>'kind' when 'linkedin' then 'linkedin' when 'phone_points' then 'phone' else 'email' end,draft->>'kind',draft->>'subject',draft->>'body',ass.id,d->'evidence','draft') on conflict do nothing;
  end loop;
  insert into prospecting.activity(prospect_id,event_type,details) values(p.id,'ai_assessed',jsonb_build_object('assessment_id',ass.id,'cost_usd',d->'cost_usd','needs_human_review',true));
  return jsonb_build_object('status','saved','score',score,'assessment_id',ass.id);
 elsif a='_screen' then
  insert into prospecting.lead_screenings(campaign_id,lead_id,outcome,details)
   select cid,id,case when do_not_contact then 'suppressed' when exists(select 1 from prospecting.sources s where s.campaign_id=cid and prospecting.domain(s.website)=prospecting.domain(l.website)) then 'approved_source_available' else 'no_approved_source' end,
    'Existing lead screened against configured employer sources. No website scraping; absent evidence is unknown, not buying intent.'
   from public.lead_finder_leads l where dup_of is null and coalesce(state,'')='CO' and niche=any(cfg.industries) and not exists(select 1 from prospecting.lead_screenings where campaign_id=cid and lead_id=l.id) order by id limit least(50,greatest(1,coalesce((d->>'limit')::int,50))) on conflict do nothing;
  get diagnostics old_count=row_count;return jsonb_build_object('screened',old_count);
 end if;
 raise exception 'Unknown engine operation';
end;$$;
create or replace function public.prospecting_engine(a text,d jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select prospecting.engine_api(a,d);$$;
revoke all on function prospecting.domain(text),prospecting.norm(text),prospecting.blocked(uuid),prospecting.assessment_current(uuid),prospecting.save_company(jsonb),prospecting.engine_api(text,jsonb),public.prospecting_engine(text,jsonb) from public,anon,authenticated;
grant usage on schema prospecting to authenticated,service_role;
grant execute on function prospecting.engine_api(text,jsonb),public.prospecting_engine(text,jsonb) to authenticated,service_role;
notify pgrst,'reload schema';
commit;
