'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const categories = new Set(['jobs','tuition','products','services','rentals','education','study_abroad','deals']);
const divisions = new Set(['ঢাকা','চট্টগ্রাম','রংপুর','রাজশাহী','খুলনা','বরিশাল','সিলেট','ময়মনসিংহ']);
const value = (form: FormData, key: string) => String(form.get(key) ?? '').trim();
const safeWholeTaka = (raw: string) => {
  if (!raw) return null;
  if (!/^\d{1,10}$/.test(raw)) return Number.NaN;
  const taka = Number(raw);
  return Number.isSafeInteger(taka) ? taka * 100 : Number.NaN;
};

export async function submitPost(form: FormData) {
  const client = await createClient().catch(() => null);
  if (!client) redirect('/posts/new?status=unavailable');
  const { data: { user } } = await client.auth.getUser();
  if (!user || user.is_anonymous) redirect('/account?mode=login&returnTo=%2Fposts%2Fnew');

  const category = value(form, 'category');
  const title = value(form, 'title');
  const body = value(form, 'body');
  const division = value(form, 'division');
  const district = value(form, 'district');
  const area = value(form, 'area');
  const contactName = value(form, 'contactName');
  const postType = value(form, 'postType');
  const priceMin = safeWholeTaka(value(form, 'priceMin'));
  const priceMax = safeWholeTaka(value(form, 'priceMax'));
  if (!categories.has(category) || title.length < 5 || title.length > 140 || body.length < 20 || body.length > 4000
    || !divisions.has(division) || !district || district.length > 80 || area.length > 100
    || contactName.length < 2 || contactName.length > 100 || !['personal','business'].includes(postType)
    || Number.isNaN(priceMin) || Number.isNaN(priceMax)
    || (priceMin !== null && priceMax !== null && priceMin > priceMax)) {
    redirect('/posts/new?status=invalid');
  }

  const { error } = await client.from('posts').insert({
    category, title, body, division, district, area: area || null,
    price_min_paisa: priceMin, price_max_paisa: priceMax,
    post_type: postType, contact_name: contactName,
  });
  if (error) redirect('/posts/new?status=submit_error');
  revalidatePath('/account');
  redirect('/account?status=post_submitted');
}
