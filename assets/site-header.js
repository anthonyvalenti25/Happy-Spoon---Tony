// Shared site header: shows how many tubs are in the shop box (saved in this browser) on the box button.
// The shop page keeps its own count up to date, so it doesn't load this.
(() => {
  let n = 0;
  try { const box = JSON.parse(localStorage.getItem('hs-shop-box')); if (Array.isArray(box)) n = box.length; } catch {}
  document.querySelectorAll('.site-box .box-count').forEach(el => { el.textContent = n; });
  document.querySelectorAll('a.site-box').forEach(a => a.setAttribute('aria-label', `Your box, ${n} tub${n === 1 ? '' : 's'}`));
})();
