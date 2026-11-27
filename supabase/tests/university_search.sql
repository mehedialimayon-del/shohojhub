begin;
insert into public.universities (name_bn,name_en,category,district,official_url,source_url,verified_at,published_at)
values ('কিউএ বিশ্ববিদ্যালয়','QA University','public','Dhaka','https://university.example.test','https://university.example.test/source',now(),now()),
('কিউএ খসড়া','QA Draft','public','Dhaka','https://draft.example.test','https://draft.example.test/source',null,null);
set local role anon;
do $$ begin
  if exists (select from public.search_universities('QA', 0)) then raise exception 'Disabled module exposed search results'; end if;
end $$;
reset role;
update public.system_modules set enabled = true where module_key = 'universities';
set local role anon;
do $$ begin
  if (select count(*) from public.search_universities('qa', 0)) <> 1 then raise exception 'Published result or draft filtering failed'; end if;
  if (select count(*) from public.search_universities('বিশ্ববিদ্যালয়', 0)) <> 1 then raise exception 'Bangla search failed'; end if;
  if exists (select from public.search_universities('QA', 1)) then raise exception 'Offset was ignored'; end if;
  if exists (select from public.search_universities('%%', 0)) then raise exception 'Wildcard was interpreted'; end if;
  if exists (select from public.search_universities('QA', -1)) then raise exception 'Invalid offset was accepted'; end if;
end $$;
rollback;
select 'university search assertions passed' as result;
