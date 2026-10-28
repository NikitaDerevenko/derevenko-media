// Делает TTF-шрифты для Open Graph картинок (app/**/opengraph-image.tsx).
// Генератор картинок не читает woff2 и вариативные шрифты, поэтому берём наши woff2
// и сохраняем статичные начертания (wght 600 и 400) в assets/og/*.ttf.
// Запуск: node scripts/make-og-fonts.js
const fs = require('fs');
const path = require('path');
const subsetFont = require('subset-font');

const root = path.join(__dirname, '..');
const out = path.join(root, 'assets', 'og');
fs.mkdirSync(out, { recursive: true });

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i)).join('');
const latin = range(0x20, 0x7e) + range(0xa0, 0xff) + '—–«»“”’…•·×№';
const cyrillic = range(0x400, 0x45f);

(async () => {
  for (const [name, file, text] of [
    ['latin', 'inter-tight-latin.woff2', latin],
    ['cyrillic', 'inter-tight-cyrillic.woff2', cyrillic],
  ]) {
    const src = fs.readFileSync(path.join(root, 'public', 'fonts', file));
    for (const wght of [400, 600]) {
      const ttf = await subsetFont(src, text, { targetFormat: 'truetype', variationAxes: { wght } });
      const dest = path.join(out, `inter-tight-${name}-${wght}.ttf`);
      fs.writeFileSync(dest, ttf);
      console.log(path.relative(root, dest), ttf.length);
    }
  }
})();
