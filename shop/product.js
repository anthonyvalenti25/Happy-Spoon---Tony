(() => {
  const flavors = [
    { id: 'chocolate-fudge', name: 'Chocolate Fudge', line: 'Deep cocoa. Full fudge mode.', short: 'Big chocolate energy, all spoonful long.', color: '#d9533b', image: 'chocolate-fudge.webp', number: '01', giant: 'CHOCOLATE<br>FUDGE' },
    { id: 'cookies-and-cream', name: 'Cookies & Cream', line: 'Cookie pieces meet sweet cream.', short: 'Creamy, cookie-specked, gone too soon.', color: '#3f8fd8', image: 'cookies-and-cream.webp', number: '02', giant: 'COOKIES<br>&amp; CREAM' },
    { id: 'salted-caramel', name: 'Salted Caramel', line: 'Buttery sweet. Little salty.', short: 'The sweet-and-salty spoonful you came for.', color: '#eb9a2b', image: 'salted-caramel.webp', number: '03', giant: 'SALTED<br>CARAMEL' },
    { id: 'mint-chip', name: 'Mint Chip', line: 'Cool mint. Dark chocolate.', short: 'A cool, chocolate-speckled classic.', color: '#62c79a', image: 'mint-chip.webp', number: '04', giant: 'MINT<br>CHIP' },
    { id: 'cookie-dough', name: 'Cookie Dough', line: 'Brown sugar. Chocolate chips.', short: 'Cookie dough nostalgia, ready for a spoon.', color: '#7a45b5', image: 'cookie-dough.webp', number: '05', giant: 'COOKIE<br>DOUGH' }
  ];
  const params = new URLSearchParams(location.search);
  const flavor = flavors.find(f => f.id === params.get('f')) || flavors[0];
  const imgRoot = '../new/img/';
  const title = `${flavor.name} | Happy Spoon`;
  document.title = title;
  document.querySelector('meta[name="description"]').content = `${flavor.name} is one of five Happy Spoon high-protein dessert yogurt flavors in 32 oz tubs.`;
  document.getElementById('crumbName').textContent = flavor.name;
  document.getElementById('productName').textContent = flavor.name;
  document.getElementById('productLine').textContent = flavor.line;
  document.getElementById('productDescription').textContent = `${flavor.short} Discover the flavor, then make it part of your lineup.`;
  document.getElementById('productNumber').textContent = `${flavor.number} / 05`;
  document.getElementById('productGiant').innerHTML = flavor.giant;
  document.getElementById('productImage').src = imgRoot + flavor.image;
  document.getElementById('productImage').alt = `Happy Spoon ${flavor.name} high-protein dessert yogurt in a 32 oz tub`;
  document.querySelector('.product-art').style.setProperty('--product-color', flavor.color);
  document.getElementById('productButton').href = `./?f=${flavor.id}#build`;

  document.getElementById('productFlavors').innerHTML = flavors.map(f => `
    <a class="flavor-dot-link" href="product.html?f=${f.id}" style="--flavor-bg:${f.color}" aria-label="${f.name}" ${f.id === flavor.id ? 'aria-current="true"' : ''}>
      <img src="${imgRoot + f.image}" alt=""><span>${f.name}</span>
    </a>`).join('');
  document.getElementById('otherFlavors').innerHTML = flavors.map(f => `
    <a href="product.html?f=${f.id}" style="--flavor-bg:${f.color}" ${f.id === flavor.id ? 'aria-current="page"' : ''}>
      <img src="${imgRoot + f.image}" alt="" loading="lazy"><span>${f.name}</span>
    </a>`).join('');
})();
