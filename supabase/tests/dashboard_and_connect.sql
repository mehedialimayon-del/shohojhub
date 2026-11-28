begin;

insert into auth.users(id) values
  ('61100000-0000-4000-8000-000000000001'),
  ('61100000-0000-4000-8000-000000000002'),
  ('61100000-0000-4000-8000-000000000003');

update public.system_modules set enabled = true where module_key in ('messaging','notifications');
insert into public.posts (owner_id,title,body,category,contact_name,division,district,status,published_at)
values ('61100000-0000-4000-8000-000000000002','ShohojQA Verified service','A disposable listing for dashboard and chat assertions.',
  'services','QA recipient','ঢাকা','ঢাকা','published', now());

select set_config('request.jwt.claims','{"sub":"61100000-0000-4000-8000-000000000001","role":"authenticated"}',true);
set local role authenticated;
do $$
declare
  actor constant uuid := '61100000-0000-4000-8000-000000000001';
  peer constant uuid := '61100000-0000-4000-8000-000000000002';
  listing uuid;
begin
  if (select count(*) from public.bd_districts) <> 64 or (select count(distinct division) from public.bd_districts) <> 8 then
    raise exception 'Verified location catalogue is incomplete';
  end if;
  if public.save_member_preferences('merchant','dhaka',false) or not public.save_member_preferences('merchant','dhaka',true) then
    raise exception 'Location consent enforcement failed';
  end if;
  if (select role from public.profiles where id = actor) <> 'member' then raise exception 'Preference changed auth role'; end if;
  if public.save_member_preferences('founder',null,false) then raise exception 'Privileged onboarding choice accepted'; end if;
  select id into strict listing from public.search_hub('ShohojQA',0,'post','ঢাকা');
  if public.post_message_peer(listing) is distinct from peer then raise exception 'Public post chat context not found'; end if;
  if exists(select from public.search_hub('ShohojQA',0,'post','সিলেট')) then raise exception 'District search returned non-matches'; end if;
  if public.send_message(peer,'QA message',gen_random_uuid()) is null then raise exception 'Message was not sent'; end if;
end $$;

select set_config('request.jwt.claims','{"sub":"61100000-0000-4000-8000-000000000002","role":"authenticated"}',true);
do $$
declare
  sender constant uuid := '61100000-0000-4000-8000-000000000001';
begin
  if exists(select from public.member_preferences) then raise exception 'A second member saw private preferences'; end if;
  if not exists(select from public.connect_inbox(0) where peer_id=sender and unread=1) then raise exception 'Inbox unread count is wrong'; end if;
  perform public.read_conversation(sender);
  if not exists(select from public.connect_inbox(0) where peer_id=sender and unread=0) then raise exception 'Inbox did not mark read'; end if;
  if not exists(select from public.notifications where read_at is not null) then raise exception 'Notification did not mark read'; end if;
  perform public.set_message_block(sender,true);
  begin
    perform public.send_message(sender,'QA blocked message',gen_random_uuid());
    raise exception 'Blocked message accepted';
  exception when insufficient_privilege then null;
  end;
end $$;

select set_config('request.jwt.claims','{"sub":"61100000-0000-4000-8000-000000000003","role":"authenticated"}',true);
select set_config('realtime.topic','shohojhub:account:61100000-0000-4000-8000-000000000002',true);
do $$ begin
  if exists (select from realtime.messages where topic=current_setting('realtime.topic')) then
    raise exception 'Outsider received another member''s private realtime signals';
  end if;
  if exists(select from public.connect_inbox(0)) or exists(select from public.messages) or exists(select from public.notifications) then
    raise exception 'Outsider saw private conversation data';
  end if;
end $$;

reset role;
do $$
begin
  if not exists (select from pg_trigger where tgrelid = 'public.messages'::regclass
    and tgname = 'shohojhub_signal_conversation_change' and tgenabled = 'O') then
    raise exception 'Realtime change signal trigger is disabled';
  end if;
end $$;

rollback;
select 'Dashboard, Nearby and private Shohoj Connect database assertions passed' as result;
