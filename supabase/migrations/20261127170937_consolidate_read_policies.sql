alter policy own_profile_read on public.profiles
using (id = (select auth.uid()) and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false));

alter policy enabled_module_read on public.system_modules to anon;
alter policy founder_module_read on public.system_modules
using (enabled or (select shohojhub_private.active_role()) = 'founder');

alter policy visible_shop on public.shops to anon;
alter policy merchant_shop on public.shops
using (
  shohojhub_private.merchant_owns_shop(id, 'storefront')
  or (published_at <= now()
    and exists (select from public.system_modules where module_key = 'storefront' and enabled))
);

alter policy visible_product on public.shop_products to anon;
alter policy merchant_product on public.shop_products
using (
  shohojhub_private.merchant_owns_shop(shop_id, 'storefront')
  or (available and exists (select from public.shops where id = shop_id and published_at <= now()))
);
