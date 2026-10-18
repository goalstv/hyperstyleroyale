import { checkCompat, estimate, recommend, byId } from './engine.js';
import { store } from './store.js';

const { vehicles, components, base } = JSON.parse(document.getElementById('cfg-data').textContent);
const form = document.getElementById('cfg');
const $ = (s) => form.querySelector(s);
const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');
const LEVEL = ['', 'Low', 'Medium', 'High'];
const CATS = ['motor', 'inverter', 'battery', 'bms', 'charger'];

const vehicle = () => vehicles.find((v) => v.id === form.vehicle.value);
const goals = () => ({
  range: +form.range.value,
  performance: +form.performance.value,
  budget: +form.budget.value,
  reversibility: form.reversibility.value,
});
const selection = () => Object.fromEntries(CATS.map((c) => [c, form[c].value]));

function applySelection(sel) {
  for (const c of CATS) if (sel[c] && byId(components, sel[c])) form[c].value = sel[c];
}

function runRecommend() {
  const sel = recommend(vehicle(), goals(), components);
  if (sel) applySelection(sel);
  render();
}

function render() {
  const v = vehicle();
  const g = goals();
  const sel = selection();
  for (const k of ['range', 'performance', 'budget']) {
    const label = k === 'budget' ? ['', 'Flexible', 'Balanced', 'Tight'][g[k]] : LEVEL[g[k]];
    form.querySelector(`[data-out="${k}"]`).textContent = label;
    form[k].setAttribute('aria-valuetext', label);
  }

  const checks = checkCompat(v, sel, components, g);
  const icon = { pass: '✓', warn: '!', fail: '✕' };
  $('[data-checks]').innerHTML = checks
    .map((c) => `<li data-status="${c.status}"><span class="ico" aria-hidden="true">${icon[c.status]}</span><div><strong>${c.label} <span class="visually-hidden">(${c.status})</span></strong><span>${c.detail}</span></div></li>`)
    .join('');

  const fails = checks.filter((c) => c.status === 'fail').length;
  const warns = checks.filter((c) => c.status === 'warn').length;
  const status = $('[data-status-label]');
  status.textContent = fails ? `${fails} blocking issue${fails > 1 ? 's' : ''}` : warns ? `Compatible · ${warns} warning${warns > 1 ? 's' : ''}` : 'Compatible';
  status.style.color = fails ? 'var(--fail)' : warns ? 'var(--warn)' : 'var(--ok)';

  const est = estimate(v, sel, components, g);
  const set = (attr, text) => ($(`[${attr}]`).textContent = text);
  set('data-out-range', `${est.rangeLow}–${est.rangeHigh} mi`);
  set('data-out-parts', `${usd(est.partsLow)}–${usd(est.partsHigh)}`);
  set('data-out-packcost', usd(est.packCost));
  set('data-out-labor', `${est.laborLow}–${est.laborHigh} h`);
  set('data-out-power', `${est.peakKw} kW`);
  set('data-out-weight', `${est.weightDelta >= 0 ? '+' : ''}${est.weightDelta} lb`);
  $('[data-out-packs]').innerHTML = est.packs
    .map((p) => `<li class="row"><span>${p.id === 'core' ? `<a href="${base}${v.packPath}">${p.name}</a>` : p.name}</span><span class="mono">${usd(p.priceUsd)}</span></li>`)
    .join('');

  const qs = new URLSearchParams({ v: v.id, ...sel, r: g.range, p: g.performance, b: g.budget, rev: g.reversibility });
  history.replaceState(null, '', `${location.pathname}?${qs}`);
}

// Restore from a shared URL, otherwise recommend for the default vehicle.
const params = new URLSearchParams(location.search);
if (params.get('v') && vehicles.some((v) => v.id === params.get('v'))) form.vehicle.value = params.get('v');
for (const [k, p] of [['range', 'r'], ['performance', 'p'], ['budget', 'b']]) if (params.get(p)) form[k].value = params.get(p);
if (params.get('rev')) form.reversibility.value = params.get('rev');
if (params.get('motor')) {
  applySelection(Object.fromEntries(CATS.map((c) => [c, params.get(c)])));
  render();
} else {
  runRecommend();
}

form.addEventListener('change', (e) => {
  if (e.target.name === 'vehicle' || e.target.name === 'reversibility') runRecommend();
  else if (e.target.id !== 'shop-logo') render();
});
form.addEventListener('input', (e) => { if (e.target.matches('[data-goal]')) render(); });
$('[data-recommend]').addEventListener('click', runRecommend);

const msg = (text) => { const m = $('[data-msg]'); m.dataset.state = 'ok'; m.textContent = text; };

$('[data-save]').addEventListener('click', () => {
  const v = vehicle();
  const est = estimate(v, selection(), components, goals());
  store.push('builds', {
    id: Date.now().toString(36),
    name: form.buildName.value || `${v.shortName} build`,
    vehicle: v.id,
    url: location.pathname + location.search,
    summary: `${est.rangeLow}–${est.rangeHigh} mi · ${usd(est.partsLow)}–${usd(est.partsHigh)} parts`,
    at: new Date().toISOString(),
  });
  msg('Build saved to your dashboard.');
});

$('[data-share]').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    msg('Share link copied.');
  } catch {
    msg(`Share link: ${location.href}`);
  }
});

let logoUrl = '';
form.querySelector('#shop-logo').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { logoUrl = reader.result; };
  reader.readAsDataURL(file);
});

$('[data-print]').addEventListener('click', () => {
  const v = vehicle();
  const sel = selection();
  const shop = store.get('session')?.shop || 'Your shop';
  const header = $('[data-print-header]');
  header.replaceChildren();
  if (logoUrl) {
    const img = new Image();
    img.src = logoUrl;
    img.alt = `${shop} logo`;
    img.style.maxHeight = '60px';
    header.append(img);
  }
  const h = document.createElement('h2');
  h.textContent = `${shop} · Conversion quote: ${form.buildName.value || v.name}`;
  const list = document.createElement('ul');
  for (const c of CATS) {
    const li = document.createElement('li');
    li.textContent = byId(components, sel[c]).name;
    list.append(li);
  }
  const date = document.createElement('p');
  date.textContent = `Prepared ${new Date().toLocaleDateString()} for a ${v.name}.`;
  header.append(h, date, list);
  $('[data-summary]').classList.add('expanded');
  window.print();
});

const expand = $('[data-expand]');
expand.addEventListener('click', () => {
  const card = $('[data-summary]');
  const open = card.classList.toggle('expanded');
  expand.setAttribute('aria-expanded', String(open));
  expand.textContent = open ? 'Hide details' : 'Show details';
});
