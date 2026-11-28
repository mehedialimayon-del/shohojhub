import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { issueMemo, restock } from './actions';
import PrintMemo from './PrintMemo';

export const dynamic = 'force-dynamic';

type Shop = { id: string; name: string };

const taka = new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' });
const money = (paisa: number) => taka.format(paisa / 100);

export default async function BusinessPage({ searchParams }: {
  searchParams: Promise<{ shop?: string; memo?: string; status?: string }>;
}) {
  const params = await searchParams;
  const db = await createClient().catch(() => null);
  if (!db) redirect('/account?status=unavailable');
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (authError || !user || user.is_anonymous) redirect('/account');

  const shops = await db.rpc('owned_storefronts');
  const owned: Shop[] = shops.data ?? [];
  const shop = owned.find(item => item.id === params.shop) ?? owned[0];

  const [products, modules, memos] = shop ? await Promise.all([
    db.from('shop_products').select('id,name,price_paisa,available').eq('shop_id', shop.id).order('name').order('id'),
    db.from('system_modules').select('module_key').eq('module_key', 'cash_memos').eq('enabled', true).maybeSingle(),
    db.from('cash_memos').select('id,memo_number,total_paisa,created_at').eq('shop_id', shop.id).order('created_at', { ascending: false }).limit(25),
  ]) : [null, null, null];
  const items = products?.data ?? [];
  const stock = items.length ? await db.from('product_stock').select('product_id,quantity').in('product_id', items.map(item => item.id)) : null;
  const balances = new Map(stock?.data?.map(row => [row.product_id, row.quantity]));
  const ready = shop && products && !products.error && !stock?.error;
  const selected = shop && params.memo && /^[0-9a-f-]{36}$/i.test(params.memo)
    ? await db.from('cash_memos').select('memo_number,subtotal_paisa,discount_paisa,total_paisa,created_at,cash_memo_items(product_name,quantity,unit_price_paisa)')
      .eq('shop_id', shop.id).eq('id', params.memo).maybeSingle()
    : null;
  const receipt = selected?.data;

  return <main className="hub-width py-10">
    <div className="print:hidden">
      <Link href="/account" className="hub-button hub-button-outline">অ্যাকাউন্ট</Link>
      <h1 className="my-6 text-3xl font-bold">স্টক ও ক্যাশ মেমো</h1>
      {params.status === 'stock' && <p role="status" className="mb-4">স্টক যোগ হয়েছে।</p>}
      {params.status === 'invalid' && <p role="status" className="mb-4">পরিমাণ ও ফর্মের তথ্য যাচাই করুন।</p>}
      {params.status === 'failed' && <p role="status" className="mb-4">অনুরোধ সম্পন্ন হয়নি। অনুমতি ও স্টক যাচাই করুন।</p>}
      {shops.error && <p role="status">দোকানের তথ্য এখন পাওয়া যাচ্ছে না।</p>}
      {!shop && !shops.error && <p>এই অ্যাকাউন্টে সক্রিয় মার্চেন্ট দোকান নেই।</p>}
      {shop && <nav aria-label="নিজের দোকান" className="mb-5 flex flex-wrap gap-2">
        {owned.map(item => <Link key={item.id} aria-current={item.id === shop.id ? 'page' : undefined}
          className="hub-button hub-button-outline" href={'/business?shop=' + item.id}>{item.name}</Link>)}
      </nav>}
      {shop && !ready && <p role="status">স্টকের তথ্য এখন পাওয়া যাচ্ছে না।</p>}
      {ready && <div className="grid items-start gap-5 md:grid-cols-2">
        <section className="hub-card grid gap-3">
          <h2 className="text-xl font-bold">বর্তমান স্টক</h2>
          {!items.length && <p>দোকানে কোনো পণ্য নেই।</p>}
          {items.map(item => <form key={item.id} action={restock} className="grid gap-2 border-t border-neutral-700 pt-3">
            <p>{item.name} · {balances.get(item.id) ?? 0}টি</p>
            <input type="hidden" name="shop" value={shop.id} />
            <input type="hidden" name="product" value={item.id} />
            <input type="hidden" name="request" value={crypto.randomUUID()} />
            <label htmlFor={'stock-' + item.id}>যোগ করার পরিমাণ</label>
            <input className="hub-input" id={'stock-' + item.id} name="quantity" type="number" min="1" max="100000" required />
            <button className="hub-button">স্টক যোগ করুন</button>
          </form>)}
        </section>
        {modules?.data && <section className="hub-card grid gap-3">
          <h2 className="text-xl font-bold">নতুন ক্যাশ মেমো</h2>
          <form action={issueMemo} className="grid gap-3">
            <input type="hidden" name="shop" value={shop.id} />
            <input type="hidden" name="request" value={crypto.randomUUID()} />
            {items.filter(item => item.available && (balances.get(item.id) ?? 0) > 0).map(item => <div key={item.id}>
              <label htmlFor={'memo-' + item.id}>{item.name} · {money(item.price_paisa)}</label>
              <input className="hub-input" id={'memo-' + item.id} name={'qty-' + item.id} type="number"
                min="0" max={Math.min(balances.get(item.id) ?? 0, 100000)} defaultValue="0" />
            </div>)}
            <label htmlFor="discount">ছাড় (পয়সায়)</label>
            <input className="hub-input" id="discount" name="discount" type="number" min="0" defaultValue="0" required />
            <label htmlFor="payment">পরিশোধের ধরন</label>
            <select className="hub-input" id="payment" name="payment">
              <option value="cash">নগদ</option><option value="mobile">মোবাইল ব্যাংকিং</option>
              <option value="bank">ব্যাংক</option><option value="credit">বাকি</option>
            </select>
            <button className="hub-button">ক্যাশ মেমো তৈরি করুন</button>
          </form>
          <h3 className="mt-4 font-bold">সাম্প্রতিক মেমো</h3>
          {memos?.error ? <p>মেমোর তালিকা এখন পাওয়া যাচ্ছে না।</p>
            : memos?.data?.length ? <ul>{memos.data.map(memo => <li key={memo.id}>
              <Link className="underline" href={'/business?shop=' + shop.id + '&memo=' + memo.id}>#{memo.memo_number} · {money(memo.total_paisa)}</Link>
            </li>)}</ul> : <p>এখনো কোনো মেমো নেই।</p>}
        </section>}
      </div>}
    </div>
    {receipt && <section className="hub-card hub-receipt mt-6 grid gap-3 print:border-0 print:bg-white print:text-black">
      <h2 className="text-xl font-bold">ক্যাশ মেমো #{receipt.memo_number}</h2>
      <p>{shop.name} · {new Intl.DateTimeFormat('bn-BD', { timeZone: 'Asia/Dhaka', dateStyle: 'medium' }).format(new Date(receipt.created_at))}</p>
      <ul>{receipt.cash_memo_items.map((item: { product_name: string; quantity: number; unit_price_paisa: number }, index: number) =>
        <li key={index}>{item.product_name} · {item.quantity} × {money(item.unit_price_paisa)}</li>)}</ul>
      <p>উপমোট {money(receipt.subtotal_paisa)} · ছাড় {money(receipt.discount_paisa)}</p>
      <strong>মোট {money(receipt.total_paisa)}</strong>
      <PrintMemo />
    </section>}
  </main>;
}
