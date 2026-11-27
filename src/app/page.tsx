import Link from 'next/link';
import { ArrowUpRight, GraduationCap, Search, Store, UserRound } from 'lucide-react';
import BangladeshLiveClock from '@/components/BangladeshLiveClock';
import ShohojHubLogo from '@/components/brand/ShohojHubLogo';
import DirectorySearch from '@/components/search/DirectorySearch';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const sections = [
  { key: 'universities', title: 'বাংলাদেশের বিশ্ববিদ্যালয়', description: 'নাম বা জেলা দিয়ে খুঁজুন', icon: GraduationCap },
  { key: 'storefront', title: 'দোকান ও পণ্য', description: 'স্থানীয় দোকান ও পণ্য খুঁজুন', icon: Store },
];

export default async function HomePage() {
  const client = await createClient().catch(() => null);
  const { data } = client
    ? await client.from('system_modules').select('module_key').eq('enabled', true).in('module_key', sections.map(section => section.key))
    : { data: null };
  const visibleSections = sections.filter(section => data?.some(module => module.module_key === section.key));
  return (
    <>
      <header className="hub-header">
        <nav className="hub-width flex items-center justify-between gap-4" aria-label="প্রধান নেভিগেশন">
          <Link href="/" aria-label="সহজ হাব হোম"><ShohojHubLogo size="sm" showBanglaSubtitle /></Link>
          <div className="flex items-center gap-5">
            <Link href="#search" className="hidden items-center gap-2 sm:flex"><Search size={16} /> খুঁজুন</Link>
            <Link href="/account" className="hub-button hub-button-outline"><UserRound size={17} /> অ্যাকাউন্ট</Link>
          </div>
        </nav>
      </header>
      <main className="hub-width pb-24">
        <section className="hub-hero">
          <div className="hub-clock"><span aria-hidden="true" /><BangladeshLiveClock /></div>
          <h1>সহজ হাব<span className="hub-accent"> BD</span></h1>
          <DirectorySearch />
        </section>
        {visibleSections.length > 0 && (
          <section className="mt-12 grid gap-4" aria-labelledby="services-title">
            <h2 className="text-xl font-bold" id="services-title">সেবা</h2>
            {visibleSections.map(({ key, title, description, icon: Icon }) => (
              <Link key={key} href="#search" className="hub-card flex items-center gap-4">
                <span className="hub-icon"><Icon size={23} /></span>
                <span className="grow"><strong className="block">{title}</strong><span className="text-sm text-neutral-300">{description}</span></span>
                <ArrowUpRight size={20} className="hub-accent" aria-hidden />
              </Link>
            ))}
          </section>
        )}
      </main>
      <footer className="hub-width hub-footer">ShohojHub BD</footer>
    </>
  );
}
