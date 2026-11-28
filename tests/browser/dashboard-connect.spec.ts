import { randomUUID } from 'node:crypto';
import { test, expect, type Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SHOHOJHUB_LOCAL_QA_SERVICE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function signIn(page: Page, email: string, password: string) {
  await page.getByLabel('ইমেইল', { exact: true }).fill(email);
  await page.getByLabel('পাসওয়ার্ড', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'সাইন ইন', exact: true }).click();
}

test('dashboard consent, nearby search, two-user chat and notifications work', async ({ page: sender, browser }, testInfo) => {
  test.skip(url !== 'http://127.0.0.1:54321' || !key || !anonKey, 'Requires disposable local Supabase');
  test.setTimeout(100_000);
  const admin = createClient(url!, key!, { auth: { persistSession: false, autoRefreshToken: false } });
  const tag = 'test' + randomUUID().slice(0, 8);
  const password = 'QA-' + randomUUID();
  const emails = ['sender', 'recipient', 'observer'].map(role => `${role}-${tag}@example.com`);
  const users: string[] = [];
  for (const email of emails) {
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !data.user) throw new Error(error?.message);
    users.push(data.user.id);
  }
  const switches = await admin.from('system_modules').update({ enabled: true }).in('module_key', ['messaging','notifications']);
  expect(switches.error).toBeNull();
  const posts = await admin.from('posts').insert(Array.from({ length: 22 }, (_, index) => ({
    owner_id: users[1], category: 'services', title: `${tag} QA public service ${index}`,
    body: 'A listing for verified-location and shared search testing.',
    division: 'ঢাকা', district: 'ঢাকা', contact_name: 'QA recipient',
    status: 'published', published_at: new Date(Date.now() - 1000).toISOString(),
  }))).select('id,title');
  expect(posts.error).toBeNull();
  const post = posts.data![0];

  const districts = await admin.from('bd_districts').select('division,district');
  expect(districts.data).toHaveLength(64);
  expect(new Set(districts.data!.map(row => row.division)).size).toBe(8);

  const recipient = await browser.newPage({ baseURL: testInfo.project.use.baseURL });
  const realtimeEvents: string[] = [];
  recipient.on('websocket', socket => {
    if (!new URL(socket.url()).pathname.includes('/realtime/')) return;
    socket.on('framereceived', ({ payload }) => {
      try {
        const frame = JSON.parse(payload.toString());
        const event = Array.isArray(frame) ? frame[3] : frame.event;
        if (typeof event === 'string') realtimeEvents.push(event);
      } catch { /* Record only protocol event types. */ }
    });
  });
  try {
    await sender.goto('/dashboard');
    await signIn(sender, emails[0], password);
    await expect(sender.getByRole('heading', { name: 'আমার ড্যাশবোর্ড' })).toBeVisible();
    await sender.getByLabel('আমি ব্যবহার করতে চাই').selectOption('merchant');
    await sender.getByLabel('আমার জেলা').selectOption('dhaka');
    await sender.getByRole('button', { name: 'পছন্দ সংরক্ষণ করুন' }).click();
    await expect(sender.getByRole('status')).toHaveText('জেলা সংরক্ষণ করতে সম্মতি দিন।');
    await sender.getByLabel('আমার জেলা').selectOption('dhaka');
    await sender.getByLabel('আমি ব্যবহার করতে চাই').selectOption('merchant');
    await sender.getByRole('checkbox').check();
    await sender.getByRole('button', { name: 'পছন্দ সংরক্ষণ করুন' }).click();
    await expect(sender.getByRole('status')).toHaveText('পছন্দ সংরক্ষণ হয়েছে।');
    await expect(sender.getByLabel('আমি ব্যবহার করতে চাই')).toHaveValue('merchant');
    const actualRole = await admin.from('profiles').select('role').eq('id', users[0]).single();
    expect(actualRole.data?.role).toBe('member');

    await sender.getByRole('link', { name: 'কাছাকাছি', exact: true }).last().click();
    await expect(sender.getByLabel('জেলা বেছে নিন')).toHaveValue('dhaka');
    const search = await sender.request.get('/api/search?' + new URLSearchParams({ q: tag, district: 'ঢাকা', kind: 'post' }));
    expect(search.ok()).toBeTruthy();
    expect(await search.json()).toMatchObject({ results: Array(20).fill(expect.objectContaining({ district: 'ঢাকা', kind: 'post' })), next: 20 });
    const second = await sender.request.get('/api/search?' + new URLSearchParams({ q: tag, district: 'ঢাকা', kind: 'post', offset: '20' }));
    expect((await second.json()).results).toHaveLength(2);
    const wrong = await sender.request.get('/api/search?' + new URLSearchParams({ q: tag, district: 'সিলেট', kind: 'post' }));
    expect((await wrong.json()).results).toHaveLength(0);
    await sender.goto('/feed?' + new URLSearchParams({ q: tag, district: 'ঢাকা', category: 'services' }));
    await expect(sender.locator('.feed-post-card')).toHaveCount(20);
    const header = await sender.locator('.app-header').boundingBox();
    const dock = await sender.locator('.bottom-dock').boundingBox();
    await sender.locator('.feed-post-card').last().scrollIntoViewIfNeeded();
    expect((await sender.locator('.app-header').boundingBox())?.y).toBe(header?.y);
    expect((await sender.locator('.bottom-dock').boundingBox())?.y).toBe(dock?.y);

    const observer = createClient(url!, anonKey!, { auth: { persistSession: false } });
    await observer.auth.signInWithPassword({ email: emails[2], password });
    const privateDistrict = await observer.from('member_preferences').select('district_id').eq('user_id',users[0]);
    expect(privateDistrict.data).toEqual([]);
    const anon = createClient(url!, anonKey!, { auth: { persistSession: false } });
    expect((await anon.rpc('post_message_peer', { target_post: post.id })).error).toBeTruthy();

    await recipient.goto('/notifications');
    await signIn(recipient, emails[1], password);
    await expect(recipient.getByText('এখনো কোনো নোটিফিকেশন নেই।')).toBeVisible();
    await sender.goto('/posts/' + post.id);
    await sender.getByRole('link', { name: 'Shohoj Connect-এ বার্তা দিন' }).click();
    const message = 'Hello from the local conversation QA';
    await sender.getByLabel('বার্তা লিখুন').fill(message);
    await sender.getByRole('button', { name: 'বার্তা পাঠান' }).click();
    await expect(sender.getByText(message)).toBeVisible();
    await expect(recipient.getByText(message)).toBeVisible({ timeout: 18_000 });
    await recipient.getByRole('link', { name: new RegExp(message) }).click();
    await expect(recipient.getByText(message)).toBeVisible();
    await expect(sender.getByText(/পড়া হয়েছে/)).toBeVisible({ timeout: 15_000 });
    const invisible = await observer.from('messages').select('id');
    expect(invisible.data).toEqual([]);
    await recipient.getByText('রিপোর্ট করুন', { exact: true }).click();
    await recipient.getByLabel('রিপোর্টের কারণ').fill('Testing the private reporting flow.');
    await recipient.getByRole('button', { name: 'রিপোর্ট জমা দিন' }).click();
    await expect(recipient.getByRole('status')).toHaveText('রিপোর্ট জমা হয়েছে।');
    await recipient.getByRole('button', { name: 'ব্যবহারকারীকে ব্লক করুন' }).click();
    await expect(recipient.getByRole('button', { name: 'ব্লক খুলুন' })).toBeVisible();
    await sender.getByLabel('বার্তা লিখুন').fill('Blocked delivery must fail');
    await sender.getByRole('button', { name: 'বার্তা পাঠান' }).click();
    await expect(sender.getByRole('status')).toHaveText('বার্তা বা অনুরোধটি সম্পন্ন হয়নি।');
  } finally {
    console.log('Recipient realtime event types:', Array.from(new Set(realtimeEvents)).join(', ') || 'none');
    await recipient.close();
  }
});
