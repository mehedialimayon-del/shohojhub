import ModulesDirectory from '@/components/modules/ModulesDirectory';
import { createClient } from '@/lib/supabase/server';
import { modules } from '@/lib/modules';

export const dynamic = 'force-dynamic';

export default async function ModulesPage() {
  const client = await createClient().catch(() => null);
  const result = client ? await client.from('system_modules').select('module_key').eq('enabled', true) : { data: null };
  return <ModulesDirectory modules={modules} enabledModuleKeys={result.data?.map((item) => item.module_key) ?? []} />;
}
