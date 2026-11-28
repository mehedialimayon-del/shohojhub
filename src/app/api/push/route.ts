import { createClient } from '@/lib/supabase/server';
import { publicPushKey, validPushEndpoint } from '@/lib/push';

async function updateSubscription(request: Request, remove: boolean) {
  if (request.headers.get('sec-fetch-site') === 'cross-site' || !request.headers.get('content-type')?.startsWith('application/json')) {
    return new Response(null, { status: 403 });
  }
  const client = await createClient().catch(() => null);
  const { data } = client ? await client.auth.getUser() : { data: null };
  if (!client || !data?.user || data.user.is_anonymous) return new Response(null, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!validPushEndpoint(body?.endpoint)) return new Response(null, { status: 400 });

  if (remove) {
    const { error } = await client.from('push_subscriptions').delete().eq('endpoint', body.endpoint);
    return new Response(null, { status: error ? 409 : 204 });
  }
  const { data: module } = await client.from('system_modules').select('enabled').eq('module_key','notifications').maybeSingle();
  if (!publicPushKey() || !module?.enabled) return new Response(null, { status: 503 });
  const p256dh = body?.keys?.p256dh;
  const auth = body?.keys?.auth;
  if (typeof p256dh !== 'string' || typeof auth !== 'string' || !/^[A-Za-z0-9_-]{87}$/.test(p256dh) || !/^[A-Za-z0-9_-]{22}$/.test(auth)) {
    return new Response(null, { status: 400 });
  }
  const { error } = await client.from('push_subscriptions').upsert({ endpoint: body.endpoint, p256dh, auth });
  return new Response(null, { status: error ? 409 : 204 });
}

export async function POST(request: Request) {
  return updateSubscription(request, false);
}

export async function DELETE(request: Request) {
  return updateSubscription(request, true);
}
