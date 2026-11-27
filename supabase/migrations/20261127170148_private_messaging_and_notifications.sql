insert into public.system_modules (module_key) values ('messaging'), ('notifications');

create table public.user_blocks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  blocked_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, blocked_user_id),
  check (user_id <> blocked_user_id)
);

create index user_blocks_target_idx on public.user_blocks(blocked_user_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  request_id uuid not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (sender_id, request_id),
  check (sender_id <> recipient_id)
);

create index messages_sender_time_idx on public.messages(sender_id, created_at desc);
create index messages_recipient_time_idx on public.messages(recipient_id, created_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  message_id uuid not null unique references public.messages(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_time_idx on public.notifications(user_id, created_at desc);

alter table public.user_blocks enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

revoke all on public.user_blocks, public.messages, public.notifications from public, anon, authenticated, service_role;
grant select on public.user_blocks, public.messages, public.notifications to authenticated, service_role;

create policy own_blocks on public.user_blocks for select to authenticated
using (user_id = (select auth.uid()) and (select shohojhub_private.active_role()) is not null);

create policy conversation_history on public.messages for select to authenticated
using (
  ((select auth.uid()) in (sender_id, recipient_id))
  and (select shohojhub_private.active_role()) is not null
  and exists (select from public.system_modules where module_key = 'messaging' and enabled)
);

create policy own_notifications on public.notifications for select to authenticated
using (
  user_id = (select auth.uid())
  and (select shohojhub_private.active_role()) is not null
  and exists (select from public.system_modules where module_key = 'notifications' and enabled)
);

create function shohojhub_private.lock_message_pair(first_user uuid, second_user uuid)
returns void language sql set search_path = ''
as $$
  select pg_advisory_xact_lock(hashtextextended(
    least(first_user, second_user)::text || ':' || greatest(first_user, second_user)::text, 0
  ))
$$;

create function shohojhub_private.set_message_block(other_user uuid, blocked boolean)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  actor uuid := auth.uid();
begin
  if actor is null or shohojhub_private.active_role() is null or other_user is null
    or other_user = actor or blocked is null
    or not exists (select from public.profiles where id = other_user) then
    raise exception 'Block request unavailable' using errcode = '42501';
  end if;
  perform shohojhub_private.lock_message_pair(actor, other_user);
  if blocked then
    insert into public.user_blocks(user_id, blocked_user_id) values (actor, other_user) on conflict do nothing;
  else
    delete from public.user_blocks where user_id = actor and blocked_user_id = other_user;
  end if;
end;
$$;

create function shohojhub_private.send_message(other_user uuid, message_body text, idempotency_key uuid)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  message uuid;
begin
  if actor is null or shohojhub_private.active_role() is null or other_user is null or other_user = actor
    or not exists (select from public.system_modules where module_key = 'messaging' and enabled)
    or not exists (select from public.profiles where id = other_user and suspended_at is null) then
    raise exception 'Message unavailable' using errcode = '42501';
  end if;
  if message_body is null or char_length(btrim(message_body)) not between 1 and 2000 or idempotency_key is null then
    raise exception 'Invalid message' using errcode = '22023';
  end if;
  perform shohojhub_private.lock_message_pair(actor, other_user);
  if exists (
    select from public.user_blocks where (user_id, blocked_user_id) in ((actor, other_user), (other_user, actor))
  ) then
    raise exception 'Message unavailable' using errcode = '42501';
  end if;
  insert into public.messages(sender_id, recipient_id, body, request_id)
  values (actor, other_user, btrim(message_body), idempotency_key)
  on conflict (sender_id, request_id) do nothing returning id into message;
  if message is null then
    select id into message from public.messages
    where sender_id = actor and recipient_id = other_user and body = btrim(message_body) and request_id = idempotency_key;
    if message is null then raise exception 'Idempotency key already used' using errcode = '22023'; end if;
  elsif exists (select from public.system_modules where module_key = 'notifications' and enabled) then
    insert into public.notifications(user_id, message_id) values (other_user, message);
  end if;
  return message;
end;
$$;

create function shohojhub_private.mark_message_read(target_message uuid)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare
  actor uuid := auth.uid();
begin
  if shohojhub_private.active_role() is null
    or not exists (select from public.system_modules where module_key = 'messaging' and enabled) then return false; end if;
  update public.messages set read_at = coalesce(read_at, now()) where id = target_message and recipient_id = actor;
  if not found then return false; end if;
  if exists (select from public.system_modules where module_key = 'notifications' and enabled) then
    update public.notifications set read_at = coalesce(read_at, now()) where message_id = target_message and user_id = actor;
  end if;
  return true;
end;
$$;

create function public.set_message_block(other_user uuid, blocked boolean)
returns void language sql set search_path = ''
as $$ select shohojhub_private.set_message_block(other_user, blocked) $$;

create function public.send_message(other_user uuid, message_body text, idempotency_key uuid)
returns uuid language sql set search_path = ''
as $$ select shohojhub_private.send_message(other_user, message_body, idempotency_key) $$;

create function public.mark_message_read(target_message uuid)
returns boolean language sql set search_path = ''
as $$ select shohojhub_private.mark_message_read(target_message) $$;

revoke all on function shohojhub_private.lock_message_pair(uuid, uuid),
  shohojhub_private.set_message_block(uuid, boolean), shohojhub_private.send_message(uuid, text, uuid),
  shohojhub_private.mark_message_read(uuid), public.set_message_block(uuid, boolean),
  public.send_message(uuid, text, uuid), public.mark_message_read(uuid) from public, anon, authenticated, service_role;
grant execute on function shohojhub_private.set_message_block(uuid, boolean), shohojhub_private.send_message(uuid, text, uuid),
  shohojhub_private.mark_message_read(uuid), public.set_message_block(uuid, boolean),
  public.send_message(uuid, text, uuid), public.mark_message_read(uuid) to authenticated;

alter publication supabase_realtime add table public.messages, public.notifications;
