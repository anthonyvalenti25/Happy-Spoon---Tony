// Happy Spoon shop mockup: pick a flavor on the shelf, fill a box of at least 4 tubs, review it in the drawer.
// Checkout is not connected. PRICE is a sample, not a real price.
(() => {
  const PRICE = 8.99;   // sample price per 32 oz tub
  const MIN = 4, MAX = 24;
  const AUTO = 3000, HOLD = 6000;   // spotlight rotation: every 3 s, or 6 s after someone picks a flavor
  let rotateTimer;
  const FLAVORS = [
    { id: 'chocolate-fudge',   name: 'Chocolate Fudge', bg: '#ef4c3c', deep: '#cf3a2b', glow: '#ff8a78', ink: '#ffffff', btn: '#2a0f0b', desc: 'Deep cocoa flavor with full dessert energy.' },
    { id: 'cookies-and-cream', name: 'Cookies & Cream', bg: '#1497ec', deep: '#0b7fd0', glow: '#6cc2fa', ink: '#ffffff', btn: '#0b1d33', desc: 'Creamy and cookie-specked, with a familiar crunch.' },
    { id: 'salted-caramel',    name: 'Salted Caramel',  bg: '#f39c1e', deep: '#df8812', glow: '#ffc46e', ink: '#2e1604', btn: '#2e1604', desc: 'Sweet, buttery caramel sharpened with a salty finish.' },
    { id: 'mint-chip',         name: 'Mint Chip',       bg: '#4fc690', deep: '#3cb17d', glow: '#94e6bf', ink: '#0d2c3d', btn: '#0d2c3d', desc: 'Cool mint with dark chocolate chips.' },
    { id: 'cookie-dough',      name: 'Cookie Dough',    bg: '#8740cf', deep: '#7232b8', glow: '#ad7ae8', ink: '#ffffff', btn: '#1f0b38', desc: 'Brown-sugar cookie dough with chocolate chips.' },
  ];
  const TUB = id => `../assets/${id}-tub-600.webp`;
  const PHOTO = id => `../assets/${id}-open-serving-720.webp`;
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

  const fromURL = FLAVORS.findIndex(f => f.id === new URLSearchParams(location.search).get('f'));
  let hero = Math.max(0, fromURL);
  let W, H, tw, th, spots = [], heroSpot, stw, sth;
  const tf = p => `translate(${p.x - tw / 2}px, ${p.y - th}px) scale(${p.s})`;
  const px = n => `${n}px`;

  function layout() {
    W = stage.clientWidth; H = stage.clientHeight;
    const pad = Math.max(8, W * 0.03), sw = (W - pad * 4) / 5;
    stw = sw * 0.92; sth = stw * 1.2;
    const shelfY = H - 44;
    const heroRoom = shelfY - sth - 26;
    th = Math.min(heroRoom * 0.94, W * (W > 500 ? 0.66 : 0.6) * 1.2); tw = th / 1.2;
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

  // ---------- Featured flavor: colors, name, description ----------
  const nameBox = $('.name');
  const meta = $('meta[name="theme-color"]');
  let colorTimer;
  function paint(first) {
    const f = FLAVORS[hero];
    const apply = () => {
      for (const k of ['bg', 'deep', 'glow', 'ink', 'btn']) root.style.setProperty(`--${k}`, f[k]);
      meta.content = f.bg;
    };
    clearTimeout(colorTimer);
    if (first || reduced) apply(); else colorTimer = setTimeout(apply, 350);
    const old = nameBox.querySelector('span:not(.out)');
    if (old) { old.className = 'out'; setTimeout(() => old.remove(), 900); }
    const s = document.createElement('span');
    s.textContent = f.name;
    if (old) s.className = 'in';
    nameBox.append(s);
    nameBox.setAttribute('aria-label', f.name);
    $('.desc').textContent = f.desc;
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
  // A tub someone picks stays in the spotlight for 6 seconds before the rotation carries on.
  const pick = k => { feature(k); rotate(HOLD); };
  stage.addEventListener('click', e => { const t = e.target.closest('.tub'); if (t) pick(Number(t.dataset.k)); });
  stage.addEventListener('keydown', e => {
    const t = e.target.closest('.tub');
    if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(Number(t.dataset.k)); }
  });

  // ---------- Flavor cards and the "four tubs" lineup ----------
  const stepHTML = (f, label) => `<div class="step">
      <button type="button" data-act="sub" data-id="${f.id}" aria-label="Remove one ${f.name}"><svg viewBox="0 0 16 16"><path d="M3 8h10"/></svg></button>
      <output>${label}</output>
      <button type="button" data-act="add" data-id="${f.id}" data-from="card" aria-label="Add one ${f.name}"><svg viewBox="0 0 16 16"><path d="M3 8h10M8 3v10"/></svg></button>
    </div>`;
  $('.cards').innerHTML = FLAVORS.map((f, k) => `
    <article class="card" style="--c-bg:${f.bg};--c-ink:${f.ink}" data-card="${f.id}">
      <div class="photo"><img src="${PHOTO(f.id)}" alt="Open tub of Happy Spoon ${f.name}" loading="lazy" decoding="async"></div>
      <div class="body">
        <h3 class="cond">${f.name}</h3>
        <p>${f.desc}</p>
        <div class="row"><b>${money(PRICE)}</b><div class="ctl">
          <button class="add" type="button" data-act="add" data-id="${f.id}" data-from="card">Add to box</button>
          ${stepHTML(f, '')}
        </div></div>
      </div>
    </article>`).join('');
  $('.lineup').innerHTML = ['chocolate-fudge', 'cookies-and-cream', 'mint-chip', 'salted-caramel']
    .map(id => `<img src="${TUB(id)}" alt="" loading="lazy">`).join('');
  $('.unit').textContent = money(PRICE);

  // ---------- Box changes ----------
  const bar = $('.bar'), boxBtn = $('.box-btn');
  function bump(el) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  let fresh = -1;   // index of the tub that just went in, so its slot can pop in
  function add(id, source) {
    if (box.length >= MAX) { note(`A box holds up to ${MAX} tubs.`); openBox(); return; }
    box.push(id);
    fresh = box.length - 1;
    save();
    render();
    flyIn(id, source);
  }
  function sub(id) {
    const i = box.lastIndexOf(id);
    if (i >= 0) { box.splice(i, 1); save(); render(); }
  }

  // A copy of the tub flies from where it was added into its slot in the box (or to the box bar if the slot is off screen).
  function flyIn(id, source) {
    const slot = $$('.slot')[fresh];
    const onScreen = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
    const target = slot && onScreen(slot) ? slot : bar;
    if (target === bar) bump(bar);
    bump(boxBtn);
    if (reduced || !source) return;
    let from;
    if (source.dataset.from === 'hero' && onScreen(tubs[hero])) from = tubs[hero].getBoundingClientRect();
    else if (source.closest('.card')) from = source.closest('.card').querySelector('.photo').getBoundingClientRect();
    if (!from) return;
    const to = target.getBoundingClientRect();
    const w = Math.min(from.width, 220), h = w * 1.2;
    const x0 = from.left + from.width / 2 - w / 2, y0 = from.top + from.height / 2 - h / 2;
    const s = Math.min(1, (target === bar ? 44 : to.width * 0.8) / w);
    const dx = to.left + (target === bar ? 40 : to.width / 2) - (x0 + w / 2), dy = to.top + to.height / 2 - (y0 + h / 2);
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

  function status(n) {
    if (n === 0) return { title: 'Build your box', sub: `Pick at least ${MIN} tubs` };
    if (n < MIN) return { title: `${n} of ${MIN} tubs`, sub: `Add ${MIN - n} more to check out` };
    return { title: `${plural(n, 'tub')} · ${money(n * PRICE)}`, sub: 'Your box is ready' };
  }

  function render() {
    const n = box.length;
    const st = status(n);
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

    // Tray slots: at least four, more as the box grows
    const slots = Math.max(MIN, n);
    $('.slots').innerHTML = Array.from({ length: slots }, (_, i) => {
      const id = box[i];
      if (!id) return `<span class="slot empty" data-n="${i + 1}"></span>`;
      return `<button type="button" class="slot${i === fresh ? ' new' : ''}" data-act="out" data-i="${i}" aria-label="Take one ${byId(id).name} out of the box"><img src="${TUB(id)}" alt=""><span class="x" aria-hidden="true"><svg viewBox="0 0 10 10"><path d="M2 2l6 6M8 2 2 8"/></svg></span></button>`;
    }).join('');
    fresh = -1;
    $('.tray-status').textContent = n >= MIN ? `Ready · ${plural(n, 'tub')}` : `${n} of ${MIN} minimum`;

    // Cards
    $$('.card').forEach(card => {
      const c = qty(card.dataset.card);
      card.querySelector('.ctl').classList.toggle('has', c > 0);
      card.querySelector('.ctl output').textContent = c;
    });

    // Header + bar
    $('.box-count').textContent = n;
    boxBtn.setAttribute('aria-label', `Open your box, ${plural(n, 'tub')}`);
    $('.bar-info b').textContent = st.title;
    $('.bar-info span').textContent = st.sub;
    $$('.pips').forEach(p => [...p.children].forEach((pip, i) => pip.classList.toggle('on', i < n)));
    const go = $('.go');
    go.classList.toggle('ready', n >= MIN);
    go.textContent = n >= MIN ? 'Check out' : 'View box';

    renderDrawer();
  }

  function renderDrawer() {
    const n = box.length;
    // Keep keyboard focus on the same control when the list is rebuilt
    const a = document.activeElement, keep = a && a.closest('.d-lines') ? `[data-act="${a.dataset.act}"][data-id="${a.dataset.id}"]` : null;
    $('.d-progress p').textContent = n >= MIN ? `${plural(n, 'tub')} in your box. You're good to go.`
      : n === 0 ? `Your box is empty. Add at least ${MIN} tubs.` : `${n} of ${MIN} tubs. Add ${MIN - n} more to check out.`;
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
    btn.textContent = n >= MIN ? `Check out · ${money(n * PRICE)}` : n === 0 ? `Add ${MIN} tubs to check out` : `Add ${plural(MIN - n, 'more tub')} to check out`;
    if (n < MIN) note('');
  }

  function openBox() { if (!drawer.open) { note(''); drawer.showModal(); } }
  drawer.addEventListener('click', e => { if (e.target === drawer) drawer.close(); });   // tap outside the sheet

  // One click handler for every button on the page
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    if (b.closest('.adder')) rotate(HOLD);   // adding or removing the spotlighted flavor also holds it
    if (act === 'add') add(b.dataset.id, b);
    else if (act === 'sub') sub(b.dataset.id);
    else if (act === 'out') { box.splice(Number(b.dataset.i), 1); save(); render(); }
    else if (act === 'open') openBox();
    else if (act === 'close') drawer.close();
    else if (act === 'all') {
      FLAVORS.forEach(f => { if (box.length < MAX) box.push(f.id); });
      save(); render(); bump(bar); bump(boxBtn);
    } else if (act === 'checkout') {
      note("Checkout isn't connected yet. This is a design mockup.", true);
    } else if (act === 'promo-close') promo.close();
  });

  // ---------- Welcome offer: 25% off, shown 1 second after the page opens, once per visitor ----------
  // Signups go to the Kit form in data-kit-form (Kit's public endpoint, no secret keys), tagged with where they came from.
  const promo = $('.promo');
  const promoForm = $('.promo-form');
  const promoNote = $('.promo-note');
  const PROMO_KEY = 'hs-shop-promo';
  let promoSeen = null;
  try { promoSeen = localStorage.getItem(PROMO_KEY); } catch {}
  const remember = v => { try { localStorage.setItem(PROMO_KEY, v); } catch {} };
  $('.promo-tub').src = TUB(FLAVORS[hero].id);
  promo.addEventListener('click', e => { if (e.target === promo) promo.close(); });   // tap outside the card
  promo.addEventListener('close', () => { if (!promo.classList.contains('joined')) remember('dismissed'); });
  if (!promoSeen || new URLSearchParams(location.search).has('promo')) {
    setTimeout(() => {
      if (drawer.open || promo.open) return;
      $('.promo-tub').src = TUB(FLAVORS[hero].id);   // match whatever flavor is on screen
      promo.showModal();
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
      button.textContent = 'Signing up…'; button.disabled = true;
      try {
        const body = new FormData();
        body.append('email_address', address);
        body.append('fields[source]', 'Shop popup: 25% off');
        const res = await fetch(`https://app.kit.com/forms/${encodeURIComponent(kitId)}/subscriptions`, { method: 'POST', body, headers: { Accept: 'application/json' } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || (data.status && data.status !== 'success')) throw new Error(data.error || res.status);
      } catch {
        promoNote.textContent = 'Something went wrong. Please try again.';
        return;
      } finally {
        promoSending = false;
        button.textContent = 'Send my 25% off code'; button.disabled = false;
      }
    }
    remember('joined');
    promo.classList.add('joined');
    $('.promo-shop').focus({ preventScroll: true });
  });

  // ---------- Spotlight rotation: the next flavor every 3 seconds; a picked one holds for 6 ----------
  // Waits while the box or the welcome popup is open, or the tab is in the background.
  function rotate(ms) {
    clearTimeout(rotateTimer);
    if (reduced) return;
    rotateTimer = setTimeout(() => {
      if (!document.hidden && !drawer.open && !promo.open) feature((hero + 1) % FLAVORS.length);
      rotate(AUTO);
    }, ms);
  }

  paint(true);
  layout();
  render();
  new ResizeObserver(() => layout()).observe(stage);
  rotate(AUTO);
})();
