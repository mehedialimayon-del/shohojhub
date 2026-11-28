'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { HubModule } from '@/lib/modules';

const categories = ['সব', 'পণ্য', 'শিক্ষা', 'চাকরি', 'সেবা', 'ব্যবসা', 'টুলস', 'কমিউনিটি', 'অ্যাকাউন্ট', 'প্রশাসন'];

export default function ModulesDirectory({ modules, enabledModuleKeys }: { modules: HubModule[]; enabledModuleKeys: string[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('সব');
  const visibleModules = useMemo(() => modules.filter((item) => {
    const matchesCategory = category === 'সব' || item.category === category;
    const text = `${item.name} ${item.title} ${item.category}`.toLocaleLowerCase('bn');
    return matchesCategory && (!query.trim() || text.includes(query.trim().toLocaleLowerCase('bn')));
  }), [category, modules, query]);

  return (
    <main className="hub-width page-content modules-page">
      <div className="page-kicker">সহজ হাব BD <span>•</span> ৪০টি মডিউল</div>
      <div className="page-title-row"><div><h1>সব মডিউল</h1><p>আপনার প্রয়োজন অনুযায়ী একটি সেবা বেছে নিন।</p></div><span className="module-total">{visibleModules.length} / {modules.length}</span></div>
      <label className="module-search"><Search size={19} /><span className="sr-only">মডিউল খুঁজুন</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="মডিউলের নাম দিয়ে খুঁজুন" /></label>
      <div className="module-category-list" role="group" aria-label="মডিউল ক্যাটাগরি">
        {categories.map((item) => <button type="button" className={category === item ? 'selected' : ''} aria-pressed={category === item} key={item} onClick={() => setCategory(item)}>{item}</button>)}
      </div>
      {visibleModules.length ? <div className="directory-grid">
        {visibleModules.map((item) => {
          const enabled = Boolean(item.enabledKey && enabledModuleKeys.includes(item.enabledKey));
          return <Link href={`/modules/${item.slug}`} className={`directory-card tone-${item.tone}`} key={item.slug}>
            <span className="directory-icon" aria-hidden>{item.icon}</span>
            <span className="directory-card-copy"><strong>{item.name}</strong><small>{item.title}</small></span>
            <span className={`module-status ${enabled ? 'is-enabled' : 'is-disabled'}`}>{enabled ? 'চালু' : 'প্রস্তুত হচ্ছে'}</span>
          </Link>;
        })}
      </div> : <p className="no-module-results" role="status">এই নামে কোনো মডিউল পাওয়া যায়নি।</p>}
    </main>
  );
}
