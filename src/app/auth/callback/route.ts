import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const code = params.get('code');
  if (!code || code.length > 256) redirect('/account?status=invalid_link');
  const session = await (async () => {
    try {
      const client = await createClient();
      const { data, error } = await client.auth.exchangeCodeForSession(code);
      return error ? null : data;
    } catch {
      return null;
    }
  })();
  if (!session) redirect('/account?status=invalid_link');
  redirect('redirectType' in session && session.redirectType === 'recovery' ? '/auth/update-password' : '/account');
}
