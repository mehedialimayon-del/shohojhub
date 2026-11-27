import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
export const metadata: Metadata = {title:'ShohojHub BD',description:'ShohojHub BD'};
export default function RootLayout({children}:{children:ReactNode}) {return <html lang="bn"><body>{children}</body></html>;}
