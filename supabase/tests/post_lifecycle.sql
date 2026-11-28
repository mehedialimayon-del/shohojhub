begin;
insert into auth.users(id) values ('72000000-0000-4000-8000-000000000001'),
 ('72000000-0000-4000-8000-000000000002'), ('72000000-0000-4000-8000-000000000003');
update public.profiles set role='admin' where id='72000000-0000-4000-8000-000000000003';
select set_config('request.jwt.claims','{"sub":"72000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
set local role authenticated;
insert into public.posts (category,intent,title,body,division,district,contact_name)
values ('services','need','Chapter two SQL test','Need a service provider for this test case.','ঢাকা','ঢাকা','QA Owner');
do $$ declare p uuid; begin
  select id into strict p from public.current_user_posts() where title='Chapter two SQL test';
  if public.change_post_status(p,'publish') then raise exception 'Member self-published'; end if;
  update public.posts set title='Chapter two edited' where id=p;
  if not found then raise exception 'Pending post not editable by its owner'; end if;
  perform set_config('shohoj.test_post',p::text,true);
end $$;
select set_config('request.jwt.claims','{"sub":"72000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
do $$ declare p uuid := current_setting('shohoj.test_post')::uuid; begin
  if exists(select from public.posts where id=p) then raise exception 'Pending post leaked'; end if;
  update public.posts set title='Wrong owner update' where id=p;
  if found or public.change_post_status(p,'close') then raise exception 'Wrong owner mutated post'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"72000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
do $$ declare p uuid := current_setting('shohoj.test_post')::uuid; begin
  if public.change_post_status(p,'publish',now()+interval '2 hours',now()+interval '1 hour') then raise exception 'Invalid schedule accepted'; end if;
  if not public.change_post_status(p,'publish',now()+interval '1 hour',now()+interval '2 hours') then raise exception 'Valid schedule rejected'; end if;
end $$;
reset role;
set local role anon;
do $$ begin if exists(select from public.posts where id=current_setting('shohoj.test_post')::uuid) then raise exception 'Scheduled post appeared early'; end if; end $$;
reset role;
update public.posts set published_at=now()-interval '2 hours',expires_at=now()-interval '1 hour' where id=current_setting('shohoj.test_post')::uuid;
set local role anon;
do $$ begin if exists(select from public.posts where id=current_setting('shohoj.test_post')::uuid) then raise exception 'Expired post appears in public feed'; end if; end $$;
reset role;
update public.posts set expires_at=now()+interval '1 hour' where id=current_setting('shohoj.test_post')::uuid;
set local role anon;
do $$ begin if not exists(select from public.posts where id=current_setting('shohoj.test_post')::uuid) then raise exception 'Active public post missing'; end if; end $$;
reset role;
select set_config('request.jwt.claims','{"sub":"72000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
set local role authenticated;
insert into public.post_reports(post_id,reason) values(current_setting('shohoj.test_post')::uuid,'Test report reason');
select set_config('request.jwt.claims','{"sub":"72000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
do $$ begin
  update public.post_reports set resolved_at=now() where post_id=current_setting('shohoj.test_post')::uuid;
  if not found then raise exception 'Report could not be resolved by admin'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"72000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $$ declare p uuid := current_setting('shohoj.test_post')::uuid; begin
  if not public.change_post_status(p,'revise') then raise exception 'Owner could not return post to review'; end if;
  if not public.change_post_status(p,'close') then raise exception 'Owner could not close post'; end if;
end $$;
reset role;
set local role anon;
do $$ begin if exists(select from public.posts where id=current_setting('shohoj.test_post')::uuid) then raise exception 'Archived post is visible'; end if; end $$;
rollback;
select 'chapter 02 permissions, scheduling, expiry, reports and close passed' as result;
