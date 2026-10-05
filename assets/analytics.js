// Google Analytics 4: how many people visit, where they come from (Instagram, TikTok, Google, direct…),
// and the clicks that matter (adding tubs, opening the box, checkout, email signups).
// Paste the Measurement ID from GA4 (Admin → Data streams → Web → "G-…") below. Empty = analytics off.
(() => {
  const GA_ID = '';

  window.hsTrack = (name, params) => { if (window.gtag) gtag('event', name, params); };
  // Only the live site counts, so local previews don't inflate the numbers
  if (!GA_ID || !/(^|\.)happyspoonyogurt\.com$/.test(location.hostname)) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA_ID);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.append(s);

  // Shop buttons (the shop's own click handler does the work; this only counts them)
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'add') hsTrack('add_to_cart', { currency: 'USD', items: [{ item_id: b.dataset.id }] });
    else if (act === 'open') hsTrack('view_cart');
    else if (act === 'checkout') hsTrack('begin_checkout');
  });
})();
