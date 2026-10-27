-- Free extraction from already saved company-controlled evidence. No guessed pattern or provider call.
-- Only a single non-generic corporate address in a short passage naming this person and role qualifies.
begin;
do $$ declare r record;begin
 for r in select distinct on(ct.id) ct.id,ct.prospect_id,e.source_url,e.excerpt,(regexp_match(e.excerpt,'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'))[1] email
 from prospecting.contacts ct join prospecting.contact_evidence e on e.contact_id=ct.id
 where ct.professional_email is null and ct.identity_status='company_source_supported' and not prospecting.contact_blocked(ct.legacy_lead_id)
 and e.source_type='company_website' and length(e.excerpt)<=650 and position(lower(ct.full_name) in lower(e.excerpt))>0 and position(lower(ct.job_title) in lower(e.excerpt))>0
 and(select count(*) from regexp_matches(e.excerpt,'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}','g'))=1 order by ct.id,e.collected_at desc loop
 if r.email !~* '^(info|office|contact|hello|admin|sales|support|service|customerservice|team|mail|reception|appointments|billing|marketing|careers|jobs|noreply|no-reply|privacy|webmaster|dispatch|inquiries)([._+-]|@)'
 and r.email !~* '@(gmail|yahoo|hotmail|outlook|live|aol|icloud|protonmail|proton|mail|msn)\.(com|net|me)$' then
 update prospecting.contacts set professional_email=lower(r.email),email_status='published_company',deliverability_status='not_checked',updated_at=now() where id=r.id;
 insert into prospecting.activity(prospect_id,event_type,details) values(r.prospect_id,'published_professional_email_extracted',jsonb_build_object('contact_id',r.id,'source_url',r.source_url,'method','Single explicit corporate address in the named company-source passage; no assumed email pattern'));
 end if;end loop;
end $$;
commit;
