import { useId } from 'react';

/** Brainka mark: four droplets pointing to the centre. */
export function LogoMark({ size = 30, color = '#111' }: { size?: number; color?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill={color} aria-hidden>
      <g id={id}>
        <circle cx="15" cy="5.2" r="4.4" />
        <path d="M11.2 7.4 Q15 10.5 15 14.2 Q15 10.5 18.8 7.4 Z" />
      </g>
      <use href={`#${id}`} transform="rotate(90 15 15)" />
      <use href={`#${id}`} transform="rotate(180 15 15)" />
      <use href={`#${id}`} transform="rotate(270 15 15)" />
    </svg>
  );
}
