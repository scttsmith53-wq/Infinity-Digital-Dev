create index if not exists personalization_optout_domain on public.lead_finder_leads(prospecting.domain(website)) where coalesce(do_not_contact,false) or coalesce(call_status,'') ~* 'not.?interested|unsubscr|bounc|dnc|opt.?out|stop';
create or replace function prospecting.personalization_blocked(lid bigint) returns boolean language sql stable security definer set search_path='' as $$
select not exists(select 1 from public.lead_finder_leads l where l.id=lid and not coalesce(l.do_not_contact,false) and l.dup_of is null
 and coalesce(l.call_status,'') !~* 'not.?interested|wrong.?number|unsubscr|bounc|dnc|do.?not.?contact|opt.?out|stop'
 and l.email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
 and not prospecting.contact_blocked(l.id)
 and not exists(select 1 from prospecting.personalization_suppressions s where (s.kind='email' and s.value=lower(trim(l.email))) or(s.kind='domain' and s.value in(split_part(lower(trim(l.email)),'@',2),prospecting.domain(l.website))))
 and not exists(select 1 from public.lead_finder_leads x where (lower(trim(x.email))=lower(trim(l.email)) or (prospecting.domain(l.website)<>'' and prospecting.domain(x.website)=prospecting.domain(l.website))) and (coalesce(x.do_not_contact,false) or coalesce(x.call_status,'') ~* 'not.?interested|unsubscr|bounc|dnc|opt.?out|stop')));
$$;
