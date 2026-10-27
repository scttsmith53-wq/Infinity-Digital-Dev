-- Integration test against a saved, source-backed pilot assessment. Every mutation rolls back.
begin;
select set_config('request.jwt.claims','{"sub":"78dfc218-78cd-43c7-9cc9-47885a5b2f82","role":"authenticated"}',true);
do $$ declare pid uuid;oid uuid;caught boolean; begin
 select p.id into pid from prospecting.prospects p where prospecting.assessment_current(p.id) limit 1;
 if pid is null then raise exception 'Test requires one current pilot assessment';end if;
 select o.id into oid from prospecting.outreach o where o.prospect_id=pid and o.assessment_id=(select id from prospecting.assessments where prospect_id=pid order by created_at desc limit 1) limit 1;
 perform public.prospecting_engine('draft_review',jsonb_build_object('id',oid,'status','approved'));
 if not exists(select 1 from prospecting.outreach where id=oid and status='approved' and reviewed_by=auth.uid()) then raise exception 'FAIL approval audit';end if;
 update prospecting.signals set metadata=metadata||'{"status":"closed"}' where prospect_id=pid;
 caught:=false;begin perform public.prospecting_engine('draft_review',jsonb_build_object('id',oid,'status','approved'));exception when others then caught:=true;end;
 if not caught then raise exception 'FAIL closed evidence approval guard';end if;
 caught:=false;begin perform public.prospecting_engine('decision',jsonb_build_object('id',pid,'stage','qualified'));exception when others then caught:=true;end;
 if not caught then raise exception 'FAIL closed evidence qualification guard';end if;
 update prospecting.prospects set do_not_contact=true where id=pid;
 caught:=false;begin perform public.prospecting_engine('draft_review',jsonb_build_object('id',oid,'status','approved'));exception when others then caught:=true;end;
 if not caught then raise exception 'FAIL do-not-contact approval guard';end if;
end $$;
select 'approval audit, closed evidence, qualification and DNC assertions passed; all changes rolled back' verification;
rollback;
