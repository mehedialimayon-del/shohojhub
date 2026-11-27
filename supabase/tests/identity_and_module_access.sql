begin;
insert into auth.users(id) values ('10000000-0000-4000-8000-000000000001'), ('10000000-0000-4000-8000-000000000002');
insert into public.system_modules(module_key,enabled) values ('test_enabled',true),('test_disabled',false);
set local role anon;
do $$ begin
  if (select count(*) from public.system_modules where module_key like 'test_%') <> 1 then raise exception 'Anonymous module visibility failed'; end if;
  if has_table_privilege('public.profiles','SELECT') then raise exception 'Anonymous profile grant'; end if;
end $$;
reset role;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
set local role authenticated;
do $$ begin
  if (select count(*) from public.profiles) <> 1 then raise exception 'Profile isolation failed'; end if;
  update public.profiles set display_name = 'QA';
  if not found then raise exception 'Owner cannot edit profile'; end if;
  if has_column_privilege('public.profiles','role','UPDATE') or has_column_privilege('public.profiles','verified_at','UPDATE') or has_column_privilege('public.profiles','suspended_at','UPDATE') then raise exception 'Privileged profile grant'; end if;
  if exists (select from public.audit_logs) or has_table_privilege('public.audit_logs','INSERT,UPDATE,DELETE') then raise exception 'Audit isolation failed'; end if;
end $$;
reset role;
update public.profiles set role = 'founder' where id = auth.uid();
set local role authenticated;
do $$ begin
  if not exists (select from public.system_modules where module_key = 'test_disabled') then raise exception 'Founder access failed'; end if;
  if not exists (select from public.audit_logs where event = 'profile_access_updated') then raise exception 'Access change was not audited'; end if;
end $$;
reset role;
update public.profiles set suspended_at = now() where id = auth.uid();
set local role authenticated;
do $$ begin
  update public.profiles set display_name = 'QA2';
  if found or exists (select from public.audit_logs) then raise exception 'Suspension was not enforced'; end if;
end $$;
rollback;
select 'identity and module assertions passed' as result;
