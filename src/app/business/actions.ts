'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

function destination(form: FormData) {
  const shop = String(form.get('shop'));
  if (!uuid.test(shop)) redirect('/business');
  return { shop, path: '/business?shop=' + shop };
}

export async function restock(form: FormData) {
  const { path } = destination(form);
  const product = String(form.get('product'));
  const request = String(form.get('request'));
  const quantity = Number(form.get('quantity'));
  if (!uuid.test(product) || !uuid.test(request) || !Number.isInteger(quantity) || quantity < 1 || quantity > 100000) {
    redirect(path + '&status=invalid');
  }
  const db = await createClient();
  const { error } = await db.rpc('adjust_stock', { target_product: product, delta: quantity, idempotency_key: request });
  redirect(path + (error ? '&status=failed' : '&status=stock'));
}

export async function issueMemo(form: FormData) {
  const { shop, path } = destination(form);
  const request = String(form.get('request'));
  const payment = String(form.get('payment'));
  const discount = Number(form.get('discount'));
  const fields = Array.from(form.entries()).filter(([key, value]) => key.startsWith('qty-') && value !== '' && value !== '0');
  const products = fields.map(([key, value]) => ({ product_id: key.slice(4), quantity: Number(value) }));
  if (!uuid.test(request) || !['cash', 'bank', 'mobile', 'credit'].includes(payment) ||
    !Number.isSafeInteger(discount) || discount < 0 || !products.length || products.length > 100 ||
    products.some(({ product_id, quantity }) => !uuid.test(product_id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 100000)) {
    redirect(path + '&status=invalid');
  }
  const db = await createClient();
  const { data, error } = await db.rpc('issue_cash_memo', {
    target_shop: shop, idempotency_key: request, products, discount, payment,
  });
  redirect(error || !data ? path + '&status=failed' : path + '&memo=' + encodeURIComponent(data));
}
