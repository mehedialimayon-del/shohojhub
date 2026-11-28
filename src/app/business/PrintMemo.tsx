'use client';

export default function PrintMemo() {
  return <button className="hub-button print:hidden" onClick={() => window.print()}>প্রিন্ট বা PDF</button>;
}
