import { Loader2 } from 'lucide-react';
export default function Loading() {
 return <div role="status" className="flex min-h-[40vh] items-center justify-center gap-3" style={{color:'var(--sh-accent, #FF5500)'}}><Loader2 className="h-7 w-7 animate-spin"/><span>Loading ShohojHub...</span></div>;
}