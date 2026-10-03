// Shared site header: shows how many tubs are in the shop box (saved in this browser) on the box button,
// and adds the phone menu button that opens the links. The shop page keeps its own box count up to date.
(() => {
  document.querySelectorAll('.site-head').forEach(head => {
    const nav = head.querySelector('.site-nav');
    if (!nav || head.querySelector('.site-menu')) return;
    nav.id = nav.id || 'site-nav';
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'site-menu';
    btn.setAttribute('aria-label', 'Menu'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', nav.id);
    btn.innerHTML = '<svg class="sm-bars" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h14M3 14h14"/></svg><svg class="sm-x" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15"/></svg>';
    head.append(btn);
    const set = open => { head.classList.toggle('menu-open', open); btn.setAttribute('aria-expanded', open); };
    btn.addEventListener('click', e => { e.stopPropagation(); set(!head.classList.contains('menu-open')); });
    nav.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
    document.addEventListener('click', e => { if (!head.contains(e.target)) set(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  });
  if (document.querySelector('.site-box button, button.site-box')) return;   // the shop counts its own box
  let n = 0;
  try { const box = JSON.parse(localStorage.getItem('hs-shop-box')); if (Array.isArray(box)) n = box.length; } catch {}
  document.querySelectorAll('.site-box .box-count').forEach(el => { el.textContent = n; });
  document.querySelectorAll('a.site-box').forEach(a => a.setAttribute('aria-label', `Your box, ${n} tub${n === 1 ? '' : 's'}`));
})();
