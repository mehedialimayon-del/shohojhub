begin;
insert into auth.users (id) values ('40000000-0000-4000-8000-000000000001'), ('40000000-0000-4000-8000-000000000002');
update public.profiles set role = 'merchant' where id::text like '40000000-%';
insert into public.shops (id, owner_id, name, district, area, published_at)
values ('41000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'Temporary QA shop', 'Dhaka', 'QA', now());
insert into public.shop_products (id, shop_id, name, price_paisa)
values ('42000000-0000-4000-8000-000000000001', '41000000-0000-4000-8000-000000000001', 'Temporary QA item', 5000);
select set_config('request.jwt.claims', '{"sub":"40000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
set local role authenticated;
do $$ begin
  begin
    perform public.adjust_stock('42000000-0000-4000-8000-000000000001', 10, gen_random_uuid());
    raise exception 'Disabled storefront permitted stock adjustment';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
update public.system_modules set enabled = true where module_key in ('storefront', 'cash_memos');
set local role anon;
do $$ begin
  if not exists (select id from public.shops where id = '41000000-0000-4000-8000-000000000001') then raise exception 'Published shop missing'; end if;
  if has_column_privilege('public.shops','owner_id','SELECT')
    or has_table_privilege('public.product_stock','SELECT')
    or has_function_privilege('public.adjust_stock(uuid, integer, uuid)','EXECUTE') then
    raise exception 'Anonymous access to private inventory or ownership';
  end if;
end $$;
reset role;
set local role authenticated;
do $$
declare
  product constant uuid := '42000000-0000-4000-8000-000000000001';
  shop constant uuid := '41000000-0000-4000-8000-000000000001';
  adjustment_key constant uuid := gen_random_uuid();
  memo_key constant uuid := gen_random_uuid();
  lines constant jsonb := '[{"product_id":"42000000-0000-4000-8000-000000000001","quantity":2,"unit_price_paisa":1}]';
  memo uuid;
begin
  if public.adjust_stock(product, 10, adjustment_key) <> 10 then raise exception 'Restock failed'; end if;
  if public.adjust_stock(product, 10, adjustment_key) <> 10 then raise exception 'Restock retry duplicated stock'; end if;
  begin
    perform public.adjust_stock(product, -11, gen_random_uuid());
    raise exception 'Negative stock adjustment accepted';
  exception when invalid_parameter_value then null;
  end;
  if has_table_privilege('public.product_stock','INSERT,UPDATE,DELETE')
    or has_table_privilege('public.cash_memos','INSERT,UPDATE,DELETE') then
    raise exception 'Direct writes can bypass inventory rules';
  end if;
  memo := public.issue_cash_memo(shop, memo_key, lines, 1000, 'cash');
  if memo is null or memo is distinct from public.issue_cash_memo(shop, memo_key, lines, 1000, 'cash') then
    raise exception 'Cash memo retry returned a different ID';
  end if;
  if (select total_paisa from public.cash_memos where id = memo) is distinct from 9000::bigint then
    raise exception 'Incorrect cash memo total';
  end if;
  if (select unit_price_paisa from public.cash_memo_items where memo_id = memo) is distinct from 5000 then
    raise exception 'Database did not price the cash memo';
  end if;
  begin
    perform public.issue_cash_memo(shop, memo_key, lines, 2000, 'cash');
    raise exception 'Idempotency key accepted modified input';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.issue_cash_memo(shop, gen_random_uuid(), lines, 20000, 'cash');
    raise exception 'Cash memo accepted excessive discount';
  exception when invalid_parameter_value then null;
  end;
  if (select quantity from public.product_stock where product_id = product) is distinct from 8 then
    raise exception 'Stock changed on retry or failed sale';
  end if;
  if (select count(*) from public.inventory_transactions where product_id = product) <> 2 then
    raise exception 'Unexpected inventory transaction count';
  end if;
end $$;
select set_config('request.jwt.claims', '{"sub":"40000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
do $$ begin
  if exists (select from public.cash_memos) or exists (select from public.product_stock) then raise exception 'Merchant data leaked'; end if;
  begin
    perform public.adjust_stock('42000000-0000-4000-8000-000000000001', 1, gen_random_uuid());
    raise exception 'Non-owner adjusted inventory';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
select 'merchant inventory and cash memo assertions passed' as result;
