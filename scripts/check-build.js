// Проверка после сборки: в .next/ не должно остаться заглушечного адреса из шаблонов (example + .com).
// Запускается автоматически после `npm run build` (postbuild).
const fs = require('fs');
const path = require('path');

// проверяем то, что уйдёт на хостинг: статичную сборку out/ (и .next, если out/ нет)
const root = fs.existsSync(path.join(__dirname, '..', 'out')) ? path.join(__dirname, '..', 'out') : path.join(__dirname, '..', '.next');
const needle = ['example', 'com'].join('.');
const hits = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // cache и build — служебные файлы сборщика (в build есть комментарий библиотеки source-map с example.com), на сайт они не попадают
      if (entry.name === 'cache' || (dir === root && entry.name === 'build')) continue;
      walk(p);
    } else if (/\.(html|js|json|rsc|txt|xml|body|meta)$/.test(entry.name)) {
      if (fs.readFileSync(p, 'utf8').includes(needle)) hits.push(path.relative(root, p));
    }
  }
}

walk(root);
if (hits.length) {
  console.error(`\n✗ В сборке найден ${needle}:\n  ${hits.slice(0, 20).join('\n  ')}\nПроверьте NEXT_PUBLIC_SITE_URL.\n`);
  process.exit(1);
}
console.log(`✓ В ${path.basename(root)}/ нет ${needle}`);
