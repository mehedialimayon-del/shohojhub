begin;
insert into auth.users(id) values ('65000000-0000-4000-8000-000000000001');
update public.profiles set role = 'merchant' where id = '65000000-0000-4000-8000-000000000001';
insert into public.universities (name_bn,name_en,category,district,official_url,source_url,verified_at,published_at,search_aliases)
values ('পরীক্ষার বিশ্ববিদ্যালয়','QA University','public','Dhaka','https://search.example.test',
'https://search.example.test/source',now(),now(),'dhaka bishwabidyaloy');
insert into public.shops (id,owner_id,name,district,area,published_at)
values ('65000000-0000-4000-8000-000000000002','65000000-0000-4000-8000-000000000001','QA Shop','Dhaka','QA area',now()),
('65000000-0000-4000-8000-000000000003','65000000-0000-4000-8000-000000000001','QA Draft Shop','Dhaka','QA area',null);
insert into public.shop_products (shop_id,name,price_paisa,available)
values ('65000000-0000-4000-8000-000000000002','QA Published Product', 100, true),
('65000000-0000-4000-8000-000000000002','QA Unavailable Product', 100, false),
('65000000-0000-4000-8000-000000000003','QA Draft Product', 100, true);
set local role anon;
do $$ begin
  if exists (select from public.search_directory('QA', 0)) then raise exception 'Disabled module returned directory entries'; end if;
end $$;
reset role;
update public.system_modules set enabled=true where module_key in ('universities','storefront');
set local role anon;
do $$ begin
  if (select count(distinct kind) from public.search_directory('QA', 0)) <> 3 then raise exception 'Search did not match all supported categories'; end if;
  if (select count(*) from public.search_directory('bishwabidyaloy', 0)) <> 1 then raise exception 'Banglish alias did not match'; end if;
  if (select count(*) from public.search_directory('বিশ্ববিদ্যালয়', 0)) <> 1 then raise exception 'Bangla title did not match'; end if;
  if exists (select from public.search_directory('QA', 3)) then raise exception 'Search pagination did not apply'; end if;
end $$;
reset role;
select set_config('request.jwt.claims', '{"sub":"65000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
set local role authenticated;
do $$ begin
  if (select count(*) from public.search_directory('QA', 0)) <> 3 then raise exception 'Draft or unavailable listings appeared in merchant search'; end if;
  if exists (select from public.search_directory('QA', 501)) then raise exception 'Search offset was unlimited'; end if;
end $$;
rollback;
select 'directory search and visibility assertions passed' as result;
