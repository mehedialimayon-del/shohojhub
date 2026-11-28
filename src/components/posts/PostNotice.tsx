const notices: Record<string, string> = {
  invalid: 'ফর্মের তথ্য ও সময় যাচাই করুন।',
  unavailable: 'এই মুহূর্তে পোস্ট সেবা পাওয়া যাচ্ছে না।',
  submit_error: 'অনুরোধ সম্পন্ন হয়নি। অনুমতি ও পোস্টের অবস্থা যাচাই করুন।',
  saved: 'পোস্ট সংরক্ষিত হয়েছে। অনুমোদনের পর ফিডে দেখা যাবে।',
  updated: 'পোস্টের অবস্থা পরিবর্তন হয়েছে।',
  photo_error: 'ছবি সংরক্ষণ হয়নি। সর্বোচ্চ ৪ এমবি JPEG, PNG বা WebP ব্যবহার করুন।',
  photo_saved: 'পোস্টের ছবি আপডেট হয়েছে।',
  reported: 'রিপোর্ট রিভিউয়ের জন্য জমা হয়েছে।',
};

export default function PostNotice({ status }: { status?: string }) {
  return status && Object.hasOwn(notices, status) ? <p className="post-notice" role="status">{notices[status]}</p> : null;
}
