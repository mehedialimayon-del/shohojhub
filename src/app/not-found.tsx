import Link from 'next/link';
export default function NotFound() {
 return <main className="mx-auto max-w-lg px-4 py-16 text-center"><h1 className="text-4xl font-black" style={{color:'var(--sh-accent, #FF5500)'}}>404</h1><p className="my-4">Page not found.</p><Link href="/" className="rounded-xl px-5 py-3 font-bold text-white" style={{backgroundColor:'var(--sh-accent, #FF5500)'}}>Back to Home</Link></main>;
}