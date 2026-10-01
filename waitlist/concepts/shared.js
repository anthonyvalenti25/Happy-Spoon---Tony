// Shared engine for the waitlist concepts: flavor data, turn timer, swipe/tap, and the waitlist form.
// A concept page calls HS.start({ stage, onChange(index, prev, dir) }) and only animates its own stage.
const HS = (() => {
  const FLAVORS = [
    { id: 'chocolate-fudge',   name: 'Chocolate Fudge', bg: '#ef4c3c', deep: '#cf3a2b', glow: '#ff8a78', ink: '#ffffff', btn: '#2a0f0b' },
    { id: 'cookies-and-cream', name: 'Cookies & Cream', bg: '#1497ec', deep: '#0b7fd0', glow: '#6cc2fa', ink: '#ffffff', btn: '#0b1d33' },
    { id: 'salted-caramel',    name: 'Salted Caramel',  bg: '#f39c1e', deep: '#df8812', glow: '#ffc46e', ink: '#2e1604', btn: '#2e1604' },
    { id: 'mint-chip',         name: 'Mint Chip',       bg: '#4fc690', deep: '#3cb17d', glow: '#94e6bf', ink: '#0d2c3d', btn: '#0d2c3d' },
    { id: 'cookie-dough',      name: 'Cookie Dough',    bg: '#8740cf', deep: '#7232b8', glow: '#ad7ae8', ink: '#ffffff', btn: '#1f0b38' },
  ];
  const N = FLAVORS.length;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mod = n => ((n % N) + N) % N;
  const src = f => `../../assets/${f.id}-tub-600.webp`;
  FLAVORS.forEach(f => { new Image().src = src(f); });

  function tub(f, cls = '') {
    const el = document.createElement('div');
    el.className = `tub ${cls}`;
    el.innerHTML = `<img src="${src(f)}" alt="" decoding="async">`;
    return el;
  }

  // Tween a number with easing; returns a cancel function.
  const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function tween(from, to, ms, fn, ease = easeInOut) {
    if (reduced) ms = 1;
    let raf, t0;
    const step = now => {
      t0 ??= now;
      const t = Math.min(1, (now - t0) / ms);
      fn(from + (to - from) * ease(t), t);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }

  function start({ stage, onChange, turn = 3400, paintDelay = 0 }) {
    const app = document.querySelector('.app');
    const root = document.documentElement;
    const bars = document.querySelector('.bars');
    const nameBox = document.querySelector('.name');
    const meta = document.querySelector('meta[name="theme-color"]');
    root.style.setProperty('--turn', `${turn}ms`);

    bars.innerHTML = FLAVORS.map((f, k) => `<button type="button" aria-label="Show ${f.name}"><i></i></button>`).join('') +
      `<button type="button" class="pause" aria-label="Pause rotation"><svg viewBox="0 0 10 10"><rect x="1" y="0" width="3" height="10" rx="1"/><rect x="6" y="0" width="3" height="10" rx="1"/></svg></button>`;
    const segs = [...bars.querySelectorAll('button:not(.pause)')];
    const pauseBtn = bars.querySelector('.pause');

    let index = 0, held = false, typing = false;
    const holds = () => held || typing || document.hidden;
    const syncPause = () => bars.classList.toggle('paused', holds());

    let colorTimer;
    function colors(i) {
      const f = FLAVORS[i];
      for (const k of ['bg', 'deep', 'glow', 'ink', 'btn']) root.style.setProperty(`--${k}`, f[k]);
      meta.content = f.bg;
    }
    // A flavor someone picks (tap, swipe, bar, arrow key) stays twice as long as an automatic turn.
    function paint(i, first, picked) {
      const f = FLAVORS[i];
      clearTimeout(colorTimer);
      if (first || !paintDelay || reduced) colors(i);
      else colorTimer = setTimeout(() => colors(i), paintDelay);
      segs.forEach((s, k) => {
        s.classList.toggle('done', k < i);
        s.classList.remove('on');
      });
      segs.forEach(s => s.style.removeProperty('--turn'));
      if (picked) segs[i].style.setProperty('--turn', `${turn * 2}ms`);
      void segs[i].offsetWidth; // restart the fill animation
      segs[i].classList.add('on');
      const old = nameBox.querySelector('span:not(.out)');
      if (old) { old.className = 'out'; setTimeout(() => old.remove(), 900); }
      const s = document.createElement('span');
      s.textContent = f.name;
      if (old) s.className = 'in';
      nameBox.append(s);
      nameBox.setAttribute('aria-label', f.name);
    }

    function go(n, dir, auto) {
      const prev = index;
      index = mod(n);
      if (index === prev) return;
      dir ??= n > prev ? 1 : -1;
      paint(index, false, !auto);
      onChange(index, prev, dir, n);
    }

    segs.forEach((s, k) => {
      s.addEventListener('click', () => go(k, k > index ? 1 : -1));
      s.addEventListener('animationend', () => { if (k === index) go(index + 1, 1, true); });
    });
    pauseBtn.addEventListener('click', () => {
      held = !held;
      pauseBtn.setAttribute('aria-label', held ? 'Play rotation' : 'Pause rotation');
      pauseBtn.innerHTML = held
        ? '<svg viewBox="0 0 10 10"><path d="M2 0l8 5-8 5z"/></svg>'
        : '<svg viewBox="0 0 10 10"><rect x="1" y="0" width="3" height="10" rx="1"/><rect x="6" y="0" width="3" height="10" rx="1"/></svg>';
      syncPause();
    });
    document.addEventListener('visibilitychange', syncPause);

    // Swipe anywhere on the stage; a tap is passed to the concept (to pick a tub).
    let x0 = null, y0 = 0;
    stage.addEventListener('pointerdown', e => { x0 = e.clientX; y0 = e.clientY; });
    stage.addEventListener('pointerup', e => {
      if (x0 === null) return;
      const dx = e.clientX - x0, dy = e.clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      else if (Math.abs(dy) > 40) go(index + (dy < 0 ? 1 : -1), dy < 0 ? 1 : -1);
      else {
        const t = e.target.closest('[data-flavor]');
        if (t) { const k = Number(t.dataset.flavor); if (k !== index) go(k, Number(t.dataset.dir) || (k > index ? 1 : -1)); }
      }
    });
    addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') go(index + 1, 1);
      if (e.key === 'ArrowLeft') go(index - 1, -1);
    });

    // Waitlist form (design preview: nothing is sent or stored)
    const form = document.querySelector('.join');
    const email = form.querySelector('input');
    const note = document.querySelector('.note');
    email.addEventListener('focus', () => { typing = true; syncPause(); });
    email.addEventListener('blur', () => { typing = false; syncPause(); });
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
        note.textContent = 'Enter a valid email address.';
        email.focus();
        return;
      }
      email.blur();
      note.textContent = 'Design preview. Signups are not saved yet.';
      app.classList.add('joined');
    });

    paint(0, true);
    onChange(0, 0, 0, 0);
    return { go, get index() { return index; } };
  }

  return { FLAVORS, N, mod, src, tub, tween, start, reduced, easeInOut };
})();
