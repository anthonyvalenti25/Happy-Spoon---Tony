// Happy Spoon shop: flavor data, sample pricing, and a cart kept in this browser.
// Checkout is not connected yet. Prices are design samples.
(function () {
  const IMG = '../new/img/';

  const FLAVORS = [
    { id: 'chocolate-fudge', name: 'Chocolate Fudge', img: 'chocolate-fudge.webp', bg: '#d9533b', deep: '#c7462f', ink: '#ffffff', accent: '#c23e27', sw: '#5a211b',
      short: 'Rich cocoa with a thick, fudgy finish.',
      desc: 'Deep cocoa flavor with the full dessert energy your nightly spoon deserves.',
      notes: ['Deep cocoa', 'Fudge swirl', 'Chocolate chunks'] },
    { id: 'cookies-and-cream', name: 'Cookies & Cream', img: 'cookies-and-cream.webp', bg: '#3f8fd8', deep: '#3582ca', ink: '#ffffff', accent: '#2f78bf', sw: '#262323',
      short: 'Vanilla cream loaded with cookie pieces.',
      desc: 'Creamy, cookie-specked satisfaction with a familiar crunch-shop attitude.',
      notes: ['Sweet cream', 'Chocolate cookie pieces', 'A little crunch'] },
    { id: 'salted-caramel', name: 'Salted Caramel', img: 'salted-caramel.webp', bg: '#eb9a2b', deep: '#de8c1d', ink: '#2b1608', accent: '#b5670d', sw: '#c26914',
      short: 'Buttery caramel with a salty finish.',
      desc: 'Sweet, buttery caramel character sharpened with a salty finish.',
      notes: ['Buttery caramel', 'Caramel swirl', 'Sea-salt finish'] },
    { id: 'mint-chip', name: 'Mint Chip', img: 'mint-chip.webp', bg: '#62c79a', deep: '#55ba8d', ink: '#0f2a1e', accent: '#25916a', sw: '#15384a',
      short: 'Cool mint with dark chocolate chips.',
      desc: 'Cool mint and dark chocolate attitude for the most refreshing spoon in the lineup.',
      notes: ['Cool mint', 'Dark chocolate chips', 'Clean finish'] },
    { id: 'cookie-dough', name: 'Cookie Dough', img: 'cookie-dough.webp', bg: '#7a45b5', deep: '#6d3aa6', ink: '#ffffff', accent: '#6c3aa5', sw: '#d7ab77',
      short: 'Brown sugar and chocolate-chip dough.',
      desc: 'Brown-sugar nostalgia and chocolate-chip flavor made for one-more-bite people.',
      notes: ['Brown sugar', 'Cookie dough pieces', 'Chocolate chips'] }
  ];

  // Sample pricing for the design. Swap these when real prices are set.
  const PACK = { 4: 13.99, 8: 25.99, 12: 35.99 };
  const SUB_OFF = 0.15;
  const FREE_SHIP = 40;
  const KEY = 'hs-cart-v1';

  const money = n => '$' + n.toFixed(2);
  const round = n => Math.round(n * 100) / 100;
  const flavorById = id => FLAVORS.find(f => f.id === id) || FLAVORS[0];
  const unitPrice = (size, sub) => round(PACK[size] * (sub ? 1 - SUB_OFF : 1));
  const perCup = (size, sub) => unitPrice(size, sub) / size;

  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { cart = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };

  const lineKey = l => [l.kind, l.flavor || JSON.stringify(l.mix), l.size, l.sub ? 'sub' + l.every : 'once'].join('|');
  const lineTotal = l => unitPrice(l.size, l.sub) * l.qty;
  const fullTotal = l => PACK[l.size] * l.qty;
  const count = () => cart.reduce((n, l) => n + l.qty, 0);
  const subtotal = () => round(cart.reduce((n, l) => n + lineTotal(l), 0));
  const savings = () => round(cart.reduce((n, l) => n + fullTotal(l) - lineTotal(l), 0));

  // ---------- Drawer markup ----------
  const drawerHTML = `
    <div class="scrim" data-close-cart></div>
    <aside class="drawer" id="cartDrawer" role="dialog" aria-modal="true" aria-labelledby="cartTitle" aria-hidden="true">
      <div class="drawer-head"><h2 id="cartTitle">Your cart</h2><button class="icon-btn" type="button" data-close-cart aria-label="Close cart">&times;</button></div>
      <div class="ship" id="shipMsg"></div>
      <div class="lines" id="cartLines"></div>
      <div class="drawer-foot" id="cartFoot"></div>
    </aside>`;
  document.body.insertAdjacentHTML('beforeend', drawerHTML);
  const drawer = document.getElementById('cartDrawer');
  let lastFocus = null;

  function openCart() {
    lastFocus = document.activeElement;
    document.body.classList.add('cart-open');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.querySelector('.icon-btn').focus();
  }
  function closeCart() {
    document.body.classList.remove('cart-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener('click', e => {
    if (e.target.closest('[data-close-cart]')) closeCart();
    if (e.target.closest('[data-open-cart]')) openCart();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('cart-open')) closeCart(); });

  function describe(l) {
    if (l.kind === 'box') {
      const parts = Object.entries(l.mix).filter(([, n]) => n > 0).map(([id, n]) => `${n} ${flavorById(id).name}`);
      return parts.join(', ');
    }
    return `${l.size}-pack`;
  }

  function render() {
    // header counts
    const n = count();
    document.querySelectorAll('.cart-count').forEach(el => { el.textContent = n; });

    // free shipping
    const sub = subtotal();
    const left = round(FREE_SHIP - sub);
    const pct = Math.min(100, (sub / FREE_SHIP) * 100);
    document.getElementById('shipMsg').innerHTML = '<p>' + (left > 0
      ? `You're <b>${money(left)}</b> away from free shipping.`
      : `<b>You've got free shipping.</b>`) + `</p><div class="ship-bar" aria-hidden="true"><i style="width:${pct}%"></i></div>`;

    const linesEl = document.getElementById('cartLines');
    const foot = document.getElementById('cartFoot');
    if (!cart.length) {
      linesEl.innerHTML = `<div class="empty"><b>Your cart is empty</b><span>Start with a single flavor or build a mixed box.</span><a class="btn" href="./#box" data-close-cart>Build a box</a></div>`;
      foot.innerHTML = '';
      return;
    }
    linesEl.innerHTML = cart.map((l, i) => {
      const f = l.kind === 'box' ? null : flavorById(l.flavor);
      const title = l.kind === 'box' ? `Mixed box of ${l.size}` : f.name;
      const img = l.kind === 'box' ? FLAVORS.find(x => l.mix[x.id] > 0) : f;
      const plan = l.sub ? `Subscribe &middot; every ${l.every} weeks` : 'One-time purchase';
      return `<div class="line">
        <div class="line-img" style="--bg:${img.bg}"><img src="${IMG + img.img}" alt=""></div>
        <div><h3>${title}</h3><p>${describe(l)}</p><p>${plan}</p>
          <div class="stepper" aria-label="Quantity for ${title}">
            <button type="button" data-dec="${i}" aria-label="Remove one">&minus;</button><output>${l.qty}</output><button type="button" data-inc="${i}" aria-label="Add one">+</button>
          </div></div>
        <div class="line-price">${money(lineTotal(l))}${l.sub ? `<s style="font-weight:500;color:var(--ink-faint);font-size:.8rem">${money(fullTotal(l))}</s>` : ''}<button type="button" data-remove="${i}">Remove</button></div>
      </div>`;
    }).join('');
    const save$ = savings();
    foot.innerHTML = `
      <div class="sum-row"><span>Subtotal</span><span>${money(sub)}</span></div>
      ${save$ > 0 ? `<div class="sum-row save"><span>Subscription savings</span><span>&minus;${money(save$)}</span></div>` : ''}
      <div class="sum-row"><span>Shipping</span><span>${left > 0 ? 'Calculated at checkout' : 'Free'}</span></div>
      <button class="btn block" type="button" id="checkoutBtn">Checkout &middot; ${money(sub)}</button>
      <p class="drawer-note" id="checkoutNote">Skip or cancel subscriptions anytime.</p>`;
    document.getElementById('checkoutBtn').addEventListener('click', () => {
      document.getElementById('checkoutNote').textContent = "Checkout isn't connected yet. This is a design preview.";
    });
  }

  document.getElementById('cartLines').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.inc) cart[+b.dataset.inc].qty++;
    if (b.dataset.dec) { const l = cart[+b.dataset.dec]; l.qty--; if (l.qty < 1) cart.splice(+b.dataset.dec, 1); }
    if (b.dataset.remove) cart.splice(+b.dataset.remove, 1);
    save(); render();
  });

  function addToCart(item, open = true) {
    const k = lineKey(item);
    const existing = cart.find(l => lineKey(l) === k);
    if (existing) existing.qty += item.qty || 1;
    else cart.push({ ...item, qty: item.qty || 1 });
    save(); render();
    document.querySelectorAll('.cart-count').forEach(el => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); });
    if (open) openCart();
  }

  render();

  window.HS = { FLAVORS, PACK, SUB_OFF, FREE_SHIP, IMG, money, perCup, unitPrice, flavorById, addToCart, openCart };
})();
