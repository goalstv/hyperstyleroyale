// Site-wide progressive enhancement. Every page renders fully without this file.
import { store } from './store.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Theme toggle (persists per viewer).
document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const root = document.documentElement;
    const current = root.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    const next = current === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('rv-theme', next); } catch {}
  });
});

// Classic / Blueprint / Electric layered view.
document.querySelectorAll('.vehicle-art.is-interactive').forEach((fig) => {
  const buttons = fig.querySelectorAll('[data-set-view]');
  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      fig.dataset.view = b.dataset.setView;
      buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    }),
  );
});

// Scroll reveals, spec counters and the exploded-view assembly.
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      io.unobserve(el);
      if (el.classList.contains('reveal')) el.classList.add('in');
      if (el.matches('[data-count]')) countUp(el);
      if (el.matches('.exploded')) setTimeout(() => el.classList.remove('collapsed'), 150);
    }
  },
  { rootMargin: '0px 0px -10% 0px' },
);
document.querySelectorAll('.reveal, [data-count], .exploded').forEach((el) => {
  if (el.matches('.exploded') && !reduced) el.classList.add('collapsed');
  io.observe(el);
});

function countUp(el) {
  const target = Number(el.dataset.count);
  if (reduced || !target) return;
  const start = performance.now();
  const fmt = (n) => Math.round(n).toLocaleString('en-US');
  const tick = (t) => {
    const k = Math.min((t - start) / 1200, 1);
    el.textContent = fmt(target * (1 - Math.pow(1 - k, 3))) + (el.dataset.suffix || '');
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// Forms: waitlist, quote requests and contact. In the prototype these are
// stored locally (and quote requests appear in the demo dashboard leads inbox).
document.querySelectorAll('form[data-form]').forEach((form) => {
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const msg = form.querySelector('.form-msg');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    const kind = form.dataset.form;
    const entry = { ...data, kind, at: new Date().toISOString() };
    if (kind === 'quote') store.push('leads', { ...entry, status: 'New' });
    else store.push('submissions', entry);
    form.reset();
    if (msg) {
      msg.dataset.state = 'ok';
      msg.textContent = form.dataset.success || 'Thanks. We received your request.';
      msg.focus?.();
    }
  });
});

// Fitment library search (?q=) and filters.
const lib = document.querySelector('[data-vehicle-filter]');
if (lib) {
  const input = lib.querySelector('input[type=search]');
  const items = document.querySelectorAll('[data-vehicle-item]');
  const status = document.querySelector('[data-filter-status]');
  const apply = () => {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    items.forEach((it) => {
      const hit = !q || it.dataset.vehicleItem.includes(q);
      it.hidden = !hit;
      if (hit) shown++;
    });
    status.textContent = q ? `${shown} platform${shown === 1 ? '' : 's'} match “${input.value}”` : '';
  };
  input.value = new URLSearchParams(location.search).get('q') || '';
  input.addEventListener('input', apply);
  apply();
}

// Pricing billing toggle.
const billing = document.querySelector('[data-billing]');
if (billing) {
  const buttons = billing.querySelectorAll('button');
  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      const annual = b.dataset.period === 'annual';
      buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      document.querySelectorAll('[data-monthly]').forEach((el) => {
        el.textContent = annual ? el.dataset.annual : el.dataset.monthly;
      });
      document.querySelectorAll('[data-period-label]').forEach((el) => {
        el.textContent = annual ? '/mo, billed annually' : '/mo, billed monthly';
      });
    }),
  );
}

// Terms acknowledgment gate for structural downloads.
document.querySelectorAll('[data-terms-gate]').forEach((gate) => {
  const box = gate.querySelector('input[type=checkbox]');
  const actions = gate.querySelectorAll('[data-requires-terms]');
  const sync = () => actions.forEach((a) => {
    a.toggleAttribute('disabled', !box.checked);
    a.setAttribute('aria-disabled', String(!box.checked));
  });
  box.addEventListener('change', sync);
  sync();
  actions.forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (!box.checked) return;
      const out = gate.querySelector('.form-msg');
      out.dataset.state = 'ok';
      out.textContent = a.dataset.message;
      if (a.dataset.pack) store.push('purchases', { pack: a.dataset.pack, at: new Date().toISOString() });
    }),
  );
});
