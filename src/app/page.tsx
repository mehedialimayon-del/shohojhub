import HomeExperience from '@/components/home/HomeExperience';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }: { searchParams: Promise<{ banner?: string }> }) {
  const { banner } = await searchParams;
  const initialSlide = typeof banner === 'string' && /^[1-3]$/.test(banner) ? Number(banner) - 1 : 0;
  const client = await createClient().catch(() => null);
  const instant = new Date().toISOString();
  const [result, posts, offer] = client ? await Promise.all([
    client.from('system_modules').select('module_key').eq('enabled', true).abortSignal(AbortSignal.timeout(4000)),
    client.from('posts').select('id,category,title,division,district,area,price_min_paisa,price_max_paisa,published_at,has_photo')
      .eq('status','published').lte('published_at',instant)
      .or('expires_at.is.null,expires_at.gt.' + instant).order('published_at',{ascending:false}).order('id',{ascending:false}).limit(12).abortSignal(AbortSignal.timeout(4000)),
    client.from('posts').select('id,title,has_photo').eq('status','published').eq('category','deals').lte('published_at',instant)
      .or('expires_at.is.null,expires_at.gt.' + instant).order('published_at',{ascending:false}).order('id',{ascending:false}).limit(1).abortSignal(AbortSignal.timeout(4000)).maybeSingle(),
  ]) : [{ data: null }, { data: null }, { data: null }];
  const enabledModuleKeys = result.data?.map((row) => row.module_key) ?? [];
  const playStore = process.env.SHOHOJHUB_PLAY_STORE_URL?.trim();
  const storeUrl = playStore && /^https:\/\/play\.google\.com\/store\/apps\/details\?id=[\w.]+$/.test(playStore) ? playStore : undefined;
  return <HomeExperience key={initialSlide} initialSlide={initialSlide} enabledModuleKeys={enabledModuleKeys} recentPosts={posts.data ?? []} storeUrl={storeUrl} offer={offer.data} />;
}
