// Zero-dependency static pre-renderer. Every public route becomes a crawlable
// HTML file at public/<route>/index.html. Usage: node build.mjs
import { mkdirSync, writeFileSync, rmSync, cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { layout, abs } from './src/lib/html.mjs';
import { SITE } from './src/data/site.mjs';
import home from './src/pages/home.mjs';
import vehiclePages from './src/pages/vehicles.mjs';
import shopPages from './src/pages/shops.mjs';
import guidePages from './src/pages/guides.mjs';
import appPages from './src/pages/app-pages.mjs';
import staticPages from './src/pages/static.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, 'public');
const ogDir = join(out, 'assets', 'og');
const keepOg = existsSync(ogDir);

// Preserve previously rendered share images; regenerate everything else.
if (keepOg) cpSync(ogDir, join(root, '.og-cache'), { recursive: true });
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'assets'), { recursive: true });
cpSync(join(root, 'src', 'assets'), join(out, 'assets'), { recursive: true });
if (keepOg) {
  cpSync(join(root, '.og-cache'), ogDir, { recursive: true });
  rmSync(join(root, '.og-cache'), { recursive: true, force: true });
}

const ogSlug = (path) => (path === '/' ? 'home' : path.slice(1).replace(/\//g, '-'));

const pages = [home(), vehiclePages(), shopPages(), guidePages(), appPages(), staticPages()].flat();
const problems = [];
const seen = new Set();
const ogManifest = [];

for (const page of pages) {
  if (seen.has(page.path)) problems.push(`duplicate route ${page.path}`);
  seen.add(page.path);
  if (page.path !== page.path.toLowerCase() || /[^a-z0-9/\-]/.test(page.path)) problems.push(`non-clean URL ${page.path}`);
  if (page.title.length > 60) problems.push(`title > 60 (${page.title.length}) ${page.path}: ${page.title}`);
  if (page.description.length > 155) problems.push(`description > 155 (${page.description.length}) ${page.path}`);

  if (page.og) {
    page.ogImage = `/assets/og/${ogSlug(page.path)}.jpg`;
    ogManifest.push({ file: `${ogSlug(page.path)}.jpg`, ...page.og });
  }
  const html = layout(page);
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) problems.push(`${h1s} <h1> elements on ${page.path}`);

  const file = page.file ? join(out, page.file) : join(out, page.path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

// Sitemap: indexable pages only, so it grows automatically with the data files.
const today = new Date().toISOString().slice(0, 10);
const indexable = pages.filter((p) => !p.noindex);
writeFileSync(
  join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map((p) => `  <url><loc>${abs(p.path)}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`,
);
writeFileSync(
  join(out, 'robots.txt'),
  `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /login

Sitemap: ${SITE.url}/sitemap.xml
`,
);
writeFileSync(
  join(out, 'assets', 'logo.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="1.5" y="1.5" width="29" height="29" rx="7" fill="#0E0F11" stroke="#F4F1EA" stroke-width="1.6"/><path d="M18 5 9 18h6l-2 9 10-14h-6l1-8Z" fill="#C8763A"/></svg>\n`,
);
writeFileSync(join(root, 'og-manifest.json'), JSON.stringify(ogManifest, null, 2));

console.log(`Built ${pages.length} pages (${indexable.length} in sitemap) → ${out}`);
if (problems.length) {
  console.error(`\n${problems.length} SEO problem(s):\n- ${problems.join('\n- ')}`);
  process.exitCode = 1;
}
