// Shared page fragments.
import { esc, u, usd, sampleTag } from './html.mjs';
import { vehicleArt } from './svg.mjs';
import { VEHICLES } from '../data/vehicles.mjs';

export const meter = (n, max = 5) =>
  `<span class="meter" role="img" aria-label="Difficulty ${n} of ${max}">${Array.from({ length: max }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span>`;

export const DIFFICULTY = ['', 'Straightforward', 'Moderate', 'Involved', 'Advanced', 'Expert'];

export function platformCard(v, { headingLevel = 3 } = {}) {
  const h = `h${headingLevel}`;
  return `
<a class="card platform-card reveal" href="${u(v.path)}" data-vehicle-item="${esc(`${v.name} ${v.body} ${v.bodyStyles.join(' ')}`.toLowerCase())}">
  ${vehicleArt(v, { id: `card-${v.id}`, interactive: false })}
  <${h}>${esc(v.name)}</${h}>
  <p class="meta">${esc(v.body)} · ${esc(v.layout)}</p>
  <p class="meta">Difficulty ${meter(v.difficulty)} · ${v.rangeBand[0]}–${v.rangeBand[1]} mi</p>
</a>`;
}

export const validationBadges = (pack) => `
<div class="badges">
  <span class="badge badge-ok"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" stroke-width="2" fill="none"/></svg>Engineer reviewed · ${esc(pack.engineerReviewed)}</span>
  <span class="badge badge-accent">Field proven: ${pack.fieldProven} builds</span>
  <span class="badge">v${esc(pack.version)}</span>
  ${sampleTag()}
</div>`;

export const partTypeBadge = (type) =>
  type === 'structural'
    ? '<span class="badge type-structural">Structural · Machine or metal print</span>'
    : '<span class="badge type-non_structural">Non-structural · Print in-house</span>';

export function waitlistForm(kind, label = 'Join the waitlist') {
  const id = `wl-${kind}`;
  return `
<form class="card" data-form="waitlist" data-success="You’re on the list. We’ll email you when ${esc(kind.replace(/-/g, ' '))} opens." novalidate>
  <input type="hidden" name="list" value="${esc(kind)}">
  <div class="field"><label for="${id}-email">Work email</label><input id="${id}-email" name="email" type="email" required autocomplete="email"></div>
  <div class="field"><label for="${id}-role">I am a</label>
    <select id="${id}-role" name="role"><option>Conversion shop</option><option>DIY builder</option><option>Vehicle owner</option><option>Parts partner</option></select></div>
  <button class="btn btn-primary" type="submit">${esc(label)}</button>
  <p class="form-msg" role="status" tabindex="-1"></p>
</form>`;
}

export function quoteForm({ shop, vehicleId } = {}) {
  const opts = VEHICLES.map((v) => `<option value="${v.id}"${v.id === vehicleId ? ' selected' : ''}>${esc(v.name)}</option>`).join('');
  return `
<form class="card" id="quote" data-form="quote" data-success="Request sent${shop ? ` to ${esc(shop.name)}` : ''}. A certified shop will reply within two business days." novalidate>
  <h2 style="font-size:1.35rem">Request a quote</h2>
  ${shop ? `<input type="hidden" name="shop" value="${esc(shop.slug)}">` : ''}
  <div class="field"><label for="q-name">Name</label><input id="q-name" name="name" required autocomplete="name"></div>
  <div class="field"><label for="q-email">Email</label><input id="q-email" name="email" type="email" required autocomplete="email"></div>
  <div class="field"><label for="q-zip">ZIP code</label><input id="q-zip" name="zip" inputmode="numeric" pattern="[0-9]{5}" required autocomplete="postal-code"></div>
  <div class="field"><label for="q-vehicle">Vehicle</label><select id="q-vehicle" name="vehicle">${opts}<option value="other">Other / not listed</option></select></div>
  <div class="field"><label for="q-goals">Goals</label><textarea id="q-goals" name="goals" placeholder="Range you need, budget, reversible or permanent, timeline"></textarea></div>
  <button class="btn btn-primary" type="submit">Send request</button>
  <p class="fine">We route your request to ${shop ? 'this shop' : 'certified shops near you'}. No spam, ever.</p>
  <p class="form-msg" role="status" tabindex="-1"></p>
</form>`;
}

export const costTable = () => `
<div class="table-wrap"><table>
  <caption class="visually-hidden">Sample cost and range bands by platform</caption>
  <thead><tr><th scope="col">Platform</th><th scope="col" class="num">Parts</th><th scope="col" class="num">Shop hours</th><th scope="col" class="num">Range</th></tr></thead>
  <tbody>${VEHICLES.map((v) => `<tr><th scope="row"><a href="${u(v.costPath)}">${esc(v.name)}</a></th><td class="num">${usd(v.partsBand[0])}–${usd(v.partsBand[1])}</td><td class="num">${v.laborBand[0]}–${v.laborBand[1]} h</td><td class="num">${v.rangeBand[0]}–${v.rangeBand[1]} mi</td></tr>`).join('')}</tbody>
</table></div>
<p class="fine">${sampleTag()} Planning bands for complete drivetrain parts and turnkey shop labor. Get a build-specific estimate in the <a href="${u('/configurator')}">configurator</a>.</p>`;
