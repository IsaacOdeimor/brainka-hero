import { useEffect, useRef, useState, type RefObject } from 'react';
import { Cancel, clock } from './clock';
import { ctx } from './dom';
import { setRulers } from './rulers';
import { rebuild } from './timeline';

type Run = { id: number; animate: boolean };

/**
 * Runs the rebuild animation on mount and on every replay.
 * Returns the run id (use it as the page `key` so each replay starts
 * from a freshly mounted, finished hero).
 *
 * If the window is resized mid-animation, the run is dropped and the
 * finished, fully responsive hero is shown instead.
 *
 * Keys: R = replay, 1 = 1×, 2 = 2×, 0 = 0.5× (slow-mo for recording).
 */
export function useRebuild(frameRef: RefObject<HTMLDivElement | null>) {
  const [run, setRun] = useState<Run>({ id: 0, animate: true });
  const running = useRef(false);

  useEffect(() => {
    clock.start();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') setRun((r) => ({ id: r.id + 1, animate: true }));
      if (e.key === '1') clock.speed = 1;
      if (e.key === '2') clock.speed = 2;
      if (e.key === '0') clock.speed = 0.5;
    };
    let lastW = window.innerWidth, lastH = window.innerHeight;
    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      const changed = w !== lastW || Math.abs(h - lastH) > 120; // ignore mobile URL-bar jitter
      lastW = w; lastH = h;
      if (changed && running.current) setRun((r) => ({ id: r.id + 1, animate: false }));
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const q = (sel: string) => frame.querySelector<HTMLElement>(sel)!;

    Object.assign(ctx, {
      frame,
      page: q('#page'),
      overlay: q('#overlay'),
      under: q('#under'),
      rulerTop: q('#rt'),
      rulerLeft: q('#rl'),
    });

    // clean slate
    clock.cancelAll();
    ctx.overlay.innerHTML = '';
    ctx.under.innerHTML = '';
    q('#btile').classList.remove('on');
    setRulers(false);
    if (!run.animate) { running.current = false; return; }

    let alive = true;
    running.current = true;
    (async () => {
      await document.fonts.ready; // measure with the real font
      if (!alive) return;
      await rebuild();
    })()
      .catch((e) => { if (!(e instanceof Cancel)) console.error(e); })
      .finally(() => { if (alive) running.current = false; });

    return () => { alive = false; clock.cancelAll(); };
  }, [run, frameRef]);

  return { runId: run.id, animate: run.animate };
}
