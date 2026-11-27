import HomeExperience from '@/components/home/HomeExperience';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const client = await createClient().catch(() => null);
  const result = client
    ? await client.from('system_modules').select('module_key').eq('enabled', true)
    : { data: null };
  const enabledModuleKeys = result.data?.map((row) => row.module_key) ?? [];
  return <HomeExperience enabledModuleKeys={enabledModuleKeys} />;
}
