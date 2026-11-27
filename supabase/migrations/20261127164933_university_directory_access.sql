do $$
begin
  if exists (
    select from pg_proc
    where oid = to_regprocedure('public.rls_auto_enable()')
      and prorettype = 'event_trigger'::regtype
  ) then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;

insert into public.system_modules (module_key) values ('universities');

create table public.universities (
  id uuid primary key default gen_random_uuid(),
  name_bn text not null check (btrim(name_bn) <> ''),
  name_en text not null check (btrim(name_en) <> ''),
  category text not null check (btrim(category) <> ''),
  district text not null check (btrim(district) <> ''),
  official_url text not null unique check (official_url ~ '^https://[^[:space:]]+$'),
  source_url text not null check (source_url ~ '^https://[^[:space:]]+$'),
  verified_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  check (published_at is null or (verified_at is not null and published_at >= verified_at))
);

create table public.university_bookmarks (
  user_id uuid not null references public.profiles (id) on delete cascade,
  university_id uuid not null references public.universities (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, university_id)
);

create index university_bookmarks_university_id_idx on public.university_bookmarks (university_id);
alter table public.universities enable row level security;
alter table public.university_bookmarks enable row level security;
revoke all on public.universities, public.university_bookmarks from public, anon, authenticated, service_role;
grant select on public.universities to anon, authenticated;
grant select, delete on public.university_bookmarks to authenticated;
grant insert (user_id, university_id) on public.university_bookmarks to authenticated;
grant select, insert, update, delete on public.universities to service_role;

create policy verified_university_read on public.universities for select to anon, authenticated
using (
  published_at <= now()
  and exists (select from public.system_modules where module_key = 'universities' and enabled)
);

create policy own_bookmark_read on public.university_bookmarks for select to authenticated
using (
  user_id = (select auth.uid())
  and (select shohojhub_private.active_role()) is not null
  and exists (select from public.universities where id = university_id)
);

create policy own_bookmark_insert on public.university_bookmarks for insert to authenticated
with check (
  user_id = (select auth.uid())
  and (select shohojhub_private.active_role()) is not null
  and exists (select from public.universities where id = university_id)
);

create policy own_bookmark_delete on public.university_bookmarks for delete to authenticated
using (user_id = (select auth.uid()) and (select shohojhub_private.active_role()) is not null);
