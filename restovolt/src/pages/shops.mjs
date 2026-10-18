import { esc, u, abs, clip } from '../lib/html.mjs';
import { quoteForm } from '../lib/parts.mjs';
import { SHOPS, cities, states } from '../data/shops.mjs';
import { vehicleById } from '../data/vehicles.mjs';

const sampleBanner = `<p class="sample-banner"><strong>Sample listing.</strong> This shop and its reviews are placeholders for the prototype. The page is excluded from search indexing until real, verified listings replace it.</p>`;

const stars = (n) => `<span aria-label="${n} out of 5 stars">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</span>`;

function shopCard(s) {
  return `
<a class="card reveal" href="${u(s.path)}">
  <div class="row"><h3>${esc(s.name)}</h3>${s.sample ? '<span class="sample-tag">Sample</span>' : ''}</div>
  <p class="mono muted">${esc(s.city)}, ${esc(s.stateCode)} · ${s.builds} EV builds</p>
  <p>${esc(s.summary)}</p>
  <div class="badges"><span class="badge badge-ok">${esc(s.certification)}</span>${s.platforms.map((p) => `<span class="badge">${esc(vehicleById(p).shortName)}</span>`).join('')}</div>
</a>`;
}

function index() {
  return {
    path: '/shops',
    title: 'EV Conversion Shops Near You | RESTOVOLT Directory',
    description: 'Find certified classic car EV conversion shops near you. Compare specialties, builds and certification, then request a quote in minutes.',
    crumbs: [['Home', '/'], ['Find a Shop', '/shops']],
    body: `
<section class="hero"><div class="wrap">
  <span class="eyebrow">Shop directory</span>
  <h1>Find an EV conversion shop near you</h1>
  <p class="lede">Certified installers who build on RESTOVOLT Fitment Packs, starting in Atlanta and the Southeast. Every certified shop commissions high-voltage systems with trained technicians.</p>
</div></section>
<section class="section-tight"><div class="wrap">
  <h2>Browse by location</h2>
  <div class="grid grid-4" style="margin-bottom:3rem">${states().map((st) => `
    <div class="card"><h3><a href="${u(`/shops/${st.stateSlug}`)}">${esc(st.state)}</a></h3><ul class="list">${st.cities.map((c) => `<li><a href="${u(`/shops/${c.stateSlug}/${c.citySlug}`)}">EV conversion shops in ${esc(c.city)}</a></li>`).join('')}</ul></div>`).join('')}
  </div>
  <h2>All shops</h2>
  <div class="grid grid-2">${SHOPS.map(shopCard).join('')}</div>
</div></section>
<section class="section editorial"><div class="wrap two-col">
  <div><h2>Not sure which shop fits?</h2><p class="lede">Send one request and we route it to certified shops near you that specialize in your vehicle.</p></div>
  ${quoteForm()}
</div></section>`,
    og: { title: 'Find an EV conversion shop', sub: 'Certified installers, starting in Atlanta' },
  };
}

function statePage(st) {
  const path = `/shops/${st.stateSlug}`;
  const allSample = st.cities.every((c) => c.shops.every((s) => s.sample));
  return {
    path,
    title: `EV Conversion Shops in ${st.state} | RESTOVOLT`,
    description: `Certified classic car EV conversion shops in ${st.state}. Compare platform specialties and request a quote from a local installer.`,
    crumbs: [['Home', '/'], ['Find a Shop', '/shops'], [st.state, path]],
    noindex: allSample,
    body: `
<section class="hero"><div class="wrap"><span class="eyebrow">Shop directory · ${esc(st.state)}</span><h1>Classic car EV conversion shops in ${esc(st.state)}</h1></div></section>
<section class="section-tight"><div class="wrap">
  ${st.cities.map((c) => `<h2><a href="${u(`/shops/${c.stateSlug}/${c.citySlug}`)}">${esc(c.city)}</a></h2><div class="grid grid-2" style="margin-bottom:2rem">${c.shops.map(shopCard).join('')}</div>`).join('')}
</div></section>`,
    og: { title: `EV conversion shops in ${st.state}`, sub: 'Certified RESTOVOLT installers' },
  };
}

function cityPage(c) {
  const path = `/shops/${c.stateSlug}/${c.citySlug}`;
  const allSample = c.shops.every((s) => s.sample);
  const platforms = [...new Set(c.shops.flatMap((s) => s.platforms))].map(vehicleById);
  return {
    path,
    title: `Classic Car EV Conversion in ${c.city} | RESTOVOLT`,
    description: `Classic car EV conversion shops in ${c.city}, ${c.state}: certified installers, platform specialties, builds and quotes for electric restomods.`,
    crumbs: [['Home', '/'], ['Find a Shop', '/shops'], [c.state, `/shops/${c.stateSlug}`], [c.city, path]],
    noindex: allSample,
    body: `
<section class="hero"><div class="wrap">
  <span class="eyebrow">${esc(c.city)}, ${esc(c.state)}</span>
  <h1>Classic car EV conversion in ${esc(c.city)}</h1>
  <p class="lede">Certified installers in and around ${esc(c.city)} building electric restomods on verified RESTOVOLT Fitment Packs.</p>
</div></section>
<div class="wrap two-col section-tight">
  <div>
    <h2>Certified shops in ${esc(c.city)}</h2>
    <div class="grid" style="margin-bottom:2rem">${c.shops.map(shopCard).join('')}</div>
    <h2>Platforms built locally</h2>
    <ul>${platforms.map((v) => `<li><a href="${u(v.path)}">${esc(v.name)} EV conversion</a> · <a href="${u(v.costPath)}">cost</a></li>`).join('')}</ul>
  </div>
  <aside class="aside-sticky">${quoteForm()}</aside>
</div>`,
    og: { title: `EV conversion in ${c.city}`, sub: `${c.shops.length} certified shop${c.shops.length === 1 ? '' : 's'}` },
  };
}

function profile(s) {
  const crumbs = [['Home', '/'], ['Find a Shop', '/shops'], [s.state, `/shops/${s.stateSlug}`], [s.city, `/shops/${s.stateSlug}/${s.citySlug}`], [s.name, s.path]];
  const avg = s.reviews.reduce((a, r) => a + r.rating, 0) / s.reviews.length;
  return {
    path: s.path,
    title: [`${s.name} · EV Conversion Shop, ${s.city} ${s.stateCode}`, `${s.name} · EV Conversions, ${s.city}`, `${s.name} · ${s.city}, ${s.stateCode}`].find((t) => t.length <= 60) || clip(s.name, 60),
    description: clip(`${s.name}, ${s.city}, ${s.stateCode}. ${s.certification}. ${s.summary}`, 155),
    crumbs,
    noindex: s.sample,
    body: `
<section class="hero"><div class="wrap two-col">
  <div>
    <span class="eyebrow">${esc(s.city)}, ${esc(s.stateCode)} · Est. ${s.founded}</span>
    <h1>${esc(s.name)}</h1>
    <p class="lede">${esc(s.summary)}</p>
    <div class="badges"><span class="badge badge-ok">${esc(s.certification)}</span><span class="badge">${s.team} team members</span><span class="badge">${s.builds} EV builds</span></div>
    ${s.sample ? `<div style="margin-top:1.5rem">${sampleBanner}</div>` : ''}
  </div>
  <div class="card">
    <dl class="kv"><dt>Address</dt><dd>${esc(s.address)}, ${esc(s.city)}, ${esc(s.stateCode)} ${esc(s.zip)}</dd><dt>Phone</dt><dd><a href="tel:${esc(s.phone)}">${esc(s.phone)}</a></dd><dt>Rating</dt><dd>${stars(Math.round(avg))}</dd></dl>
    <a class="btn btn-primary" href="#quote">Request a quote</a>
  </div>
</div></section>
<div class="wrap two-col section-tight">
  <article class="prose">
    <h2>About the shop</h2><p>${esc(s.about)}</p>
    <h2>Platform specialties</h2>
    <ul>${s.platforms.map((p) => { const v = vehicleById(p); return `<li><a href="${u(v.path)}">${esc(v.name)}</a></li>`; }).join('')}</ul>
    <h2>Build gallery</h2>
    <p class="empty">Build gallery photos appear here when the shop publishes build journals.</p>
    <h2>Reviews</h2>
    <ul class="list">${s.reviews.map((r) => `<li><p>${stars(r.rating)} · <span class="muted">${esc(r.author)}</span></p><p>${esc(r.text)}</p></li>`).join('')}</ul>
  </article>
  <aside>${quoteForm({ shop: s })}</aside>
</div>`,
    jsonld: [{
      '@context': 'https://schema.org',
      '@type': 'AutoRepair',
      name: s.name,
      url: abs(s.path),
      telephone: s.phone,
      foundingDate: String(s.founded),
      address: { '@type': 'PostalAddress', streetAddress: s.address, addressLocality: s.city, addressRegion: s.stateCode, postalCode: s.zip, addressCountry: 'US' },
      geo: { '@type': 'GeoCoordinates', latitude: s.geo[0], longitude: s.geo[1] },
      aggregateRating: { '@type': 'AggregateRating', ratingValue: avg.toFixed(1), reviewCount: s.reviews.length },
    }],
    og: { title: s.name, sub: `${s.city}, ${s.stateCode} · ${s.certification}` },
  };
}

export default function shopPages() {
  return [index(), ...states().map(statePage), ...cities().map(cityPage), ...SHOPS.map(profile)];
}
