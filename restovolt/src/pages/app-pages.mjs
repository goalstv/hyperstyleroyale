// Configurator, auth and dashboard. Rendered as static shells, enhanced in the browser.
import { esc, u, hvNotice, sampleTag, BASE } from '../lib/html.mjs';
import { VEHICLES } from '../data/vehicles.mjs';
import { COMPONENTS, CATEGORY_LABELS } from '../data/components.mjs';

function configurator() {
  const data = {
    vehicles: VEHICLES.map(({ id, name, shortName, path, packPath, config, pack }) => ({ id, name, shortName, path, packPath, config, pack: { name: pack.name, priceUsd: pack.priceUsd } })),
    components: COMPONENTS,
    base: BASE,
  };
  const goal = (key, label, low, high) => `
    <div class="range-row"><label for="g-${key}">${label}</label>
      <input id="g-${key}" name="${key}" type="range" min="1" max="3" step="1" value="2" aria-valuetext="Medium priority" data-goal>
      <output for="g-${key}" data-out="${key}">Medium</output></div>
    <p class="visually-hidden">1 = ${low}, 3 = ${high}</p>`;
  const body = `
<section class="hero"><div class="wrap">
  <span class="eyebrow">Build configurator</span>
  <h1>Configure an electric restomod</h1>
  <p class="lede">Choose a platform and set your goals. We recommend a compatible drivetrain, check every component against each other and the chassis, and estimate parts, labor and the Fitment Packs you need.</p>
</div></section>
<form class="wrap cfg section-tight" id="cfg" novalidate>
  <div>
    <fieldset class="cfg-step"><legend class="visually-hidden">Vehicle</legend>
      <h2><span class="step-num">01</span> Vehicle</h2>
      <div class="vehicle-pick">${VEHICLES.map((v, i) => `
        <label><input type="radio" name="vehicle" value="${v.id}"${i === 0 ? ' checked' : ''}><strong>${esc(v.shortName)}</strong><span>${v.yearStart}–${v.yearEnd} ${esc(v.make)}</span></label>`).join('')}
      </div>
    </fieldset>
    <fieldset class="cfg-step"><legend class="visually-hidden">Goals</legend>
      <h2><span class="step-num">02</span> Goals</h2>
      ${goal('range', 'Range', 'low priority', 'high priority')}
      ${goal('performance', 'Performance', 'low priority', 'high priority')}
      ${goal('budget', 'Budget focus', 'flexible', 'tight')}
      <div class="field" style="margin-top:1rem"><span class="field-label mono muted" id="rev-l">BUILD TYPE</span>
        <div class="seg" role="radiogroup" aria-labelledby="rev-l">
          <label><input type="radio" name="reversibility" value="either" checked> No preference</label>
          <label><input type="radio" name="reversibility" value="reversible"> Reversible (bolt-in)</label>
          <label><input type="radio" name="reversibility" value="permanent"> Permanent OK</label>
        </div></div>
      <button class="btn btn-primary" type="button" data-recommend>Recommend a drivetrain</button>
    </fieldset>
    <fieldset class="cfg-step"><legend class="visually-hidden">Components</legend>
      <h2><span class="step-num">03</span> Drivetrain components ${sampleTag('Sample catalog')}</h2>
      <p class="muted">Adjust any component. Compatibility checks update instantly.</p>
      ${Object.entries(CATEGORY_LABELS).map(([cat, label]) => `
      <div class="field"><label for="c-${cat}">${label}</label><select id="c-${cat}" name="${cat}" data-component>
        ${COMPONENTS.filter((c) => c.category === cat).map((c) => `<option value="${c.id}">${esc(c.name)} · $${c.priceUsd.toLocaleString('en-US')}</option>`).join('')}
      </select></div>`).join('')}
    </fieldset>
    <section class="cfg-step" aria-labelledby="checks-h">
      <h2 id="checks-h"><span class="step-num">04</span> Compatibility checks</h2>
      <ul class="checks" data-checks aria-live="polite"><li data-status="warn"><span class="ico">…</span><span>Enable JavaScript to run live compatibility checks.</span></li></ul>
    </section>
    ${hvNotice('Configurator results are planning estimates. Final component selection, fusing and commissioning must be verified by a qualified technician.')}
  </div>

  <aside class="summary" aria-labelledby="sum-h">
    <div class="card" data-summary>
      <div class="print-only" data-print-header></div>
      <div class="row"><h2 id="sum-h" style="font-size:1.1rem;margin:0">Build summary</h2><span class="summary-status" data-status-label>—</span></div>
      <button class="btn btn-ghost btn-sm summary-expand" type="button" aria-expanded="false" data-expand style="width:100%;margin:.75rem 0">Show details</button>
      <dl style="margin-top:1rem">
        <dt>Est. range</dt><dd data-out-range>—</dd>
        <dt>Parts cost</dt><dd data-out-parts>—</dd>
      </dl>
      <div class="summary-more">
        <dl>
          <dt>Fitment Packs</dt><dd data-out-packcost>—</dd>
          <dt>Labor</dt><dd data-out-labor>—</dd>
          <dt>Peak power</dt><dd data-out-power>—</dd>
          <dt>Weight change</dt><dd data-out-weight>—</dd>
        </dl>
        <h3 style="font-size:.95rem">Fitment Packs needed</h3>
        <ul class="list" data-out-packs></ul>
        <p class="fine">${sampleTag()} Estimates use sample component prices.</p>
        <div class="no-print">
          <div class="field"><label for="build-name">Build name</label><input id="build-name" name="buildName" placeholder="e.g. Customer: 1969 C10"></div>
          <div class="field"><label for="shop-logo">Shop logo for quote (optional)</label><input id="shop-logo" type="file" accept="image/png,image/jpeg,image/svg+xml"></div>
          <div class="btn-row">
            <button class="btn btn-primary btn-sm" type="button" data-save>Save build</button>
            <button class="btn btn-ghost btn-sm" type="button" data-share>Copy share link</button>
            <button class="btn btn-ghost btn-sm" type="button" data-print>Export quote PDF</button>
          </div>
          <p class="form-msg" role="status" data-msg></p>
        </div>
        <div class="print-only"><p><strong>High-voltage safety:</strong> EV conversions involve lethal DC voltages. Installation and commissioning must be performed by a qualified, HV-trained technician. Estimates are not a fixed quote.</p></div>
      </div>
    </div>
  </aside>
</form>
<script type="application/json" id="cfg-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
  return {
    path: '/configurator',
    title: 'EV Conversion Build Configurator | RESTOVOLT',
    description: 'Configure a classic car EV conversion: compatible motor, inverter, battery and BMS, estimated cost, labor hours, range and the Fitment Packs you need.',
    crumbs: [['Home', '/'], ['Configurator', '/configurator']],
    body,
    bodyClass: 'has-summary',
    scripts: ['/assets/configurator.js'],
    og: { title: 'Build configurator', sub: 'Compatible drivetrains, costs and packs in minutes' },
  };
}

function login() {
  return {
    path: '/login',
    title: 'Sign in | RESTOVOLT',
    description: 'Sign in to your RESTOVOLT shop dashboard to manage saved builds, active projects, purchased Fitment Packs and leads.',
    noindex: true,
    body: `
<section class="section"><div class="wrap narrow">
  <span class="eyebrow">Shop account</span>
  <h1>Sign in</h1>
  <p class="sample-banner"><strong>Demo mode.</strong> This prototype has no backend. Signing in creates a local demo session in this browser only; production auth should use a hosted identity provider.</p>
  <form class="card" id="login-form" style="margin-top:1.5rem" novalidate>
    <div class="field"><label for="l-email">Work email</label><input id="l-email" name="email" type="email" required autocomplete="email"></div>
    <div class="field"><label for="l-shop">Shop name</label><input id="l-shop" name="shop" required autocomplete="organization"></div>
    <div class="field"><label for="l-pass">Password</label><input id="l-pass" name="password" type="password" required minlength="8" autocomplete="current-password"></div>
    <button class="btn btn-primary" type="submit">Sign in</button>
    <p class="form-msg" role="status"></p>
  </form>
</div></section>`,
    scripts: ['/assets/dashboard.js'],
  };
}

function dashboard() {
  return {
    path: '/dashboard',
    title: 'Shop Dashboard | RESTOVOLT',
    description: 'Your RESTOVOLT shop dashboard: saved builds, active projects with stage tracking, purchased packs, leads inbox and team seats.',
    noindex: true,
    body: `
<section class="section-tight"><div class="wrap" data-dashboard>
  <div class="row"><div><span class="eyebrow" data-dash-shop>Shop dashboard</span><h1 style="font-size:clamp(2rem,4vw,3rem)">Dashboard</h1></div>
    <div class="btn-row"><a class="btn btn-primary btn-sm" href="${u('/configurator')}">New build</a><button class="btn btn-ghost btn-sm" type="button" data-signout>Sign out</button></div></div>
  <p class="empty" data-dash-gate>Sign in to view your dashboard. <a href="${u('/login')}">Sign in</a></p>
  <div class="dash" data-dash-body hidden>
    <nav class="dash-nav" aria-label="Dashboard sections"><a href="#projects">Active projects</a><a href="#saved">Saved builds</a><a href="#leads">Leads inbox</a><a href="#packs">Purchased packs</a><a href="#team">Team seats</a><a href="${u('/scan-upload')}">Scan upload</a></nav>
    <div class="grid" style="gap:2rem">
      <div class="kpis" data-kpis></div>
      <section class="card" id="projects"><h2 style="font-size:1.25rem">Active projects ${sampleTag('Sample')}</h2><ul class="list" data-projects></ul></section>
      <section class="card" id="saved"><h2 style="font-size:1.25rem">Saved builds</h2><ul class="list" data-saved></ul></section>
      <section class="card" id="leads"><h2 style="font-size:1.25rem">Leads inbox</h2><ul class="list" data-leads></ul></section>
      <section class="card" id="packs"><h2 style="font-size:1.25rem">Purchased packs</h2><ul class="list" data-packs></ul></section>
      <section class="card" id="team"><h2 style="font-size:1.25rem">Team seats</h2><ul class="list" data-team></ul>
        <form class="row" data-invite style="margin-top:1rem" novalidate><div class="field" style="flex:1;margin:0"><label for="inv">Invite by email</label><input id="inv" type="email" name="email" required></div><button class="btn btn-ghost btn-sm" type="submit" style="align-self:end">Invite</button></form></section>
    </div>
  </div>
</div></section>`,
    scripts: ['/assets/dashboard.js'],
  };
}

export default function appPages() {
  return [configurator(), login(), dashboard()];
}
