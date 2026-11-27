alter table public.universities add column search_aliases text not null default '' check (char_length(search_aliases) <= 500);
alter table public.shops add column search_aliases text not null default '' check (char_length(search_aliases) <= 500);
alter table public.shop_products add column search_aliases text not null default '' check (char_length(search_aliases) <= 500);

grant select (search_aliases) on public.shops to anon, authenticated;

create function public.search_directory(search_term text, page_offset integer default 0)
returns table (
  kind text, id uuid, title text, secondary_title text, district text, category text
)
language sql stable security invoker set search_path = ''
as $$
  with input as (
    select lower(btrim(search_term)) as term
    where char_length(btrim(search_term)) between 2 and 80 and page_offset between 0 and 500
  ), storefront_enabled as (
    select from public.system_modules where module_key = 'storefront' and enabled
  ), matches as (
    select 'university'::text as kind, u.id, u.name_bn as title, u.name_en as secondary_title, u.district, u.category
      from public.universities u cross join input i
      where strpos(lower(u.name_bn || ' ' || u.name_en || ' ' || u.district || ' ' || u.search_aliases), i.term) > 0
    union all
    select 'shop', s.id, s.name, s.area, s.district, 'shop'
      from public.shops s cross join input i
      where s.published_at <= now() and exists (select from storefront_enabled)
        and strpos(lower(s.name || ' ' || s.area || ' ' || s.district || ' ' || s.search_aliases), i.term) > 0
    union all
    select 'product', p.id, p.name, s.name, s.district, 'product'
      from public.shop_products p join public.shops s on s.id = p.shop_id cross join input i
      where s.published_at <= now() and p.available and exists (select from storefront_enabled)
        and strpos(lower(p.name || ' ' || p.search_aliases || ' ' || s.name || ' ' || s.district), i.term) > 0
  )
  select m.kind, m.id, m.title, m.secondary_title, m.district, m.category
  from matches m
  order by m.title, m.kind, m.id
  limit 21 offset greatest(coalesce(page_offset, 0), 0)
$$;

revoke all on function public.search_directory(text, integer) from public, anon, authenticated, service_role;
grant execute on function public.search_directory(text, integer) to anon, authenticated;
