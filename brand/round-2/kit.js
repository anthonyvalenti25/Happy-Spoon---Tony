// Round 2 brand guideline helpers: per-section feedback, the copy dock, and live contrast ratios.
(function () {
  const KEY = document.body.dataset.key;
  const KIT = document.body.dataset.kit;
  let store = {};
  try { store = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { store = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} dock(); };

  // Feedback bar at the end of each section marked data-fb
  const secs = [...document.querySelectorAll('[data-fb]')];
  secs.forEach(sec => {
    const name = sec.dataset.fb;
    const st = store[name] || (store[name] = { v: '', note: '' });
    const el = document.createElement('div');
    el.className = 'fb';
    el.innerHTML = `<b>${name}: keep it?</b><button type="button" class="yes" data-v="like">Like</button><button type="button" class="no" data-v="dislike">Dislike</button><textarea placeholder="Anything to change in ${name.toLowerCase()}?" aria-label="Notes on ${name}"></textarea>`;
    (sec.querySelector('.wrap') || sec).appendChild(el);
    const paint = () => el.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', st.v === b.dataset.v));
    el.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      st.v = st.v === b.dataset.v ? '' : b.dataset.v; paint(); save();
    });
    const ta = el.querySelector('textarea');
    ta.value = st.note || '';
    ta.addEventListener('input', () => { st.note = ta.value; save(); });
    paint();
  });

  const d = document.createElement('div');
  d.className = 'dock';
  d.innerHTML = '<span></span><button type="button">Copy feedback</button>';
  document.body.appendChild(d);
  function dock() {
    const n = secs.filter(s => { const st = store[s.dataset.fb]; return st && (st.v || (st.note || '').trim()); }).length;
    d.querySelector('span').textContent = n ? `${n} of ${secs.length} sections marked` : 'No notes yet';
  }
  d.querySelector('button').addEventListener('click', async e => {
    const btn = e.currentTarget;
    const lines = [`Happy Spoon brand kit, round 2: ${KIT}`];
    secs.forEach(s => {
      const st = store[s.dataset.fb]; if (!st || !(st.v || (st.note || '').trim())) return;
      lines.push(`- ${s.dataset.fb}: ${st.v || 'no vote'}${(st.note || '').trim() ? ' / ' + st.note.trim() : ''}`);
    });
    const extra = window.kitExtra ? window.kitExtra() : '';
    if (extra) lines.push(extra);
    if (lines.length < 2 + (extra ? 1 : 0)) { btn.textContent = 'Mark something first'; setTimeout(() => btn.textContent = 'Copy feedback', 1600); return; }
    const text = lines.join('\n');
    try { await navigator.clipboard.writeText(text); btn.textContent = 'Copied'; } catch (err) { window.prompt('Copy this:', text); }
    setTimeout(() => btn.textContent = 'Copy feedback', 1600);
  });
  dock();

  // Contrast ratios: <x data-contrast="#fg #bg">
  const lum = hex => {
    const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
  };
  window.contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  window.paintContrast = () => document.querySelectorAll('[data-contrast]').forEach(el => {
    const [fg, bg] = el.dataset.contrast.split(' ');
    const r = window.contrast(fg, bg);
    el.textContent = `${r.toFixed(1)}:1 · ${r >= 4.5 ? 'any text' : r >= 3 ? 'large text only' : 'decoration only'}`;
  });
  window.paintContrast();
})();
