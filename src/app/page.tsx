import HomeExperience from '@/components/home/HomeExperience';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const client = await createClient().catch(() => null);
  const result = client
    ? await client.from('system_modules').select('module_key').eq('enabled', true)
    : { data: null };
  const enabledModuleKeys = result.data?.map((row) => row.module_key) ?? [];
  const posts = client
    ? await client.from('posts').select('id,category,title,division,district,price_min_paisa,price_max_paisa,published_at')
      .eq('status','published').lte('published_at',new Date().toISOString()).order('published_at',{ascending:false}).limit(2)
    : { data: null };
  return <HomeExperience enabledModuleKeys={enabledModuleKeys} recentPosts={posts.data ?? []} />;
}
