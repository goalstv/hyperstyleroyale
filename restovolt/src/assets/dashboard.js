// Demo auth + dashboard. Local-only: there is no backend in the prototype.
import { store } from './store.js';

const base = document.querySelector('link[rel=icon]').getAttribute('href').replace(/\/assets\/logo\.svg$/, '');
const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const STAGES = ['Teardown', 'Fabrication', 'Install', 'HV Commissioning', 'Road Test', 'Delivered'];

const login = document.getElementById('login-form');
if (login) {
  if (store.get('session')) location.replace(`${base}/dashboard`);
  login.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!login.checkValidity()) return login.reportValidity();
    const { email, shop } = Object.fromEntries(new FormData(login));
    store.set('session', { email, shop, since: new Date().toISOString() });
    if (!store.get('team')) store.set('team', [{ email, role: 'Owner' }]);
    location.assign(`${base}/dashboard`);
  });
}

const dash = document.querySelector('[data-dashboard]');
if (dash) {
  const session = store.get('session');
  if (session) render(session);
  dash.querySelector('[data-signout]').addEventListener('click', () => {
    store.remove('session');
    location.assign(`${base}/login`);
  });
}

function render(session) {
  dash.querySelector('[data-dash-gate]').hidden = true;
  dash.querySelector('[data-dash-body]').hidden = false;
  dash.querySelector('[data-dash-shop]').textContent = session.shop;

  const projects = [
    { name: '1969 C10 Fleetside · customer: Sample A', stage: 3, due: 'Nov 14' },
    { name: '1974 Bronco wagon · customer: Sample B', stage: 1, due: 'Dec 20' },
    { name: '1967 Beetle sedan · customer: Sample C', stage: 4, due: 'Oct 31' },
  ];
  const builds = store.get('builds', []);
  const leads = [...store.get('leads', []), { name: 'Sample lead', vehicle: 'c10', zip: '30318', goals: '180+ miles, reversible', status: 'Contacted', at: '2026-10-10T15:00:00Z' }];
  const packs = store.get('purchases', []);
  const team = store.get('team', []);

  dash.querySelector('[data-kpis]').innerHTML = [
    [projects.length, 'Active projects'],
    [builds.length, 'Saved builds'],
    [leads.filter((l) => l.status === 'New').length, 'New leads'],
    [`${team.length} / 5`, 'Seats used (Pro)'],
  ].map(([n, l]) => `<div class="kpi"><b>${n}</b><span>${l}</span></div>`).join('');

  dash.querySelector('[data-projects]').innerHTML = projects.map((p) => `
    <li><div class="row"><strong>${esc(p.name)}</strong><span class="mono muted">${STAGES[p.stage]} · due ${p.due}</span></div>
    <ol class="stages" aria-label="Stage ${p.stage + 1} of 6: ${STAGES[p.stage]}">${STAGES.map((_, i) => `<li class="${i < p.stage ? 'done' : i === p.stage ? 'current' : ''}"></li>`).join('')}</ol>
    <div class="stage-labels" aria-hidden="true">${STAGES.map((s) => `<span>${s}</span>`).join('')}</div></li>`).join('');

  const list = (sel, items, fn, empty) => {
    dash.querySelector(sel).innerHTML = items.length ? items.map(fn).join('') : `<li class="empty">${empty}</li>`;
  };
  list('[data-saved]', builds, (b) => `<li class="row"><span><a href="${esc(b.url)}">${esc(b.name)}</a><br><span class="fine">${esc(b.summary)}</span></span><span class="fine">${new Date(b.at).toLocaleDateString()}</span></li>`,
    `No saved builds yet. <a href="${base}/configurator">Open the configurator</a>.`);
  list('[data-leads]', leads, (l) => `<li><div class="row"><strong>${esc(l.name)}</strong><span class="badge${l.status === 'New' ? ' badge-accent' : ''}">${esc(l.status)}</span></div><p class="fine">${esc(l.vehicle)} · ZIP ${esc(l.zip)} · ${esc(l.goals || '')}</p></li>`,
    'No leads yet.');
  list('[data-packs]', packs, (p) => `<li class="row"><span>${esc(p.pack)}</span><span class="fine">${new Date(p.at).toLocaleDateString()}</span></li>`,
    'No purchased packs yet.');
  list('[data-team]', team, (m) => `<li class="row"><span>${esc(m.email)}</span><span class="fine">${esc(m.role)}</span></li>`, 'No team members.');

  const invite = dash.querySelector('[data-invite]');
  invite.onsubmit = (e) => {
    e.preventDefault();
    if (!invite.checkValidity()) return invite.reportValidity();
    const t = store.get('team', []);
    if (t.length >= 5) return alert('Pro includes 5 seats. Upgrade to Fleet for unlimited seats.');
    t.push({ email: invite.email.value, role: 'Technician (invited)' });
    store.set('team', t);
    render(session);
  };
}
