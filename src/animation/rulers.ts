import { ctx, px } from './dom';

/** Fill the top/left rulers with labels for the current frame size. */
export function buildRulers() {
  const { rulerTop: rt, rulerLeft: rl, frame } = ctx;
  rt.innerHTML = '';
  rl.innerHTML = '';
  const w = frame.clientWidth, h = Math.min(frame.clientHeight, window.innerHeight * 1.5);
  for (let x = 100; x < w; x += 100) {
    const s = document.createElement('span');
    s.style.left = px(x);
    s.textContent = String(x);
    rt.appendChild(s);
  }
  for (let y = 100; y < h; y += 100) {
    const s = document.createElement('span');
    s.style.top = px(y + 18);
    s.textContent = String(y);
    rl.appendChild(s);
  }
}

export function setRulers(on: boolean) {
  ctx.rulersOn = on;
  ctx.rulerTop.classList.toggle('on', on);
  ctx.rulerLeft.classList.toggle('on', on);
}
