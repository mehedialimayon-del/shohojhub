import { submitPost } from '@/app/posts/actions';
import { divisions, postCategories, postIntents, type Post } from '@/lib/feed';

export default function PostForm({ post, intent = 'general' }: { post?: Post; intent?: string }) {
  return <form action={submitPost} className="hub-card post-form">
    {post && <input name="id" type="hidden" value={post.id} />}
    <label>উদ্দেশ্য<select name="intent" defaultValue={post?.intent ?? intent}>
      {Object.entries(postIntents).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
    </select></label>
    <label>ক্যাটাগরি<select name="category" required defaultValue={post?.category ?? ''}>
      <option value="" disabled>ক্যাটাগরি বেছে নিন</option>
      {Object.entries(postCategories).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
    </select></label>
    <label>পোস্টের শিরোনাম<input className="hub-input" name="title" required minLength={5} maxLength={140} defaultValue={post?.title} /></label>
    <label>বিস্তারিত<textarea name="body" required minLength={20} maxLength={4000} rows={5} defaultValue={post?.body} /></label>
    <div className="post-form-grid">
      <label>বিভাগ<select name="division" required defaultValue={post?.division ?? ''}><option value="" disabled>বিভাগ বেছে নিন</option>
        {divisions.map(item => <option key={item}>{item}</option>)}
      </select></label>
      <label>জেলা<input name="district" required maxLength={80} defaultValue={post?.district} /></label>
    </div>
    <label>এলাকা (ঐচ্ছিক)<input name="area" maxLength={100} defaultValue={post?.area ?? ''} /></label>
    <div className="post-form-grid">
      <label>সর্বনিম্ন মূল্য (৳)<input name="priceMin" inputMode="numeric" type="number" min="0" max="9999999999" defaultValue={post?.price_min_paisa == null ? '' : post.price_min_paisa / 100} /></label>
      <label>সর্বোচ্চ মূল্য (৳)<input name="priceMax" inputMode="numeric" type="number" min="0" max="9999999999" defaultValue={post?.price_max_paisa == null ? '' : post.price_max_paisa / 100} /></label>
    </div>
    <label>পোস্টের ধরন<select name="postType" defaultValue={post?.post_type ?? 'personal'}>
      <option value="personal">ব্যক্তিগত</option><option value="business">ব্যবসায়িক</option>
    </select></label>
    <label>যোগাযোগের নাম<input className="hub-input" name="contactName" required minLength={2} maxLength={100} defaultValue={post?.contact_name} /></label>
    <p className="post-review-note">যোগাযোগের নাম প্রকাশিত পোস্টে দেখাবে। ছবি যোগ করতে প্রথমে পোস্ট জমা দিন।</p>
    <button className="hub-button" type="submit">{post ? 'পরিবর্তন সংরক্ষণ করুন' : 'রিভিউয়ের জন্য জমা দিন'}</button>
  </form>;
}
