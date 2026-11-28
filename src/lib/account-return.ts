export function accountReturnTo(value: unknown) {
  return typeof value === 'string'
    && (/^\/posts\/new(?:\?intent=(need|offer))?$/.test(value) || ['/dashboard', '/connect', '/notifications'].includes(value))
    ? value : '/account';
}
