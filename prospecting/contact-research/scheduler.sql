begin;
create or replace function prospecting.dispatch_contacts(n int default 6) returns int language plpgsql security definer set search_path='' as $$
declare token text;i int;pending int;begin
 if not pg_try_advisory_xact_lock(hashtextextended('contact-dispatch',0)) then return 0;end if;
 if not(select worker_enabled from prospecting.contact_settings where campaign_id='eaad1c3e-038e-4f26-b4d9-eb3c9aa95485') then return 0;end if;
 select count(*) into pending from prospecting.research_jobs where status='queued' and next_attempt_at<=now() or status='running' and lease_until<now();
 if pending=0 then return 0;end if;
 select decrypted_secret into token from vault.decrypted_secrets where name='PROSPECTING_ENGINE_CRON';
 if token is null then raise exception 'Existing internal scheduler secret missing';end if;
 for i in 1..least(6,greatest(1,n),pending) loop
 perform net.http_post(url:='https://qfhfuesnjfuwfujhvgpa.supabase.co/functions/v1/contact-research',headers:=jsonb_build_object('Content-Type','application/json','x-prospect-scheduler',token),body:='{"action":"run"}',timeout_milliseconds:=120000);
 end loop;return least(6,greatest(1,n),pending);
end;$$;
revoke all on function prospecting.dispatch_contacts(int) from public,anon,authenticated,service_role;
select cron.schedule('contact-research-queue','* * * * *','select prospecting.dispatch_contacts(6);');
select cron.alter_job((select jobid from cron.job where jobname='contact-research-queue'),active:=false);
commit;
