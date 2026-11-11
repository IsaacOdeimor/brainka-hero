/**
 * The faint orbit lines behind the app tiles, in the visual's own
 * 690×798 coordinate space. Their lower halves fade out behind the head.
 */
export const ORBITS = [
  { id: 'arcO', cx: 344, cy: 250, rx: 330, ry: 152, stroke: '#d2d2d6', width: 1.2 },
  { id: 'arcI', cx: 344, cy: 256, rx: 248, ry: 121, stroke: '#d6d6da', width: 1.2 },
  { id: 'arcH', cx: 344, cy: 266, rx: 235, ry: 48, stroke: '#f7f7f8', width: 2 },
] as const;

/** Full ellipse as a path that starts on the left and sweeps over the top (so it can be "drawn"). */
const ellipsePath = ({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) =>
  `M${cx - rx} ${cy} A${rx} ${ry} 0 1 1 ${cx + rx} ${cy} A${rx} ${ry} 0 1 1 ${cx - rx} ${cy}`;

export default function Orbit() {
  return (
    <svg id="arcs" viewBox="0 0 690 798" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <defs>
        <linearGradient id="fadeG" x1="0" y1="0" x2="0" y2="798" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.302" stopColor="#fff" />
          <stop offset="0.377" stopColor="#000" />
        </linearGradient>
        <mask id="fadeM" maskUnits="userSpaceOnUse" x="-20" y="-20" width="730" height="838">
          <rect x="-20" y="-20" width="730" height="838" fill="url(#fadeG)" />
        </mask>
      </defs>
      <g mask="url(#fadeM)" fill="none">
        {ORBITS.map((o) => (
          <path key={o.id} id={o.id} className="L" d={ellipsePath(o)} stroke={o.stroke}
            strokeWidth={o.width} />
        ))}
      </g>
    </svg>
  );
}
