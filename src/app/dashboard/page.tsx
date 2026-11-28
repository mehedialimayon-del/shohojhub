import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { districtGroups, loadDistricts } from '@/lib/districts';
import { savePreferences } from './actions';

const roles = { member: 'সাধারণ সদস্য', merchant: 'ব্যবসায়ী', tutor: 'শিক্ষক', guardian: 'অভিভাবক' };
const statusText: Record<string, string> = {
  saved: 'পছন্দ সংরক্ষণ হয়েছে।',
  consent: 'জেলা সংরক্ষণ করতে সম্মতি দিন।',
  unavailable: 'অ্যাকাউন্টের পছন্দ এখন সংরক্ষণ করা যাচ্ছে না।',
};

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const client = await createClient().catch(() => null);
  const { data: auth } = client ? await client.auth.getUser() : { data: null };
  if (!client || !auth?.user || auth.user.is_anonymous) redirect('/account?returnTo=/dashboard');

  const [profile, saved, districts] = await Promise.all([
    client.from('profiles').select('display_name,suspended_at,verified_at,role').eq('id', auth.user.id).maybeSingle(),
    client.from('member_preferences').select('preferred_role,district_id').eq('user_id', auth.user.id).maybeSingle(),
    loadDistricts(client),
  ]);
  const { status } = await searchParams;
  return <main className="hub-width page-content">
    <h1 className="mb-4 text-2xl font-bold">আমার ড্যাশবোর্ড</h1>
    {status && Object.hasOwn(statusText, status) && <p className="post-notice" role="status">{statusText[status]}</p>}
    {!profile.data || profile.data.suspended_at ? <div className="hub-card">
      <p>{profile.data?.suspended_at ? 'এই অ্যাকাউন্ট স্থগিত আছে।' : 'এখন প্রোফাইল পাওয়া যাচ্ছে না।'}</p>
      <Link className="mt-3 inline-block underline" href="/account">অ্যাকাউন্টে যান</Link>
    </div> : <>
      <section className="hub-card mb-4">
        <h2 className="text-lg font-bold">{profile.data.display_name || 'আমার প্রোফাইল'}</h2>
        <p className="text-sm text-neutral-300">{profile.data.verified_at ? 'প্রোফাইল যাচাই করা হয়েছে' : 'প্রোফাইল যাচাই হয়নি'}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className="hub-button hub-button-outline" href="/account">অ্যাকাউন্ট সেটিংস</Link>
          <Link className="hub-button hub-button-outline" href="/posts/manage">আমার পোস্ট</Link>
          <Link className="hub-button hub-button-outline" href="/connect">Shohoj Connect</Link>
          <Link className="hub-button hub-button-outline" href="/nearby">কাছাকাছি</Link>
        </div>
      </section>
      <form className="hub-card post-form" action={savePreferences}>
        <h2 className="font-bold">ব্যবহারের পছন্দ</h2>
        <label>আমি ব্যবহার করতে চাই<select name="role" defaultValue={saved.data?.preferred_role ?? 'member'}>
          {Object.entries(roles).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select></label>
        <p className="text-sm text-neutral-300">এই পছন্দ অনুযায়ী ড্যাশবোর্ড সাজবে। ব্যবসায়ী বা শিক্ষক হিসেবে প্রকাশের অনুমতি আলাদাভাবে যাচাই হয়।</p>
        {saved.data?.preferred_role === 'merchant' && profile.data.role === 'merchant' && <Link href="/business" className="back-link">স্টক ও ক্যাশ মেমো</Link>}
        {saved.data?.preferred_role === 'tutor' && <Link href="/modules/porai" className="back-link">পড়াই মডিউল</Link>}
        {saved.data?.preferred_role === 'guardian' && <Link href="/feed?category=tuition" className="back-link">টিউশন পোস্ট</Link>}
        <label>আমার জেলা<select name="district" defaultValue={saved.data?.district_id ?? ''}>
          <option value="">জেলা সংরক্ষণ করবেন না</option>
          {Array.from(districtGroups(districts), ([division, entries]) => <optgroup label={division} key={division}>
            {entries.map(district => <option key={district.id} value={district.id}>{district.district}</option>)}
          </optgroup>)}
        </select></label>
        <label className="flex items-start gap-2"><input name="consent" type="checkbox" defaultChecked={Boolean(saved.data?.district_id)} />
          <span>কাছাকাছি ফলাফলের জন্য নির্বাচিত জেলা ব্যক্তিগতভাবে রাখার সম্মতি দিচ্ছি।</span>
        </label>
        <button type="submit" className="hub-button">পছন্দ সংরক্ষণ করুন</button>
      </form>
    </>}
  </main>;
}
