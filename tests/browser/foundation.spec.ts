import { test, expect } from '@playwright/test';

test('homepage and clock fit the viewport and account navigation works', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('সহজ হাব BD');
  await expect(page.locator('time')).toHaveAttribute('datetime', /T/);
  const timestamp = await page.locator('time').getAttribute('datetime');
  await expect(page.locator('time')).not.toHaveAttribute('datetime', timestamp!);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('header').getByRole('link', { name: 'অ্যাকাউন্ট', exact: true }).click();
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
  await page.goto('/business');
  await expect(page).toHaveURL(/\/account(?:\?status=unavailable)?$/);
  const response = await request.get('/api/search?q=Dhaka&offset=501');
  expect(response.status()).toBe(400);
  await page.goto('/auth/update-password');
  await expect(page).toHaveURL(/\/account\?status=(invalid_link|unavailable)$/);
  await page.goto('/auth/callback?next=https://outside.example');
  await expect(page).toHaveURL(/\/account\?status=invalid_link$/);
  await page.goto('/missing-page');
  await page.getByRole('link', { name: 'Back to Home', exact: true }).click();
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

test('premium home interactions and the 42-module directory work', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'সহজ হাব BD' })).toBeVisible();
  await expect(page.locator('.brand-pin')).toHaveAttribute('src', /shohojhub-pin\.png/);
  await expect(page.locator('.brand-wordmark')).toHaveAttribute('src', /shohojhub-wordmark\.png/);
  const desktop = (page.viewportSize()?.width ?? 0) >= 1100;
  const cards = page.locator('.module-card:visible');
  await expect(cards).toHaveCount(desktop ? 14 : 10);
  await expect(cards.locator('strong')).toHaveText([
    'ঝুড়িভরা', 'শখেরহাট', 'স্যারকই', 'ExamArena BD',
    'A&N Overseas', 'কর্মদুয়ার', 'ডাকদিলেই', 'ভাড়াহাট', 'Business Tools', 'AN Media Hub',
    ...(desktop ? ['কাজেরবাক্স', 'বুদ্ধিবাবু', 'বন্ধুআনো', 'কাজেরহাট'] : []),
  ]);
  expect(await page.locator('.featured-grid').evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length)).toBe(desktop ? 7 : 5);
  await expect(cards.filter({ hasText: 'Business Tools' })).toHaveAttribute('href', '/business');
  await expect(cards.filter({ hasText: 'AN Media Hub' })).toHaveAttribute('href', '/feed?category=education');
  await expect(cards.filter({ hasText: 'ঝুড়িভরা' })).toHaveAttribute('href', '/modules/chaikini');
  expect((await page.locator('.app-header').boundingBox())?.height).toBeLessThanOrEqual(72);
  expect((await page.locator('.bottom-dock').boundingBox())?.height).toBeLessThanOrEqual(desktop ? 55 : 86);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const headerTop = (await page.locator('.app-header').boundingBox())?.y;
  const dockTop = (await page.locator('.bottom-dock').boundingBox())?.y;
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  expect((await page.locator('.app-header').boundingBox())?.y).toBe(headerTop);
  expect((await page.locator('.bottom-dock').boundingBox())?.y).toBe(dockTop);
  await page.evaluate(() => window.scrollTo(0, 0));
  if (desktop) {
    await expect(page.getByRole('navigation', { name: 'ডেস্কটপ নেভিগেশন' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'ডেস্কটপ সাইডবার' })).toBeVisible();
    await page.getByRole('button', { name: 'আগের ব্যানার' }).click();
    await expect(page.getByRole('link', { name: 'অফার দেখুন', exact: true })).toHaveAttribute('href', '/feed?category=deals');
    await page.getByRole('button', { name: 'পরের ব্যানার' }).click();
    await expect(page.getByRole('button', { name: 'স্লাইড 1' })).toHaveAttribute('aria-pressed', 'true');
  }
  await page.getByRole('button', { name: 'টিকার থামান' }).click();
  await expect(page.locator('.ticker-track')).toHaveCSS('animation-play-state', 'paused');
  await page.getByRole('button', { name: 'টিকার চালু করুন' }).click();

  await page.getByRole('button', { name: 'এলাকা বেছে নিন' }).click();
  await page.getByRole('button', { name: 'ঢাকা', exact: true }).click();
  await expect(page.getByRole('button', { name: 'এলাকা বেছে নিন' })).toContainText('ঢাকা');

  await page.getByRole('button', { name: 'স্লাইড 2' }).click();
  await expect(page.locator('.hero-copy')).toContainText('হাতের নাগালে');
  await page.getByRole('button', { name: 'ট্রেন্ডিং' }).click();
  await expect(cards).toHaveCount(5);

  await page.getByRole('link', { name: /সব মডিউল দেখুন/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'সব মডিউল' })).toBeVisible();
  await expect(page.locator('.directory-card')).toHaveCount(42);
  await page.getByRole('button', { name: 'শিক্ষা', exact: true }).click();
  await expect(page.locator('.directory-card')).toHaveCount(4);
  await page.getByRole('link', { name: /স্যারকই/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'স্যারকই' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('এখনো চালু করা হয়নি');
  await page.goto('/modules/haatbazar-used');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('পুরোনোসোনা');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('পুরোনো বেচুন, সাশ্রয়ে কিনুন');
  await page.goto('/modules/skill-courses');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('হাতেখড়ি');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('শিখুন, দক্ষ হোন, আয় করুন');
});

test('live feed and filter sheet match the supplied inner-page structure', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'ফিল্টার', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'ফিল্টার করুন' })).toBeVisible();
  await page.getByRole('button', { name: 'ফিল্টার বন্ধ করুন' }).click();
  await expect(page.getByRole('heading', { name: 'লাইভ ফিড' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'সব পোস্ট' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'বিস্তারিত ফিল্টার খুলুন' }).click();
  const dialog = page.getByRole('dialog', { name: 'ফিল্টার করুন' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'চাকরি' }).click();
  await expect(dialog.getByRole('button', { name: 'চাকরি' })).toHaveAttribute('aria-pressed', 'true');
  await dialog.getByRole('button', { name: 'রিসেট' }).click();
  await expect(dialog.getByRole('button', { name: 'চাকরি' })).toHaveAttribute('aria-pressed', 'false');
  await dialog.getByRole('button', { name: /ফলাফল দেখুন/ }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText(/এখনো কোনো প্রকাশিত পোস্ট নেই|ফিড এখন লোড করা যাচ্ছে না/)).toBeVisible();
});

test('guest can reach each post intent and sign-in preserves the requested form', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'আমি সেবা দেব', exact: true }).click();
  await expect(page).toHaveURL(/\/posts\/new\?intent=offer$/);
  await expect(page.getByText('পোস্ট দিতে সাইন ইন প্রয়োজন')).toBeVisible();
  await page.getByRole('link', { name: 'সাইন ইন করুন' }).click();
  await expect(page.locator('input[name="returnTo"]')).toHaveValue('/posts/new?intent=offer');
});
