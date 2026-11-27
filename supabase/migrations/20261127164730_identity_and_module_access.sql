create schema shohojhub_private;
revoke all on schema shohojhub_private from public, anon, authenticated;

create type public.account_role as enum ('member', 'merchant', 'tutor', 'guardian', 'admin', 'founder');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 100),
  role public.account_role not null default 'member',
  suspended_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.system_modules (
  module_key text primary key check (module_key ~ '^[a-z][a-z0-9_]{0,62}$'),
  enabled boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  event text not null check (event in ('profile_access_updated', 'module_created', 'module_updated', 'module_deleted')),
  target_id text not null,
  created_at timestamptz not null default now()
);

create index audit_logs_actor_id_idx on public.audit_logs (actor_id);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

alter table public.profiles enable row level security;
alter table public.system_modules enable row level security;
alter table public.audit_logs enable row level security;

revoke all on public.profiles, public.system_modules, public.audit_logs from public, anon, authenticated, service_role;
grant select on public.profiles, public.system_modules, public.audit_logs to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant select on public.system_modules to anon;
grant select on public.profiles, public.system_modules, public.audit_logs to service_role;
grant update (role, suspended_at, verified_at) on public.profiles to service_role;
grant insert, update, delete on public.system_modules to service_role;

create function shohojhub_private.active_role()
returns public.account_role
language sql stable security definer set search_path = ''
as $$
  select role from public.profiles
  where id = (select auth.uid()) and suspended_at is null
    and not coalesce((auth.jwt()->>'is_anonymous')::boolean, false);
$$;

create policy own_profile_read on public.profiles for select to authenticated
using (id = (select auth.uid()) and not coalesce((auth.jwt()->>'is_anonymous')::boolean, false));

create policy own_active_profile_update on public.profiles for update to authenticated
using (id = (select auth.uid()) and (select shohojhub_private.active_role()) is not null)
with check (id = (select auth.uid()) and (select shohojhub_private.active_role()) is not null);

create policy enabled_module_read on public.system_modules for select to anon, authenticated
using (enabled);

create policy founder_module_read on public.system_modules for select to authenticated
using ((select shohojhub_private.active_role()) = 'founder');

create policy founder_audit_read on public.audit_logs for select to authenticated
using ((select shohojhub_private.active_role()) = 'founder');

create function shohojhub_private.create_profile()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger shohojhub_create_profile after insert on auth.users
for each row execute function shohojhub_private.create_profile();

create function shohojhub_private.record_access_change()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_table_name = 'profiles' then
    insert into public.audit_logs (actor_id, event, target_id)
    values (auth.uid(), 'profile_access_updated', new.id::text);
  elsif tg_op = 'DELETE' then
    insert into public.audit_logs (actor_id, event, target_id)
    values (auth.uid(), 'module_deleted', old.module_key);
  else
    insert into public.audit_logs (actor_id, event, target_id)
    values (auth.uid(), case tg_op when 'INSERT' then 'module_created' else 'module_updated' end, new.module_key);
  end if;
  return null;
end;
$$;

create trigger shohojhub_profile_access_audit
after update of role, suspended_at, verified_at on public.profiles
for each row when ((old.role, old.suspended_at, old.verified_at) is distinct from (new.role, new.suspended_at, new.verified_at))
execute function shohojhub_private.record_access_change();

create trigger shohojhub_module_access_audit
after insert or update or delete on public.system_modules
for each row execute function shohojhub_private.record_access_change();

revoke all on all functions in schema shohojhub_private from public, anon, authenticated, service_role;
grant execute on function shohojhub_private.active_role() to authenticated;
