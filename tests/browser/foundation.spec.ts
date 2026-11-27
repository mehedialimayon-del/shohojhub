import { test, expect } from '@playwright/test';

test('homepage and clock fit the viewport and account navigation works', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('সহজ হাব BD');
  await expect(page.locator('time')).toHaveAttribute('datetime', /T/);
  const timestamp = await page.locator('time').getAttribute('datetime');
  await expect(page.locator('time')).not.toHaveAttribute('datetime', timestamp!);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'অ্যাকাউন্ট', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('অ্যাকাউন্ট');
  await page.getByRole('link', { name: 'নতুন অ্যাকাউন্ট' }).click();
  await expect(page.getByRole('button', { name: 'অ্যাকাউন্ট তৈরি' })).toBeVisible();
  await page.getByRole('link', { name: 'পাসওয়ার্ড ভুলে গেছেন?' }).click();
  await expect(page.getByRole('button', { name: 'পাসওয়ার্ড রিসেট লিংক পাঠান' })).toBeVisible();
  await page.getByRole('link', { name: 'যাচাই ইমেইল আবার পাঠান' }).click();
  await expect(page.getByRole('button', { name: 'যাচাই লিংক আবার পাঠান' })).toBeVisible();
  await page.getByRole('link', { name: 'সহজ হাব হোম' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('সহজ হাব BD');
});

test('search retries a failed request and shows the empty result state', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/search?*', async route => {
    calls++;
    await route.fulfill(calls === 1 ? { status: 503 } : { json: { results: [], next: null } });
  });
  await page.goto('/');
  const input = page.getByRole('searchbox');
  await input.fill('ঢ');
  await expect(page.getByRole('status')).toContainText('অন্তত ২টি অক্ষর');
  await input.fill('ঢাকা');
  await expect(page.getByRole('status')).toContainText('এখন খোঁজা যাচ্ছে না');
  await page.getByRole('button', { name: 'আবার খুঁজুন' }).click();
  await expect(page.getByRole('status')).toContainText('কোনো ফল পাওয়া যায়নি');
  expect(calls).toBe(2);
});

test('server validates pagination and guards password reset', async ({ page, request }) => {
  const response = await request.get('/api/search?q=Dhaka&offset=501');
  expect(response.status()).toBe(400);
  await page.goto('/auth/update-password');
  await expect(page).toHaveURL(/\/account\?status=(invalid_link|unavailable)$/);
  await page.goto('/auth/callback?next=https://outside.example');
  await expect(page).toHaveURL(/\/account\?status=invalid_link$/);
  await page.goto('/missing-page');
  await page.locator('a[href="/"]').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('সহজ হাব BD');
});

test('search displays supported result types with pagination', async ({ page }) => {
  await page.route('**/api/search?*', async route => {
    const nextPage = new URL(route.request().url()).searchParams.get('offset') === '20';
    const results = nextPage
      ? [{ kind: 'product', id: '3', title: 'পরীক্ষার পণ্য', secondary_title: 'পরীক্ষার দোকান', district: 'ঢাকা' }]
      : [
        { kind: 'university', id: '1', title: 'পরীক্ষার বিশ্ববিদ্যালয়', secondary_title: 'Test University', district: 'ঢাকা' },
        { kind: 'shop', id: '2', title: 'পরীক্ষার দোকান', secondary_title: 'টেস্ট এলাকা', district: 'ঢাকা' },
      ];
    await route.fulfill({ json: { results, next: nextPage ? null : 20 } });
  });
  await page.goto('/');
  await page.getByRole('searchbox').fill('ঢাকা');
  await expect(page.locator('li')).toHaveCount(2);
  await page.getByRole('button', { name: 'পরের পাতা' }).click();
  await expect(page.locator('li')).toHaveCount(1);
  await expect(page.locator('li')).toContainText('পরীক্ষার পণ্য');
  await page.getByRole('button', { name: 'আগের পাতা' }).click();
  await expect(page.locator('li')).toHaveCount(2);
});

test('premium home interactions and the 40-module directory work', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'সহজ হাব BD' })).toBeVisible();
  await expect(page.locator('.brand-emblem')).toHaveAttribute('src', /shohojhub-emblem\.png/);
  await expect(page.locator('.module-card')).toHaveCount(10);

  await page.getByRole('button', { name: 'এলাকা বেছে নিন' }).click();
  await page.getByRole('button', { name: 'ঢাকা', exact: true }).click();
  await expect(page.getByRole('button', { name: /ঢাকা/ })).toBeVisible();

  await page.getByRole('button', { name: 'স্লাইড 2' }).click();
  await expect(page.locator('.hero-copy')).toContainText('হাতের নাগালে');
  await page.getByRole('button', { name: 'ট্রেন্ডিং' }).click();
  await expect(page.locator('.module-card')).toHaveCount(5);

  await page.getByRole('link', { name: /সব মডিউল দেখুন/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'সব মডিউল' })).toBeVisible();
  await expect(page.locator('.directory-card')).toHaveCount(40);
  await page.getByRole('button', { name: 'শিক্ষা', exact: true }).click();
  await expect(page.locator('.directory-card')).toHaveCount(3);
  await page.getByRole('link', { name: /Porai/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Porai' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('এখনো চালু করা হয়নি');
});
