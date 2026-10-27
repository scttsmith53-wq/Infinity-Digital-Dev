begin;
select set_config('request.jwt.claims','{"sub":"78dfc218-78cd-43c7-9cc9-47885a5b2f82","role":"authenticated"}',true);
do $$ declare c prospecting.contacts%rowtype;e prospecting.contact_evidence%rowtype;caught boolean;begin
 select * into c from prospecting.contacts where identity_confidence>=0.8 limit 1 for update;
 if c.id is null then raise exception 'Test requires one company-supported candidate';end if;
 select * into e from prospecting.contact_evidence where contact_id=c.id and position(lower(c.full_name) in lower(excerpt))>0 and position(lower(c.job_title) in lower(excerpt))>0 limit 1;
 update prospecting.contacts set identity_confidence=0.5,identity_status='external_source_needs_confirmation',research_status='needs_review' where id=c.id;
 caught:=false;begin perform public.prospecting_contacts('contact_review',jsonb_build_object('id',c.id,'status','approved'));exception when others then caught:=true;end;
 if not caught then raise exception 'FAIL weak identity approval';end if;
 perform public.prospecting_contacts('verify_contact',jsonb_build_object('id',c.id,'source_url',e.source_url,'excerpt',e.excerpt,'verified',true));
 perform public.prospecting_contacts('contact_review',jsonb_build_object('id',c.id,'status','approved'));
 perform public.prospecting_contacts('draft',jsonb_build_object('id',c.id));
 if not exists(select 1 from prospecting.contact_drafts where contact_id=c.id and status='draft') then raise exception 'FAIL approved-contact draft';end if;
 perform public.prospecting_contacts('contact_review',jsonb_build_object('id',c.id,'status','rejected'));
 if not exists(select 1 from prospecting.contact_drafts where contact_id=c.id and status='rejected') then raise exception 'FAIL rejection invalidates draft';end if;
end $$;
select 'weak identities blocked; human verification, approval, draft and rejection passed; all changes rolled back' verification;
rollback;
