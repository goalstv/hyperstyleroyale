import { esc, u, sampleTag, hvNotice } from '../lib/html.mjs';
import { vehicleArt, explodedView } from '../lib/svg.mjs';
import { platformCard, validationBadges, partTypeBadge } from '../lib/parts.mjs';
import { VEHICLES, vehicleById } from '../data/vehicles.mjs';
import { PLANS } from '../data/pricing.mjs';
import { SITE } from '../data/site.mjs';

export default function home() {
  const hero = vehicleById('c10');
  const showcase = vehicleById('beetle');
  const featured = VEHICLES.flatMap((v) => v.builds.map((b) => ({ ...b, v }))).filter((b) => b.stage === 'Delivered').slice(0, 3);

  const body = `
<section class="hero">
  <div class="wrap hero-grid">
    <div>
      <span class="eyebrow">Fitment intelligence for electric restomods</span>
      <h1>Electrify the classics. Engineered to fit.</h1>
      <p class="lede">Verified scan data, engineered mounts and battery box layouts, and a curated parts path. Built for conversion shops that need speed, repeatability and confidence on every build.</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="${u('/vehicles')}">Explore the Fitment Library</a>
        <a class="btn btn-ghost" href="${u('/for-shops')}">For Shops</a>
      </div>
    </div>
    ${vehicleArt(hero, { id: 'hero', label: `${hero.name}, RESTOVOLT hero vehicle` })}
  </div>
</section>

<section class="section-tight" aria-labelledby="platforms-h">
  <div class="wrap">
    <div class="section-head"><h2 id="platforms-h">Launch platforms</h2><p>Five classics with verified Fitment Packs. More platforms ship as shops submit scans.</p></div>
    <div class="grid grid-5">${VEHICLES.map((v) => platformCard(v)).join('')}</div>
  </div>
</section>

<section class="section editorial" aria-labelledby="how-h">
  <div class="wrap">
    <span class="eyebrow">How it works</span>
    <h2 id="how-h">From teardown to road test, without re-engineering the basics.</h2>
    <div class="grid grid-3" style="margin-top:2.5rem">
      <div class="card reveal"><span class="step-num">01</span><h3>Choose your platform</h3><p>Open a vehicle hub for packaging notes, difficulty, range and cost bands, and builds that have already been through the shop.</p></div>
      <div class="card reveal"><span class="step-num">02</span><h3>Configure the build</h3><p>Set goals for range, performance, budget and reversibility. The configurator checks motor, inverter, battery and BMS compatibility as you go.</p></div>
      <div class="card reveal"><span class="step-num">03</span><h3>Download and fabricate</h3><p>Get STEP and STL files, a bill of materials, torque specs and an assembly checklist. Print the non-structural parts in-house and send structural parts to a fabrication partner.</p></div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="proof-h">
  <div class="wrap">
    <div class="section-head"><h2 id="proof-h">Proof in the build count ${sampleTag('Sample metrics')}</h2><p>Placeholder figures for the prototype. Replace with live platform data at launch.</p></div>
    <div class="grid grid-3">
      <div><div class="stat" data-count="38">38</div><p class="muted">Builds completed with Fitment Packs</p></div>
      <div><div class="stat" data-count="12">12</div><p class="muted">Certified installer shops</p></div>
      <div><div class="stat" data-count="64" data-suffix=" h">64 h</div><p class="muted">Average engineering hours saved per build</p></div>
    </div>
  </div>
</section>

<section class="section editorial" aria-labelledby="pack-h">
  <div class="wrap two-col" style="align-items:center">
    <div>
      <span class="eyebrow">Fitment Packs</span>
      <h2 id="pack-h">Every mount, plate and box, already drawn and already fitted.</h2>
      <p class="lede">Each pack is specific to one platform and labels every part by how it should be made.</p>
      <ul class="list" style="margin:1.5rem 0">
        ${showcase.pack.parts.slice(0, 4).map((p) => `<li class="row"><span>${esc(p.name)}</span>${partTypeBadge(p.type)}</li>`).join('')}
      </ul>
      ${validationBadges(showcase.pack)}
      <p style="margin-top:1.5rem"><a class="btn btn-primary" href="${u(showcase.packPath)}">See the ${esc(showcase.shortName)} Fitment Pack</a></p>
    </div>
    <div>${explodedView()}</div>
  </div>
</section>

<section class="section" aria-labelledby="shops-h">
  <div class="wrap">
    <div class="section-head"><div><span class="eyebrow">For shops</span><h2 id="shops-h">Run EV conversions like a production line.</h2></div><p>Built for 1 to 20 person restoration shops that are great with wrenches and do not want to become a CAD department.</p></div>
    <div class="grid grid-3">
      <div class="card reveal"><h3>Shop dashboard</h3><p>Track every build through Teardown, Fabrication, Install, HV Commissioning, Road Test and Delivered. Saved builds, purchased packs and team seats in one place.</p>
        <ol class="stages" aria-label="Example build at Install stage"><li class="done"></li><li class="done"></li><li class="current"></li><li></li><li></li><li></li></ol></div>
      <div class="card reveal"><h3>Lead routing</h3><p>Owners researching conversions on RESTOVOLT are routed to certified shops near them, filtered by the platforms you specialize in.</p></div>
      <div class="card reveal"><h3>White-label quotes</h3><p>Export a client-ready quote with your logo, the recommended drivetrain, cost band, labor estimate and the safety notes your customer needs to read.</p></div>
    </div>
    <p style="margin-top:2rem"><a class="btn btn-ghost" href="${u('/for-shops')}">See shop features</a></p>
  </div>
</section>

<section class="section editorial" aria-labelledby="builds-h">
  <div class="wrap">
    <div class="section-head"><h2 id="builds-h">Featured builds ${sampleTag('Sample builds')}</h2><p>Public build journals launch soon. These examples show the format.</p></div>
    <div class="grid grid-3">
      ${featured.map((b) => `
      <article class="card reveal">
        ${vehicleArt(b.v, { id: `fb-${b.v.id}`, interactive: false })}
        <h3>${esc(b.title)}</h3>
        <p class="mono muted">${b.kwh} kWh · ${b.range} mi est. · ${esc(b.stage)}</p>
        <a href="${u(b.v.path)}">${esc(b.v.name)} hub</a>
      </article>`).join('')}
    </div>
    <p style="margin-top:2rem"><a href="${u('/builds')}">Join the build journal waitlist</a></p>
  </div>
</section>

<section class="section" aria-labelledby="safety-h">
  <div class="wrap two-col">
    <div>
      <span class="eyebrow">Safety and engineering standards</span>
      <h2 id="safety-h">High voltage is not a place for guesswork.</h2>
      <p class="lede">Every pack carries an engineering review date and a field-proven build count. Structural parts are always labeled for machining or metal printing, and structural downloads require terms acknowledgment.</p>
      <p><a href="${u('/safety')}">Read our safety and compliance standards</a></p>
    </div>
    <div class="aside-sticky">${hvNotice()}<div class="badges"><span class="badge badge-ok">Certified Installer program</span><span class="badge">Engineer-reviewed designs</span><span class="badge">Structural parts labeled</span></div></div>
  </div>
</section>

<section class="section editorial" aria-labelledby="pricing-h">
  <div class="wrap">
    <div class="section-head"><h2 id="pricing-h">Plans for every shop size</h2><p>Subscribe for unlimited packs and lead routing, or buy single packs as you need them.</p></div>
    <div class="grid grid-3">
      ${PLANS.map((p) => `<div class="card tier${p.featured ? ' featured' : ''}"><h3>${p.name}</h3><div class="price">$${p.monthly}<small>/mo</small></div><p class="muted">${esc(p.pitch)}</p></div>`).join('')}
    </div>
    <div class="btn-row" style="margin-top:2rem"><a class="btn btn-primary" href="${u('/pricing')}">Compare plans</a><a class="btn btn-ghost" href="${u('/configurator')}">Try the configurator</a></div>
  </div>
</section>`;

  return [{
    path: '/',
    title: 'RESTOVOLT | Classic Car EV Conversion Fitment Library',
    description: 'Electric restomod fitment platform: verified motor mounts, battery box layouts and EV conversion kits for classic cars, built for conversion shops.',
    body,
    og: { title: 'Electrify the classics.', sub: SITE.tagline },
  }];
}
