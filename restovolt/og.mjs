// Renders a 1200×630 Open Graph image per page from og-manifest.json (written
// by build.mjs) into public/assets/og/. Requires Playwright. Usage: node og.mjs
import { readFileSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const outDir = join(root, 'public', 'assets', 'og');
mkdirSync(outDir, { recursive: true });

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    const globalRoot = execSync('npm root -g').toString().trim();
    return import(pathToFileURL(join(globalRoot, 'playwright', 'index.mjs')).href);
  }
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const template = ({ title, sub }) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600&family=JetBrains+Mono:wght@500&display=block" rel="stylesheet">
<style>
  body { margin:0; width:1200px; height:630px; background:#0E0F11; color:#F4F1EA; font-family:'Inter Tight',sans-serif; position:relative; overflow:hidden; }
  .grid { position:absolute; inset:0; background-image:linear-gradient(#22252a 1px,transparent 1px),linear-gradient(90deg,#22252a 1px,transparent 1px); background-size:40px 40px; opacity:.55; }
  .glow { position:absolute; right:-200px; top:-200px; width:700px; height:700px; background:radial-gradient(circle, rgba(200,118,58,.35), transparent 65%); }
  .in { position:absolute; inset:72px; display:flex; flex-direction:column; justify-content:space-between; }
  .brand { font:600 26px 'Inter Tight'; letter-spacing:.2em; display:flex; align-items:center; gap:16px; }
  h1 { font-size:76px; line-height:1.02; letter-spacing:-.035em; margin:0; max-width:950px; }
  p { font:500 26px 'JetBrains Mono',monospace; color:#C8763A; margin:20px 0 0; }
</style></head><body><div class="grid"></div><div class="glow"></div>
<div class="in"><div class="brand"><svg width="40" height="40" viewBox="0 0 32 32"><rect x="1.5" y="1.5" width="29" height="29" rx="7" fill="none" stroke="#F4F1EA" stroke-width="1.6"/><path d="M18 5 9 18h6l-2 9 10-14h-6l1-8Z" fill="#C8763A"/></svg>RESTOVOLT</div>
<div><h1>${esc(title)}</h1><p>${esc(sub || '')}</p></div></div></body></html>`;

const manifest = JSON.parse(readFileSync(join(root, 'og-manifest.json'), 'utf8'));
manifest.push({ file: 'default.jpg', title: 'Electrify the classics.', sub: 'Classic soul. Electric heart. Engineered to fit.' });

const { chromium } = await loadPlaywright();
const browser = await chromium.launch(existsChromium());
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const item of manifest) {
  await page.setContent(template(item), { waitUntil: 'networkidle' }).catch(() => page.setContent(template(item)));
  await page.screenshot({ path: join(outDir, item.file), type: 'jpeg', quality: 82 });
}
await browser.close();
console.log(`Rendered ${manifest.length} share images → ${outDir}`);

function existsChromium() {
  const p = process.env.CHROMIUM_PATH;
  return p ? { executablePath: p } : {};
}
