import type { SVGProps } from 'react';

export function ArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.7}
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 13 14" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" {...props}>
      <path d="M2 1.8v10.4L11 7z" />
    </svg>
  );
}
