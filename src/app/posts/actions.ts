'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { divisions, postCategories, postIdPattern, postIntents } from '@/lib/feed';

const value = (form: FormData, key: string) => String(form.get(key) ?? '').trim();
const wholeTaka = (raw: string) => !raw ? null : /^\d{1,10}$/.test(raw) ? Number(raw) * 100 : NaN;
const photoLimit = 4 * 1024 * 1024;
const photoTypes = ['image/jpeg', 'image/png', 'image/webp'];

async function signedIn(returnTo = '/posts/new') {
  const client = await createClient().catch(() => null);
  if (!client) redirect(returnTo + '?status=unavailable');
  const { data: { user } } = await client.auth.getUser();
  if (!user || user.is_anonymous) redirect('/account?mode=login&returnTo=%2Fposts%2Fnew');
  return client;
}

function refreshFeed() {
  revalidatePath('/');
  revalidatePath('/feed');
  revalidatePath('/posts/manage');
  revalidatePath('/posts/review');
}

function idFrom(form: FormData) {
  const id = value(form, 'id');
  if (!postIdPattern.test(id)) redirect('/posts/manage?status=invalid');
  return id;
}

export async function submitPost(form: FormData) {
  const rawId = value(form, 'id');
  if (rawId && !postIdPattern.test(rawId)) redirect('/posts/manage?status=invalid');
  const path = rawId ? '/posts/' + rawId : '/posts/new';
  const client = await signedIn(path);
  const sharedPin = form.get('publicPin') === 'on';
  const mapLat = sharedPin ? Number(value(form,'mapLat')) : null;
  const mapLng = sharedPin ? Number(value(form,'mapLng')) : null;
  if (sharedPin && (mapLat === null || mapLng === null || !Number.isFinite(mapLat) || !Number.isFinite(mapLng)
      || mapLat < 20 || mapLat > 27 || mapLng < 87 || mapLng > 93)) redirect(path + '?status=invalid');
  const fields = {
    category: value(form, 'category'),
    intent: value(form, 'intent'),
    title: value(form, 'title'),
    body: value(form, 'body'),
    division: value(form, 'division'),
    district: value(form, 'district'),
    area: value(form, 'area') || null,
    contact_name: value(form, 'contactName'),
    post_type: value(form, 'postType'),
    price_min_paisa: wholeTaka(value(form, 'priceMin')),
    price_max_paisa: wholeTaka(value(form, 'priceMax')),
    map_lat: mapLat,
    map_lng: mapLng,
  };
  if (!Object.hasOwn(postCategories, fields.category) || !Object.hasOwn(postIntents, fields.intent)
    || fields.title.length < 5 || fields.title.length > 140 || fields.body.length < 20 || fields.body.length > 4000
    || !divisions.includes(fields.division) || !fields.district || fields.district.length > 80 || (fields.area?.length ?? 0) > 100
    || fields.contact_name.length < 2 || fields.contact_name.length > 100 || !['personal', 'business'].includes(fields.post_type)
    || Number.isNaN(fields.price_min_paisa) || Number.isNaN(fields.price_max_paisa)
    || (fields.price_min_paisa !== null && fields.price_max_paisa !== null && fields.price_min_paisa > fields.price_max_paisa)) {
    redirect(path + '?status=invalid');
  }
  const operation = rawId
    ? client.from('posts').update(fields).eq('id', rawId)
    : client.from('posts').insert(fields);
  const { data, error } = await operation.select('id').maybeSingle();
  if (error || !data) redirect(path + '?status=submit_error');
  refreshFeed();
  redirect('/posts/' + data.id + '?status=saved');
}

export async function postPhoto(form: FormData) {
  const id = idFrom(form);
  const path = '/posts/' + id;
  const client = await signedIn(path);
  const bucket = client.storage.from('feed-photos');
  const file = form.get('photo');
  if (value(form, 'action') === 'remove') {
    const { error } = await bucket.remove([id]);
    if (error) redirect(path + '?status=photo_error');
  } else {
    if (!(file instanceof File) || file.size < 12 || file.size > photoLimit || !photoTypes.includes(file.type)) {
      redirect(path + '?status=photo_error');
    }
    const bytes = Buffer.from(await file.slice(0, 12).arrayBuffer());
    const matches = (file.type === 'image/jpeg' && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
      || (file.type === 'image/png' && bytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a')
      || (file.type === 'image/webp' && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP');
    if (!matches) redirect(path + '?status=photo_error');
    const { error } = await bucket.upload(id, file, { upsert: true, contentType: file.type });
    if (error) redirect(path + '?status=photo_error');
  }
  const { data, error } = await client.rpc('sync_post_photo', { target: id });
  if (error || !data) redirect(path + '?status=photo_error');
  refreshFeed();
  redirect(path + '?status=photo_saved');
}

function dhakaDate(value: string) {
  if (!value) return null;
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(value)) return undefined;
  const date = new Date(value + ':00+06:00');
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString();
}

export async function changePostStatus(form: FormData) {
  const id = idFrom(form);
  const action = value(form, 'action');
  const target = value(form, 'review') === '1' ? '/posts/review' : '/posts/' + id;
  const start = dhakaDate(value(form, 'start'));
  const end = dhakaDate(value(form, 'end'));
  if (start === undefined || end === undefined || !['publish','reject','close','revise'].includes(action)) redirect(target + '?status=invalid');
  const client = await signedIn(target);
  const { data, error } = await client.rpc('change_post_status', { target: id, action, start_at: start, end_at: end });
  if (error || !data) redirect(target + '?status=submit_error');
  refreshFeed();
  redirect(target + '?status=updated');
}

export async function reportPost(form: FormData) {
  const id = idFrom(form);
  const path = '/posts/' + id;
  const reason = value(form, 'reason');
  if (reason.length < 8 || reason.length > 300) redirect(path + '?status=invalid');
  const client = await signedIn(path);
  const { error } = await client.from('post_reports').insert({ post_id: id, reason });
  if (error && error.code !== '23505') redirect(path + '?status=submit_error');
  redirect(path + '?status=reported');
}

export async function resolvePostReport(form: FormData) {
  const id = idFrom(form);
  const client = await signedIn('/posts/review');
  const { data, error } = await client.from('post_reports').update({ resolved_at: new Date().toISOString() })
    .eq('id', id).is('resolved_at', null).select('id').maybeSingle();
  revalidatePath('/posts/review');
  redirect('/posts/review?status=' + (error || !data ? 'submit_error' : 'updated'));
}
