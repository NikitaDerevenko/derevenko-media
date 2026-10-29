// Open Graph картинки 1200×630 (имя, одна строка предложения, зелёный акцент) → public/og/*.png.
// Тексты берутся из lib/i18n/ru.ts и en.ts, шрифты — assets/og/*.ttf (scripts/make-og-fonts.js).
// Запускается автоматически перед сборкой (prebuild). Вручную: node scripts/make-og.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Загружает TS-модуль словаря (в нём только type-импорты) */
function loadTs(rel) {
  const src = fs.readFileSync(path.join(root, rel), 'utf8');
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  new Function('module', 'exports', 'require', js)(module, module.exports, require);
  return module.exports;
}

const { ru } = loadTs('lib/i18n/ru.ts');
const { en } = loadTs('lib/i18n/en.ts');
const DIRECTIONS = ['promotion', 'websites', 'telegram-bots', 'mini-apps'];

// Палитра — как в app/globals.css
const C = { bg: '#FFFFFF', ink: '#161A1D', muted: '#586067', accent: '#146E4A', onAccent: '#FFFFFF', line: '#E1E4E0' };

const font = (f) => fs.readFileSync(path.join(root, 'assets', 'og', f));
// Латиница и кириллица — разные файлы: даём им разные имена, satori берёт недостающие глифы из следующего шрифта
const fonts = [
  { name: 'Onest', data: font('onest-latin-600.ttf'), weight: 600, style: 'normal' },
  { name: 'Onest Cyrillic', data: font('onest-cyrillic-600.ttf'), weight: 600, style: 'normal' },
  { name: 'Onest', data: font('onest-latin-400.ttf'), weight: 400, style: 'normal' },
  { name: 'Onest Cyrillic', data: font('onest-cyrillic-400.ttf'), weight: 400, style: 'normal' },
];

const el = (style, children) => ({ type: 'div', props: { style: { display: 'flex', ...style }, children } });

function card({ kicker, title, line }) {
  return el({ width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'space-between', background: C.bg, padding: 72, fontFamily: 'Onest, Onest Cyrillic' }, [
    el({ alignItems: 'center', gap: 20 }, [
      el({ width: 14, height: 14, borderRadius: 7, background: C.accent }, []),
      el({ fontSize: 30, fontWeight: 600, color: C.ink }, kicker),
    ]),
    el({ flexDirection: 'column' }, [
      el({ fontSize: title.length > 48 ? 58 : 68, fontWeight: 600, lineHeight: 1.05, color: C.ink, maxWidth: 1000 }, title),
    ]),
    el({ alignItems: 'center', justifyContent: 'space-between', borderTop: `2px solid ${C.line}`, paddingTop: 28 }, [
      el({ fontSize: 26, fontWeight: 400, color: C.muted, maxWidth: 860 }, line),
      el({ fontSize: 24, fontWeight: 600, color: C.accent }, 'derevenko-media.ru'),
    ]),
  ]);
}

const outDir = path.join(root, 'public', 'og');
fs.mkdirSync(outDir, { recursive: true });

async function render(name, data) {
  const svg = await satori(card(data), { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  fs.writeFileSync(path.join(outDir, `${name}.png`), png);
  console.log(`og/${name}.png`, png.length);
}

for (const [locale, d] of [['ru', ru], ['en', en]]) {
  await render(locale, { kicker: d.brand.name, title: d.meta.ogLine, line: d.footer.role });
  for (const dir of DIRECTIONS) {
    const x = d.directions[dir];
    await render(`${locale}-${dir}`, { kicker: `${d.brand.name}: ${x.name.toLowerCase()}`, title: x.page.h1, line: x.forWhom });
  }
}
