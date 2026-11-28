import FeedExperience, { type FeedPost, type FeedQuery } from '@/components/feed/FeedExperience';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const categorySlugs: Record<string, string> = {
  'চাকরি':'jobs','টিউশন':'tuition','পণ্য':'products','সেবা':'services','বাসা ভাড়া':'rentals',
  'শিক্ষা':'education','শিক্ষা/ভর্তি':'education','বিদেশে পড়াশোনা':'study_abroad','অফার':'deals','অফার/ডিল':'deals',
};
const allowedCategories = new Set(['jobs','tuition','products','services','rentals','education','study_abroad','deals']);
const intFilter = (value?: string) => value && /^\d{1,10}$/.test(value) ? Number(value) * 100 : null;

export default async function FeedPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const one = (key: string) => typeof params[key] === 'string' ? params[key] as string : '';
  const initial: FeedQuery = {
    category: categorySlugs[one('category')] ?? (allowedCategories.has(one('category')) ? one('category') : ''),
    categories: (one('categories').split(',').filter((item) => allowedCategories.has(item))).slice(0,8),
    division: one('division').slice(0,80), district: one('district').slice(0,80), area: one('area').slice(0,100),
    min: one('min').match(/^\d{1,10}$/) ? one('min') : '', max: one('max').match(/^\d{1,10}$/) ? one('max') : '',
    types: one('types').split(',').filter((item) => ['personal','business','sponsored'].includes(item)).slice(0,3),
    q: one('q').trim().slice(0,100),
  };
  let posts: FeedPost[] = [];
  let count = 0;
  let unavailable = false;
  try {
    const client = await createClient();
    let query = client.from('posts').select('id,category,title,body,division,district,area,price_min_paisa,price_max_paisa,post_type,contact_name,created_at,published_at', { count: 'exact' })
      .eq('status', 'published').lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(40);
    if (initial.q) query = query.textSearch('search_document', initial.q, { type: 'websearch', config: 'simple' });
    if (initial.category) query = query.eq('category', initial.category);
    if (initial.categories.length) query = query.in('category', initial.categories);
    if (initial.division) query = query.eq('division', initial.division);
    if (initial.district) query = query.eq('district', initial.district);
    if (initial.area) query = query.eq('area', initial.area);
    const min = intFilter(initial.min);
    const max = intFilter(initial.max);
    if (min !== null) query = query.or(`price_max_paisa.is.null,price_max_paisa.gte.${min}`);
    if (max !== null) query = query.or(`price_min_paisa.is.null,price_min_paisa.lte.${max}`);
    if (initial.types.length) query = query.in('post_type', initial.types);
    const result = await query;
    if (result.error) unavailable = true;
    else { posts = (result.data ?? []) as FeedPost[]; count = result.count ?? posts.length; }
  } catch { unavailable = true; }
  return <FeedExperience initial={initial} posts={posts} count={count} unavailable={unavailable} />;
}
