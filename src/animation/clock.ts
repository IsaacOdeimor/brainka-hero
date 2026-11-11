/**
 * One virtual clock drives every wait and tween in the animation.
 * Changing `speed` slows or speeds up everything mid-flight, and
 * `cancelAll()` stops a run cleanly (used by Replay).
 */
export class Cancel extends Error {}

type Ease = (p: number) => number;
type Waiter = { t: number; res: () => void; rej: (e: unknown) => void };
type Tween = {
  t0: number; d: number; e: Ease;
  fn: (p: number, dt: number) => void;
  res: () => void; rej: (e: unknown) => void;
};

export const ease = {
  linear: (p: number) => p,
  inOut: (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  out: (p: number) => 1 - Math.pow(1 - p, 3),
};

class Clock {
  /** virtual time in ms */
  now = 0;
  speed = 1;
  private last: number | null = null;
  private waits = new Set<Waiter>();
  private tweens = new Set<Tween>();
  private raf = 0;

  start() {
    if (this.raf) return;
    const loop = (t: number) => {
      const dt = this.last == null ? 0 : Math.min(50, t - this.last) * this.speed;
      this.last = t;
      this.now += dt;
      for (const w of [...this.waits]) {
        if (this.now >= w.t) { this.waits.delete(w); w.res(); }
      }
      for (const tw of [...this.tweens]) {
        const p = Math.min(1, (this.now - tw.t0) / tw.d);
        tw.fn(tw.e(p), dt);
        if (p >= 1) { this.tweens.delete(tw); tw.res(); }
      }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  sleep(ms: number) {
    return new Promise<void>((res, rej) => this.waits.add({ t: this.now + ms, res, rej }));
  }

  tween(ms: number, fn: (p: number, dt: number) => void, e: Ease = ease.inOut) {
    return new Promise<void>((res, rej) =>
      this.tweens.add({ t0: this.now, d: Math.max(1, ms), fn, e, res, rej }));
  }

  cancelAll() {
    for (const w of this.waits) w.rej(new Cancel());
    for (const t of this.tweens) t.rej(new Cancel());
    this.waits.clear();
    this.tweens.clear();
  }
}

export const clock = new Clock();
export const sleep = (ms: number) => clock.sleep(ms);
export const tween = (ms: number, fn: (p: number, dt: number) => void, e?: Ease) => clock.tween(ms, fn, e);
