-- Isolated personalization pilot. Stable lead/contact tables and ranking are read only.
create table prospecting.personalization_settings (
 id boolean primary key default true check(id), budget_usd numeric not null default 1 check(budget_usd between 0 and 1), committed_usd numeric not null default 0,
 worker_enabled boolean not null default true, pilot_reviewed boolean not null default false,
 sender_address text not null default '2256 Park Centre Dr, Suite 101, Westminster, CO 80234',
 unsubscribe_confirmed boolean not null default false, suppression_checked_at timestamptz,
 suppression_source text, created_at timestamptz not null default now()
);
insert into prospecting.personalization_settings(id) values(true);
create table prospecting.personalization_shortlist (
 lead_id bigint primary key references public.lead_finder_leads(id), rank integer not null unique,
 original_score numeric, source_path text not null, snapshot_at timestamptz not null default now()
);
create table prospecting.personalization_jobs (
 id uuid primary key default gen_random_uuid(), lead_id bigint not null unique references public.lead_finder_leads(id),
 status text not null default 'queued' check(status in('queued','running','completed','needs_research','failed','blocked')),
 attempts integer not null default 0 check(attempts between 0 and 3), lease uuid, lease_until timestamptz,
 next_attempt_at timestamptz not null default now(), cost_usd numeric not null default 0, error text,
 attempts_log jsonb not null default '[]', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table prospecting.personalization_versions (
 id uuid primary key default gen_random_uuid(), lead_id bigint not null references public.lead_finder_leads(id),
 input_hash text not null, recipient text not null, first_name text not null default 'there', first_name_verified boolean not null default false,
 research jsonb not null, qa_status text not null check(qa_status in('approved_for_review','needs_research','needs_revision','rejected')),
 qa_errors jsonb not null default '[]', human_status text not null default 'pending' check(human_status in('pending','approved','rejected')),
 reviewed_at timestamptz, reviewed_by uuid, evidence_checked boolean not null default false,
 email_body text, model text not null default 'gpt-5.6-luna', usage jsonb not null default '{}', cost_usd numeric not null default 0,
 created_at timestamptz not null default now(), unique(lead_id,input_hash)
);
create index personalization_versions_lead_date on prospecting.personalization_versions(lead_id,created_at desc);
create index personalization_jobs_queue on prospecting.personalization_jobs(status,next_attempt_at);
create table prospecting.personalization_cache (
 lead_id bigint primary key references public.lead_finder_leads(id), website text not null, pages jsonb not null,
 attempts jsonb not null default '[]', fetched_at timestamptz not null default now()
);
create table prospecting.personalization_suppressions (
 value text primary key, kind text not null check(kind in('email','domain')), reason text not null,
 source text not null, created_at timestamptz not null default now()
);
create table prospecting.personalization_exports (
 id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), created_by uuid,
 production boolean not null, filters jsonb not null, version_ids jsonb not null, row_count integer not null
);
create table prospecting.personalization_export_items (
 version_id uuid primary key references prospecting.personalization_versions(id), email text not null unique,
 export_id uuid not null references prospecting.personalization_exports(id)
);
do $$declare t text;begin foreach t in array array['personalization_settings','personalization_shortlist','personalization_jobs','personalization_versions','personalization_cache','personalization_suppressions','personalization_exports','personalization_export_items'] loop
 execute format('alter table prospecting.%I enable row level security',t);
 execute format('revoke all on prospecting.%I from public,anon,authenticated',t);
end loop;end$$;

create function prospecting.personalization_blocked(lid bigint) returns boolean language sql stable security definer set search_path='' as $$
select not exists(select 1 from public.lead_finder_leads l where l.id=lid and not coalesce(l.do_not_contact,false) and l.dup_of is null
 and coalesce(l.call_status,'') !~* 'not.?interested|wrong.?number|unsubscr|bounc|dnc|do.?not.?contact|opt.?out|stop'
 and l.email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
 and not prospecting.contact_blocked(l.id)
 and not exists(select 1 from prospecting.personalization_suppressions s where (s.kind='email' and s.value=lower(trim(l.email))) or(s.kind='domain' and s.value in(split_part(lower(trim(l.email)),'@',2),prospecting.domain(l.website))))
 and not exists(select 1 from public.lead_finder_leads x where lower(trim(x.email))=lower(trim(l.email)) and (coalesce(x.do_not_contact,false) or coalesce(x.call_status,'') ~* 'not.?interested|unsubscr|bounc|dnc|opt.?out|stop')));
$$;
revoke all on function prospecting.personalization_blocked(bigint) from public,anon,authenticated;

create function prospecting.personalization_api(a text,d jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare worker boolean:=coalesce(auth.jwt()->>'role','')='service_role'; cfg prospecting.personalization_settings%rowtype;
 j prospecting.personalization_jobs%rowtype; v prospecting.personalization_versions%rowtype; l public.lead_finder_leads%rowtype;
 x jsonb; result jsonb; ids jsonb; eid uuid; n integer; firstn text; verified boolean;
begin
 if not worker and auth.uid() is distinct from (select owner_id from prospecting.campaigns where id='eaad1c3e-038e-4f26-b4d9-eb3c9aa95485') then raise exception 'Owner sign-in required' using errcode='42501';end if;
 if left(a,1)='_' and not worker then raise exception 'Worker only' using errcode='42501';end if;
 if d is null or jsonb_typeof(d)<>'object' or octet_length(d::text)>1500000 then raise exception 'Invalid request';end if;
 select * into cfg from prospecting.personalization_settings where id;
 if a='_snapshot' then
 perform pg_advisory_xact_lock(hashtextextended('personalization-snapshot',0));
 if exists(select 1 from prospecting.personalization_shortlist) then return jsonb_build_object('count',(select count(*) from prospecting.personalization_shortlist),'cached',true);end if;
 if jsonb_array_length(d->'rows')<>2000 then raise exception 'Expected frozen top-2000 shortlist';end if;
 insert into prospecting.personalization_shortlist(lead_id,rank,original_score,source_path) select (z->>'lead_id')::bigint,ord,(z->>'lead_score')::numeric,d->>'source_path' from jsonb_array_elements(d->'rows') with ordinality e(z,ord);
 return jsonb_build_object('count',2000);
 elsif a='overview' then
 return jsonb_build_object('settings',to_jsonb(cfg),'shortlist_count',(select count(*) from prospecting.personalization_shortlist),'total_leads',(select count(*) from public.lead_finder_leads),'jobs',coalesce((select jsonb_agg(z) from(select q.*,l.name,l.niche,l.state from prospecting.personalization_jobs q join public.lead_finder_leads l on l.id=q.lead_id order by q.created_at,q.lead_id)z),'[]'),'versions',(select count(*) from prospecting.personalization_versions),'actual_cost',(select coalesce(sum(cost_usd),0) from prospecting.personalization_jobs));
 elsif a='list' then
 select coalesce(jsonb_agg(z),'[]') into result from(select l.id,l.name,l.website,l.email,l.niche,l.city,l.state,s.rank,s.original_score,v.id version_id,v.qa_status,v.human_status,v.research->>'service' service,v.research->>'score' score,prospecting.personalization_blocked(l.id) blocked
 from public.lead_finder_leads l left join prospecting.personalization_shortlist s on s.lead_id=l.id left join lateral(select p.* from prospecting.personalization_versions p where p.lead_id=l.id order by p.created_at desc limit 1)v on true
 where (coalesce(d->>'scope','top')='full' or s.lead_id is not null) and (coalesce(d->>'industry','')='' or l.niche=d->>'industry') and (coalesce(d->>'state','')='' or l.state=d->>'state')
 and(coalesce(d->>'query','')='' or l.name ilike '%'||(d->>'query')||'%') and(coalesce(d->>'qa_status','')='' or v.qa_status=d->>'qa_status')
 and(coalesce(d->>'min_score','')='' or coalesce((v.research->>'score')::numeric,0)>=(d->>'min_score')::numeric)
 order by s.rank nulls last,l.id limit 100 offset least(15000,greatest(0,coalesce((d->>'offset')::int,0))))z;
 return result;
 elsif a='detail' then
 select * into l from public.lead_finder_leads where id=(d->>'lead_id')::bigint;if not found then raise exception 'Business not found';end if;
 return jsonb_build_object('business',jsonb_build_object('id',l.id,'name',l.name,'website',l.website,'email',l.email,'email_status',l.email_status,'industry',l.niche,'city',l.city,'state',l.state,'rating',l.rating,'reviews',l.reviews,'site_audit',l.site_audit,'site_audited_at',l.site_audited_at),
 'blocked',prospecting.personalization_blocked(l.id),'versions',coalesce((select jsonb_agg(z order by created_at desc) from prospecting.personalization_versions z where lead_id=l.id),'[]'),
 'contacts',coalesce((select jsonb_agg(to_jsonb(c)||jsonb_build_object('evidence',(select jsonb_agg(e) from prospecting.contact_evidence e where e.contact_id=c.id))) from prospecting.contacts c where c.legacy_lead_id=l.id and c.research_status<>'rejected'),'[]'));
 elsif a='enqueue_pilot' then
 perform pg_advisory_xact_lock(hashtextextended('personalization-pilot',0));
 if exists(select 1 from prospecting.personalization_jobs) then return jsonb_build_object('queued',0,'reason','Pilot already selected; resume existing jobs');end if;
 if(select count(*) from prospecting.personalization_shortlist)<>2000 then raise exception 'Load original shortlist first';end if;
 -- Round robin across state and industry, retaining original order within each stratum. No re-ranking.
 insert into prospecting.personalization_jobs(lead_id) select id from(select l.id,s.rank,row_number() over(partition by l.state,l.niche order by s.rank) bucket_rank from prospecting.personalization_shortlist s join public.lead_finder_leads l on l.id=s.lead_id where not prospecting.personalization_blocked(l.id) and l.website ~* '^https?://' )z order by bucket_rank,rank limit 25;
 get diagnostics n=row_count;return jsonb_build_object('queued',n);
 elsif a='settings' then
 update prospecting.personalization_settings set worker_enabled=coalesce((d->>'worker_enabled')::boolean,worker_enabled),unsubscribe_confirmed=coalesce((d->>'unsubscribe_confirmed')::boolean,unsubscribe_confirmed) where id;
 return '{"saved":true}';
 elsif a='suppression_sync' or a='_suppression_sync' then
 if length(coalesce(d->>'source',''))<10 or d->>'complete' is distinct from 'true' then raise exception 'Confirm a complete current Smartlead suppression snapshot';end if;
 for x in select * from jsonb_array_elements(coalesce(d->'items','[]')) loop
 if x->>'kind' not in('email','domain') or length(coalesce(x->>'value',''))<3 or x->>'value' ~ '[[:space:]]' then raise exception 'Invalid suppression value';end if;
 insert into prospecting.personalization_suppressions(value,kind,reason,source) values(lower(trim(x->>'value')),x->>'kind',coalesce(x->>'reason','unsubscribed or blocked'),d->>'source') on conflict(value) do update set reason=excluded.reason,source=excluded.source;
 end loop;
 update prospecting.personalization_settings set suppression_checked_at=now(),suppression_source=d->>'source' where id;return jsonb_build_object('saved',true,'count',jsonb_array_length(coalesce(d->'items','[]')));
 elsif a='review' then
 select * into v from prospecting.personalization_versions where id=(d->>'id')::uuid for update;
 if not found or d->>'status' not in('approved','rejected','pending') then raise exception 'Invalid review';end if;
 if d->>'status'='approved' and(v.qa_status<>'approved_for_review' or prospecting.personalization_blocked(v.lead_id) or d->>'evidence_checked' is distinct from 'true' or v.created_at<now()-interval '30 days') then raise exception 'Open sources, check every claim, and resolve QA/suppression first';end if;
 update prospecting.personalization_versions set human_status=d->>'status',evidence_checked=coalesce((d->>'evidence_checked')::boolean,false),reviewed_by=auth.uid(),reviewed_at=now() where id=v.id;return '{"saved":true,"sent":false}';
 elsif a='_claim' then
 perform pg_advisory_xact_lock(hashtextextended('personalization-budget',0));
 update prospecting.personalization_jobs set status=case when attempts<3 then 'queued' else 'failed' end,lease=null,lease_until=null,error='Expired worker lease recovered; unknown spend remains reserved' where status='running' and lease_until<now();
 select * into cfg from prospecting.personalization_settings where id for update;
 if not cfg.worker_enabled or cfg.committed_usd+.02>cfg.budget_usd then return '{"claimed":false,"reason":"paused_or_budget"}';end if;
 if(select count(*) from prospecting.personalization_jobs where status='running')>=2 then return '{"claimed":false,"reason":"concurrency_limit"}';end if;
 select * into j from prospecting.personalization_jobs where status='queued' and attempts<3 and next_attempt_at<=now() and(d->>'id' is null or id=(d->>'id')::uuid) order by created_at,lead_id limit 1 for update skip locked;
 if not found then return '{"claimed":false,"reason":"empty"}';end if;
 if prospecting.personalization_blocked(j.lead_id) then update prospecting.personalization_jobs set status='blocked' where id=j.id;return '{"claimed":false,"reason":"suppressed"}';end if;
 update prospecting.personalization_settings set committed_usd=committed_usd+.02 where id;
 update prospecting.personalization_jobs set status='running',attempts=attempts+1,lease=gen_random_uuid(),lease_until=now()+interval '4 minutes',updated_at=now() where id=j.id returning * into j;
 select * into l from public.lead_finder_leads where id=j.lead_id;
 select split_part(c.full_name,' ',1) into firstn from prospecting.contacts c where c.legacy_lead_id=l.id and lower(c.professional_email)=lower(trim(l.email)) and c.research_status='approved' and c.identity_status in('company_source_supported','human_verified') and c.last_verified_at>now()-interval '30 days' order by c.last_verified_at desc limit 1;
 return jsonb_build_object('claimed',true,'job',to_jsonb(j),'business',jsonb_build_object('id',l.id,'name',l.name,'website',l.website,'email',lower(trim(l.email)),'industry',l.niche,'city',l.city,'state',l.state),'first_name',coalesce(firstn,'there'),'first_name_verified',firstn is not null,
 'cached',(select to_jsonb(c) from prospecting.personalization_cache c where c.lead_id=l.id and c.website=l.website and c.fetched_at>now()-interval '30 days'),
 'contact_evidence',coalesce((select jsonb_agg(jsonb_build_object('url',e.source_url,'text',e.excerpt,'fetched_at',e.collected_at)) from prospecting.contact_evidence e join prospecting.contacts c on c.id=e.contact_id where c.legacy_lead_id=l.id and e.collected_at>now()-interval '30 days' and c.research_status<>'rejected'),'[]'));
 elsif a='_cached_version' then
 select * into v from prospecting.personalization_versions where lead_id=(d->>'lead_id')::bigint and input_hash=d->>'input_hash' and created_at>now()-interval '30 days';return to_jsonb(v);
 elsif a='_finish' then
 perform pg_advisory_xact_lock(hashtextextended('personalization-budget',0));
 select * into j from prospecting.personalization_jobs where id=(d->>'id')::uuid and lease=(d->>'lease')::uuid and status='running' and lease_until>now() for update;
 if not found then raise exception 'Expired lease; stale worker cannot save';end if;
 if coalesce((d->>'settle')::boolean,false) then update prospecting.personalization_settings set committed_usd=greatest(0,committed_usd-.02+coalesce((d->>'cost_usd')::numeric,0)) where id;end if;
 if d->'pages' is not null then insert into prospecting.personalization_cache(lead_id,website,pages,attempts) select j.lead_id,l.website,d->'pages',coalesce(d->'attempts','[]') from public.lead_finder_leads l where l.id=j.lead_id on conflict(lead_id) do update set website=excluded.website,pages=excluded.pages,attempts=excluded.attempts,fetched_at=now();end if;
 if prospecting.personalization_blocked(j.lead_id) then d:=d||'{"status":"blocked"}';
 elsif d->'version' is not null then
 x:=d->'version';
 insert into prospecting.personalization_versions(lead_id,input_hash,recipient,first_name,first_name_verified,research,qa_status,qa_errors,email_body,usage,cost_usd)
 values(j.lead_id,x->>'input_hash',x->>'recipient',x->>'first_name',(x->>'first_name_verified')::boolean,x->'research',x->>'qa_status',coalesce(x->'qa_errors','[]'),x->>'email_body',coalesce(x->'usage','{}'),coalesce((d->>'cost_usd')::numeric,0)) on conflict(lead_id,input_hash) do nothing;
 end if;
 if d->>'status' not in('completed','needs_research','failed','blocked') then raise exception 'Invalid finish';end if;
 update prospecting.personalization_jobs set status=d->>'status',cost_usd=cost_usd+coalesce((d->>'cost_usd')::numeric,0),error=left(d->>'error',1000),attempts_log=attempts_log||jsonb_build_array(jsonb_build_object('at',now(),'sources',d->'attempts','usage',d->'usage','cost_usd',d->'cost_usd','settled',d->'settle')),lease=null,lease_until=null,updated_at=now() where id=j.id;
 return jsonb_build_object('status',d->>'status','sent',false);
 elsif a='retry' then
 update prospecting.personalization_jobs set status='queued',next_attempt_at=now()+interval '2 seconds',error=null where id=(d->>'id')::uuid and status not in('queued','running') and attempts<3 and not prospecting.personalization_blocked(lead_id);get diagnostics n=row_count;return jsonb_build_object('queued',n);
 elsif a='export' then
 perform pg_advisory_xact_lock(hashtextextended('personalization-export',0));
 if coalesce((d->>'production')::boolean,false) and (not cfg.unsubscribe_confirmed or cfg.suppression_checked_at is null or cfg.suppression_checked_at<now()-interval '24 hours') then raise exception 'Confirm unsubscribe handling and synchronize current suppression data before import-ready export';end if;
 select coalesce(jsonb_agg(z),'[]') into result from(select v.*,l.name company_name,l.niche industry,l.state,l.website,s.rank from prospecting.personalization_versions v join public.lead_finder_leads l on l.id=v.lead_id left join prospecting.personalization_shortlist s on s.lead_id=l.id
 where v.id=(select p.id from prospecting.personalization_versions p where p.lead_id=l.id order by p.created_at desc limit 1)
 and(coalesce(d->>'scope','top')='full' or s.lead_id is not null) and(coalesce(d->>'industry','')='' or l.niche=d->>'industry') and(coalesce(d->>'state','')='' or l.state=d->>'state') and coalesce((v.research->>'score')::numeric,0)>=coalesce((d->>'min_score')::numeric,0)
 and(not coalesce((d->>'production')::boolean,false) or(v.qa_status='approved_for_review' and v.human_status='approved' and v.evidence_checked and v.created_at>now()-interval '30 days' and lower(trim(l.email))=v.recipient and not prospecting.personalization_blocked(l.id) and not exists(select 1 from prospecting.personalization_export_items i where i.version_id=v.id or i.email=v.recipient)))
 order by s.rank nulls last,l.id limit 2000)z;
 -- Final normalized-email deduplication applies to both review and production exports.
 select coalesce(jsonb_agg(value),'[]') into result from(select distinct on(value->>'recipient') value from jsonb_array_elements(result) order by value->>'recipient',value->>'id')z;
 select coalesce(jsonb_agg(value->>'id'),'[]') into ids from jsonb_array_elements(result);
 insert into prospecting.personalization_exports(created_by,production,filters,version_ids,row_count) values(auth.uid(),coalesce((d->>'production')::boolean,false),d,ids,jsonb_array_length(result)) returning id into eid;
 if coalesce((d->>'production')::boolean,false) then insert into prospecting.personalization_export_items(version_id,email,export_id) select (x->>'id')::uuid,x->>'recipient',eid from jsonb_array_elements(result)x;end if;
 return jsonb_build_object('export_id',eid,'production',coalesce((d->>'production')::boolean,false),'rows',result);
 else raise exception 'Unsupported personalization action';end if;
end;$$;
revoke all on function prospecting.personalization_api(text,jsonb) from public,anon;
grant execute on function prospecting.personalization_api(text,jsonb) to authenticated,service_role;
create function public.prospecting_personalization(a text,d jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select prospecting.personalization_api(a,d);$$;
revoke all on function public.prospecting_personalization(text,jsonb) from public,anon;
grant execute on function public.prospecting_personalization(text,jsonb) to authenticated,service_role;
