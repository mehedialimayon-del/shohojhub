import type { SupabaseClient } from '@supabase/supabase-js';

export type District = { id: string; division: string; district: string };

export async function loadDistricts(client: SupabaseClient | null) {
  if (!client) return [];
  const { data } = await client.from('bd_districts').select('id,division,district').order('district');
  return (data ?? []) as District[];
}

export function districtGroups(rows: District[]) {
  return Map.groupBy(rows, value => value.division);
}
