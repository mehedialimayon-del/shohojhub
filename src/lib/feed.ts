export const postIntents = { general: 'সাধারণ পোস্ট', need: 'আমার প্রয়োজন', offer: 'আমি সেবা দেব' };
export const postTypes = { personal: 'ব্যক্তিগত', business: 'ব্যবসায়িক', sponsored: 'স্পনসরড' };
export const postCategories = {
  jobs: 'চাকরি', tuition: 'টিউশন', products: 'পণ্য', services: 'সেবা', rentals: 'বাসা ভাড়া',
  education: 'শিক্ষা/ভর্তি', study_abroad: 'বিদেশে পড়াশোনা', deals: 'অফার/ডিল',
};
export const divisions = ['ঢাকা', 'চট্টগ্রাম', 'রংপুর', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'ময়মনসিংহ'];
export const postColumns = 'id,category,title,body,division,district,area,price_min_paisa,price_max_paisa,post_type,contact_name,status,intent,has_photo,created_at,published_at,expires_at,map_lat,map_lng';
export const postIdPattern = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;

export type Post = {
  id: string; category: string; title: string; body: string; division: string; district: string; area: string | null;
  price_min_paisa: number | null; price_max_paisa: number | null; post_type: string; contact_name: string;
  status: string; intent: string; has_photo: boolean; created_at: string; published_at: string | null; expires_at: string | null;
  map_lat: number | null; map_lng: number | null;
};

export function postStatus(post: Pick<Post, 'status' | 'published_at' | 'expires_at'>) {
  if (post.status === 'published') {
    if (post.published_at && Date.parse(post.published_at) > Date.now()) return 'প্রকাশের সময় নির্ধারিত';
    if (post.expires_at && Date.parse(post.expires_at) <= Date.now()) return 'মেয়াদ শেষ';
    return 'প্রকাশিত';
  }
  if (post.status === 'archived') return 'বন্ধ';
  if (post.status === 'rejected') return 'অনুমোদন হয়নি';
  return 'রিভিউয়ের অপেক্ষায়';
}
