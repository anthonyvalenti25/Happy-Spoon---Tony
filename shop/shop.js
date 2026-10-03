// Happy Spoon shop mockup: pick a flavor on the shelf, fill a box of at least 4 tubs, review it in the drawer.
// Checkout is not connected. PRICE is a sample, and protein (20 g) and calories (180) are placeholders until the recipes are final.
(() => {
  const PRICE = 8.99;   // sample price per 32 oz tub
  const MIN = 4, MAX = 24;
  const TURN = 8000;   // each flavor stays in the spotlight for 8 s, whether it came up on its own or was tapped
  let rotateTimer;
  const FLAVORS = [
    // Colors from the brand guide (brand/index.html). White ink on every flavor.
    { id: 'chocolate-fudge',   name: 'Chocolate Fudge', two: 'Chocolate <br>Fudge', short: 'Choc Fudge',  bg: '#ef4c3c', deep: '#cf3a2b', glow: '#ff8a78', ink: '#ffffff', btn: '#2a0f0b' },
    { id: 'cookies-and-cream', name: 'Cookies & Cream', two: 'Cookies <br>&amp; Cream', short: 'Cookies & Cream', bg: '#1497ec', deep: '#0b7fd0', glow: '#6cc2fa', ink: '#ffffff', btn: '#0b1d33' },
    { id: 'salted-caramel',    name: 'Salted Caramel',  two: 'Salted <br>Caramel', short: 'Salted Caramel', bg: '#f39c1e', deep: '#df8812', glow: '#ffc46e', ink: '#ffffff', btn: '#2e1604' },
    { id: 'mint-chip',         name: 'Mint Chip',       two: 'Mint <br>Chip', short: 'Mint Chip',  bg: '#4fc690', deep: '#3cb17d', glow: '#94e6bf', ink: '#ffffff', btn: '#0d2c3d' },
    { id: 'cookie-dough',      name: 'Cookie Dough',    two: 'Cookie <br>Dough', short: 'Cookie Dough', bg: '#8740cf', deep: '#7232b8', glow: '#ad7ae8', ink: '#ffffff', btn: '#1f0b38' },
  ];
  const ASSETS = new URL('../assets/', document.currentScript.src).href;   // works wherever the page lives
  const TUB = id => `${ASSETS}${id}-tub-600.webp`;
    const money = n => `$${n.toFixed(2)}`;
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const byId = id => FLAVORS.find(f => f.id === id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // The box is the list of tubs in the order they went in. It's kept in this browser only.
  const KEY = 'hs-shop-box';
  let box = [];
  try { box = JSON.parse(localStorage.getItem(KEY)) || []; } catch {}
  box = Array.isArray(box) ? box.filter(byId).slice(0, MAX) : [];
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(box)); } catch {} };
  const qty = id => box.filter(x => x === id).length;

  // ---------- Hero stage: a glass shelf of five tubs; the featured one sits up in the halo ----------
  const root = document.documentElement;
  const stage = $('#stage');
  const halo = document.createElement('div'); halo.className = 'halo';
  const shelf = document.createElement('div'); shelf.className = 'shelf';
  const face = document.createElement('div'); face.className = 'face';
  const edge = document.createElement('div'); edge.className = 'edge';
  const under = document.createElement('div'); under.className = 'under';
  shelf.append(under, face, edge);
  stage.append(halo, shelf);
  const refls = FLAVORS.map(f => { const r = document.createElement('img'); r.className = 'refl'; r.src = TUB(f.id); r.alt = ''; face.append(r); return r; });
  const shadows = FLAVORS.map(() => { const d = document.createElement('div'); d.className = 'cshadow'; shelf.append(d); return d; });
  const tubs = FLAVORS.map((f, k) => {
    const t = document.createElement('div');
    t.className = 'tub'; t.dataset.k = k; t.tabIndex = 0; t.setAttribute('role', 'button');
    t.setAttribute('aria-label', `Show ${f.name}`);
    t.innerHTML = `<img src="${TUB(f.id)}" alt="" decoding="async">`;
    stage.append(t);
    return t;
  });
  const badges = FLAVORS.map(() => { const b = document.createElement('span'); b.className = 'badge'; stage.append(b); return b; });
  // Phones: protein and calories sit faintly either side of the spotlighted tub (the row under the name is hidden there)
  const sides = [['20<i>g</i>', 'Protein'], ['180', 'Calories']].map(([n, label], k) => {
    const el = document.createElement('div');
    el.className = `side-stat ${k ? 'right' : 'left'}`; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<b class="wide">${n}</b><small>${label}</small>`;
    stage.append(el);
    return el;
  });

  const fromURL = FLAVORS.findIndex(f => f.id === new URLSearchParams(location.search).get('f'));
  let hero = Math.max(0, fromURL);
  let W, H, tw, th, spots = [], heroSpot, stw, sth;
  const tf = p => `translate(${p.x - tw / 2}px, ${p.y - th}px) scale(${p.s})`;
  const px = n => `${n}px`;

  function layout() {
    W = stage.clientWidth; H = stage.clientHeight;
    const pad = Math.max(8, W * 0.03), sw = (W - pad * 4) / 5;
    stw = sw * (W < 500 ? 0.76 : 0.92); sth = stw * 1.2;   // smaller shelf tubs on phones so the featured one stands out
    const shelfY = H - 44;
    const heroRoom = shelfY - sth - 26;
    th = Math.min(heroRoom * 0.94, W * 0.66 * 1.2); tw = th / 1.2;
    const heroY = Math.min(heroRoom, heroRoom / 2 + th / 2 + 6);
    heroSpot = { x: W / 2, y: heroY, s: 1 };
    spots = FLAVORS.map((_, k) => ({ x: sw / 2 + k * (sw + pad), y: shelfY, s: stw / tw }));
    tubs.forEach(t => { t.style.width = px(tw); });

    const off = -shelf.offsetLeft, faceTop = shelfY - 13, faceH = 32;
    Object.assign(face.style, { top: px(faceTop), height: px(faceH) });
    Object.assign(edge.style, { top: px(faceTop + faceH), height: px(6) });
    Object.assign(under.style, { top: px(faceTop + faceH + 6), height: px(30) });
    spots.forEach((p, k) => {
      Object.assign(refls[k].style, { left: px(p.x + off - stw / 2), top: px(shelfY - faceTop - 2), width: px(stw), height: px(sth) });
      Object.assign(shadows[k].style, { left: px(p.x + off - stw * 0.55), top: px(shelfY - 7), width: px(stw * 1.1), height: px(14) });
      Object.assign(badges[k].style, { left: px(p.x + stw * 0.22), top: px(shelfY - sth - 8) });
    });
    const d = Math.min(th * 1.02, W * 0.92);
    Object.assign(halo.style, { left: px(W / 2 - d / 2), top: px(heroY - th / 2 - d / 2 - th * 0.02), width: px(d), height: px(d) });
    const sideW = Math.max(0, W / 2 - tw / 2 - 4);
    sides.forEach((el, k) => Object.assign(el.style, { width: px(sideW), top: px(heroY - th * 0.5), [k ? 'right' : 'left']: '0px' }));
    place();
  }
  function mark() {
    refls.forEach((r, k) => r.classList.toggle('gone', k === hero));
    shadows.forEach((d, k) => d.classList.toggle('gone', k === hero));
  }
  function place() {
    tubs.forEach((t, k) => {
      t.getAnimations().forEach(a => a.cancel());
      t.style.transform = tf(k === hero ? heroSpot : spots[k]);
      t.style.zIndex = k === hero ? 3 : 2;
    });
    mark();
  }
  // Fly along an arc rather than a straight line.
  function arc(t, a, b, delay, lift) {
    if (reduced) return;
    const mid = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - lift, s: (a.s + b.s) / 2 };
    t.animate([{ transform: tf(a) }, { transform: tf(mid), offset: .45 }, { transform: tf(b) }],
      { duration: 1000, delay, easing: 'cubic-bezier(.6,0,.3,1)', fill: 'backwards' });
  }

  // ---------- Featured flavor: colors and name ----------
  const nameBox = $('.name');
  let meta = $('meta[name="theme-color"]');
  // Safari on a Mac (dark mode) only tints its tab bar with some colors. Tested in Safari 2026-10-03: red and purple work
  // as they are; blue, orange and green were refused, so the bar gets the lightest shade that passed. Pages keep their colors.
  const BAR = { '#1497ec': '#118ad7', '#f39c1e': '#b97615', '#4fc690': '#33825f' };
  const barColor = hex => BAR[hex.toLowerCase()] || hex;

  // While the popup or box drawer is open the page is dimmed. The dialog's own backdrop stops short of
  // Safari's status bar and bottom toolbar on iPhone, so a separate dim layer reaches under both bars.
  let dimmed = false;
  const dimColor = hex => {
    const n = parseInt(hex.slice(1), 16), a = .72, d = [10, 12, 14];   // same as the dialog backdrop
    return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v, i) => Math.round(v * (1 - a) + d[i] * a).toString(16).padStart(2, '0')).join('');
  };
  // Safari keeps tinting its bars from the dim layer for as long as it exists, even when it's see-through,
  // so after fading out it is taken out of the page entirely and the page color is handed back to Safari.
  let dimTimer;
  function dim(on) {
    dimmed = on;
    const d = $('.dimmer');
    clearTimeout(dimTimer);
    if (on) {
      d.hidden = false;
      void d.offsetWidth;   // let it appear before fading in
      d.classList.add('on');
      meta.content = dimColor(FLAVORS[hero].bg);
    } else {
      d.classList.remove('on');
      meta.content = barColor(FLAVORS[hero].bg);
      dimTimer = setTimeout(() => {
        if (dimmed) return;
        d.hidden = true;
        const fresh = meta.cloneNode();   // a new theme-color tag makes Safari re-read the color
        meta.replaceWith(fresh); meta = fresh;
        meta.content = barColor(FLAVORS[hero].bg);
      }, 400);
    }
  }
  let colorTimer;
  function paint(first) {
    const f = FLAVORS[hero];
    const apply = () => {
      for (const k of ['bg', 'deep', 'glow', 'ink', 'btn']) root.style.setProperty(`--${k}`, f[k]);
      meta.content = dimmed ? dimColor(f.bg) : barColor(f.bg);
    };
    clearTimeout(colorTimer);
    if (first || reduced) apply(); else colorTimer = setTimeout(apply, 350);
    const old = nameBox.querySelector('span:not(.out)');
    if (old) { old.className = 'out'; setTimeout(() => old.remove(), 900); }
    const s = document.createElement('span');
    s.innerHTML = f.two;
    if (old) s.className = 'in';
    nameBox.append(s);
    nameBox.setAttribute('aria-label', f.name);
    // Why Happy Spoon tub follows the spotlight (fades out, swaps, fades back in)
    const whyTub = $('.why-tub');
    if (whyTub) {
      const src = `${ASSETS}flavor-displays/${f.id}.webp`;
      if (first) { whyTub.src = src; whyTub.alt = `Happy Spoon ${f.name} tub`; }
      else if (!whyTub.src.endsWith(src.split('/').pop())) {
        whyTub.classList.add('swap');
        setTimeout(() => { whyTub.src = src; whyTub.alt = `Happy Spoon ${f.name} tub`; whyTub.classList.remove('swap'); }, 350);
      }
    }
    $$('.adder [data-act]').forEach(b => { b.dataset.id = f.id; });
    $('.adder .add-main').textContent = `Add ${f.name} to box`;
  }
  function feature(k) {
    if (k === hero) return;
    const prev = hero;
    hero = k;
    paint();
    render();
    if (reduced) { place(); return; }
    place();
    const up = tubs[k], down = tubs[prev];
    up.style.zIndex = 4; down.style.zIndex = 3;
    arc(down, heroSpot, spots[prev], 0, th * 0.12);
    arc(up, spots[k], heroSpot, 180, th * 0.18);
    halo.classList.remove('pulse'); void halo.offsetWidth; halo.classList.add('pulse');
  }
  // A tapped tub gets the same 8 seconds before the rotation carries on.
  const pick = k => { feature(k); rotate(TURN); };
  stage.addEventListener('click', e => { const t = e.target.closest('.tub'); if (t) pick(Number(t.dataset.k)); });
  stage.addEventListener('keydown', e => {
    const t = e.target.closest('.tub');
    if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(Number(t.dataset.k)); }
  });

  // ---------- Flavor cards and the lineup strip ----------
  const stepHTML = (f, label) => `<div class="step">
      <button type="button" data-act="sub" data-id="${f.id}" aria-label="Remove one ${f.name}"><svg viewBox="0 0 16 16"><path d="M3 8h10"/></svg></button>
      <output>${label}</output>
      <button type="button" data-act="add" data-id="${f.id}" data-from="card" aria-label="Add one ${f.name}"><svg viewBox="0 0 16 16"><path d="M3 8h10M8 3v10"/></svg></button>
    </div>`;
  const STATS = `<div class="stats"><div class="stat"><b class="wide">20<i>g</i></b><small>Protein</small></div><div class="stat"><b class="wide">180</b><small>Calories</small></div></div>`;
  $('.cards').innerHTML = FLAVORS.map(f => `
    <article class="card" style="--c-bg:${f.bg};--c-btn:${f.btn}" data-card="${f.id}" id="card-${f.id}">
      <div class="art"><img src="${ASSETS}flavor-displays/${f.id}.webp" alt="Happy Spoon ${f.name} tub" width="900" height="900" loading="lazy" decoding="async"></div>
      <div class="body">
        <h3 class="wide">${f.name}</h3>
        ${STATS}
        <div class="row"><b>${money(PRICE)}</b><div class="ctl">
          <button class="add" type="button" data-act="add" data-id="${f.id}" data-from="card">Add to box</button>
          ${stepHTML(f, '')}
        </div></div>
      </div>
    </article>`).join('');
  $('.strip').innerHTML = FLAVORS.map(f => `<span style="--c:${f.bg}">${f.short}</span>`).join('');

  // On phones the flavor cards scroll sideways and loop: a copy of all five sits on each side, and when
  // scrolling stops in a copy the row jumps to the matching real card. (Desktop shows a grid; copies hidden.)
  const cardRow = $('.cards');
  const originals = $$('.card', cardRow);
  const copy = () => originals.map(c => { const n = c.cloneNode(true); n.removeAttribute('id'); n.dataset.clone = ''; return n; });
  cardRow.prepend(...copy());
  cardRow.append(...copy());
  const looping = () => cardRow.scrollWidth > cardRow.clientWidth + 4;
  const posOf = el => el.getBoundingClientRect().left - cardRow.getBoundingClientRect().left + cardRow.scrollLeft - (parseFloat(getComputedStyle(cardRow).scrollPaddingLeft) || 0);
  function recenter() {
    if (!looping()) return;
    const start = posOf(originals[0]), setW = posOf(originals[originals.length - 1]) - start + (originals[1].getBoundingClientRect().left - originals[0].getBoundingClientRect().left);
    if (cardRow.scrollLeft < start - setW / 2) cardRow.scrollLeft += setW;
    else if (cardRow.scrollLeft > start + setW / 2) cardRow.scrollLeft -= setW;
  }
  let loopTimer, loopReady = false;
  cardRow.addEventListener('scroll', () => { clearTimeout(loopTimer); loopTimer = setTimeout(recenter, 160); }, { passive: true });
  function startLoop() {
    if (!looping()) { loopReady = false; return; }
    if (!loopReady || cardRow.scrollLeft < 1) { cardRow.scrollLeft = posOf(originals[0]); loopReady = cardRow.scrollLeft > 0; }
  }
  new ResizeObserver(startLoop).observe(cardRow);
  addEventListener('load', startLoop);
  setTimeout(startLoop, 300);
  $('.unit').textContent = money(PRICE);

  // ---------- Box changes ----------
  const boxBtn = $('.box-btn'), toast = $('.toast');
  function bump(el) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  function add(id, source) {
    if (box.length >= MAX) { note(`A box holds up to ${MAX} tubs.`); openBox(); return; }
    box.push(id);
    save();
    render();
    showToast(id);
    flyIn(id, source);
  }
  // "Added Chocolate Fudge · View box", then it slips away after a few seconds
  let toastTimer;
  function showToast(id) {
    const n = box.length;
    $('.toast-text').innerHTML = `<b>Added ${byId(id).name}</b><span>${plural(n, 'tub')} in your box</span>`;
    toast.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('on'), 3200);
  }
  function sub(id) {
    const i = box.lastIndexOf(id);
    if (i >= 0) { box.splice(i, 1); save(); render(); }
  }

  // A copy of the tub flies from where it was added to the header's box button (or the toast if the header is off screen).
  function flyIn(id, source) {
    const onScreen = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
    const target = onScreen(boxBtn) ? boxBtn : toast;
    bump(target);
    if (reduced || !source) return;
    let from;
    if (source.dataset.from === 'hero' && onScreen(tubs[hero])) from = tubs[hero].getBoundingClientRect();
    else if (source.closest('.card')) from = source.closest('.card').querySelector('.art img').getBoundingClientRect();
    if (!from) return;
    const to = target.getBoundingClientRect();
    const w = Math.min(from.width, 220), h = w * 1.2;
    const x0 = from.left + from.width / 2 - w / 2, y0 = from.top + from.height / 2 - h / 2;
    const s = Math.min(1, 40 / w);
    const dx = to.left + (target === toast ? 30 : to.width / 2) - (x0 + w / 2), dy = to.top + to.height / 2 - (y0 + h / 2);
    const img = new Image();
    img.src = TUB(id); img.className = 'flyer'; img.alt = '';
    Object.assign(img.style, { left: px(x0), top: px(y0), width: px(w) });
    document.body.append(img);
    img.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * .5}px, ${dy * .5 - 60}px) scale(${(1 + s) / 2})`, opacity: 1, offset: .5 },
      { transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: .9 },
    ], { duration: 650, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => img.remove();
  }

  // ---------- Render everything that depends on the box ----------
  const drawer = $('.drawer');
  const dNote = $('.d-note');
  function note(text, warn) { dNote.textContent = text; dNote.classList.toggle('warn', !!warn); }

  function render() {
    const n = box.length;
    const f = FLAVORS[hero];

    // Hero adder
    const q = qty(f.id);
    $('.adder').classList.toggle('has', q > 0);
    $('.adder output').textContent = `${q} in your box`;
    $('.adder [data-act="sub"]').setAttribute('aria-label', `Remove one ${f.name}`);
    $('.adder .step [data-act="add"]').setAttribute('aria-label', `Add one more ${f.name}`);

    // Shelf badges
    FLAVORS.forEach((fl, k) => {
      const c = qty(fl.id);
      badges[k].textContent = c;
      badges[k].classList.toggle('on', c > 0 && k !== hero);
    });

    // Cards
    $$('.card').forEach(card => {
      const c = qty(card.dataset.card);
      card.querySelector('.ctl').classList.toggle('has', c > 0);
      card.querySelector('.ctl output').textContent = c;
    });

    // Header box button
    $('.box-count').textContent = n;
    boxBtn.setAttribute('aria-label', `Open your box, ${plural(n, 'tub')}`);

    renderDrawer();
  }

  function renderDrawer() {
    const n = box.length;
    // Keep keyboard focus on the same control when the list is rebuilt
    const a = document.activeElement, keep = a && a.closest('.d-lines') ? `[data-act="${a.dataset.act}"][data-id="${a.dataset.id}"]` : null;
    // The 4 tub minimum is only mentioned here, inside the box, and on the checkout button
    $('.d-progress p').textContent = n >= MIN ? `${plural(n, 'tub')} in your box. You're good to go.`
      : n === 0 ? '' : `Boxes start at ${MIN} tubs. Add ${plural(MIN - n, 'more tub')} to check out.`;
    $$('.d-progress .pips i').forEach((pip, i) => pip.classList.toggle('on', i < n));
    $('.d-progress .pips').hidden = n === 0 || n >= MIN;
    $('.d-progress').hidden = n === 0;   // the empty message below says it already
    const lines = FLAVORS.filter(f => qty(f.id) > 0);
    $('.d-lines').innerHTML = lines.length ? lines.map(f => {
      const c = qty(f.id);
      return `<div class="line" style="--c-bg:${f.bg}">
        <div class="thumb"><img src="${TUB(f.id)}" alt=""></div>
        <div><b>${f.name}</b><span>${plural(c, 'tub')} · ${money(c * PRICE)}</span></div>
        ${stepHTML(f, c)}
      </div>`;
    }).join('') : `<p class="empty-box">Nothing here yet. Pick your flavors to start your box.</p>`;
    if (keep) $(keep, $('.d-lines'))?.focus();
    $('.sum').textContent = money(n * PRICE);
    const btn = $('.checkout');
    btn.disabled = n < MIN;
    btn.textContent = n >= MIN ? `Check out · ${money(n * PRICE)}` : n === 0 ? 'Pick your flavors' : `Add ${plural(MIN - n, 'more tub')} to check out`;
    if (n < MIN) note('');
  }

  // The popup and drawer open as regular (non-modal) dialogs: while a modal dialog is open, iPhone Safari
  // freezes its status bar and toolbar color, so they'd stay bright while the page dims. The page behind
  // is made inert by hand instead, and Escape or a tap on the dimmed area closes them.
  const behind = () => [$('.hero'), $('main'), $('.site-footer')];
  function openDialog(d) {
    if (d.open) return;
    d.show();
    behind().forEach(el => { el.inert = true; });
    dim(true);
    (d.querySelector('[autofocus]') || d.querySelector('.close'))?.focus({ preventScroll: true });
  }
  function dialogClosed() {
    if (drawer.open || promo.open) return;
    behind().forEach(el => { el.inert = false; });
    dim(false);
  }
  const closeAll = () => { [drawer, promo].forEach(d => d.open && d.close()); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
  $('.dimmer').addEventListener('click', closeAll);

  function openBox() { if (!drawer.open) { note(''); openDialog(drawer); } }
  drawer.addEventListener('close', dialogClosed);
  drawer.addEventListener('click', e => { if (e.target === drawer) drawer.close(); });   // tap outside the sheet

  // One click handler for every button on the page
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    if (b.closest('.adder')) rotate(TURN);   // adding or removing the spotlighted flavor restarts its 8 seconds
    if (act === 'add') add(b.dataset.id, b);
    else if (act === 'sub') sub(b.dataset.id);
    else if (act === 'open') { toast.classList.remove('on'); openBox(); }
    else if (act === 'close') drawer.close();
    else if (act === 'checkout') {
      note("Checkout isn't connected yet. This is a design mockup.", true);
    } else if (act === 'promo-close') promo.close();
  });

  // ---------- Welcome offer: a free tub in your first box, shown 1 second after the page opens, once per visitor ----------
  // Signups go to the Kit form in data-kit-form (Kit's public endpoint, no secret keys), tagged with where they came from.
  const promo = $('.promo');
  const promoForm = $('.promo-form');
  const promoNote = $('.promo-note');
  const PROMO_KEY = 'hs-shop-promo';
  let promoSeen = null;
  try { promoSeen = localStorage.getItem(PROMO_KEY); } catch {}
  const remember = v => { try { localStorage.setItem(PROMO_KEY, v); } catch {} };
  promo.addEventListener('click', e => { if (e.target === promo) promo.close(); });   // tap outside the card
  promo.addEventListener('close', () => { if (!promo.classList.contains('joined')) remember('dismissed'); dialogClosed(); });
  // ?promo always shows it; ?nopromo never does (handy for screenshots)
  if ((!promoSeen || new URLSearchParams(location.search).has('promo')) && !new URLSearchParams(location.search).has('nopromo')) {
    setTimeout(() => {
      if (drawer.open || promo.open) return;
      openDialog(promo);
    }, 1000);
  }
  let promoSending = false;
  promoForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (promoSending) return;
    const email = promoForm.querySelector('input[type="email"]');
    const address = email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(address)) { promoNote.textContent = 'Enter a valid email address.'; email.focus(); return; }
    promoNote.textContent = '';
    const kitId = (promoForm.dataset.kitForm || '').trim();
    const button = promoForm.querySelector('button');
    if (kitId && !promoForm.querySelector('[name="website"]').value) {
      promoSending = true;
      button.classList.add('sending'); button.disabled = true;   // the brand's loading smile
      try {
        const body = new FormData();
        body.append('email_address', address);
        body.append('fields[source]', 'Shop popup: free tub');
        const res = await fetch(`https://app.kit.com/forms/${encodeURIComponent(kitId)}/subscriptions`, { method: 'POST', body, headers: { Accept: 'application/json' } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || (data.status && data.status !== 'success')) throw new Error(data.error || res.status);
      } catch {
        promoNote.textContent = 'Something went wrong. Please try again.';
        return;
      } finally {
        promoSending = false;
        button.classList.remove('sending'); button.disabled = false;
      }
    }
    remember('joined');
    promo.classList.add('joined');
    $('.promo-shop').focus({ preventScroll: true });
  });

  // ---------- Spotlight rotation: the next flavor every 8 seconds ----------
  // Waits while the box or the welcome popup is open, the tab is in the background, or the shelf is scrolled
  // out of view (so the page color holds still while someone reads the flavors below).
  let heroInView = true;
  new IntersectionObserver(([e]) => { heroInView = e.isIntersecting; }, { threshold: .35 }).observe($('.hero'));
  function rotate(ms) {
    clearTimeout(rotateTimer);
    if (reduced) return;
    rotateTimer = setTimeout(() => {
      if (!document.hidden && heroInView && !drawer.open && !promo.open && !document.querySelector('.menu-open')) feature((hero + 1) % FLAVORS.length);
      rotate(TURN);
    }, ms);
  }

  // Preload the Why section's tub art once the page is idle, so flavor swaps don't flash empty
  addEventListener('load', () => setTimeout(() => FLAVORS.forEach(f => { new Image().src = `${ASSETS}flavor-displays/${f.id}.webp`; }), 1500));
  paint(true);
  layout();
  render();
  if (new URLSearchParams(location.search).has('box')) openBox();   // the header's box button on other pages links here
  new ResizeObserver(() => layout()).observe(stage);
  rotate(TURN);
})();
