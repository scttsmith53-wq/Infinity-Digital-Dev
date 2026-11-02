create index if not exists personalization_lead_email on public.lead_finder_leads(lower(trim(email)));
create index if not exists personalization_blocked_domain on public.lead_finder_leads(prospecting.domain(website)) where do_not_contact or coalesce(call_status,'') ~* 'dnc|do.?not.?contact|opt.?out|stop|wrong.?number';
create index if not exists personalization_suppressed_prospect_domain on prospecting.prospects(prospecting.domain(website)) where do_not_contact or stage='suppressed';
