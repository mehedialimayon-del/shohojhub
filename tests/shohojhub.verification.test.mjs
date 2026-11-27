import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('package declares required runtime dependencies',()=>{const p=JSON.parse(read('package.json'));for(const k of ['next','react','react-dom','@supabase/ssr','@supabase/supabase-js','server-only','lucide-react']) assert.ok(p.dependencies[k],k);});
test('logo SVG namespace',()=>assert.match(read('src/components/brand/ShohojHubLogo.tsx'),/http:\/\/www\.w3\.org\/2000\/svg/));
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
