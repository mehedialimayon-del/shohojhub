import HomeExperience from '@/components/home/HomeExperience';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }: { searchParams: Promise<{ banner?: string }> }) {
  const { banner } = await searchParams;
  const initialSlide = typeof banner === 'string' && /^[1-4]$/.test(banner) ? Number(banner) - 1 : 0;
  const client = await createClient().catch(() => null);
  const instant = new Date().toISOString();
  const [result, posts] = client ? await Promise.all([
    client.from('system_modules').select('module_key').eq('enabled', true).abortSignal(AbortSignal.timeout(4000)),
    client.from('posts').select('id,category,title,division,district,area,price_min_paisa,price_max_paisa,published_at,has_photo')
      .eq('status','published').lte('published_at',instant)
      .or('expires_at.is.null,expires_at.gt.' + instant).order('published_at',{ascending:false}).limit(2).abortSignal(AbortSignal.timeout(4000)),
  ]) : [{ data: null }, { data: null }];
  const enabledModuleKeys = result.data?.map((row) => row.module_key) ?? [];
  return <HomeExperience initialSlide={initialSlide} enabledModuleKeys={enabledModuleKeys} recentPosts={posts.data ?? []} />;
}
