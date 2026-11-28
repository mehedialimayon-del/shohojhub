begin;
insert into auth.users(id) values ('71000000-0000-4000-8000-000000000001'), ('71000000-0000-4000-8000-000000000002');
update public.profiles set role = 'merchant' where id in ('71000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000002');
insert into public.shops (owner_id,name,district,area,published_at)
values ('71000000-0000-4000-8000-000000000001','Own draft','Dhaka','QA',null),
('71000000-0000-4000-8000-000000000002','Other public shop','Dhaka','QA',now());
select set_config('request.jwt.claims','{"sub":"71000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
set local role authenticated;
do $$ begin
  if exists (select from public.owned_storefronts()) then raise exception 'Disabled storefront leaked'; end if;
end $$;
reset role;
update public.system_modules set enabled = true where module_key = 'storefront';
set local role authenticated;
do $$ begin
  if (select array_agg(name) from public.owned_storefronts()) is distinct from array['Own draft'] then
    raise exception 'Owned shop isolation failed';
  end if;
end $$;
reset role;
update public.profiles set suspended_at=now() where id='71000000-0000-4000-8000-000000000001';
set local role authenticated;
do $$ begin
  if exists (select from public.owned_storefronts()) then raise exception 'Suspended merchant retained access'; end if;
end $$;
reset role;
set local role anon;
do $$ begin
  if has_function_privilege('public.owned_storefronts()', 'EXECUTE') then raise exception 'Anonymous RPC grant'; end if;
end $$;
rollback;
select 'owned storefront assertions passed' as result;
