(() => {
  const flavors = [
    { id: 'chocolate-fudge', name: 'Chocolate Fudge', line: 'Deep cocoa and fudge.', short: 'Chocolate yogurt with a rich cocoa flavor.', color: '#d9533b', swatch: '#5a211b', image: 'chocolate-fudge.webp' },
    { id: 'cookies-and-cream', name: 'Cookies & Cream', line: 'Cookie pieces and sweet cream.', short: 'Creamy yogurt with chocolate cookie pieces.', color: '#3f8fd8', swatch: '#262323', image: 'cookies-and-cream.webp' },
    { id: 'salted-caramel', name: 'Salted Caramel', line: 'Caramel with a salty finish.', short: 'Sweet caramel flavor with a touch of salt.', color: '#eb9a2b', swatch: '#c26914', image: 'salted-caramel.webp' },
    { id: 'mint-chip', name: 'Mint Chip', line: 'Mint and dark chocolate.', short: 'Cool mint yogurt with dark chocolate pieces.', color: '#62c79a', swatch: '#15384a', image: 'mint-chip.webp' },
    { id: 'cookie-dough', name: 'Cookie Dough', line: 'Brown sugar and chocolate chips.', short: 'Cookie dough flavor with chocolate chips.', color: '#7a45b5', swatch: '#d7ab77', image: 'cookie-dough.webp' }
  ];
  const imgRoot = '../assets/';
  const grid = document.getElementById('flavorGrid');
  const builder = document.getElementById('builderList');
  const counts = Object.fromEntries(flavors.map(f => [f.id, 0]));
  let boxSize = 6;
  let toastTimer;
  const requestedFlavor = new URLSearchParams(location.search).get('f');
  if (Object.hasOwn(counts, requestedFlavor)) counts[requestedFlavor] = 1;

  grid.innerHTML = flavors.map(f => `
    <article class="flavor-card" style="--flavor-bg:${f.color}">
      <a class="flavor-card-link" href="product.html?f=${f.id}" aria-label="Explore ${f.name}">
        <div class="flavor-image"><img src="${imgRoot + f.image}" alt="Happy Spoon ${f.name} 32 oz tub" ${f.id === 'chocolate-fudge' ? 'fetchpriority="high"' : 'loading="lazy"'}></div>
        <div class="flavor-copy"><h3>${f.name}</h3><p>${f.short}</p><span class="flavor-link">Flavor details</span></div>
      </a>
    </article>`).join('');

  builder.innerHTML = flavors.map(f => `
    <div class="builder-row" data-flavor="${f.id}" style="--flavor-bg:${f.color}">
      <img src="${imgRoot + f.image}" alt="" loading="lazy">
      <div><h4>${f.name}</h4><small>${f.line}</small></div>
      <div class="counter" role="group" aria-label="${f.name} tubs">
        <button type="button" data-delta="-1" aria-label="Remove one ${f.name} tub">−</button>
        <output aria-live="polite">0</output>
        <button type="button" data-delta="1" aria-label="Add one ${f.name} tub">+</button>
      </div>
    </div>`).join('');

  const picked = () => Object.values(counts).reduce((sum, n) => sum + n, 0);
  const track = document.getElementById('progressTrack');
  const progressText = document.getElementById('progressText');
  const remainingText = document.getElementById('remaining');
  const submit = document.getElementById('previewOrder');
  const message = document.getElementById('builderMessage');
  const toast = document.getElementById('toast');
  const notify = text => {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  };

  function renderBox() {
    const total = picked();
    builder.querySelectorAll('.builder-row').forEach(row => {
      const id = row.dataset.flavor;
      const n = counts[id];
      row.querySelector('output').textContent = n;
      row.querySelector('[data-delta="-1"]').disabled = n === 0;
      row.querySelector('[data-delta="1"]').disabled = total >= boxSize;
    });
    document.querySelectorAll('.size-option').forEach(btn => {
      const selected = Number(btn.dataset.size) === boxSize;
      btn.classList.toggle('selected', selected);
      btn.setAttribute('aria-pressed', String(selected));
    });
    progressText.textContent = `${total} of ${boxSize} picked`;
    remainingText.textContent = Math.max(boxSize - total, 0);
    track.style.setProperty('--box-size', boxSize);
    const colorSlots = flavors.flatMap(f => Array(counts[f.id]).fill(f.color));
    track.innerHTML = Array.from({ length: boxSize }, (_, i) => `<i class="${i < total ? 'filled' : ''}" style="--slot-color:${colorSlots[i] || '#d9533b'}"></i>`).join('');
    submit.disabled = total !== boxSize;
    submit.innerHTML = total === boxSize ? 'Continue to checkout' : `Choose ${Math.max(boxSize - total, 0)} more`;
  }

  builder.addEventListener('click', event => {
    const button = event.target.closest('[data-delta]');
    if (!button) return;
    const id = button.closest('.builder-row').dataset.flavor;
    const next = counts[id] + Number(button.dataset.delta);
    if (next < 0 || (Number(button.dataset.delta) > 0 && picked() >= boxSize)) return;
    counts[id] = next;
    renderBox();
  });

  document.querySelectorAll('.size-option').forEach(button => button.addEventListener('click', () => {
    boxSize = Number(button.dataset.size);
    let excess = picked() - boxSize;
    for (const f of [...flavors].reverse()) {
      const trim = Math.min(excess, counts[f.id]);
      counts[f.id] -= trim;
      excess -= trim;
    }
    renderBox();
  }));

  document.getElementById('fillBox').addEventListener('click', () => {
    Object.keys(counts).forEach(id => { counts[id] = 0; });
    for (let i = 0; i < boxSize; i++) counts[flavors[i % flavors.length].id]++;
    renderBox();
  });

  submit.addEventListener('click', () => {
    if (picked() !== boxSize) return;
    message.textContent = 'Your flavor mix is ready to go. Checkout will be connected before launch.';
    notify('Your mix is ready. Checkout is not connected in this preview.');
  });

  renderBox();
})();
