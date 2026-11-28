import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('package declares required runtime dependencies',()=>{const p=JSON.parse(read('package.json'));for(const k of ['next','react','react-dom','@supabase/ssr','@supabase/supabase-js','server-only','lucide-react']) assert.ok(p.dependencies[k],k);});
test('header uses the approved pin and separate wordmark', () => {
  const header = read('src/components/home/AppChrome.tsx');
  for (const file of ['shohojhub-pin.png', 'shohojhub-wordmark.png']) {
    assert.ok(header.includes('/brand/' + file));
    const png = readFileSync(new URL('../public/brand/' + file, import.meta.url));
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
  }
});
test('loading status and spinner',()=>{const s=read('src/app/loading.tsx');assert.match(s,/role="status"/);assert.match(s,/animate-spin/);});
test('error recovery wiring',()=>{const s=read('src/app/error.tsx');assert.match(s,/onClick=\{reset\}/);assert.match(s,/href="\/"/);});
test('404 home navigation wiring',()=>assert.match(read('src/app/not-found.tsx'),/href="\/"/));
test('browser client uses public configuration only',()=>{const s=read('src/lib/supabase/client.ts');assert.match(s,/createBrowserClient/);assert.match(s,/NEXT_PUBLIC_SUPABASE_URL/);assert.doesNotMatch(s,/SERVICE_ROLE/);});
test('server client isolates admin credentials and supports bulk cookies',()=>{const s=read('src/lib/supabase/server.ts');assert.match(s,/import 'server-only'/);assert.match(s,/getAll\(/);assert.match(s,/setAll\(/);assert.match(s,/persistSession: false/);});

import ts from 'typescript';
import vm from 'node:vm';
test('Bangladesh clock actual formatter crosses midnight and advances seconds',()=>{
 const js=ts.transpileModule(read('src/components/BangladeshLiveClock.tsx'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const exports={};vm.runInNewContext(js,{exports,require:()=>({}),Intl,Date});
 const fmt=exports.formatBangladeshTime;
 const before=fmt(new Date('2026-11-27T17:59:59Z'));const after=fmt(new Date('2026-11-27T18:00:00Z'));
 assert.match(before,/২৭ নভেম্বর/);assert.match(after,/২৮ নভেম্বর/);assert.notEqual(after,fmt(new Date('2026-11-27T18:00:01Z')));
});

test('clock timer lifecycle is wired',()=>{const s=read('src/components/BangladeshLiveClock.tsx');assert.match(s,/setInterval\(.*1000\)/);assert.match(s,/clearInterval\(timer\)/);});

test('feed is backed by public Supabase posts and validated query filters',()=>{const page=read('src/app/feed/page.tsx');const ui=read('src/components/feed/FeedExperience.tsx');assert.match(page,/from\('posts'\)/);assert.match(page,/eq\('status', 'published'\)/);assert.match(page,/textSearch\('search_document'/);assert.match(page,/allowedCategories/);assert.match(ui,/router\.push\(`\/feed/);assert.match(ui,/ফলাফল দেখুন/);});
test('post submissions require a signed-in user and are created through server validation',()=>{const action=read('src/app/posts/actions.ts');const page=read('src/app/posts/new/page.tsx');assert.match(action,/client\.auth\.getUser\(\)/);assert.match(action,/user\.is_anonymous/);assert.match(action,/from\('posts'\)\.insert/);assert.match(action,/Object\.hasOwn\(postCategories, fields\.category\)/);assert.match(action,/includes\(fields\.post_type\)/);assert.match(read('src/components/posts/PostForm.tsx'),/action=\{submitPost\}/);assert.match(read('src/components/posts/PostForm.tsx'),/রিভিউয়ের জন্য জমা দিন/);});
test('feed migration limits public visibility and prevents direct publishing',()=>{const migration=read('supabase/migrations/20261128012827_public_feed_posts.sql');const queryGrant=read('supabase/migrations/20261128052024_public_feed_query_privileges.sql');assert.match(migration,/enable row level security/);assert.match(migration,/status = 'published' and published_at <= now\(\)/);assert.match(migration,/status = 'pending'/);assert.match(migration,/owner_id = \(select auth\.uid\(\)\)/);assert.match(migration,/grant insert \(category, title/);assert.doesNotMatch(migration,/grant insert[^;]*owner_id/s);assert.match(queryGrant,/status, search_document/);});
