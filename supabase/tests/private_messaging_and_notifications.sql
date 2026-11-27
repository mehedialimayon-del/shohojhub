begin;
insert into auth.users(id) values ('61000000-0000-4000-8000-000000000001'), ('61000000-0000-4000-8000-000000000002'), ('61000000-0000-4000-8000-000000000003');
select set_config('request.jwt.claims', '{"sub":"61000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
set local role authenticated;
do $$ begin
  begin
    perform public.send_message('61000000-0000-4000-8000-000000000002', 'QA message', gen_random_uuid());
    raise exception 'Disabled messaging accepted send';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
update public.system_modules set enabled = true where module_key in ('messaging', 'notifications');
set local role authenticated;
do $$
declare
  recipient constant uuid := '61000000-0000-4000-8000-000000000002';
  request_id constant uuid := gen_random_uuid();
  message uuid;
begin
  message := public.send_message(recipient, 'QA message', request_id);
  if message is null or message is distinct from public.send_message(recipient, 'QA message', request_id) then
    raise exception 'Message send or retry failed';
  end if;
  if not exists (select from public.messages where id = message) or exists (select from public.notifications) then
    raise exception 'Sender permissions incorrect';
  end if;
  if public.mark_message_read(message) then raise exception 'Sender marked recipient message as read'; end if;
  perform public.set_message_block(recipient, true);
  begin
    perform public.send_message(recipient, 'QA blocked message', gen_random_uuid());
    raise exception 'Sender can message blocked recipient';
  exception when insufficient_privilege then null;
  end;
end $$;
select set_config('request.jwt.claims', '{"sub":"61000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
do $$
declare
  sender constant uuid := '61000000-0000-4000-8000-000000000001';
  message uuid;
begin
  select id into strict message from public.messages;
  if (select count(*) from public.notifications where message_id = message) <> 1 then raise exception 'Recipient must get one notification'; end if;
  if not public.mark_message_read(message) then raise exception 'Recipient could not mark message read'; end if;
  if not exists (select from public.notifications where message_id = message and read_at is not null) then raise exception 'Recipient notification stayed unread'; end if;
  begin
    perform public.send_message(sender, 'QA blocked reply', gen_random_uuid());
    raise exception 'Block did not apply in reverse';
  exception when insufficient_privilege then null;
  end;
end $$;
select set_config('request.jwt.claims', '{"sub":"61000000-0000-4000-8000-000000000003","role":"authenticated"}', true);
do $$ begin
  if exists (select from public.messages) or exists (select from public.notifications) or exists (select from public.user_blocks) then
    raise exception 'Messaging records visible to outsider';
  end if;
  if has_table_privilege('public.messages','INSERT,UPDATE,DELETE') or has_table_privilege('public.notifications','INSERT,UPDATE,DELETE') then
    raise exception 'Direct message or notification write';
  end if;
end $$;
reset role;
do $$ begin
  if (select count(*) from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public'
    and tablename in ('messages', 'notifications')) <> 2 then raise exception 'Realtime publication is incomplete'; end if;
end $$;
rollback;
select 'messaging and notification assertions passed' as result;
