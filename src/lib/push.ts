import 'server-only';
import webPush from 'web-push';
import { createAdminClient } from '@/lib/supabase/server';

export function validPushEndpoint(input: unknown): input is string {
  if (typeof input !== 'string' || input.length < 20 || input.length > 2048) return false;
  try {
    const url = new URL(input);
    return url.protocol === 'https:' && !url.port && !url.username && !url.password && !url.hash
      && ['fcm.googleapis.com', 'updates.push.services.mozilla.com', 'web.push.apple.com'].includes(url.hostname);
  } catch { return false; }
}

export function publicPushKey() {
  const { SHOHOJHUB_VAPID_PUBLIC_KEY: key, SHOHOJHUB_VAPID_PRIVATE_KEY: secret, SHOHOJHUB_VAPID_CONTACT: contact, SUPABASE_SERVICE_ROLE_KEY: database } = process.env;
  return secret && contact && database && key && /^[A-Za-z0-9_-]{87}$/.test(key) ? key : '';
}

export async function deliverMessagePush(recipient: string, message: string) {
  const key = publicPushKey();
  if (!key) return;
  try {
    const admin = createAdminClient();
    const [enabled, notification, devices] = await Promise.all([
      admin.from('system_modules').select('enabled').eq('module_key', 'notifications').maybeSingle(),
      admin.from('notifications').select('id').eq('user_id', recipient).eq('message_id', message).maybeSingle(),
      admin.from('push_subscriptions').select('endpoint,p256dh,auth').eq('user_id', recipient)
        .order('updated_at', { ascending: false }).limit(8),
    ]);
    if (!enabled.data?.enabled || !notification.data) return;
    await Promise.allSettled((devices.data ?? []).filter(device => validPushEndpoint(device.endpoint)).map(async device => {
      try {
        await webPush.sendNotification({ endpoint: device.endpoint, keys: { p256dh: device.p256dh, auth: device.auth } },
          JSON.stringify({ tag: message }), {
            TTL: 3600, timeout: 4000, topic: message.replaceAll('-', ''),
            vapidDetails: { subject: process.env.SHOHOJHUB_VAPID_CONTACT!, publicKey: key, privateKey: process.env.SHOHOJHUB_VAPID_PRIVATE_KEY! },
          });
      } catch (error) {
        if (error instanceof webPush.WebPushError && [404, 410].includes(error.statusCode)) {
          await admin.from('push_subscriptions').delete().eq('endpoint', device.endpoint).eq('user_id', recipient);
        }
      }
    }));
  } catch {
    // The in-app notification remains available when push delivery is unavailable.
  }
}
