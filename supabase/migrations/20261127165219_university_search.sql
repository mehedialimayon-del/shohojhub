create function public.search_universities(search_term text, page_offset integer default 0)
returns table (id uuid, name_bn text, name_en text, district text, category text)
language sql stable security invoker set search_path = ''
as $$
  select u.id, u.name_bn, u.name_en, u.district, u.category
  from public.universities u
  where char_length(btrim(search_term)) between 2 and 80
    and page_offset between 0 and 500
    and (
      strpos(lower(u.name_bn), lower(btrim(search_term))) > 0
      or strpos(lower(u.name_en), lower(btrim(search_term))) > 0
      or strpos(lower(u.district), lower(btrim(search_term))) > 0
    )
  order by u.name_en, u.id
  limit 21 offset greatest(coalesce(page_offset, 0), 0)
$$;
revoke all on function public.search_universities(text, integer) from public, anon, authenticated, service_role;
grant execute on function public.search_universities(text, integer) to anon, authenticated;
