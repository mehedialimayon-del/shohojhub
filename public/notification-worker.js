self.addEventListener('push', event => {
  let tag;
  try { tag = event.data?.json()?.tag; } catch { /* Generic notification for malformed payloads. */ }
  event.waitUntil(self.registration.showNotification('সহজ হাব BD', {
    body: 'আপনার নতুন একটি বার্তা এসেছে।',
    icon: '/brand/shohojhub-pin.png',
    ...(typeof tag === 'string' && { tag }),
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async windows => {
    const open = windows.find(client => new URL(client.url).pathname === '/notifications');
    if (open) return open.focus();
    return self.clients.openWindow('/notifications');
  }));
});
