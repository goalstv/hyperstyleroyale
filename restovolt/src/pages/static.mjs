import { esc, u, hvNotice, sampleTag } from '../lib/html.mjs';
import { waitlistForm, costTable } from '../lib/parts.mjs';
import { PLANS, COMPARE, ANNUAL_DISCOUNT, PER_PACK_NOTE } from '../data/pricing.mjs';
import { VEHICLES } from '../data/vehicles.mjs';
import { CATEGORY_LABELS, COMPONENTS } from '../data/components.mjs';
import { SITE } from '../data/site.mjs';

const cell = (v) => (v === true ? '<span class="yes">Yes</span>' : v === false ? '<span class="no">—</span>' : esc(v));

function pricing() {
  const annual = (m) => Math.round(m * (1 - ANNUAL_DISCOUNT));
  const faqs = [
    { q: 'Can I buy a single Fitment Pack without subscribing?', a: PER_PACK_NOTE },
    { q: 'How does the annual discount work?', a: `Annual billing saves ${ANNUAL_DISCOUNT * 100}% versus monthly, billed once per year.` },
    { q: 'How is lead routing priced?', a: 'Pro and Fleet include lead routing in your service area. Additional leads outside your included area can be purchased per lead.' },
  ];
  return {
    path: '/pricing',
    title: 'Pricing for EV Conversion Shops | RESTOVOLT',
    description: 'RESTOVOLT plans for conversion shops: Starter, Pro and Fleet. Fitment Pack downloads, team seats, lead routing and white-label quotes. Save 20% annually.',
    crumbs: [['Home', '/'], ['Pricing', '/pricing']],
    body: `
<section class="hero"><div class="wrap">
  <span class="eyebrow">Pricing ${sampleTag('Sample pricing')}</span>
  <h1>Plans that pay for themselves on the first build</h1>
  <p class="lede">Every plan includes the configurator, compatibility checks and saved builds. Upgrade for more packs, more seats and routed leads.</p>
  <div class="billing-toggle" role="group" aria-label="Billing period" data-billing>
    <button type="button" data-period="monthly" aria-pressed="true">Monthly</button>
    <button type="button" data-period="annual" aria-pressed="false">Annual · save ${ANNUAL_DISCOUNT * 100}%</button>
  </div>
</div></section>
<section class="section-tight"><div class="wrap">
  <div class="grid grid-3">${PLANS.map((p) => `
    <div class="card tier${p.featured ? ' featured' : ''}">
      <div class="row"><h2 style="font-size:1.4rem;margin:0">${p.name}</h2>${p.featured ? '<span class="badge badge-accent">Most popular</span>' : ''}</div>
      <div class="price">$<span data-monthly="${p.monthly}" data-annual="${annual(p.monthly)}">${p.monthly}</span><small data-period-label>/mo, billed monthly</small></div>
      <p class="muted">${esc(p.pitch)}</p>
      <ul>${p.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
      <a class="btn ${p.featured ? 'btn-primary' : 'btn-ghost'}" href="${u(p.id === 'fleet' ? '/contact' : '/login')}">${esc(p.cta)}</a>
    </div>`).join('')}
  </div>
  <p class="muted" style="margin-top:1.5rem">${esc(PER_PACK_NOTE)}</p>
</div></section>
<section class="section-tight"><div class="wrap">
  <h2>Compare plans</h2>
  <div class="table-wrap"><table>
    <caption class="visually-hidden">Plan feature comparison</caption>
    <thead><tr><th scope="col">Feature</th>${PLANS.map((p) => `<th scope="col">${p.name}</th>`).join('')}</tr></thead>
    <tbody>${COMPARE.map(([label, ...vals]) => `<tr><th scope="row">${esc(label)}</th>${vals.map((v) => `<td>${cell(v)}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>
</div></section>
<section class="section editorial"><div class="wrap narrow"><h2>Pricing FAQs</h2>${faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}</div></section>`,
    og: { title: 'Pricing for shops', sub: 'Starter, Pro and Fleet · save 20% annually' },
  };
}

function forShops() {
  return {
    path: '/for-shops',
    title: 'EV Conversion Tools for Restoration Shops | RESTOVOLT',
    description: 'Add EV conversions to your restoration shop without a CAD department: verified Fitment Packs, configurator quotes, lead routing and a build dashboard.',
    crumbs: [['Home', '/'], ['For Shops', '/for-shops']],
    body: `
<section class="hero"><div class="wrap">
  <span class="eyebrow">For shops</span>
  <h1>Add EV conversions without becoming a CAD shop</h1>
  <p class="lede">RESTOVOLT replaces weeks of re-engineering with verified, vehicle-specific designs and a streamlined parts path, so your team spends its hours building, not measuring.</p>
  <div class="btn-row"><a class="btn btn-primary" href="${u('/pricing')}">See plans</a><a class="btn btn-ghost" href="${u('/configurator')}">Try the configurator</a></div>
</div></section>
<section class="section-tight"><div class="wrap grid grid-3">
  <div class="card"><h2 style="font-size:1.2rem">Fitment Packs</h2><p>Motor mounts, adapter plates and battery boxes for each platform, with STEP and STL files, BOM, torque specs and checklists. Structural and non-structural parts are labeled for the right manufacturing method.</p></div>
  <div class="card"><h2 style="font-size:1.2rem">Configurator and quotes</h2><p>Recommend a compatible drivetrain in minutes, catch mismatched components before you buy them, and export a quote with your logo.</p></div>
  <div class="card"><h2 style="font-size:1.2rem">Shop dashboard</h2><p>Track every project through Teardown, Fabrication, Install, HV Commissioning, Road Test and Delivered. Manage saved builds, purchased packs, leads and team seats.</p></div>
  <div class="card"><h2 style="font-size:1.2rem">Lead routing</h2><p>Owners researching conversions are matched to certified shops near them that build their platform. Pay per lead or include it in your plan.</p></div>
  <div class="card"><h2 style="font-size:1.2rem">Certified Installer badge</h2><p>Complete HV training and a documented commissioning audit to earn the badge on your directory profile and in routed leads.</p></div>
  <div class="card"><h2 style="font-size:1.2rem">Scan upload ${sampleTag('Phase 2')}</h2><p>Scan a vehicle we do not cover yet. If accepted, you earn contributor credit and a revenue share on every pack sold. <a href="${u('/scan-upload')}">Learn more</a></p></div>
</div></section>
<section class="section editorial"><div class="wrap"><h2>Typical economics by platform</h2>${costTable()}</div></section>`,
    og: { title: 'Built for conversion shops', sub: 'Fitment Packs, quotes, leads and a build dashboard' },
  };
}

function safety() {
  return {
    path: '/safety',
    title: 'EV Conversion Safety & Compliance Standards | RESTOVOLT',
    description: 'RESTOVOLT high-voltage safety standards, structural part rules, design terms, Certified Installer program, and titling, insurance and registration help.',
    crumbs: [['Home', '/'], ['Safety', '/safety']],
    body: `
<section class="hero"><div class="wrap narrow"><span class="eyebrow">Safety and compliance</span><h1>Engineering and safety standards</h1><p class="lede">Converting a classic car to electric introduces high-voltage systems capable of causing serious injury or death. These standards apply to every design we publish and every shop we certify.</p></div></section>
<div class="wrap narrow section-tight prose">
  ${hvNotice()}
  <h2>High-voltage work</h2>
  <ul>
    <li>Work on HV systems must be performed or directly supervised by a technician trained for high-voltage electric vehicle service.</li>
    <li>Always isolate the pack, remove the service disconnect and verify zero voltage before working on HV components.</li>
    <li>Use insulated tools and appropriately rated PPE. Never work on HV systems alone.</li>
    <li>Commission every build with insulation-resistance and pre-charge tests, and keep the results in the build file.</li>
  </ul>
  <h2>Structural vs. non-structural parts</h2>
  <p>Every part in a Fitment Pack is labeled. <strong>Structural</strong> parts carry loads (motor mounts, adapter plates, battery boxes and their brackets) and must be produced by CNC machining, fabrication from the specified material, or certified metal printing. <strong>Non-structural</strong> parts (clips, bezels, harness guides) may be printed in-house in the specified polymer.</p>
  <h2 id="terms">Design use terms</h2>
  <p>Before downloading structural designs you must confirm that parts will be produced with the specified materials and methods, installed by a qualified technician, and inspected according to the pack checklist. Designs are provided to professionals for the stated platform only. Prototype placeholder: replace with counsel-reviewed terms before launch.</p>
  <h2>Validation badges</h2>
  <p><strong>Engineer reviewed</strong> shows the date a qualified engineer last reviewed the pack revision. <strong>Field proven</strong> counts completed builds that reported back using that revision.</p>
  <h2>Certified Installer program</h2>
  <p>Shops earn the Certified Installer badge by documenting HV training for at least one technician, passing a commissioning audit on a completed build, and maintaining build files for every RESTOVOLT conversion. Level 2 adds a second trained technician and a dedicated commissioning area.</p>
  <h2 id="registration">Titling, insurance and registration</h2>
  <p>Requirements for converted vehicles vary by state and country and change over time. In many places you will need to update the fuel type on the title or registration, may need an inspection, and must notify your insurer. Read our guide on <a href="${u('/guides/how-to-register-a-converted-electric-car')}">how to register and insure a converted electric car</a>, and always confirm local rules with your motor-vehicle agency and insurer.</p>
</div>`,
    og: { title: 'Safety and engineering standards', sub: 'HV safety, structural parts and certification' },
  };
}

function about() {
  return {
    path: '/about',
    title: 'About RESTOVOLT | Fitment Intelligence for EV Restomods',
    description: 'RESTOVOLT is building the fitment library for electric restomods so conversion shops stop re-engineering the same mounts, plates and battery boxes.',
    crumbs: [['Home', '/'], ['About', '/about']],
    body: `
<section class="hero"><div class="wrap narrow"><span class="eyebrow">About</span><h1>Classic soul. Electric heart. Engineered to fit.</h1>
<p class="lede">Classic EV conversions are slow and expensive because every shop re-engineers the same mounts, adapter plates and battery box layouts from scratch, and sources parts from a dozen fragmented places.</p></div></section>
<div class="wrap narrow section-tight prose">
  <p>RESTOVOLT replaces that guesswork with a verified, vehicle-specific fitment library and a streamlined parts path. We start with 3D scan data, engineer the parts that every conversion of a platform needs, and refine each design with field reports from the shops that build them.</p>
  <h2>What we believe</h2>
  <ul><li>Safety is visible, not buried in a PDF.</li><li>Designs should be honest about what they are: structural parts are labeled, reviewed and dated.</li><li>Shops should own their customer relationships. We route leads; we do not compete for builds.</li><li>Classic cars deserve reversible options.</li></ul>
  <p>RESTOVOLT is independent and not affiliated with any vehicle manufacturer. Model names are used only to identify the vehicles our designs fit.</p>
  <p><a href="${u('/contact')}">Get in touch</a></p>
</div>`,
    og: { title: 'About RESTOVOLT', sub: SITE.tagline },
  };
}

function contact() {
  return {
    path: '/contact',
    title: 'Contact RESTOVOLT',
    description: 'Contact RESTOVOLT about Fitment Packs, Fleet plans, fabrication and parts partnerships, scan submissions or press.',
    crumbs: [['Home', '/'], ['Contact', '/contact']],
    body: `
<section class="section"><div class="wrap two-col">
  <div><span class="eyebrow">Contact</span><h1>Talk to the team</h1><p class="lede">Fleet plans, partnerships, scan submissions or a question about a pack. We reply within two business days.</p><p><a href="mailto:${SITE.email}">${SITE.email}</a></p></div>
  <form class="card" data-form="contact" data-success="Thanks. We’ll reply within two business days." novalidate>
    <div class="field"><label for="ct-name">Name</label><input id="ct-name" name="name" required autocomplete="name"></div>
    <div class="field"><label for="ct-email">Email</label><input id="ct-email" name="email" type="email" required autocomplete="email"></div>
    <div class="field"><label for="ct-topic">Topic</label><select id="ct-topic" name="topic"><option>Fleet plan</option><option>Fabrication or parts partnership</option><option>Scan submission</option><option>Fitment Pack question</option><option>Press</option></select></div>
    <div class="field"><label for="ct-msg">Message</label><textarea id="ct-msg" name="message" required></textarea></div>
    <button class="btn btn-primary" type="submit">Send message</button>
    <p class="form-msg" role="status" tabindex="-1"></p>
  </form>
</div></section>`,
    og: { title: 'Contact RESTOVOLT', sub: 'Fleet plans, partnerships and scan submissions' },
  };
}

function comingSoon({ path, h1, eyebrow, title, description, lede, kind, extra = '' }) {
  return {
    path, title, description,
    crumbs: [['Home', '/'], [eyebrow, path]],
    body: `
<section class="hero"><div class="wrap two-col">
  <div><span class="eyebrow">${esc(eyebrow)} · Coming soon</span><h1>${esc(h1)}</h1><p class="lede">${esc(lede)}</p>${extra}</div>
  <div>${waitlistForm(kind)}</div>
</div></section>`,
    og: { title: h1, sub: 'Coming soon · join the waitlist' },
  };
}

function parts() {
  const cats = Object.entries(CATEGORY_LABELS).map(([k, l]) => `<li>${esc(l)} <span class="muted">(${COMPONENTS.filter((c) => c.category === k).length} in preview catalog)</span></li>`).join('');
  return comingSoon({
    path: '/parts', eyebrow: 'Parts Marketplace', h1: 'EV conversion parts, curated for fitment',
    title: 'EV Conversion Kit Parts Marketplace | RESTOVOLT',
    description: 'Curated EV conversion parts from kit partners and certified salvage sources, filtered by vehicle compatibility, voltage, kWh, condition and price.',
    lede: 'Motors, inverters, tested salvage battery modules, BMS and chargers from kit partners and certified salvage sources, filtered by vehicle compatibility, voltage, kWh, condition and price.',
    kind: 'parts-marketplace',
    extra: `<ul>${cats}</ul><p><a href="${u('/configurator')}">Preview compatibility in the configurator</a></p>`,
  });
}

function builds() {
  return comingSoon({
    path: '/builds', eyebrow: 'Build Journals', h1: 'Electric restomod build journals',
    title: 'Electric Restomod Build Journals | RESTOVOLT',
    description: 'Public build logs for classic car EV conversions: photos, specs and progress milestones from certified shops and experienced builders. Coming soon.',
    lede: 'Photo-rich build logs with specs and stage milestones from Teardown to Delivered, published by certified shops and experienced builders.',
    kind: 'build-journals',
    extra: `<p>Platforms: ${VEHICLES.map((v) => `<a href="${u(v.path)}">${esc(v.shortName)}</a>`).join(' · ')}</p>`,
  });
}

function scan() {
  const steps = ['Submitted', 'In review', 'Design in progress', 'Published'];
  return {
    ...comingSoon({
      path: '/scan-upload', eyebrow: 'Scan Upload', h1: 'Scan a classic. Earn on every pack.',
      title: 'Submit a Vehicle 3D Scan | RESTOVOLT',
      description: 'Shops can submit 3D scans of classic vehicles not yet in the RESTOVOLT library for contributor credit and a revenue share on published Fitment Packs.',
      lede: 'Upload a 3D scan of a vehicle not yet in the library. Our engineers review it, design the Fitment Pack, and credit you with a revenue share when it publishes.',
      kind: 'scan-upload',
      extra: `<ol class="stages" style="grid-template-columns:repeat(4,1fr);margin-top:1.5rem" aria-label="Scan status flow">${steps.map((_, i) => `<li class="${i === 0 ? 'current' : ''}"></li>`).join('')}</ol>
        <div class="stage-labels" style="grid-template-columns:repeat(4,1fr)">${steps.map((s) => `<span>${s}</span>`).join('')}</div>`,
    }),
  };
}

function notFound() {
  return {
    path: '/404', noindex: true, file: '404.html',
    title: 'Page not found | RESTOVOLT',
    description: 'The page you were looking for could not be found.',
    body: `<section class="section"><div class="wrap narrow"><span class="eyebrow">404</span><h1>That part doesn’t fit here.</h1><p class="lede">The page you were looking for has moved or never existed.</p><div class="btn-row"><a class="btn btn-primary" href="${u('/vehicles')}">Fitment Library</a><a class="btn btn-ghost" href="${u('/')}">Home</a></div></div></section>`,
  };
}

export default function staticPages() {
  return [pricing(), forShops(), safety(), about(), contact(), parts(), builds(), scan(), notFound()];
}
