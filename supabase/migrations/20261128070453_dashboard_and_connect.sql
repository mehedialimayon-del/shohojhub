-- Division and district names from https://bangladesh.gov.bd/views/district-list.
create table public.bd_districts (
  id text primary key,
  division text not null,
  district text not null unique
);

insert into public.bd_districts (id, division, district) values
  ('dhaka','ঢাকা','ঢাকা'), ('faridpur','ঢাকা','ফরিদপুর'), ('gazipur','ঢাকা','গাজীপুর'),
  ('gopalganj','ঢাকা','গোপালগঞ্জ'), ('kishoreganj','ঢাকা','কিশোরগঞ্জ'), ('madaripur','ঢাকা','মাদারীপুর'),
  ('manikganj','ঢাকা','মানিকগঞ্জ'), ('munshiganj','ঢাকা','মুন্সীগঞ্জ'), ('narayanganj','ঢাকা','নারায়ণগঞ্জ'),
  ('narsingdi','ঢাকা','নরসিংদী'), ('rajbari','ঢাকা','রাজবাড়ী'), ('shariatpur','ঢাকা','শরীয়তপুর'),
  ('tangail','ঢাকা','টাঙ্গাইল'),
  ('bagerhat','খুলনা','বাগেরহাট'), ('chuadanga','খুলনা','চুয়াডাঙ্গা'), ('jashore','খুলনা','যশোর'),
  ('jhenaidah','খুলনা','ঝিনাইদহ'), ('khulna','খুলনা','খুলনা'), ('kushtia','খুলনা','কুষ্টিয়া'),
  ('magura','খুলনা','মাগুরা'), ('meherpur','খুলনা','মেহেরপুর'), ('narail','খুলনা','নড়াইল'), ('satkhira','খুলনা','সাতক্ষীরা'),
  ('bandarban','চট্টগ্রাম','বান্দরবান'), ('brahmanbaria','চট্টগ্রাম','ব্রাহ্মণবাড়িয়া'),
  ('chandpur','চট্টগ্রাম','চাঁদপুর'), ('chattogram','চট্টগ্রাম','চট্টগ্রাম'), ('comilla','চট্টগ্রাম','কুমিল্লা'),
  ('coxsbazar','চট্টগ্রাম','কক্সবাজার'), ('feni','চট্টগ্রাম','ফেনী'), ('khagrachhari','চট্টগ্রাম','খাগড়াছড়ি'),
  ('lakshmipur','চট্টগ্রাম','লক্ষ্মীপুর'), ('noakhali','চট্টগ্রাম','নোয়াখালী'), ('rangamati','চট্টগ্রাম','রাঙ্গামাটি'),
  ('bogra','রাজশাহী','বগুড়া'), ('joypurhat','রাজশাহী','জয়পুরহাট'), ('naogaon','রাজশাহী','নওগাঁ'),
  ('natore','রাজশাহী','নাটোর'), ('chapainawabganj','রাজশাহী','চাঁপাইনবাবগঞ্জ'), ('pabna','রাজশাহী','পাবনা'),
  ('rajshahi','রাজশাহী','রাজশাহী'), ('sirajganj','রাজশাহী','সিরাজগঞ্জ'),
  ('habiganj','সিলেট','হবিগঞ্জ'), ('moulvibazar','সিলেট','মৌলভীবাজার'),
  ('sunamganj','সিলেট','সুনামগঞ্জ'), ('sylhet','সিলেট','সিলেট'),
  ('dinajpur','রংপুর','দিনাজপুর'), ('gaibandha','রংপুর','গাইবান্ধা'), ('kurigram','রংপুর','কুড়িগ্রাম'),
  ('lalmonirhat','রংপুর','লালমনিরহাট'), ('nilphamari','রংপুর','নীলফামারী'), ('panchagarh','রংপুর','পঞ্চগড়'),
  ('rangpur','রংপুর','রংপুর'), ('thakurgaon','রংপুর','ঠাকুরগাঁও'),
  ('jamalpur','ময়মনসিংহ','জামালপুর'), ('mymensingh','ময়মনসিংহ','ময়মনসিংহ'),
  ('netrokona','ময়মনসিংহ','নেত্রকোণা'), ('sherpur','ময়মনসিংহ','শেরপুর'),
  ('barguna','বরিশাল','বরগুনা'), ('barisal','বরিশাল','বরিশাল'), ('bhola','বরিশাল','ভোলা'),
  ('jhalakathi','বরিশাল','ঝালকাঠি'), ('patuakhali','বরিশাল','পটুয়াখালী'), ('pirojpur','বরিশাল','পিরোজপুর');

alter table public.bd_districts enable row level security;
revoke all on public.bd_districts from public, anon, authenticated, service_role;
grant select on public.bd_districts to anon, authenticated, service_role;
create policy read_verified_districts on public.bd_districts for select to anon, authenticated using (true);

create table public.member_preferences (
  user_id uuid primary key default auth.uid() references public.profiles(id) on delete cascade,
  preferred_role text not null check (preferred_role in ('member','merchant','tutor','guardian')),
  district_id text references public.bd_districts(id),
  district_consent_at timestamptz,
  updated_at timestamptz not null default now(),
  check ((district_id is null) = (district_consent_at is null))
);

alter table public.member_preferences enable row level security;
revoke all on public.member_preferences from public, anon, authenticated, service_role;
grant select on public.member_preferences to authenticated;
create policy member_reads_own_preferences on public.member_preferences for select to authenticated
using (user_id = (select auth.uid()) and (select shohojhub_private.active_role()) is not null);

create function shohojhub_private.save_member_preferences(choice text, district text, consent boolean)
returns boolean language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid();
begin
  if actor is null or shohojhub_private.active_role() is null
    or choice is null or choice not in ('member','merchant','tutor','guardian')
    or (district is not null and (consent is distinct from true
      or not exists (select from public.bd_districts d where d.id = save_member_preferences.district)))
  then return false; end if;

  insert into public.member_preferences (user_id, preferred_role, district_id, district_consent_at)
  values (actor, choice, district, case when district is not null then now() end)
  on conflict (user_id) do update set
    preferred_role = excluded.preferred_role, district_id = excluded.district_id,
    district_consent_at = excluded.district_consent_at, updated_at = now();
  return true;
end;
$$;

create function public.save_member_preferences(choice text, district text, consent boolean)
returns boolean language sql set search_path = ''
as $$ select shohojhub_private.save_member_preferences(choice, district, consent) $$;

create function shohojhub_private.connect_available()
returns boolean language sql stable set search_path = ''
as $$
  select (select shohojhub_private.active_role()) is not null
    and exists (select from public.system_modules where module_key = 'messaging' and enabled)
$$;

create function shohojhub_private.post_message_peer(target_post uuid)
returns uuid language sql stable security definer set search_path = '' as $$
  select p.owner_id from public.posts p join public.profiles o on o.id = p.owner_id
  where p.id = target_post and p.owner_id <> (select auth.uid()) and o.suspended_at is null
    and p.status = 'published' and p.published_at <= now() and (p.expires_at is null or p.expires_at > now())
    and shohojhub_private.connect_available()
    and not exists (select from public.user_blocks where (user_id, blocked_user_id)
      in (((select auth.uid()),p.owner_id),(p.owner_id,(select auth.uid()))))
$$;

create function public.post_message_peer(target_post uuid)
returns uuid language sql stable set search_path = ''
as $$ select shohojhub_private.post_message_peer(target_post) $$;

create function shohojhub_private.connect_inbox(page_offset integer)
returns table(peer_id uuid, peer_name text, latest_message text, latest_at timestamptz, unread bigint)
language sql stable security definer set search_path = '' as $$
  with related as (
    select m.*, m.recipient_id as other from public.messages m where m.sender_id = (select auth.uid())
    union all
    select m.*, m.sender_id as other from public.messages m where m.recipient_id = (select auth.uid())
  ), newest as (
    select distinct on (other) other,id,body,created_at from related
    order by other,created_at desc,id desc
  ), pending as (
    select other,count(*) as unread from related where recipient_id = (select auth.uid()) and read_at is null group by other
  )
  select n.other, nullif(p.display_name,''), n.body, n.created_at, coalesce(c.unread,0)
  from newest n left join pending c on c.other = n.other join public.profiles p on p.id = n.other
  where shohojhub_private.connect_available() and page_offset between 0 and 500
  order by n.created_at desc,n.id desc limit 21 offset greatest(page_offset,0)
$$;

create function public.connect_inbox(page_offset integer default 0)
returns table(peer_id uuid, peer_name text, latest_message text, latest_at timestamptz, unread bigint)
language sql stable set search_path = ''
as $$ select * from shohojhub_private.connect_inbox(page_offset) $$;

create function shohojhub_private.read_conversation(peer uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not shohojhub_private.connect_available() then return; end if;
  with marked as (
    update public.messages set read_at = now()
    where recipient_id = (select auth.uid()) and sender_id = peer and read_at is null returning id
  )
  update public.notifications set read_at = now()
  where user_id = (select auth.uid()) and read_at is null and message_id in (select id from marked);
end;
$$;

create function public.read_conversation(peer uuid)
returns void language sql set search_path = ''
as $$ select shohojhub_private.read_conversation(peer) $$;

create table public.message_reports (
  reporter_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  message_id uuid not null references public.messages(id) on delete cascade,
  reason text not null check (char_length(btrim(reason)) between 8 and 300),
  created_at timestamptz not null default now(),
  primary key(reporter_id,message_id)
);

alter table public.message_reports enable row level security;
revoke all on public.message_reports from public, anon, authenticated, service_role;
grant insert (message_id, reason) on public.message_reports to authenticated;
grant select on public.message_reports to authenticated;
create policy participant_reports_received_messages on public.message_reports for insert to authenticated
with check (reporter_id = (select auth.uid()) and exists (
  select from public.messages m where m.id = message_id and m.recipient_id = (select auth.uid())
));
create policy moderator_reads_message_reports on public.message_reports for select to authenticated
using ((select shohojhub_private.active_role()) in ('admin','founder'));

revoke all on function shohojhub_private.save_member_preferences(text,text,boolean),
  shohojhub_private.connect_available(), shohojhub_private.post_message_peer(uuid),
  shohojhub_private.connect_inbox(integer), shohojhub_private.read_conversation(uuid),
  public.save_member_preferences(text,text,boolean), public.post_message_peer(uuid),
  public.connect_inbox(integer), public.read_conversation(uuid) from public,anon,authenticated,service_role;
grant execute on function shohojhub_private.save_member_preferences(text,text,boolean),
  shohojhub_private.post_message_peer(uuid), shohojhub_private.connect_inbox(integer), shohojhub_private.read_conversation(uuid),
  public.save_member_preferences(text,text,boolean), public.post_message_peer(uuid),
  public.connect_inbox(integer), public.read_conversation(uuid) to authenticated;

create function public.search_hub(search_term text, page_offset integer default 0,
  result_kind text default null, result_district text default null)
returns table (kind text,id uuid,title text,secondary_title text,district text,category text)
language sql stable security invoker set search_path = ''
as $$
  with input as (
    select btrim(search_term) as term
    where char_length(btrim(search_term)) between 2 and 80 and page_offset between 0 and 500
  ), listings as (
    select 'university'::text as kind,u.id,u.name_bn as title,u.name_en as secondary_title,u.district,u.category
    from public.universities u cross join input i
    where strpos(lower(u.name_bn || ' ' || u.name_en || ' ' || u.district || ' ' || u.search_aliases), lower(i.term)) > 0
    union all
    select 'shop',s.id,s.name,s.area,s.district,'shop' from public.shops s cross join input i
    where s.published_at <= now() and exists (select from public.system_modules where module_key = 'storefront' and enabled)
      and strpos(lower(s.name || ' ' || s.area || ' ' || s.district || ' ' || s.search_aliases),lower(i.term)) > 0
    union all
    select 'product',p.id,p.name,s.name,s.district,'product'
    from public.shop_products p join public.shops s on s.id = p.shop_id cross join input i
    where s.published_at <= now() and p.available and exists (select from public.system_modules where module_key = 'storefront' and enabled)
      and strpos(lower(p.name || ' ' || p.search_aliases || ' ' || s.name || ' ' || s.district),lower(i.term)) > 0
    union all
    select 'post',p.id,p.title,p.division,p.district,p.category from public.posts p cross join input i
    where p.status = 'published' and p.published_at <= now() and (p.expires_at is null or p.expires_at > now())
      and p.search_document @@ websearch_to_tsquery('simple',i.term)
  )
  select l.* from listings l
  where (result_kind is null or l.kind = result_kind) and (result_district is null or l.district = result_district)
  order by l.title,l.kind,l.id limit 21 offset greatest(page_offset,0);
$$;

revoke all on function public.search_hub(text,integer,text,text) from public, anon, authenticated, service_role;
grant execute on function public.search_hub(text,integer,text,text) to anon, authenticated;

create table public.push_subscriptions (
  endpoint text primary key check (char_length(endpoint) between 20 and 2048),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  p256dh text not null check (p256dh ~ '^[A-Za-z0-9_-]{87}$'),
  auth text not null check (auth ~ '^[A-Za-z0-9_-]{22}$'),
  updated_at timestamptz not null default now()
);
create index push_subscriptions_user_idx on public.push_subscriptions(user_id,updated_at desc);
alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from public,anon,authenticated,service_role;
grant select, delete on public.push_subscriptions to authenticated, service_role;
grant insert (endpoint,p256dh,auth), update (endpoint,p256dh,auth,updated_at) on public.push_subscriptions to authenticated;
create policy manage_own_push_subscription on public.push_subscriptions for all to authenticated
using (user_id = (select auth.uid()) and (select shohojhub_private.active_role()) is not null)
with check (user_id = (select auth.uid()) and (select shohojhub_private.active_role()) is not null);

-- Broadcast a change signal over each participant's private Realtime topic.
-- The signal contains no message content. Pages still read through table RLS.
create policy private_shohoj_connect_events on realtime.messages for select to authenticated
using (extension = 'broadcast' and (select realtime.topic()) = 'shohojhub:account:' || (select auth.uid())::text);

create function shohojhub_private.signal_conversation_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform realtime.send('{}'::jsonb, 'conversation_changed', 'shohojhub:account:' || new.sender_id::text, true);
  perform realtime.send('{}'::jsonb, 'conversation_changed', 'shohojhub:account:' || new.recipient_id::text, true);
  return null;
end;
$$;

revoke all on function shohojhub_private.signal_conversation_change() from public, anon, authenticated, service_role;

create trigger shohojhub_signal_conversation_change
after insert or update of read_at on public.messages for each row
execute function shohojhub_private.signal_conversation_change();
