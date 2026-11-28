import type { SupabaseClient } from '@supabase/supabase-js';

export type PublishedListing = {
  id: string; title: string; body: string; category: string; district: string; area: string | null;
  price_min_paisa: number | null; price_max_paisa: number | null; expires_at: string | null;
  has_photo: boolean; map_lat: number | null; map_lng: number | null;
};

const cards = 'id,title,body,category,district,area,price_min_paisa,price_max_paisa,expires_at,has_photo';

export async function publicListings(client: SupabaseClient | null, filters: {
  category?: string; district?: string; q?: string; min?: number; offset?: number; map?: boolean;
}) {
  if (!client) return { rows: [] as PublishedListing[], failed: false, next: false };
  const now = new Date().toISOString();
  const projection = filters.map ? cards + ',map_lat,map_lng' : cards;
  let query = client.from('posts').select(projection).eq('status','published').lte('published_at',now)
    .or('expires_at.is.null,expires_at.gt.' + now).order('published_at',{ ascending:false }).order('id',{ ascending:false });
  if (filters.category) query = query.eq('category',filters.category);
  if (filters.district) query = query.eq('district',filters.district);
  if (filters.q && filters.q.length >= 2) query = query.textSearch('search_document',filters.q,{ config:'simple', type:'websearch' });
  if (filters.min) query = query.gte('price_min_paisa',filters.min * 100);
  const offset = filters.offset ?? 0;
  const response = await query.range(offset,offset + 23).abortSignal(AbortSignal.timeout(4500));
  return { rows: (response.data ?? []).slice(0,23) as unknown as PublishedListing[], failed: Boolean(response.error), next: (response.data?.length ?? 0) > 23 };
}
