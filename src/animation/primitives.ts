/**
 * The "design tool" moves the agents perform:
 * draw a box, type text, drag a layer, measure spacing, swap an icon.
 */
import { clock, sleep, tween } from './clock';
import { ctx, fadeRemove, layer, mk, px, rel } from './dom';
import type { Agent } from './agents';

export interface SelOptions {
  red?: boolean;
  thin?: boolean;
  fill?: 'wire' | 'img';
  radius?: number;
  bg?: string;
  handles?: boolean;
  badge?: boolean;
  ruler?: boolean;
  travel?: number;
}

export interface Selection {
  set(x: number, y: number, w: number, h: number): void;
  unguide(): void;
  remove(): void;
  badge: HTMLElement | null;
}

/** A Figma-style selection box with handles, a "w × h" badge and ruler guides. */
export function selBox(x: number, y: number, w: number, h: number, o: SelOptions = {}): Selection {
  const cls = ['sel', o.red && 'red', o.thin && 'thin', o.fill].filter(Boolean).join(' ');
  const b = mk(cls, {}, o.fill ? ctx.under : ctx.overlay);
  if (o.radius) b.style.borderRadius = px(o.radius);
  if (o.bg) b.style.background = o.bg;
  if (o.handles !== false && !o.red) b.innerHTML = '<i></i><i></i><i></i><i></i>';

  const bd = o.badge === false ? null : mk('badge' + (o.red ? ' red' : ''));
  let guides: HTMLElement[] = [];
  if (ctx.rulersOn && o.ruler !== false) {
    guides = [
      mk('rb', { top: '0', height: '20px' }, ctx.rulerTop),
      mk('rb', { left: '0', width: '20px' }, ctx.rulerLeft),
      mk('dg h', { left: '20px' }),
      mk('dg v', { top: '20px' }),
    ];
  }

  const api: Selection = {
    badge: bd,
    set(x, y, w, h) {
      Object.assign(b.style, { left: px(x), top: px(y), width: px(w), height: px(h) });
      if (bd) {
        bd.textContent = `${Math.round(w)} × ${Math.round(h)}`;
        Object.assign(bd.style, { left: px(x + w / 2), top: px(y + h + 7) });
      }
      if (guides.length) {
        const [hx, hy, gx, gy] = guides;
        Object.assign(hx.style, { left: px(x), width: px(w) });
        Object.assign(hy.style, { top: px(y), height: px(h) });
        Object.assign(gx.style, { top: px(y), width: px(Math.max(0, x - 20)) });
        Object.assign(gy.style, { left: px(x), height: px(Math.max(0, y - 20)) });
      }
    },
    unguide() { guides.forEach((n) => fadeRemove(n)); guides = []; },
    remove() { [b, bd, ...guides].forEach((n) => fadeRemove(n)); },
  };
  api.set(x, y, w, h);
  return api;
}

/** Red spacing line with its distance label. Returns a function that removes it. */
export function redLine(x1: number, y1: number, x2: number, y2: number, label?: number | string) {
  const horiz = Math.abs(y1 - y2) < 0.5;
  const line = mk('rline', horiz
    ? { left: px(Math.min(x1, x2)), top: px(y1), width: px(Math.abs(x2 - x1)), height: '1px' }
    : { left: px(x1), top: px(Math.min(y1, y2)), width: '1px', height: px(Math.abs(y2 - y1)) });
  const b = mk('badge red', horiz
    ? { left: px((x1 + x2) / 2), top: px(y1 + 7) }
    : { left: px(x1 + 6), top: px((y1 + y2) / 2 - 8), transform: 'none' });
  b.textContent = String(label ?? Math.round(horiz ? Math.abs(x2 - x1) : Math.abs(y2 - y1)));
  return () => { fadeRemove(line); fadeRemove(b); };
}

/** Move to (x,y), switch to the crosshair and drag out a w×h box. */
export async function drawBox(a: Agent, x: number, y: number, w: number, h: number, ms = 550, o: SelOptions = {}) {
  a.setMode('arrow');
  await a.move(x, y, o.travel ?? 380);
  a.setMode('cross');
  const s = selBox(x, y, 1, 1, o);
  await tween(ms, (p) => {
    const W = Math.max(1, w * p), H = Math.max(1, h * p);
    s.set(x, y, W, H);
    a.at(x + W, y + H);
  });
  a.setMode('arrow');
  s.unguide();
  if (s.badge) setTimeout(() => fadeRemove(s.badge), 700 / clock.speed);
  return s;
}

/** Type an element's `data-text` into it with an I-beam cursor and blinking caret. */
export async function typeText(a: Agent, el: HTMLElement, o: { cps?: number; box?: boolean; travel?: number } = {}) {
  const text = el.dataset.text ?? '';
  const cps = o.cps ?? 26;

  el.textContent = text;
  const R = rel(el);
  el.textContent = '';
  el.classList.add('on');

  const box = o.box === false ? null
    : selBox(R.x - 3, R.y - 2, R.w + 6, R.h + 4, { thin: true, handles: false, badge: false, ruler: false });

  a.setMode('ibeam');
  await a.move(R.x + 2, R.y + R.h * 0.6, o.travel ?? 320);

  const caret = document.createElement('span');
  caret.className = 'caret';
  for (let i = 1; i <= text.length; i++) {
    el.textContent = text.slice(0, i);
    el.appendChild(caret);
    const c = rel(caret);
    a.at(c.x + 7, c.y + c.h * 0.7);
    await sleep(1000 / cps);
  }
  await sleep(120);
  caret.remove();
  box?.remove();
  a.setMode('arrow');
}

/** Grab a layer that sits at an offset (dx,dy) and drag it into its real position. */
export async function drag(a: Agent, el: HTMLElement, dx: number, dy: number, ms = 500,
  o: { red?: boolean; badge?: boolean; travel?: number } = {}) {
  el.style.transition = 'none';
  el.style.transform = `translate(${dx}px,${dy}px)`;
  const R = rel(el);
  const s = selBox(R.x, R.y, R.w, R.h, { red: !!o.red, handles: !o.red, badge: o.badge !== false, ruler: false });
  const gx = R.x + R.w * 0.55, gy = R.y + R.h * 0.6;

  a.setMode('arrow');
  await a.move(gx, gy, o.travel ?? 320);
  await tween(ms, (p) => {
    const cx = dx * (1 - p), cy = dy * (1 - p);
    el.style.transform = `translate(${cx}px,${cy}px)`;
    s.set(R.x - dx + cx, R.y - dy + cy, R.w, R.h);
    a.at(gx - dx + cx, gy - dy + cy);
  });
  el.style.transform = '';
  el.style.transition = '';
  await sleep(150);
  s.remove();
}

/** Select a tile's placeholder Slack icon and swap it for the right app icon. */
export async function swapIcon(a: Agent, name: string, placed: Promise<void>) {
  await placed;
  const t = layer(`t-${name}`);
  const R = rel(t);
  a.setMode('arrow');
  await a.move(R.x + R.w * 0.66, R.y + R.h * 0.68, 420);
  const inset = R.w * 0.1076;
  const s = selBox(R.x + inset, R.y + inset, R.w - 2 * inset, R.h - 2 * inset, { ruler: false });
  await sleep(260);
  t.querySelector('.tmp')?.classList.remove('on');
  t.querySelector('.g.L')?.classList.add('on');
  await sleep(420);
  s.remove();
}
