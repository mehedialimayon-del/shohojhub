begin;
insert into auth.users(id) values ('20000000-0000-4000-8000-000000000001'), ('20000000-0000-4000-8000-000000000002');
insert into public.universities (id,name_bn,name_en,category,district,official_url,source_url,verified_at,published_at)
values ('30000000-0000-4000-8000-000000000001','পরীক্ষা','Test University','public','Test','https://example.test','https://example.test/source',now(),now()),
('30000000-0000-4000-8000-000000000002','খসড়া','Draft University','public','Test','https://draft.example.test','https://draft.example.test/source',null,null);
set local role anon;
do $$ begin
  if exists (select from public.universities) then raise exception 'Disabled directory is visible'; end if;
end $$;
reset role;
update public.system_modules set enabled = true where module_key = 'universities';
set local role anon;
do $$ begin
  if (select count(*) from public.universities) <> 1 then raise exception 'Published directory visibility failed'; end if;
  if has_table_privilege('public.university_bookmarks','SELECT') then raise exception 'Anonymous bookmark access'; end if;
end $$;
reset role;
select set_config('request.jwt.claims','{"sub":"20000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
set local role authenticated;
insert into public.university_bookmarks (user_id, university_id) values (auth.uid(),'30000000-0000-4000-8000-000000000001');
do $$ begin
  if (select count(*) from public.university_bookmarks) <> 1 then raise exception 'Own bookmark is missing'; end if;
  if has_table_privilege('public.universities','INSERT,UPDATE,DELETE') then raise exception 'Unexpected directory write privilege'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"20000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
do $$ begin
  if exists (select from public.university_bookmarks) then raise exception 'Bookmark leaked'; end if;
end $$;
rollback;
select 'directory and bookmark assertions passed' as result;
