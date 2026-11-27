insert into public.system_modules (module_key) values ('storefront'), ('cash_memos');

create table public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  district text not null check (char_length(btrim(district)) between 1 and 80),
  area text not null check (char_length(btrim(area)) between 1 and 100),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.shop_products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 1 and 160),
  price_paisa integer not null check (price_paisa >= 0),
  available boolean not null default true,
  created_at timestamptz not null default now(),
  unique (shop_id, id)
);

create table public.product_stock (
  product_id uuid primary key references public.shop_products(id) on delete restrict,
  quantity integer not null default 0 check (quantity >= 0)
);

create table public.cash_memos (
  id uuid primary key default gen_random_uuid(),
  memo_number bigint generated always as identity unique,
  shop_id uuid not null references public.shops(id) on delete restrict,
  request_id uuid not null,
  payment_method text not null check (payment_method in ('cash','bank','mobile','credit')),
  subtotal_paisa bigint not null check (subtotal_paisa >= 0),
  discount_paisa bigint not null check (discount_paisa between 0 and subtotal_paisa),
  total_paisa bigint generated always as (subtotal_paisa - discount_paisa) stored,
  created_at timestamptz not null default now(),
  unique (shop_id, request_id)
);

create table public.cash_memo_items (
  memo_id uuid not null references public.cash_memos(id) on delete restrict,
  product_id uuid not null references public.shop_products(id) on delete restrict,
  product_name text not null,
  quantity integer not null check (quantity between 1 and 100000),
  unit_price_paisa integer not null check (unit_price_paisa >= 0),
  primary key (memo_id, product_id)
);

create table public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.shop_products(id) on delete restrict,
  memo_id uuid references public.cash_memos(id) on delete restrict,
  quantity_change integer not null check (quantity_change <> 0),
  request_id uuid,
  created_at timestamptz not null default now(),
  check ((memo_id is null and request_id is not null) or (memo_id is not null and request_id is null and quantity_change < 0)),
  unique (product_id, request_id),
  unique (product_id, memo_id)
);

create index shops_owner_idx on public.shops(owner_id);
create index cash_memo_items_product_idx on public.cash_memo_items(product_id);
create index inventory_transactions_memo_idx on public.inventory_transactions(memo_id);

alter table public.shops enable row level security;
alter table public.shop_products enable row level security;
alter table public.product_stock enable row level security;
alter table public.cash_memos enable row level security;
alter table public.cash_memo_items enable row level security;
alter table public.inventory_transactions enable row level security;

revoke all on public.shops, public.shop_products, public.product_stock, public.cash_memos,
  public.cash_memo_items, public.inventory_transactions from public, anon, authenticated, service_role;
revoke all on sequence public.cash_memos_memo_number_seq from public, anon, authenticated, service_role;
grant select (id, name, district, area, published_at) on public.shops to anon, authenticated;
grant select on public.shop_products to anon, authenticated;
grant select on public.product_stock, public.cash_memos, public.cash_memo_items, public.inventory_transactions to authenticated;
grant select on public.shops, public.shop_products, public.product_stock, public.cash_memos, public.cash_memo_items,
  public.inventory_transactions to service_role;
grant insert, update on public.shops, public.shop_products to service_role;

create function shohojhub_private.merchant_owns_shop(target_shop uuid, module text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select shohojhub_private.active_role()) = 'merchant'
    and exists (select from public.shops where id = target_shop and owner_id = (select auth.uid()))
    and exists (select from public.system_modules where module_key = module and enabled)
$$;

create policy visible_shop on public.shops for select to anon, authenticated
using (
  published_at <= now()
  and exists (select from public.system_modules where module_key = 'storefront' and enabled)
);

create policy merchant_shop on public.shops for select to authenticated
using (shohojhub_private.merchant_owns_shop(id, 'storefront'));

create policy visible_product on public.shop_products for select to anon, authenticated
using (available and exists (select from public.shops where id = shop_id and published_at <= now()));

create policy merchant_product on public.shop_products for select to authenticated
using (shohojhub_private.merchant_owns_shop(shop_id, 'storefront'));

create policy merchant_stock on public.product_stock for select to authenticated
using (exists (select from public.shop_products p where p.id = product_id and shohojhub_private.merchant_owns_shop(p.shop_id, 'storefront')));

create policy merchant_inventory on public.inventory_transactions for select to authenticated
using (exists (select from public.shop_products p where p.id = product_id and shohojhub_private.merchant_owns_shop(p.shop_id, 'storefront')));

create policy merchant_memos on public.cash_memos for select to authenticated
using (shohojhub_private.merchant_owns_shop(shop_id, 'cash_memos'));

create policy merchant_memo_items on public.cash_memo_items for select to authenticated
using (exists (select from public.cash_memos m where m.id = memo_id));

create function shohojhub_private.adjust_stock(target_product uuid, delta integer, idempotency_key uuid)
returns integer language plpgsql security definer set search_path = ''
as $$
declare
  target_shop uuid;
  previous_delta integer;
  remaining integer;
begin
  select shop_id into target_shop from public.shop_products where id = target_product for update;
  if target_shop is null or shohojhub_private.merchant_owns_shop(target_shop, 'storefront') is distinct from true then
    raise exception 'Stock adjustment forbidden' using errcode = '42501';
  end if;
  if delta is null or delta = 0 or idempotency_key is null then
    raise exception 'Invalid stock adjustment' using errcode = '22023';
  end if;
  insert into public.product_stock (product_id) values (target_product) on conflict do nothing;
  select quantity_change into previous_delta from public.inventory_transactions
    where product_id = target_product and request_id = idempotency_key;
  if found then
    if previous_delta <> delta then raise exception 'Idempotency key already used' using errcode = '22023'; end if;
    select quantity into remaining from public.product_stock where product_id = target_product;
    return remaining;
  end if;
  update public.product_stock set quantity = quantity + delta
    where product_id = target_product and quantity::bigint + delta between 0 and 2147483647
    returning quantity into remaining;
  if not found then raise exception 'Invalid stock balance' using errcode = '22023'; end if;
  insert into public.inventory_transactions (product_id, quantity_change, request_id)
  values (target_product, delta, idempotency_key);
  return remaining;
end;
$$;

create function shohojhub_private.issue_cash_memo(
  target_shop uuid, idempotency_key uuid, products jsonb, discount bigint, payment text
)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  product record;
  memo uuid;
  request_lines jsonb;
  priced_lines jsonb := '[]'::jsonb;
  subtotal bigint := 0;
begin
  if shohojhub_private.merchant_owns_shop(target_shop, 'cash_memos') is distinct from true
    or shohojhub_private.merchant_owns_shop(target_shop, 'storefront') is distinct from true then
    raise exception 'Cash memo forbidden' using errcode = '42501';
  end if;
  if idempotency_key is null or discount is null or discount < 0
    or payment is null or payment not in ('cash','bank','mobile','credit')
    or jsonb_typeof(products) is distinct from 'array' then
    raise exception 'Invalid cash memo' using errcode = '22023';
  end if;
  if jsonb_array_length(products) not between 1 and 100 then
    raise exception 'Invalid number of memo items' using errcode = '22023';
  end if;
  select jsonb_agg(jsonb_build_object('product_id', item.product_id, 'quantity', item.quantity) order by item.product_id)
    into request_lines
    from jsonb_to_recordset(products) as item(product_id uuid, quantity integer)
    having count(*) = count(distinct item.product_id) and bool_and(coalesce(item.quantity between 1 and 100000, false));
  if request_lines is null then raise exception 'Invalid memo items' using errcode = '22023'; end if;

  perform from public.shops where id = target_shop for update;
  if shohojhub_private.merchant_owns_shop(target_shop, 'cash_memos') is distinct from true
    or shohojhub_private.merchant_owns_shop(target_shop, 'storefront') is distinct from true then
    raise exception 'Cash memo forbidden' using errcode = '42501';
  end if;
  select id into memo from public.cash_memos where shop_id = target_shop and request_id = idempotency_key;
  if found then
    if exists (select from public.cash_memos where id = memo and discount_paisa = discount and payment_method = payment)
      and request_lines = (
        select jsonb_agg(jsonb_build_object('product_id', i.product_id, 'quantity', i.quantity) order by i.product_id)
        from public.cash_memo_items i where i.memo_id = memo
      ) then return memo;
    end if;
    raise exception 'Idempotency key already used' using errcode = '22023';
  end if;

  for product in
    select p.id, p.name, p.price_paisa, item.quantity
    from jsonb_to_recordset(request_lines) as item(product_id uuid, quantity integer)
    join public.shop_products p on p.id = item.product_id
    where p.shop_id = target_shop and p.available
    order by p.id for update of p
  loop
    update public.product_stock set quantity = quantity - product.quantity
      where product_id = product.id and quantity >= product.quantity;
    if not found then raise exception 'Insufficient stock' using errcode = '22023'; end if;
    subtotal := subtotal + product.price_paisa::bigint * product.quantity;
    priced_lines := priced_lines || jsonb_build_array(to_jsonb(product));
  end loop;
  if jsonb_array_length(priced_lines) <> jsonb_array_length(request_lines) or discount > subtotal then
    raise exception 'Invalid product or discount' using errcode = '22023';
  end if;

  insert into public.cash_memos (shop_id, request_id, payment_method, subtotal_paisa, discount_paisa)
  values (target_shop, idempotency_key, payment, subtotal, discount) returning id into memo;

  insert into public.cash_memo_items (memo_id, product_id, product_name, quantity, unit_price_paisa)
  select memo, item.id, item.name, item.quantity, item.price_paisa
  from jsonb_to_recordset(priced_lines) as item(id uuid, name text, quantity integer, price_paisa integer);

  insert into public.inventory_transactions (product_id, memo_id, quantity_change)
  select product_id, memo, -quantity from public.cash_memo_items where memo_id = memo;
  return memo;
end;
$$;

create function public.adjust_stock(target_product uuid, delta integer, idempotency_key uuid)
returns integer language sql security invoker set search_path = ''
as $$ select shohojhub_private.adjust_stock(target_product, delta, idempotency_key) $$;

create function public.issue_cash_memo(target_shop uuid, idempotency_key uuid, products jsonb, discount bigint, payment text)
returns uuid language sql security invoker set search_path = ''
as $$ select shohojhub_private.issue_cash_memo(target_shop, idempotency_key, products, discount, payment) $$;

grant usage on schema shohojhub_private to authenticated;
revoke all on function shohojhub_private.merchant_owns_shop(uuid, text), shohojhub_private.adjust_stock(uuid, integer, uuid),
  shohojhub_private.issue_cash_memo(uuid, uuid, jsonb, bigint, text), public.adjust_stock(uuid, integer, uuid),
  public.issue_cash_memo(uuid, uuid, jsonb, bigint, text) from public, anon, authenticated, service_role;
grant execute on function shohojhub_private.merchant_owns_shop(uuid, text), shohojhub_private.adjust_stock(uuid, integer, uuid),
  shohojhub_private.issue_cash_memo(uuid, uuid, jsonb, bigint, text), public.adjust_stock(uuid, integer, uuid),
  public.issue_cash_memo(uuid, uuid, jsonb, bigint, text) to authenticated;
