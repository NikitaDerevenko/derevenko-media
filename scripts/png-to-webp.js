// Конвертирует PNG в WebP рядом с исходником: node scripts/png-to-webp.js public/projects/x/a.png ...
const sharp = require('sharp');

(async () => {
  for (const f of process.argv.slice(2)) {
    const out = f.replace(/\.png$/i, '.webp');
    const info = await sharp(f).webp({ quality: 82 }).toFile(out);
    console.log(out, `${info.width}x${info.height}`, `${Math.round(info.size / 1024)}KB`);
  }
})();
