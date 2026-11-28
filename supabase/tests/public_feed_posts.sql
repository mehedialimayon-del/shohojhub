begin;
insert into auth.users (id) values
  ('43000000-0000-4000-8000-000000000001'),
  ('43000000-0000-4000-8000-000000000002');

select set_config('request.jwt.claims', '{"sub":"43000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
set local role authenticated;
insert into public.posts (category,title,body,division,district,contact_name)
values ('jobs','QA feed post','A QA post description with enough details for validation.','ঢাকা','ঢাকা','QA Owner');
do $$ begin
  if (select count(*) from public.posts) <> 1 then raise exception 'Owner cannot read their pending post'; end if;
  if has_column_privilege('public.posts','owner_id','INSERT') then raise exception 'Users can forge post ownership'; end if;
  if has_column_privilege('public.posts','status','INSERT') then raise exception 'Users can publish directly'; end if;
end $$;
reset role;

select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;
do $$ begin
  if exists (select from public.posts) then raise exception 'Pending post leaked to anonymous feed'; end if;
  if has_column_privilege('public.posts','contact_name','SELECT') is false then raise exception 'Expected public contact field is missing'; end if;
end $$;
reset role;

select set_config('request.jwt.claims', '{"sub":"43000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
set local role authenticated;
do $$ begin
  if exists (select from public.posts) then raise exception 'Another account can read an owner-only pending post'; end if;
end $$;
reset role;

set local role service_role;
update public.posts set status = 'published', published_at = now();
reset role;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;
do $$ begin
  if (select count(*) from public.posts) <> 1 then raise exception 'Published post missing from public feed'; end if;
  if has_column_privilege('public.posts','owner_id','SELECT') then raise exception 'Public feed exposes ownership IDs'; end if;
end $$;
rollback;
select 'public feed post policy assertions passed' as result;
