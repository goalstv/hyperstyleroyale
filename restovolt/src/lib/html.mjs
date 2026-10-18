import { SITE, NAV, FOOTER } from '../data/site.mjs';
import { VEHICLES } from '../data/vehicles.mjs';

// BASE_PATH lets the static output live under a sub-path (e.g. GitHub Pages).
export const BASE = (process.env.BASE_PATH || '').replace(/\/$/, '');
export const u = (href) => (href.startsWith('/') ? BASE + href : href);
export const abs = (href) => SITE.url + href;

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Trim to max length at a word boundary, adding an ellipsis. */
export const clip = (str, max) => (str.length <= max ? str : str.slice(0, str.lastIndexOf(' ', max - 1)).replace(/[\s,.:;·]+$/, '') + '…');

export const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');
export const fmtDate = (iso) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

export const jsonld = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

const ORG = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  url: SITE.url,
  logo: abs('/assets/logo.svg'),
  email: SITE.email,
  slogan: SITE.tagline,
};
const WEBSITE = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: abs('/vehicles?q={search_term_string}') },
    'query-input': 'required name=search_term_string',
  },
};

export function breadcrumbLd(crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map(([name, href], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(href) })),
  };
}

export function faqLd(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

export function breadcrumbs(crumbs) {
  return `<nav class="crumbs wrap" aria-label="Breadcrumb"><ol>${crumbs
    .map(([name, href], i) =>
      i === crumbs.length - 1
        ? `<li><span aria-current="page">${esc(name)}</span></li>`
        : `<li><a href="${u(href)}">${esc(name)}</a></li>`)
    .join('')}</ol></nav>`;
}

export const faqList = (faqs) =>
  `<div class="faqs">${faqs
    .map((f) => `<details class="faq"><summary><h3>${esc(f.q)}</h3></summary><p>${esc(f.a)}</p></details>`)
    .join('')}</div>`;

export const sampleTag = (text = 'Sample data') => `<span class="sample-tag" title="Placeholder figures for the prototype">${esc(text)}</span>`;

export const hvNotice = (extra = '') => `
<aside class="hv-notice" role="note" aria-label="High-voltage safety notice">
  <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22"><path d="M12 2 1 21h22L12 2Zm1 14h-2v2h2v-2Zm0-7h-2v5h2V9Z" fill="currentColor"/></svg>
  <div><strong>High-voltage safety.</strong> EV conversions involve lethal DC voltages. Installation and commissioning must be performed or supervised by a qualified, HV-trained technician following our <a href="${u('/safety')}">safety standards</a>. ${extra}</div>
</aside>`;

export const logo = () => `
<svg class="logo-mark" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
  <rect x="1.5" y="1.5" width="29" height="29" rx="7" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path d="M18 5 9 18h6l-2 9 10-14h-6l1-8Z" fill="var(--accent)"/>
</svg>`;

function header(path) {
  const links = NAV.map(
    (n) => `<li><a href="${u(n.href)}"${path === n.href || path.startsWith(n.href + '/') ? ' aria-current="page"' : ''}>${n.label}</a></li>`,
  ).join('');
  return `
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-row">
    <a class="brand" href="${u('/')}" aria-label="RESTOVOLT home">${logo()}<span>RESTOVOLT</span></a>
    <nav class="main-nav" aria-label="Primary"><ul>${links}</ul></nav>
    <div class="header-actions">
      <button class="icon-btn theme-toggle" type="button" aria-label="Toggle color theme" data-theme-toggle>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z" fill="currentColor"/></svg>
      </button>
      <a class="btn btn-ghost btn-sm hide-sm" href="${u('/login')}">Sign in</a>
      <a class="btn btn-primary btn-sm hide-sm" href="${u('/for-shops')}">For Shops</a>
      <details class="mobile-menu">
        <summary class="icon-btn" aria-label="Menu"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" stroke-width="1.8" fill="none"/></svg></summary>
        <nav aria-label="Mobile"><ul>${links}<li><a href="${u('/for-shops')}">For Shops</a></li><li><a href="${u('/login')}">Sign in</a></li></ul></nav>
      </details>
    </div>
  </div>
</header>`;
}

function footer() {
  const cols = FOOTER.map(
    (c) => `<div><h2 class="foot-h">${c.title}</h2><ul>${c.links.map(([h, l]) => `<li><a href="${u(h)}">${l}</a></li>`).join('')}</ul></div>`,
  ).join('');
  const veh = VEHICLES.map((v) => `<li><a href="${u(v.path)}">${esc(v.name)} EV conversion</a></li>`).join('');
  const cost = VEHICLES.map((v) => `<li><a href="${u(v.costPath)}">${esc(v.shortName)} EV conversion cost</a></li>`).join('');
  return `
<footer class="site-footer">
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-brand"><a class="brand" href="${u('/')}">${logo()}<span>RESTOVOLT</span></a><p>${esc(SITE.tagline)}</p>
        <p class="fine">Prototype build. Figures marked “sample” are placeholders. RESTOVOLT is independent and not affiliated with any vehicle manufacturer; model names identify fitment only.</p></div>
      ${cols}
      <div><h2 class="foot-h">Vehicles</h2><ul>${veh}</ul></div>
      <div><h2 class="foot-h">Cost guides</h2><ul>${cost}</ul></div>
    </div>
    <p class="fine foot-legal">© ${new Date().getFullYear()} RESTOVOLT (working name). Designs are provided for qualified professionals. Confirm titling, insurance and registration rules locally.</p>
  </div>
</footer>`;
}

/**
 * Render a full HTML document.
 * page: { path, title, description, body, jsonld?, noindex?, ogImage?, scripts?, crumbs?, ogType? }
 */
export function layout(page) {
  const canonical = abs(page.path === '/' ? '/' : page.path);
  const og = abs(page.ogImage || '/assets/og/default.jpg');
  const ld = [ORG, WEBSITE, ...(page.crumbs ? [breadcrumbLd(page.crumbs)] : []), ...(page.jsonld || [])];
  const scripts = (page.scripts || []).map((s) => `<script type="module" src="${u(s)}"></script>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${canonical}">
${page.noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${SITE.locale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="${SITE.twitter}">
<meta name="twitter:title" content="${esc(page.title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${og}">
<meta name="theme-color" content="#0E0F11" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#F4F1EA" media="(prefers-color-scheme: light)">
<link rel="icon" href="${u('/assets/logo.svg')}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="${u('/assets/styles.css')}">
<script>document.documentElement.classList.add('js');try{var t=localStorage.getItem('rv-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
${ld.map(jsonld).join('\n')}
</head>
<body class="${page.bodyClass || ''}">
${header(page.path)}
${page.crumbs ? breadcrumbs(page.crumbs) : ''}
<main id="main">
${page.body}
</main>
${footer()}
<script type="module" src="${u('/assets/app.js')}"></script>
${scripts}
</body>
</html>
`;
}
