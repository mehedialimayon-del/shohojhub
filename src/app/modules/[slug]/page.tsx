import Link from 'next/link';
import { ArrowLeft, ArrowRight, LockKeyhole, Search } from 'lucide-react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getModule, modules } from '@/lib/modules';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return modules.map((item) => ({ slug: item.slug }));
}

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hubModule = getModule(slug);
  if (!hubModule) notFound();
  const client = await createClient().catch(() => null);
  const state = hubModule.enabledKey && client
    ? await client.from('system_modules').select('enabled').eq('module_key', hubModule.enabledKey).maybeSingle()
    : null;
  const previewListings = slug === 'porai' ? '/tuition' : slug === 'chakrichai' ? '/jobs' : null;
  const enabled = slug === 'my-dashboard' || Boolean(hubModule.enabledKey && state?.data?.enabled);

  return <main className="hub-width page-content module-detail">
    <Link href="/modules" className="back-link"><ArrowLeft size={17} /> সব মডিউল</Link>
    <section className={`module-detail-card tone-${hubModule.tone}`}>
      <div className="module-detail-icon" aria-hidden>{hubModule.icon}</div>
      <div className="page-kicker">{hubModule.category} <span>•</span> সহজ হাব BD</div>
      <h1>{hubModule.name}</h1>
      <h2>{hubModule.title}</h2>
      <p>{hubModule.description}</p>
      <div className={`module-detail-status ${enabled ? 'is-enabled' : 'is-disabled'}`} role="status">
        {enabled ? <><span className="status-light" /> এই মডিউল চালু আছে।</> : <><LockKeyhole size={17} /> এই মডিউল এখনো চালু করা হয়নি। চালু না হওয়া পর্যন্ত কোনো পোস্ট বা কার্যক্রম দেখানো হবে না।</>}
      </div>
      <div className="module-detail-actions">
        {enabled && hubModule.enabledKey === 'storefront' && <Link href="/#search" className="hub-button"><Search size={18} /> দোকান ও পণ্য খুঁজুন</Link>}
        {enabled && hubModule.enabledKey === 'cash_memos' && <Link href="/account" className="hub-button">অ্যাকাউন্টে যান <ArrowRight size={17} /></Link>}
        {enabled && hubModule.enabledKey === 'porai' && <Link href="/account" className="hub-button">অ্যাকাউন্টে যান <ArrowRight size={17} /></Link>}
        {enabled && hubModule.enabledKey === 'messaging' && <Link href="/connect" className="hub-button">Shohoj Connect খুলুন <ArrowRight size={17} /></Link>}
        {slug === 'my-dashboard' && <Link href="/dashboard" className="hub-button">ড্যাশবোর্ড খুলুন <ArrowRight size={17} /></Link>}
        {previewListings && <Link href={previewListings} className="hub-button">প্রকাশিত তালিকা দেখুন <ArrowRight size={17} /></Link>}
        {slug === 'amar-chahida' && <>
          <Link href="/feed?intent=need" className="hub-button">প্রয়োজনের পোস্ট দেখুন</Link>
          <Link href="/posts/new?intent=need" className="hub-button hub-button-outline">আমার প্রয়োজন পোস্ট করুন</Link>
        </>}
        <Link href="/modules" className="hub-button hub-button-outline">অন্য মডিউল দেখুন</Link>
      </div>
    </section>
  </main>;
}
