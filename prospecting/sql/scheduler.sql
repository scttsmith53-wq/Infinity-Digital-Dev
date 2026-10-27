begin;
do $$ begin if not exists(select 1 from vault.secrets where name='PROSPECTING_ENGINE_CRON') then perform vault.create_secret(gen_random_uuid()::text||gen_random_uuid()::text,'PROSPECTING_ENGINE_CRON','Internal prospect collection scheduler only');end if;end $$;
create or replace function prospecting.scheduler_key() returns text language plpgsql security definer set search_path='' as $$begin
 if coalesce(auth.jwt()->>'role','')<>'service_role' then raise exception 'Worker only' using errcode='42501';end if;
 return (select decrypted_secret from vault.decrypted_secrets where name='PROSPECTING_ENGINE_CRON');end;$$;
create or replace function public.prospecting_scheduler_key() returns text language sql security invoker set search_path='' as $$select prospecting.scheduler_key();$$;
revoke all on function prospecting.scheduler_key(),public.prospecting_scheduler_key() from public,anon,authenticated;
grant execute on function prospecting.scheduler_key(),public.prospecting_scheduler_key() to service_role;
create or replace function prospecting.dispatch_daily() returns void language plpgsql security definer set search_path='' as $$
declare cfg prospecting.engine_settings%rowtype;today date:=(now() at time zone 'America/Denver')::date;token text;request_id bigint;transport_failed boolean;
begin
 if not pg_try_advisory_xact_lock(hashtextextended('prospecting-daily',0)) then return;end if;
 select * into cfg from prospecting.engine_settings where campaign_id='eaad1c3e-038e-4f26-b4d9-eb3c9aa95485' for update;
 if not cfg.automation_enabled or extract(hour from now() at time zone 'America/Denver')<7 then return;end if;
 select coalesce(status_code<>200 or timed_out or error_msg is not null,false) into transport_failed from net._http_response where id=cfg.last_dispatch_id;
 if cfg.last_daily_date=today and not (coalesce(transport_failed,false) and cfg.dispatch_attempts<3 and cfg.last_dispatch_at<now()-interval '15 minutes') and not exists(select 1 from prospecting.sources where campaign_id=cfg.campaign_id and enabled and compliance_approved and last_error is not null and next_attempt_at<=now() and failures<3 and last_attempt_at::date=current_date) then return;end if;
 select decrypted_secret into token from vault.decrypted_secrets where name='PROSPECTING_ENGINE_CRON';
 request_id:=net.http_post(url:='https://qfhfuesnjfuwfujhvgpa.supabase.co/functions/v1/prospect-engine',headers:=jsonb_build_object('Content-Type','application/json','x-prospect-scheduler',token),body:='{"action":"collect","scheduled":true}'::jsonb,timeout_milliseconds:=120000);
 update prospecting.engine_settings set last_daily_date=today,last_dispatch_id=request_id,last_dispatch_at=now(),dispatch_attempts=case when last_daily_date=today then dispatch_attempts+1 else 1 end where campaign_id=cfg.campaign_id;
end;$$;
revoke all on function prospecting.dispatch_daily() from public,anon,authenticated,service_role;
select cron.schedule('prospecting-engine-daily','*/15 * * * *','select prospecting.dispatch_daily();');
select cron.alter_job((select jobid from cron.job where jobname='prospecting-engine-daily'),active:=false);
commit;
