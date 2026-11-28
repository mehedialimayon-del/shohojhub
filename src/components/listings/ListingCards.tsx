import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, MapPin, Radio, Tag } from 'lucide-react';
import type { PublishedListing } from '@/lib/public-listings';
import { postCategories } from '@/lib/feed';

const numbers = new Intl.NumberFormat('bn-BD');
const days = new Intl.DateTimeFormat('bn-BD', { dateStyle:'medium', timeZone:'Asia/Dhaka' });

export default function ListingCards({ rows, failed }: { rows: PublishedListing[]; failed: boolean }) {
  if (failed || !rows.length) return <div role="status" className="fixed-results-empty">
    <Radio aria-hidden /><p>{failed ? 'ফলাফল এখন লোড করা যাচ্ছে না।' : 'এই ফিল্টারে প্রকাশিত কোনো ফলাফল পাওয়া যায়নি।'}</p>
  </div>;
  return <ul className="fixed-result-cards">
    {rows.map(row => <li key={row.id} className="fixed-result-card">
      {row.has_photo ? <Image src={'/api/posts/' + row.id + '/photo'} width={106} height={84} unoptimized alt="" /> : <span className="fixed-result-icon"><Tag aria-hidden /></span>}
      <div><b>{postCategories[row.category as keyof typeof postCategories] ?? 'সহজ হাব'}</b><h2>{row.title}</h2>
        <small><MapPin size={14} /> {[row.area,row.district].filter(Boolean).join(', ')}</small>
        {row.price_min_paisa !== null && <strong>৳ {numbers.format(row.price_min_paisa / 100)}{row.price_max_paisa !== null && row.price_max_paisa !== row.price_min_paisa ? ' – ' + numbers.format(row.price_max_paisa / 100) : ''}</strong>}
        {row.expires_at && <small><CalendarDays size={14} /> {days.format(new Date(row.expires_at))}</small>}
      </div>
      <Link className="fixed-result-open" href={'/posts/' + row.id} aria-label={row.title + ' বিস্তারিত'}>বিস্তারিত <ArrowRight size={15} /></Link>
    </li>)}
  </ul>;
}
