import { esc, u, abs, fmtDate, faqLd, faqList, hvNotice } from '../lib/html.mjs';
import { costTable } from '../lib/parts.mjs';
import { GUIDES, AUTHORS } from '../data/guides.mjs';
import { vehicleById } from '../data/vehicles.mjs';

function block(b) {
  return `<h2>${esc(b.h)}</h2>${(b.p || []).map((p) => `<p>${esc(p)}</p>`).join('')}${b.ul ? `<ul>${b.ul.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>` : ''}${b.table === 'platforms' ? costTable() : ''}`;
}

function article(g) {
  const a = AUTHORS[g.author];
  const crumbs = [['Home', '/'], ['Guides', '/guides'], [g.title, g.path]];
  const ld = [{
    '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description: g.description,
    datePublished: g.published, dateModified: g.reviewed, mainEntityOfPage: abs(g.path),
    author: { '@type': 'Person', name: a.name, jobTitle: a.role },
    publisher: { '@type': 'Organization', name: 'RESTOVOLT', logo: { '@type': 'ImageObject', url: abs('/assets/logo.svg') } },
    image: abs(`/assets/og/${g.path.slice(1).replace(/\//g, '-')}.jpg`),
  }];
  if (g.faqs) ld.push(faqLd(g.faqs));
  if (g.howTo) ld.push({
    '@context': 'https://schema.org', '@type': 'HowTo', name: g.title, description: g.description,
    step: g.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text })),
  });
  const body = `
<article>
  <header class="hero"><div class="wrap narrow">
    <span class="eyebrow">Guide · ${g.readMins} min read</span>
    <h1>${esc(g.title)}</h1>
    <p class="lede">${esc(g.lede)}</p>
    <p class="fine">By <a href="#author">${esc(a.name)}</a> · Published ${esc(fmtDate(g.published))} · Engineer reviewed ${esc(fmtDate(g.reviewed))}</p>
  </div></header>
  <div class="wrap two-col section-tight">
    <div class="prose">
      ${g.steps ? `<h2>Step by step</h2><ol>${g.steps.map((s) => `<li><strong>${esc(s.name)}.</strong> ${esc(s.text)}</li>`).join('')}</ol>` : ''}
      ${g.blocks.map(block).join('')}
      ${g.faqs ? `<h2>Frequently asked questions</h2>${faqList(g.faqs)}` : ''}
      <section id="author" class="card" style="margin-top:3rem"><h2 style="margin-top:0;font-size:1.1rem">About the author</h2><p><strong>${esc(a.name)}</strong><br><span class="muted">${esc(a.role)}</span></p><p>${esc(a.bio)}</p></section>
    </div>
    <aside class="aside-sticky">
      <div class="card"><h2 style="font-size:1.1rem">Platforms in this guide</h2><ul class="list">${g.vehicles.map((id) => { const v = vehicleById(id); return `<li><a href="${u(v.path)}">${esc(v.name)} EV conversion</a></li>`; }).join('')}</ul></div>
      ${hvNotice()}
    </aside>
  </div>
</article>`;
  return {
    path: g.path, title: g.seoTitle, description: g.description, crumbs, body, jsonld: ld, ogType: 'article',
    og: { title: g.title, sub: `Guide · ${g.readMins} min read` },
  };
}

function index() {
  return {
    path: '/guides',
    title: 'Classic Car EV Conversion Guides | RESTOVOLT',
    description: 'Practical, engineer-reviewed guides to classic car EV conversions: costs, whether it is worth it, registration, insurance and platform advice.',
    crumbs: [['Home', '/'], ['Guides', '/guides']],
    body: `
<section class="hero"><div class="wrap"><span class="eyebrow">Guides</span><h1>Electric restomod guides</h1><p class="lede">Engineer-reviewed answers to the questions owners and shops ask most, from cost to registration.</p></div></section>
<section class="section-tight"><div class="wrap"><h2 class="visually-hidden">All guides</h2><div class="grid grid-3">${GUIDES.map((g) => `
  <a class="card reveal" href="${u(g.path)}"><span class="eyebrow">${g.readMins} min read</span><h3>${esc(g.title)}</h3><p class="muted">${esc(g.description)}</p></a>`).join('')}</div></div></section>`,
    og: { title: 'Electric restomod guides', sub: 'Costs, value, registration and more' },
  };
}

export default function guidePages() {
  return [index(), ...GUIDES.map(article)];
}
