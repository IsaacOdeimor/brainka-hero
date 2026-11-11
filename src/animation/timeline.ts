/**
 * The full sequence:
 *   1. the finished hero dissolves, 9 agents swarm the logo tile
 *   2. rulers slide in, a 10th agent joins, everyone takes a spot
 *   3. ten agents rebuild the page in parallel (one async track each)
 *   4. victory lap: the swarm flies over the hero and leaves
 *
 * Nothing is hardcoded to one screen size: every target is measured from
 * the live layout, so the same choreography runs on desktop, tablet and phone.
 */
import { clock, sleep } from './clock';
import {
  box, ctx, fadeRemove, layer, lockTextSizes, mk, px, rel, show, toFrame, unlockTextSizes, visible,
} from './dom';
import { Agent, AGENT_COLORS, flight } from './agents';
import { drag, drawBox, redLine, swapIcon, typeText } from './primitives';
import { buildRulers, setRulers } from './rulers';
import { TILES, type TileName } from '../components/AppTiles';
import { NAV_LINKS } from '../components/Nav';
import { ORBITS } from '../components/Orbit';

export async function rebuild() {
  const { page, frame } = ctx;
  const btile = frame.querySelector<HTMLElement>('#btile')!;
  const visual = layer('visual');
  const now = () => clock.now;
  let agents: Agent[] = [];

  // the visible part of the frame (on phones the page is taller than the screen)
  const W = frame.clientWidth;
  const H = Math.min(frame.clientHeight, window.innerHeight);
  const small = W < 760;

  /** a point/box in the visual's 690×798 design space → frame coordinates */
  const vu = (x: number, y: number, w = 0, h = 0) => {
    const r = rel(visual), k = r.w / 690;
    return { x: r.x + x * k, y: r.y + y * k, w: w * k, h: h * k };
  };

  // a promise per tile, resolved once the tile has been placed (icon swaps wait on it)
  const placed = {} as Record<TileName, Promise<void>>;
  const markPlaced = {} as Record<TileName, () => void>;
  for (const t of TILES) placed[t.name] = new Promise((r) => (markPlaced[t.name] = r));

  await sleep(800);

  /* ---------- 1. dissolve + swarm around the logo ---------- */
  lockTextSizes();
  page.style.opacity = '0';
  Object.assign(btile.style, { left: px(W / 2 - 30), top: px(H / 2 - 30) });
  btile.classList.add('on');

  const fromEdge = (i: number): [number, number] => {
    const side = i % 4, r = Math.random();
    return side === 0 ? [r * W, -40] : side === 1 ? [W + 40, r * H] : side === 2 ? [r * W, H + 40] : [-40, r * H];
  };
  for (let i = 0; i < 9; i++) {
    const a = new Agent(AGENT_COLORS[i], ...fromEdge(i));
    a.fly = true;
    agents.push(a);
  }
  const ringScale = Math.min(1, W / 900);
  const ring = agents.map((_, i) => ({
    r: (70 + (i % 3) * 38 + Math.random() * 20) * Math.max(0.6, ringScale),
    th: (i / 9) * Math.PI * 2,
    w: (i % 2 ? 1 : -1) * (0.0028 + Math.random() * 0.0012),
  }));
  await flight(agents, 1500, (_a, i, t) => {
    const g = ring[i], th = g.th + g.w * t;
    return [W / 2 + Math.cos(th) * g.r, H / 2 + Math.sin(th) * g.r * 0.85];
  }, {}, now);

  // hide every layer instantly, then show the (now empty) page again
  page.classList.add('nt');
  page.classList.remove('static');
  void page.offsetWidth;
  page.classList.remove('nt');
  page.style.opacity = '1';

  /* ---------- 2. rulers in, 10th agent, scatter ---------- */
  btile.classList.remove('on');
  buildRulers();
  setRulers(true);
  const tenth = new Agent(AGENT_COLORS[9], W / 2, H + 40);
  tenth.fly = true;
  agents.push(tenth);

  const spots = [
    [.07, .065], [.35, .043], [.86, .065], [.5, .27], [.6, .226],
    [.486, .41], [.11, .3], [.076, .69], [.69, .56], [.42, .13],
  ].map(([fx, fy]) => [fx * W, fy * H] as [number, number]);
  await flight(agents, 700, (_a, i) => spots[i], { k: 1.6e-4, c: 0.022 }, now);
  agents.forEach((a) => { a.fly = false; a.vx = a.vy = 0; a.setMode('cross'); });
  await sleep(250);

  /* ---------- 3. the build: ten parallel tracks ---------- */
  const T0 = clock.now;
  const at = (ms: number) => sleep(Math.max(0, T0 + ms - clock.now));
  const [R, Y, B, G, Pk, V, O, Tl, C, I] = agents;

  const gsBox = box('gs');
  const guideH = mk('guide h out', { top: px(gsBox.y + gsBox.h / 2) });
  const guideV = mk('guide v out', { left: px(box('h1a').x) });
  const orbitPlaceholder: { current: { remove(): void } | null } = { current: null };

  /** draw a pill-shaped placeholder over a button, then reveal the real one */
  const wireButton = (a: Agent, id: string, ms: number, bg?: string) => {
    const b = box(id);
    return drawBox(a, b.x, b.y, b.w, b.h, ms, { fill: 'wire', radius: b.h / 2, bg });
  };
  /** draw a box exactly over a small layer (icon, line) and reveal it */
  const drawOver = async (a: Agent, id: string, ms: number) => {
    const b = box(id);
    const s = await drawBox(a, b.x, b.y, b.w, Math.max(1, b.h), ms);
    show(id); await sleep(120); s.remove();
  };

  await Promise.all([
    // R: logo, eyebrow line, headline line 1, "Watch Demo" button
    (async () => {
      await at(0);
      await drawOver(R, 'logoMark', 420);
      await typeText(R, layer('logoText'), { cps: 20 });
      await at(1500); await drawOver(R, 'eyeLine', 320);
      await at(2300); await typeText(R, layer('h1a'), { cps: 22 });
      await at(7300);
      const s = await wireButton(R, 'btn2', 500); show('btn2'); await sleep(150); s.remove();
      await drawOver(R, 'btn2Icon', 260);
      await typeText(R, layer('btn2Text'), { cps: 20 });
    })(),

    // Y: nav links: type the first, duplicate it three times, rename the copies
    (async () => {
      if (!visible('nav1')) { NAV_LINKS.forEach((l) => show(l.id)); return; }
      await at(150);
      const first = layer('nav1');
      first.style.transform = 'translate(-6px,-21px)';
      await typeText(Y, first, { cps: 18 });
      await drag(Y, first, -6, -21, 420);

      await at(3500);
      for (let i = 1; i < NAV_LINKS.length; i++) {
        const el = layer(NAV_LINKS[i].id);
        const prev = box(NAV_LINKS[i - 1].id), target = rel(el);
        el.textContent = NAV_LINKS[0].label;
        el.classList.add('on');
        await drag(Y, el, prev.x - target.x, 0, 420, { red: true });
        const mid = target.y + target.h / 2;
        const kill = redLine(prev.x + prev.w, mid, target.x, mid);
        setTimeout(kill, 650 / clock.speed);
        await sleep(120);
      }
      for (const [i, t] of [[1, 5400], [2, 6600], [3, 7900]] as const) {
        await at(t);
        const el = layer(NAV_LINKS[i].id);
        el.classList.add('hl'); await sleep(260); el.classList.remove('hl');
        await typeText(Y, el, { cps: 18 });
      }
    })(),

    // B: "Get Started" button, "Log in", Dropbox icon
    (async () => {
      await at(100);
      const wire = await wireButton(B, 'gs', 600, '#55565c');
      if (visible('login')) { await at(900); await typeText(B, layer('login'), { cps: 18 }); }
      else show('login');
      await at(1800); show('gs'); await sleep(200); wire.remove();
      await typeText(B, layer('gsText'), { cps: 18 });
      await at(3700); await drawOver(B, 'gsArrow', 280);
      await at(7700); await swapIcon(B, 'dropbox', placed.dropbox);
    })(),

    // G: orbit placeholder, headline line 2 typed off-grid then snapped into line
    (async () => {
      await at(300);
      const o = vu(14, 95, 660, 160);
      orbitPlaceholder.current = await drawBox(G, o.x, o.y, o.w, o.h, 800, { fill: 'img' });
      await at(2900);
      const el = layer('h1b');
      const off = small ? [14, -6] : [31, -8];
      el.style.transform = `translate(${off[0]}px,${off[1]}px)`;
      await typeText(G, el, { cps: 24 });
      guideV.classList.remove('out');
      await drag(G, el, off[0], off[1], 560);
      await at(7000); await swapIcon(G, 'gcal', placed.gcal);
    })(),

    // Pk: first tile + Slack icon, then duplicate the tile six times
    (async () => {
      await at(450);
      await drawOver(Pk, 't-slack', 480);
      await sleep(200);
      layer('t-slack').querySelector('.g')!.classList.add('on');
      markPlaced.slack();

      await at(3900);
      for (const name of ['notion', 'figma', 'gcal', 'github', 'gmail', 'dropbox'] as const) {
        const src = box('t-slack');
        const el = layer(`t-${name}`), t = rel(el);
        el.classList.add('on');
        el.querySelector('.tmp')!.classList.add('on');
        await drag(Pk, el, src.x - t.x, src.y - t.y, 380, { red: true, travel: 260 });
        const kill = Math.abs(t.y - src.y) < src.h * 0.75
          ? redLine(src.x + src.w, t.y + t.h / 2, t.x, t.y + t.h / 2)
          : redLine(t.x + t.w / 2, src.y + src.h, t.x + t.w / 2, t.y);
        setTimeout(kill, 500 / clock.speed);
        markPlaced[name]();
      }
    })(),

    // V: pen draws the three orbit lines, then swaps two icons
    (async () => {
      await at(600);
      for (const o of ORBITS) {
        const p = layer<SVGPathElement>(o.id);
        const L = p.getTotalLength();
        const ctm = p.getScreenCTM()!;
        const pointAt = (d: number) => {
          const q = new DOMPoint(p.getPointAtLength(d).x, p.getPointAtLength(d).y).matrixTransform(ctm);
          return toFrame(q.x, q.y);
        };
        p.classList.add('on');
        p.style.strokeDasharray = String(L);
        p.style.strokeDashoffset = String(L);
        const start = pointAt(0);
        V.setMode('arrow'); await V.move(start.x, start.y, 360); V.setMode('pen');
        await clock.tween(o.id === 'arcH' ? 600 : 850, (q) => {
          const d = (L / 2) * q;
          p.style.strokeDashoffset = String(L - d);
          const pt = pointAt(d);
          V.at(pt.x, pt.y);
        });
        p.style.strokeDashoffset = '0';
      }
      V.setMode('arrow');
      orbitPlaceholder.current?.remove();
      await at(6100); await swapIcon(V, 'notion', placed.notion);
      await at(7100); await swapIcon(V, 'gmail', placed.gmail);
    })(),

    // O: eyebrow text and subtitle
    (async () => {
      await at(650); await typeText(O, layer('eyeText'), { cps: 30 });
      await at(3300); await typeText(O, layer('sub'), { cps: 36 });
    })(),

    // Tl: primary button
    (async () => {
      await at(2700);
      const wire = await wireButton(Tl, 'btn1', 560);
      await at(3800); show('btn1'); await sleep(200); wire.remove();
      await at(6700); await drawOver(Tl, 'btn1Arrow', 280);
      await typeText(Tl, layer('btn1Text'), { cps: 20 });
    })(),

    // C: image placeholder, then the head fades in
    (async () => {
      await at(1100);
      const h = vu(76, 240, 560, 560);
      const ph = await drawBox(C, h.x, h.y, h.w, h.h, 900, { fill: 'img' });
      await at(6300);
      const c = vu(344, 560);
      await C.move(c.x, c.y, 400);
      show('head'); await sleep(500); ph.remove();
    })(),

    // I: measures the logo → nav gap, then swaps two icons
    (async () => {
      await at(1800);
      if (visible('nav1')) {
        const lt = box('logoText'), n1 = box('nav1'), y = n1.y + n1.h / 2;
        await I.move(lt.x + lt.w + 12, y + 20, 400);
        const kill = redLine(lt.x + lt.w, y, n1.x, y); await sleep(700); kill();
      }
      await at(6400); await swapIcon(I, 'figma', placed.figma);
      await at(7400); await swapIcon(I, 'github', placed.github);
    })(),

    // shared alignment guides + rulers out
    (async () => {
      await at(900); guideH.classList.remove('out');
      await at(2600); setRulers(false);
      await at(6000); guideH.classList.add('out');
      await at(7000); guideV.classList.add('out');
    })(),
  ]);

  unlockTextSizes();

  /* ---------- 4. victory lap ---------- */
  await sleep(300);
  agents.forEach((a) => {
    a.setMode('arrow'); a.fly = true;
    a.vx = (Math.random() - 0.5) * 0.3; a.vy = (Math.random() - 0.5) * 0.3;
  });
  const orbit = agents.map((_, i) => ({ r: (22 + (i % 4) * 14) * Math.max(0.6, ringScale), th: i * 0.7, w: 0.006 + (i % 3) * 0.002 }));
  const tiles = vu(345, 150), disc = vu(344, 266);
  const h1 = box('h1a');
  const waypoints: [number, number, number][] = [
    [tiles.x, tiles.y, 900], [disc.x, disc.y, 1600],
    [h1.x + h1.w * 0.5, h1.y + h1.h, 2500], [W + 260, -260, 3700],
  ];
  const t0 = clock.now;
  await flight(agents, 3600, (_a, i, t) => {
    const e = t - t0;
    const [wx, wy] = waypoints.find((w) => e < w[2]) ?? waypoints[waypoints.length - 1];
    const o = orbit[i], th = o.th + o.w * t;
    return [wx + Math.cos(th) * o.r, wy + Math.sin(th) * o.r];
  }, { k: 1.4e-4, c: 0.012, sep: 18 }, now);

  agents.forEach((a) => fadeRemove(a.node, 400));
  agents = [];
}
