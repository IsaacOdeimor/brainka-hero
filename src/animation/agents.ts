import { ease, tween } from './clock';
import { mk } from './dom';

export type CursorMode = 'arrow' | 'cross' | 'ibeam' | 'pen';

const CURSORS: Record<CursorMode, (c: string) => string> = {
  arrow: (c) => `<svg width="22" height="22" style="left:-2px;top:-2px"><path d="M2 2 L19 8.6 L11.2 11.2 L8.6 19 Z" fill="${c}" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  cross: (c) => `<svg width="20" height="20" style="left:-10px;top:-10px"><path d="M10 1.5v17M1.5 10h17" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/><path d="M10 1.5v17M1.5 10h17" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  ibeam: (c) => `<svg width="12" height="24" style="left:-6px;top:-12px"><path d="M2.5 2h7M2.5 22h7M6 2v20" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/><path d="M2.5 2h7M2.5 22h7M6 2v20" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  pen: (c) => `<svg width="26" height="26" style="left:-1px;top:-1px"><path d="M1.5 1.5 L5.5 12 L12 5.5 Z" fill="${c}" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 9 L18 18" stroke="#fff" stroke-width="6" stroke-linecap="round"/><path d="M9 9 L18 18" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><path d="M20 4v6M17 7h6" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/></svg>`,
};

export const AGENT_COLORS = [
  '#ef4444', '#eab308', '#0ea5e9', '#16a34a', '#ec4899',
  '#8b5cf6', '#f97316', '#14b8a6', '#fb7185', '#6366f1',
];

/** One "agent": a coloured cursor that can move, change tool, and fly with the swarm. */
export class Agent {
  x: number; y: number;
  vx = 0; vy = 0;
  rot = 0;
  fly = false;
  mode: CursorMode = 'arrow';
  readonly node: HTMLDivElement;

  constructor(readonly color: string, x = 720, y = 463) {
    this.x = x; this.y = y;
    this.node = mk('agent');
    this.setMode('arrow');
  }

  setMode(m: CursorMode) {
    this.mode = m;
    this.node.innerHTML = CURSORS[m](this.color);
    if (m !== 'arrow') this.rot = 0;
    this.draw();
    return this;
  }

  draw() {
    this.node.style.transform = `translate(${this.x}px,${this.y}px) rotate(${this.rot}deg)`;
  }

  at(x: number, y: number) { this.x = x; this.y = y; this.draw(); }

  move(x: number, y: number, ms = 420, e = ease.inOut) {
    if (this.mode === 'arrow') this.rot = 0;
    const x0 = this.x, y0 = this.y;
    return tween(ms, (p) => this.at(x0 + (x - x0) * p, y0 + (y - y0) * p), e);
  }
}

/**
 * Spring-physics flight for the swarm (intro and victory lap).
 * Each flying agent is pulled toward `target(agent, i, t)`, pushed away
 * from its neighbours, and its arrow turns to face where it is going.
 */
export function flight(
  agents: Agent[],
  ms: number,
  target: (a: Agent, i: number, t: number) => [number, number],
  opts: { k?: number; c?: number; sep?: number } = {},
  now: () => number,
) {
  const k = opts.k ?? 1.1e-4, c = opts.c ?? 0.016, sep = opts.sep ?? 26;
  return tween(ms, (_p, dt) => {
    const steps = Math.max(1, Math.ceil(dt / 8)), h = dt / steps;
    for (let s = 0; s < steps; s++) {
      agents.forEach((a, i) => {
        if (!a.fly) return;
        const [tx, ty] = target(a, i, now());
        let ax = (tx - a.x) * k - a.vx * c;
        let ay = (ty - a.y) * k - a.vy * c;
        for (const b of agents) {
          if (b === a || !b.fly) continue;
          const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < sep * sep && d2 > 0.01) {
            const f = 2.2e-3 / Math.sqrt(d2);
            ax += dx * f; ay += dy * f;
          }
        }
        a.vx += ax * h; a.vy += ay * h;
        a.x += a.vx * h; a.y += a.vy * h;
      });
    }
    for (const a of agents) {
      if (!a.fly) continue;
      if (Math.hypot(a.vx, a.vy) > 0.02) a.rot = (Math.atan2(a.vy, a.vx) * 180) / Math.PI + 135;
      a.draw();
    }
  }, ease.linear);
}
