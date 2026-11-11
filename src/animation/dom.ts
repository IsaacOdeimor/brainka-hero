import { clock } from './clock';

/** Shared handles to the frame layers, set once per run. */
export const ctx = {
  frame: null as unknown as HTMLElement,
  page: null as unknown as HTMLElement,
  overlay: null as unknown as HTMLElement,
  under: null as unknown as HTMLElement,
  rulerTop: null as unknown as HTMLElement,
  rulerLeft: null as unknown as HTMLElement,
  rulersOn: false,
};

export const px = (v: number) => `${v}px`;

export function mk(cls: string, style: Partial<CSSStyleDeclaration> = {}, parent: HTMLElement = ctx.overlay) {
  const d = document.createElement('div');
  d.className = cls;
  Object.assign(d.style, style);
  parent.appendChild(d);
  return d;
}

export function fadeRemove(n: Element | null | undefined, ms = 260) {
  if (!n) return;
  n.classList.add('out');
  setTimeout(() => n.remove(), ms / clock.speed);
}

export type Box = { x: number; y: number; w: number; h: number };

/** Element bounds in frame coordinates (what the overlay draws in). */
export function rel(el: Element): Box {
  const f = ctx.frame.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return { x: r.left - f.left, y: r.top - f.top, w: r.width, h: r.height };
}

/** A client-space point → frame coordinates. */
export function toFrame(x: number, y: number) {
  const f = ctx.frame.getBoundingClientRect();
  return { x: x - f.left, y: y - f.top };
}

/** Find a layer inside the hero page. */
export const layer = <T extends Element = HTMLElement>(id: string) =>
  ctx.page.querySelector(`#${id}`) as T;

/** Is the layer laid out at this screen size? (e.g. nav links are hidden on phones) */
export const visible = (id: string) => {
  const el = layer(id);
  return !!el && el.getClientRects().length > 0;
};

export const box = (id: string) => rel(layer(id));

export const show = (id: string) => layer(id).classList.add('on');

/**
 * Lock every text layer to its finished size, so typing it in
 * (or renaming "Product" → "Solutions") never pushes the layout around.
 */
export function lockTextSizes() {
  ctx.page.querySelectorAll<HTMLElement>('[data-text]').forEach((el) => {
    const r = el.getBoundingClientRect();
    el.style.minWidth = px(r.width);
    el.style.minHeight = px(r.height);
  });
}
export function unlockTextSizes() {
  ctx.page.querySelectorAll<HTMLElement>('[data-text]').forEach((el) => {
    el.style.minWidth = '';
    el.style.minHeight = '';
  });
}
