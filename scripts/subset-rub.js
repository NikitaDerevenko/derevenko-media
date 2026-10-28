const fs = require('fs');
const subsetFont = require('subset-font');
(async () => {
  const src = fs.readFileSync(process.argv[2]);
  const out = await subsetFont(src, '₽', { targetFormat: 'woff2' });
  fs.writeFileSync(process.argv[3], out);
  console.log('rub', out.length);
})();
