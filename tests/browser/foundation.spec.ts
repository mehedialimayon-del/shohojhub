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

test('premium home interactions and the 40-module directory work', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'সহজ হাব BD' })).toBeVisible();
  await expect(page.locator('.brand-pin')).toHaveAttribute('src', /shohojhub-pin\.png/);
  await expect(page.locator('.brand-wordmark')).toHaveAttribute('src', /shohojhub-wordmark\.png/);
  const desktop = (page.viewportSize()?.width ?? 0) >= 1100;
  const cards = page.locator('.module-card:visible');
  await page.getByRole('button', { name: 'ব্যানার থামান' }).click();
  await expect(cards).toHaveCount(desktop ? 14 : 10);
  await expect(cards.locator('strong')).toHaveText([
    'চায়াকিনি', 'হাটবাজার', 'পড়াই', 'ExamArena BD',
    'A&N Overseas', 'চাকরিচাই', 'সেবাচাই', 'বাসাচাই', 'Business Tools', 'AN Media Hub',
    ...(desktop ? ['ShohojTools', 'AI Assistant', 'Referral & Rewards', 'KajChai'] : []),
  ]);
  expect(await page.locator('.featured-grid').evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length)).toBe(desktop ? 7 : 5);
  await expect(cards.filter({ hasText: 'Business Tools' })).toHaveAttribute('href', '/business');
  await expect(cards.filter({ hasText: 'AN Media Hub' })).toHaveAttribute('href', '/feed?category=education');
  await expect(cards.filter({ hasText: 'চায়াকিনি' })).toHaveAttribute('href', '/modules/chaikini');
  await expect(cards.filter({ hasText: 'চাকরিচাই' })).toHaveAttribute('href', '/jobs');
  await expect(cards.filter({ hasText: 'পড়াই' })).toHaveAttribute('href', '/tuition');
  await expect(page.locator('.home-promo-card')).toHaveCount(0);
  const homePostCount = await page.locator('.home-feed-post').count();
  if (homePostCount === 0) await expect(page.locator('.live-feed .feed-empty')).toBeVisible();
  await page.getByRole('button', { name: 'আরও তথ্য' }).click();
  await expect(page.getByRole('dialog', { name: 'কেন ব্যবহার করবেন সহজ হাব BD?' })).toBeVisible();
  await expect(page.locator('.benefit-grid article')).toHaveCount(5);
  await page.getByRole('button', { name: 'বন্ধ করুন' }).last().click();
  await expect(page.getByRole('dialog', { name: 'কেন ব্যবহার করবেন সহজ হাব BD?' })).toHaveCount(0);
  expect((await page.locator('.app-header').boundingBox())?.height).toBeLessThanOrEqual(72);
  const frame = page.locator('.reference-home-shell');
  const size = await frame.boundingBox();
  expect(size?.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  expect(size?.height).toBe(page.viewportSize()?.height);
  expect(size?.width).toBe(page.viewportSize()?.width);
  if (desktop) await expect(page.locator('.bottom-dock')).toBeHidden();
  expect(await frame.evaluate(el => getComputedStyle(el).overflow)).toBe('hidden');
  expect(await frame.evaluate(el => getComputedStyle(el).backgroundImage)).toBe('none');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
  expect(await page.locator('.reference-feed-stream').evaluate(el => getComputedStyle(el).overflowY)).toBe('auto');
});

test('module directory links open working module destinations', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'ব্যানার থামান' }).click();
  await page.getByRole('link', { name: /সব মডিউল দেখুন/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'সব মডিউল' })).toBeVisible();
  await expect(page.locator('.directory-card')).toHaveCount(40);
  await page.getByRole('button', { name: 'শিক্ষা', exact: true }).click();
  await expect(page.locator('.directory-card')).toHaveCount(3);
  await page.getByRole('link', { name: /Porai/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Porai' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('এখনো চালু করা হয়নি');
});

test('the reference carousel rotates and can be paused', async ({ page }) => {
  await page.goto('/');
  const banner = page.locator('.hero-banner');
  const desktop = (page.viewportSize()?.width ?? 0) >= 1100;
  await expect(banner).toHaveAttribute('data-banner', '1');
  await expect(page.getByRole('button', { name: 'স্লাইড 2' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'স্লাইড 3' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'স্লাইড 4' })).toHaveCount(0);
  await expect(banner).toHaveAttribute('data-banner', '2', { timeout: 4000 });
  await expect(banner.getByRole('img', { name: /Google Play থেকে ডাউনলোড করুন/ })).toBeVisible();
  await page.getByRole('button', { name: 'ব্যানার থামান' }).click();
  await page.getByRole('button', { name: 'স্লাইড 1' }).click();
  await expect(banner).toHaveAttribute('data-banner', '1');
  await expect(page.getByRole('button', { name: 'ব্যানার চালু করুন' })).toBeVisible();
  await page.getByRole('button', { name: 'স্লাইড 2' }).click();
  await expect(banner).toHaveAttribute('data-banner', '2');
  await page.locator(desktop ? '.hero-cta' : '.hero-banner-hotspot').click();
  await expect(page.locator('.download-notice')).toContainText('Google Play ডাউনলোড লিংক প্রকাশের পর এখানে যুক্ত হবে');
});

test('center navigation opens Nearby and listing results can expand without moving the chrome', async ({ page }) => {
  await page.route('https://tile.openstreetmap.org/**', route => route.abort());
  await page.goto('/');
  if ((page.viewportSize()?.width ?? 0) >= 1100) {
    await page.getByRole('navigation', { name:'ডেস্কটপ সাইডবার' }).getByRole('link', { name:'কাছাকাছি',exact:true }).click();
  } else {
    await page.getByRole('navigation', { name:'নিচের নেভিগেশন' }).getByRole('link', { name:'খুঁজুন' }).click();
  }
  await expect(page.getByRole('heading', { name:'কাছাকাছি সেবা ও পোস্ট' })).toBeVisible();
  await page.getByRole('button', { name:'বড় ম্যাপ দেখুন' }).click();
  await expect(page.locator('.nearby-map')).toHaveClass(/nearby-map-expanded/);
  await page.getByRole('button', { name:'বড় ম্যাপ বন্ধ করুন' }).click();
  await page.goto('/jobs');
  await expect(page.getByRole('heading', { name:'চাকরিচাই' })).toBeVisible();
  const box = await page.locator('.app-header').boundingBox();
  await page.getByRole('link', { name:'বড় ভিউ' }).click();
  await expect(page.locator('.fixed-listing-frame')).toHaveClass(/is-expanded/);
  expect((await page.locator('.app-header').boundingBox())?.y).toEqual(box?.y);
  await page.goto('/tuition');
  await expect(page.getByRole('heading', { name:'পড়াই · টিউশন' })).toBeVisible();
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
