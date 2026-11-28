import Link from 'next/link';
import { ArrowLeft, FilePlus2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { submitPost } from '../actions';

export const dynamic = 'force-dynamic';

const notices: Record<string, string> = {
  invalid: 'সব তথ্য ঠিকভাবে দিন। শিরোনাম অন্তত ৫ অক্ষর এবং বিবরণ অন্তত ২০ অক্ষর হতে হবে।',
  unavailable: 'এই মুহূর্তে পোস্ট সেবা পাওয়া যাচ্ছে না। পরে আবার চেষ্টা করুন।',
  submit_error: 'পোস্ট জমা হয়নি। তথ্য যাচাই করে আবার চেষ্টা করুন।',
};

export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const client = await createClient().catch(() => null);
  const { data: { user } = { user: null } } = client ? await client.auth.getUser() : { data: { user: null } };
  return <main className="hub-width page-content post-compose-page">
    <Link href="/feed" className="hub-button hub-button-outline post-back"><ArrowLeft size={17} /> লাইভ ফিডে ফিরুন</Link>
    <div className="page-title-row"><div><span className="page-kicker">সহজ হাব BD <span>›</span> পোস্ট</span><h1><FilePlus2 size={29} /> নতুন পোস্ট দিন</h1><p>আপনার এলাকার চাকরি, পণ্য, সেবা বা সুযোগ শেয়ার করুন।</p></div></div>
    {status && Object.hasOwn(notices, status) && <p className="post-notice" role="status">{notices[status]}</p>}
    {!user || user.is_anonymous ? <section className="hub-card post-login-prompt"><strong>পোস্ট দিতে সাইন ইন প্রয়োজন</strong><p>আপনার পোস্টটি রিভিউয়ের জন্য জমা হবে। অনুমোদনের পরই লাইভ ফিডে দেখা যাবে।</p><Link className="hub-button" href="/account?mode=login&returnTo=%2Fposts%2Fnew">সাইন ইন করুন</Link></section> : <form action={submitPost} className="hub-card post-form">
      <label>ক্যাটাগরি<select name="category" required defaultValue=""><option value="" disabled>ক্যাটাগরি বেছে নিন</option><option value="jobs">চাকরি</option><option value="tuition">টিউশন</option><option value="products">পণ্য</option><option value="services">সেবা</option><option value="rentals">বাসা ভাড়া</option><option value="education">শিক্ষা/ভর্তি</option><option value="study_abroad">বিদেশে পড়াশোনা</option><option value="deals">অফার/ডিল</option></select></label>
      <label>পোস্টের শিরোনাম<input className="hub-input" name="title" required minLength={5} maxLength={140} placeholder="যেমন: মার্কেটিং এক্সিকিউটিভ প্রয়োজন" /></label>
      <label>বিস্তারিত<textarea name="body" required minLength={20} maxLength={4000} rows={5} placeholder="কাজ, পণ্য বা সেবার প্রয়োজনীয় তথ্য লিখুন" /></label>
      <div className="post-form-grid"><label>বিভাগ<select name="division" required defaultValue=""><option value="" disabled>বিভাগ বেছে নিন</option>{['ঢাকা','চট্টগ্রাম','রংপুর','রাজশাহী','খুলনা','বরিশাল','সিলেট','ময়মনসিংহ'].map((item) => <option key={item}>{item}</option>)}</select></label><label>জেলা<input name="district" required maxLength={80} placeholder="জেলার নাম" /></label></div>
      <label>এলাকা (ঐচ্ছিক)<input name="area" maxLength={100} placeholder="উপজেলা বা এলাকার নাম" /></label>
      <div className="post-form-grid"><label>সর্বনিম্ন মূল্য (৳)<input name="priceMin" inputMode="numeric" type="number" min="0" max="10000000000" placeholder="ঐচ্ছিক" /></label><label>সর্বোচ্চ মূল্য (৳)<input name="priceMax" inputMode="numeric" type="number" min="0" max="10000000000" placeholder="ঐচ্ছিক" /></label></div>
      <label>পোস্টের ধরন<select name="postType" defaultValue="personal"><option value="personal">ব্যক্তিগত</option><option value="business">ব্যবসায়িক</option></select></label>
      <label>যোগাযোগের নাম<input className="hub-input" name="contactName" required minLength={2} maxLength={100} defaultValue={typeof user.user_metadata?.display_name === 'string' ? user.user_metadata.display_name.slice(0,100) : ''} /></label>
      <p className="post-review-note">আপনার যোগাযোগের নাম প্রকাশিত পোস্টে দেখা যাবে। জমা দেওয়া পোস্ট প্রথমে রিভিউ হবে এবং অনুমোদনের পরই পাবলিক ফিডে দেখাবে।</p>
      <button className="hub-button" type="submit">রিভিউয়ের জন্য জমা দিন</button>
    </form>}
  </main>;
}
