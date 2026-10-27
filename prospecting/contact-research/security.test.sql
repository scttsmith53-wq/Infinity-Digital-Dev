-- All fixtures and changes are rolled back; no network requests or model calls.
begin;
select set_config('request.jwt.claims','{"sub":"78dfc218-78cd-43c7-9cc9-47885a5b2f82","role":"authenticated"}',true);
set local role authenticated;
select public.prospecting_contacts('overview')->'metrics' as owner_access;
do $$ declare caught boolean:=false;begin
 begin perform public.prospecting_contacts('_claim');exception when insufficient_privilege then caught:=true;end;
 if not caught then raise exception 'FAIL owner invoked worker-only operation';end if;
 perform set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
 caught:=false;begin perform public.prospecting_contacts('overview');exception when insufficient_privilege then caught:=true;end;
 if not caught then raise exception 'FAIL unrelated owner read contacts';end if;
end $$;
reset role;
select set_config('request.jwt.claims','{"role":"service_role"}',true);
do $$ declare j prospecting.research_jobs%rowtype;claim jsonb;r jsonb;old_lease uuid;caught boolean;begin
 select * into j from prospecting.research_jobs where status='completed' and attempt_count=1 order by legacy_lead_id desc limit 1 for update;
 if j.id is null then raise exception 'Test requires a completed pilot job';end if;
 update prospecting.contact_settings set worker_enabled=true,daily_limit=120;
 update prospecting.research_jobs set status='queued' where id=j.id;
 claim:=public.prospecting_contacts('_claim',jsonb_build_object('id',j.id));
 if not(claim->>'claimed')::boolean then raise exception 'FAIL worker claim';end if;
 old_lease:=(claim->'job'->>'lease_token')::uuid;
 r:=public.prospecting_contacts('_claim',jsonb_build_object('id',j.id));
 if(r->>'claimed')::boolean then raise exception 'FAIL simultaneous duplicate claim';end if;
 update prospecting.contact_settings set budget_usd=0;
 r:=public.prospecting_contacts('_reserve',jsonb_build_object('id',j.id,'lease_token',old_lease));
 if(r->>'allowed')::boolean then raise exception 'FAIL exhausted budget';end if;
 update prospecting.research_jobs set lease_until=now()-interval '1 minute' where id=j.id;
 claim:=public.prospecting_contacts('_claim',jsonb_build_object('id',j.id));
 if not(claim->>'claimed')::boolean or (claim->'job'->>'lease_token')::uuid=old_lease then raise exception 'FAIL interrupted-job recovery';end if;
 if not exists(select 1 from prospecting.research_attempts where job_id=j.id and status='interrupted') then raise exception 'FAIL interruption history';end if;
 caught:=false;begin perform public.prospecting_contacts('_finish',jsonb_build_object('id',j.id,'lease_token',old_lease,'status','completed'));exception when others then caught:=true;end;
 if not caught then raise exception 'FAIL stale worker wrote results';end if;
 update prospecting.prospects set do_not_contact=true where id=j.prospect_id;
 r:=public.prospecting_contacts('_finish',jsonb_build_object('id',j.id,'lease_token',claim->'job'->>'lease_token','status','completed','contacts','[]'::jsonb));
 if r->>'status'<>'blocked' then raise exception 'FAIL DNC completion gate';end if;
end $$;
select jsonb_build_object('assertions','owner/nonowner, worker-only, budget, concurrency, recovery, stale lease and DNC passed','anonymous_denied',not has_function_privilege('anon','public.prospecting_contacts(text,jsonb)','EXECUTE'),'direct_contact_table_denied',not has_table_privilege('authenticated','prospecting.contacts','SELECT')) verification;
rollback;
