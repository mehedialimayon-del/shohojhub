import { randomUUID } from 'node:crypto';
import { test, expect, type Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SHOHOJHUB_LOCAL_QA_SERVICE_KEY;
const localStack = apiUrl === 'http://127.0.0.1:54321' && Boolean(serviceKey);
const photo = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+XK0sAAAAASUVORK5CYII=', 'base64');

function dhakaTime(minutesFromNow: number) {
  return new Date(Date.now() + (6 * 60 + minutesFromNow) * 60_000).toISOString().slice(0, 16);
}

async function expectHiddenPage(page: Page, path: string) {
  await page.goto(path);
  await expect(page.getByRole('heading', { name: '404', exact: true })).toBeVisible();
}

async function signIn(page: Page, email: string, password: string) {
  await page.getByLabel('ইমেইল', { exact: true }).fill(email);
  await page.getByLabel('পাসওয়ার্ড', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'সাইন ইন', exact: true }).click();
}

test('members and moderators can complete the post lifecycle', async ({ page: owner, browser }, testInfo) => {
  test.skip(!localStack, 'Requires the disposable Supabase stack on port 54321');
  test.setTimeout(90_000);
  const admin = createClient(apiUrl!, serviceKey!, { auth: { persistSession: false, autoRefreshToken: false } });
  const suffix = randomUUID().slice(0, 8);
  const password = 'QA-' + randomUUID();
  const users: string[] = [];

  for (const account of ['owner', 'reader', 'moderator']) {
    const email = `${account}-${suffix}@example.com`;
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !data.user) throw new Error(`Failed to prepare ${account}: ${error?.message}`);
    users.push(email);
    if (account === 'moderator') {
      const { error: roleError } = await admin.from('profiles').update({ role: 'admin' }).eq('id', data.user.id);
      if (roleError) throw roleError;
    }
  }

  const [ownerEmail, readerEmail, moderatorEmail] = users;
  const reader = await browser.newPage({ baseURL: testInfo.project.use.baseURL });
  const moderator = await browser.newPage({ baseURL: testInfo.project.use.baseURL });
  const title = `Chapter 02 QA ${suffix}`;

  try {
    await owner.goto('/');
    await owner.getByRole('link', { name: 'আমার প্রয়োজন', exact: true }).click();
    await owner.getByRole('link', { name: 'সাইন ইন করুন' }).click();
    await signIn(owner, ownerEmail, password);
    await expect(owner).toHaveURL(/\/posts\/new\?intent=need$/);
    await expect(owner.getByLabel('উদ্দেশ্য')).toHaveValue('need');
    await owner.getByLabel('ক্যাটাগরি').selectOption('services');
    await owner.getByLabel('পোস্টের শিরোনাম').fill(title);
    await owner.getByLabel('বিস্তারিত').fill('QA exercise for submission, approval, scheduling, and storage.');
    await owner.getByLabel('বিভাগ').selectOption('ঢাকা');
    await owner.getByLabel('জেলা', { exact: true }).fill('ঢাকা');
    await owner.getByLabel('এলাকা (ঐচ্ছিক)').fill('মিরপুর');
    await owner.getByLabel('সর্বনিম্ন মূল্য (৳)').fill('200');
    await owner.getByLabel('সর্বোচ্চ মূল্য (৳)').fill('400');
    await owner.getByLabel('যোগাযোগের নাম').fill('QA Owner');
    await owner.getByRole('button', { name: 'রিভিউয়ের জন্য জমা দিন' }).click();
    await expect(owner.getByRole('heading', { name: title })).toBeVisible();
    await expect(owner.getByText('রিভিউয়ের অপেক্ষায়')).toBeVisible();
    const postPath = new URL(owner.url()).pathname;
    const photoPath = '/api' + postPath + '/photo';

    await owner.getByLabel('পোস্টের ছবি').setInputFiles({ name: 'fixture.png', mimeType: 'image/png', buffer: photo });
    await owner.getByRole('button', { name: 'ছবি সংরক্ষণ করুন' }).click();
    await expect(owner.getByRole('status')).toHaveText('পোস্টের ছবি আপডেট হয়েছে।');
    const ownerPhoto = await owner.request.get(photoPath);
    expect(ownerPhoto.status()).toBe(200);
    expect(await ownerPhoto.body()).toEqual(photo);

    await expectHiddenPage(reader, postPath);
    expect((await reader.request.get(photoPath)).status()).toBe(404);
    await reader.goto('/account');
    await signIn(reader, readerEmail, password);
    await expect(reader.getByRole('button', { name: 'সাইন আউট' })).toBeVisible();
    await expectHiddenPage(reader, postPath);
    await expectHiddenPage(reader, '/posts/review');
    expect((await reader.request.get(photoPath)).status()).toBe(404);

    await moderator.goto('/account');
    await signIn(moderator, moderatorEmail, password);
    await expect(moderator.getByRole('button', { name: 'সাইন আউট' })).toBeVisible();
    await moderator.goto('/posts/review');
    const reviewCard = moderator.locator('section').filter({ has: moderator.getByRole('link', { name: title, exact: true }) });
    await reviewCard.getByLabel('প্রকাশের সময় (বাংলাদেশ, ঐচ্ছিক)').fill(dhakaTime(10));
    await reviewCard.getByLabel('মেয়াদ শেষ (বাংলাদেশ, ঐচ্ছিক)').fill(dhakaTime(25));
    await reviewCard.getByRole('button', { name: 'অনুমোদন করুন' }).click();
    await expect(reviewCard.getByText('প্রকাশের সময় নির্ধারিত')).toBeVisible();
    await expectHiddenPage(reader, postPath);
    expect((await reader.request.get(photoPath)).status()).toBe(404);

    await owner.goto(postPath);
    await owner.getByRole('button', { name: 'রিভিউতে ফিরিয়ে সম্পাদনা করুন' }).click();
    const revisedTitle = `${title} revised`;
    await owner.getByLabel('পোস্টের শিরোনাম').fill(revisedTitle);
    await owner.getByRole('button', { name: 'পরিবর্তন সংরক্ষণ করুন' }).click();
    await expect(owner.getByRole('heading', { name: revisedTitle })).toBeVisible();
    await moderator.goto('/posts/review');
    await moderator.locator('section').filter({ has: moderator.getByRole('link', { name: revisedTitle, exact: true }) })
      .getByRole('button', { name: 'অনুমোদন করুন' }).click();
    await expect(moderator.getByText('প্রকাশিত', { exact: true })).toBeVisible();

    const filters = new URLSearchParams({ intent: 'need', categories: 'services', division: 'ঢাকা', district: 'ঢাকা',
      area: 'মিরপুর', min: '300', max: '450', types: 'personal', q: suffix });
    await reader.goto('/feed?' + filters);
    await reader.getByRole('link', { name: revisedTitle }).click();
    expect((await reader.request.get(photoPath)).status()).toBe(200);
    const reason = `QA test report ${suffix}`;
    await reader.getByLabel('রিপোর্টের কারণ').fill(reason);
    await reader.getByRole('button', { name: 'রিপোর্ট করুন', exact: true }).click();
    await expect(reader.getByRole('status')).toHaveText('রিপোর্ট রিভিউয়ের জন্য জমা হয়েছে।');
    await moderator.goto('/posts/review');
    const report = moderator.locator('article').filter({ hasText: reason });
    await report.getByRole('button', { name: 'রিপোর্ট পর্যালোচনা সম্পন্ন' }).click();
    await expect(report).toHaveCount(0);

    await owner.goto(postPath);
    await owner.getByRole('button', { name: 'পোস্ট বন্ধ করুন' }).click();
    await expect(owner.getByText('বন্ধ', { exact: true })).toBeVisible();
    await expectHiddenPage(reader, postPath);
    expect((await reader.request.get(photoPath)).status()).toBe(404);
  } finally {
    await Promise.all([reader.close(), moderator.close()]);
  }
});
