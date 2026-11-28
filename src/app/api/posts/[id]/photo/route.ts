import { createClient } from '@/lib/supabase/server';
import { postIdPattern } from '@/lib/feed';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!postIdPattern.test(id)) return new Response(null, { status: 404 });
  const client = await createClient().catch(() => null);
  if (!client) return new Response(null, { status: 503 });
  const { data, error } = await client.storage.from('feed-photos').download(id);
  if (error || !data || !['image/jpeg','image/png','image/webp'].includes(data.type)) return new Response(null, { status: 404 });
  return new Response(data, {
    headers: { 'Content-Type': data.type, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' },
  });
}
