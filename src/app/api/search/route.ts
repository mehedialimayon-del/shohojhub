import { createClient } from '@/lib/supabase/server';

const requestsPerMinute = 90;
const maxClients = 2_000;
const clients = new Map<string, number>();
let windowStart = 0;

function allowRequest(request: Request) {
  const now = Date.now();
  if (now - windowStart >= 60_000) {
    clients.clear();
    windowStart = now;
  }
  // Vercel overwrites this header. Other deployments share a conservative per-instance budget.
  const key = (process.env.VERCEL ? request.headers.get('x-vercel-forwarded-for') : null) ?? 'shared';
  const count = clients.get(key) ?? 0;
  if ((!clients.has(key) && clients.size >= maxClients) || count >= requestsPerMinute) return false;
  clients.set(key, count + 1);
  return true;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const term = (params.get('q') ?? '').normalize('NFC').trim();
  const offsetInput = params.get('offset') ?? '0';
  const offset = Number(offsetInput);
  if (term.length < 2 || term.length > 80 || !/^\d{1,3}$/.test(offsetInput) || offset > 500) {
    return Response.json({ error: 'invalid_search' }, { status: 400 });
  }
  if (!allowRequest(request)) {
    return Response.json({ error: 'rate_limited' }, { status: 429, headers: { 'Retry-After': '60' } });
  }
  try {
    const client = await createClient();
    const { data, error } = await client.rpc('search_directory', { search_term: term, page_offset: offset }).abortSignal(request.signal);
    if (error) throw error;
    return Response.json({ results: data.slice(0, 20), next: data.length > 20 && offset < 500 ? offset + 20 : null }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return Response.json({ error: 'search_unavailable' }, { status: 503 });
  }
}
