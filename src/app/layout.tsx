import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import AppChrome from '@/components/home/AppChrome';

export const metadata: Metadata = {
  title: 'সহজ হাব BD — এক প্ল্যাটফর্মে সব প্রয়োজন',
  description: 'বাংলাদেশের স্থানীয় সেবা, পণ্য, শিক্ষা, চাকরি ও প্রয়োজনীয় ডিজিটাল টুল এক জায়গায়।',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="bn"><body><AppChrome>{children}</AppChrome></body></html>;
}
