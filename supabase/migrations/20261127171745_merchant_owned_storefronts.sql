create function shohojhub_private.owned_storefronts()
returns table(id uuid, name text)
language sql stable security definer set search_path = ''
as $$
  select s.id, s.name from public.shops s
  where s.owner_id = (select auth.uid())
    and (select shohojhub_private.active_role()) = 'merchant'
    and exists (select from public.system_modules where module_key = 'storefront' and enabled)
  order by s.name, s.id
$$;

create function public.owned_storefronts()
returns table(id uuid, name text)
language sql stable security invoker set search_path = ''
as $$ select * from shohojhub_private.owned_storefronts() $$;

revoke all on function public.owned_storefronts(), shohojhub_private.owned_storefronts()
from public, anon, authenticated, service_role;
grant execute on function public.owned_storefronts(), shohojhub_private.owned_storefronts() to authenticated;
