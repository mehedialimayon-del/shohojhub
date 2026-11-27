import React from 'react';

export interface ShohojHubLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showBanglaSubtitle?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { icon: 30, titleClass: 'text-base', subClass: 'text-[10px]' },
  md: { icon: 38, titleClass: 'text-xl', subClass: 'text-[11px]' },
  lg: { icon: 48, titleClass: 'text-2xl sm:text-3xl', subClass: 'text-xs' },
} as const;

export function ShohojHubLogo({
  size = 'md',
  showBanglaSubtitle = false,
  className = '',
}: ShohojHubLogoProps) {
  const dims = SIZE_MAP[size];

  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width={dims.icon}
        height={dims.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect x="2" y="2" width="44" height="44" rx="12" fill="#0A0A0A" stroke="#FF5500" strokeWidth="2.5" />
        <path
          d="M14 16.5C14 14.567 15.567 13 17.5 13H25.5C27.433 13 29 14.567 29 16.5C29 18.433 27.433 20 25.5 20H18.5C16.567 20 15 21.567 15 23.5C15 25.433 16.567 27 18.5 27H26.5C28.433 27 30 28.567 30 30.5C30 32.433 28.433 34 26.5 34H17.5C15.567 34 14 32.433 14 30.5"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M34 14V34M27 24H34"
          stroke="#FF5500"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <circle cx="34" cy="14" r="2.2" fill="#FF5500" />
      </svg>

      <span className="flex flex-col leading-none text-left">
        <span className={`font-black tracking-tight ${dims.titleClass}`}>
          <span style={{ color: 'var(--sh-text, #FFFFFF)' }}>Shohoj</span>
          <span style={{ color: 'var(--sh-accent, #FF5500)' }}>Hub</span>
        </span>
        {showBanglaSubtitle && (
          <span className={`font-semibold opacity-75 mt-1 ${dims.subClass}`}>
            সহজহাব • বাংলাদেশ
          </span>
        )}
      </span>
    </span>
  );
}

export default ShohojHubLogo;
