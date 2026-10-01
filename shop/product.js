(() => {
  const flavors = [
    { id: 'chocolate-fudge', name: 'Chocolate Fudge', line: 'Deep cocoa and fudge.', short: 'Chocolate yogurt with a rich cocoa flavor.', color: '#d9533b', image: 'chocolate-fudge.webp' },
    { id: 'cookies-and-cream', name: 'Cookies & Cream', line: 'Cookie pieces and sweet cream.', short: 'Creamy yogurt with chocolate cookie pieces.', color: '#3f8fd8', image: 'cookies-and-cream.webp' },
    { id: 'salted-caramel', name: 'Salted Caramel', line: 'Caramel with a salty finish.', short: 'Sweet caramel flavor with a touch of salt.', color: '#eb9a2b', image: 'salted-caramel.webp' },
    { id: 'mint-chip', name: 'Mint Chip', line: 'Mint and dark chocolate.', short: 'Cool mint yogurt with dark chocolate pieces.', color: '#62c79a', image: 'mint-chip.webp' },
    { id: 'cookie-dough', name: 'Cookie Dough', line: 'Brown sugar and chocolate chips.', short: 'Cookie dough flavor with chocolate chips.', color: '#7a45b5', image: 'cookie-dough.webp' }
  ];
  const params = new URLSearchParams(location.search);
  const flavor = flavors.find(f => f.id === params.get('f')) || flavors[0];
  const imgRoot = '../assets/';
  const title = `${flavor.name} | Happy Spoon`;
  document.title = title;
  document.querySelector('meta[name="description"]').content = `${flavor.name} is one of five Happy Spoon high-protein dessert yogurt flavors in 32 oz tubs.`;
  document.getElementById('crumbName').textContent = flavor.name;
  document.getElementById('productName').textContent = flavor.name;
  document.getElementById('productLine').textContent = flavor.line;
  document.getElementById('productDescription').textContent = flavor.short;
  document.getElementById('productImage').src = imgRoot + flavor.image;
  document.getElementById('productImage').alt = `Happy Spoon ${flavor.name} high-protein dessert yogurt in a 32 oz tub`;
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
