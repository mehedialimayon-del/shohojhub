create table public.posts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles(id) on delete restrict,
  category text not null check (category in ('jobs','tuition','products','services','rentals','education','study_abroad','deals')),
  title text not null check (char_length(btrim(title)) between 5 and 140),
  body text not null check (char_length(btrim(body)) between 20 and 4000),
  division text not null check (char_length(btrim(division)) between 1 and 80),
  district text not null check (char_length(btrim(district)) between 1 and 80),
  area text check (area is null or char_length(btrim(area)) <= 100),
  price_min_paisa bigint check (price_min_paisa is null or price_min_paisa >= 0),
  price_max_paisa bigint check (price_max_paisa is null or price_max_paisa >= 0),
  post_type text not null default 'personal' check (post_type in ('personal','business','sponsored')),
  contact_name text not null check (char_length(btrim(contact_name)) between 2 and 100),
  status text not null default 'pending' check (status in ('pending','published','rejected','archived')),
  created_at timestamptz not null default now(),
  published_at timestamptz,
  search_document tsvector generated always as (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(body,''))) stored,
  check (price_min_paisa is null or price_max_paisa is null or price_min_paisa <= price_max_paisa),
  check ((status = 'published' and published_at is not null) or status <> 'published')
);

create index posts_public_feed_idx on public.posts (published_at desc, id desc) where status = 'published';
create index posts_owner_created_idx on public.posts (owner_id, created_at desc);
create index posts_search_idx on public.posts using gin (search_document);

alter table public.posts enable row level security;
revoke all on public.posts from public, anon, authenticated, service_role;
grant select (id, category, title, body, division, district, area, price_min_paisa, price_max_paisa, post_type, contact_name, status, search_document, created_at, published_at)
  on public.posts to anon, authenticated;
grant insert (category, title, body, division, district, area, price_min_paisa, price_max_paisa, post_type, contact_name)
  on public.posts to authenticated;
grant delete on public.posts to authenticated;
grant select, insert, update, delete on public.posts to service_role;

create policy published_posts_read on public.posts for select to anon, authenticated
using (status = 'published' and published_at <= now());

create policy owner_posts_read on public.posts for select to authenticated
using (owner_id = (select auth.uid()));

create policy active_member_create_pending_post on public.posts for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and status = 'pending'
  and post_type in ('personal','business')
  and (select shohojhub_private.active_role()) is not null
);

create policy owner_delete_pending_post on public.posts for delete to authenticated
using (owner_id = (select auth.uid()) and status = 'pending');
