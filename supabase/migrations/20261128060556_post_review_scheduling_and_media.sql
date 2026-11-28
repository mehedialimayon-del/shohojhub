alter table public.posts
  add column intent text not null default 'general' check (intent in ('general','need','offer')),
  add column expires_at timestamptz,
  add column has_photo boolean not null default false,
  add constraint posts_expiry_after_publication check (expires_at is null or published_at is null or expires_at > published_at);

grant select (intent, expires_at, has_photo) on public.posts to anon, authenticated;
grant insert (intent) on public.posts to authenticated;
grant update (intent, category, title, body, division, district, area, price_min_paisa, price_max_paisa, post_type, contact_name)
  on public.posts to authenticated;
revoke delete on public.posts from authenticated;
alter policy published_posts_read on public.posts
  using (status = 'published' and published_at <= now() and (expires_at is null or expires_at > now()));
alter policy owner_posts_read on public.posts
  using (owner_id = (select auth.uid()) and (select shohojhub_private.active_role()) is not null);
create policy edit_pending_post on public.posts for update to authenticated
  using (owner_id = (select auth.uid()) and status = 'pending' and (select shohojhub_private.active_role()) is not null)
  with check (owner_id = (select auth.uid()) and status = 'pending' and post_type in ('personal','business')
    and (select shohojhub_private.active_role()) is not null);
create policy moderator_posts_read on public.posts for select to authenticated
  using ((select shohojhub_private.active_role()) in ('admin','founder'));

create table public.post_reviews (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  reviewer_id uuid references public.profiles(id) on delete set null,
  decision text not null check (decision in ('publish','reject','close','revise')),
  created_at timestamptz not null default now()
);
create index post_reviews_post_idx on public.post_reviews(post_id);
alter table public.post_reviews enable row level security;
revoke all on public.post_reviews from public, anon, authenticated, service_role;
grant select on public.post_reviews to authenticated, service_role;
create policy moderator_post_reviews on public.post_reviews for select to authenticated
  using ((select shohojhub_private.active_role()) in ('admin','founder'));

create table public.post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  reporter_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  reason text not null check (char_length(btrim(reason)) between 8 and 300),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique (post_id, reporter_id)
);
create index post_reports_reporter_idx on public.post_reports(reporter_id);
alter table public.post_reports enable row level security;
revoke all on public.post_reports from public, anon, authenticated, service_role;
grant select (id, post_id, reason, created_at, resolved_at) on public.post_reports to authenticated;
grant insert (post_id, reason) on public.post_reports to authenticated;
grant update (resolved_at) on public.post_reports to authenticated;
create policy moderator_report_read on public.post_reports for select to authenticated
  using ((select shohojhub_private.active_role()) in ('admin','founder'));
create policy moderator_report_resolve on public.post_reports for update to authenticated
  using ((select shohojhub_private.active_role()) in ('admin','founder'))
  with check ((select shohojhub_private.active_role()) in ('admin','founder'));
create policy active_user_report on public.post_reports for insert to authenticated
  with check (reporter_id = (select auth.uid()) and (select shohojhub_private.active_role()) is not null
    and exists (select from public.posts p where p.id = post_id and p.status = 'published'
      and p.published_at <= now() and (p.expires_at is null or p.expires_at > now())));

create function shohojhub_private.current_user_posts()
returns table(id uuid, title text, status text, published_at timestamptz, expires_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select p.id,p.title,p.status,p.published_at,p.expires_at
  from public.posts p where p.owner_id = (select auth.uid()) and (select shohojhub_private.active_role()) is not null
  order by p.created_at desc limit 100
$$;

create function public.current_user_posts()
returns table(id uuid, title text, status text, published_at timestamptz, expires_at timestamptz)
language sql stable security invoker set search_path = ''
as $$ select * from shohojhub_private.current_user_posts() $$;

create function shohojhub_private.change_post_status(target uuid, action text, start_at timestamptz, end_at timestamptz)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  role_name text := shohojhub_private.active_role();
  entry public.posts%rowtype;
  start_time timestamptz := greatest(now(),coalesce(start_at,now()));
begin
  if actor is null or role_name is null then return false; end if;
  select * into entry from public.posts where id = target for update;
  if not found then return false; end if;

  if action = 'publish' and role_name in ('admin','founder') and entry.status = 'pending' then
    if end_at is not null and end_at <= start_time then return false; end if;
    update public.posts set status = 'published', published_at = start_time, expires_at = end_at where id = target;
  elsif action = 'reject' and role_name in ('admin','founder') and entry.status = 'pending' then
    update public.posts set status = 'rejected', published_at = null, expires_at = null where id = target;
  elsif action = 'close' and (entry.owner_id = actor or role_name in ('admin','founder')) and entry.status <> 'archived' then
    update public.posts set status = 'archived' where id = target;
  elsif action = 'revise' and entry.owner_id = actor and entry.status in ('published','rejected') then
    update public.posts set status = 'pending', published_at = null, expires_at = null where id = target;
  else
    return false;
  end if;
  insert into public.post_reviews(post_id,reviewer_id,decision) values(target,actor,action);
  return true;
end;
$$;

create function public.change_post_status(target uuid, action text, start_at timestamptz default null, end_at timestamptz default null)
returns boolean language sql security invoker set search_path = ''
as $$ select shohojhub_private.change_post_status(target,action,start_at,end_at) $$;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('feed-photos','feed-photos',false,4194304,array['image/jpeg','image/png','image/webp']);

create policy feed_photo_read on storage.objects for select to anon, authenticated
using (bucket_id = 'feed-photos' and exists (select from public.posts p where p.id::text = name));

create function shohojhub_private.can_edit_post_photo(object_name text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select from public.posts p where p.id::text = object_name and p.status = 'pending'
      and p.owner_id = (select auth.uid()) and (select shohojhub_private.active_role()) is not null
  )
$$;

create policy feed_photo_insert on storage.objects for insert to authenticated
with check (bucket_id = 'feed-photos' and shohojhub_private.can_edit_post_photo(name));
create policy feed_photo_update on storage.objects for update to authenticated
using (bucket_id = 'feed-photos' and shohojhub_private.can_edit_post_photo(name))
with check (bucket_id = 'feed-photos' and shohojhub_private.can_edit_post_photo(name));
create policy feed_photo_delete on storage.objects for delete to authenticated
using (bucket_id = 'feed-photos' and shohojhub_private.can_edit_post_photo(name));

create function shohojhub_private.sync_post_photo(target uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if not shohojhub_private.can_edit_post_photo(target::text) then return false; end if;
  update public.posts p set has_photo = exists (select from storage.objects
    where bucket_id = 'feed-photos' and name = target::text)
  where p.id = target and p.status = 'pending' and p.owner_id = auth.uid();
  return found;
end;
$$;

create function public.sync_post_photo(target uuid)
returns boolean language sql security invoker set search_path = ''
as $$ select shohojhub_private.sync_post_photo(target) $$;

revoke all on function public.current_user_posts(), shohojhub_private.current_user_posts(),
  public.change_post_status(uuid,text,timestamptz,timestamptz),
  shohojhub_private.change_post_status(uuid,text,timestamptz,timestamptz),
  shohojhub_private.can_edit_post_photo(text),public.sync_post_photo(uuid),shohojhub_private.sync_post_photo(uuid)
from public, anon, authenticated, service_role;
grant execute on function public.current_user_posts(), shohojhub_private.current_user_posts(),
  public.change_post_status(uuid,text,timestamptz,timestamptz),
  shohojhub_private.change_post_status(uuid,text,timestamptz,timestamptz),
  shohojhub_private.can_edit_post_photo(text),public.sync_post_photo(uuid),shohojhub_private.sync_post_photo(uuid)
to authenticated;
