'use client';
import Link from 'next/link';
import { useEffect } from 'react';
export default function ErrorPage({error,reset}:{error:Error & {digest?:string};reset:()=>void}) {
 useEffect(()=>{console.error('ShohojHub error',error.digest)},[error]);
 return <main className="mx-auto max-w-lg px-4 py-16 text-center"><h1 className="text-2xl font-bold">Something went wrong</h1><p className="my-4">Please try again.</p><button onClick={reset} className="rounded-xl px-5 py-3 text-white" style={{backgroundColor:'var(--sh-accent, #FF5500)'}}>Try again</button><Link href="/" className="ml-4 underline">Back to Home</Link></main>;
}