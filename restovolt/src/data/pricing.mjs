// Subscription tiers. SAMPLE PRICING for the prototype.
export const ANNUAL_DISCOUNT = 0.2;

export const PLANS = [
  {
    id: 'starter', name: 'Starter', monthly: 149,
    pitch: 'For shops adding their first EV conversions.',
    cta: 'Start with Starter',
    highlights: ['2 Fitment Pack downloads per month', '1 team seat', 'Configurator with saved builds', 'Standard directory listing'],
  },
  {
    id: 'pro', name: 'Pro', monthly: 349, featured: true,
    pitch: 'For shops running conversions every month.',
    cta: 'Choose Pro',
    highlights: ['8 Fitment Pack downloads per month', '5 team seats', 'Branded quote PDFs', 'Lead routing in your area', 'Certified Installer badge eligibility'],
  },
  {
    id: 'fleet', name: 'Fleet', monthly: 799,
    pitch: 'For multi-bay shops and production builders.',
    cta: 'Talk to sales',
    highlights: ['Unlimited Fitment Packs', 'Unlimited team seats', 'White-label quotes', 'Lead routing priority', 'Early access to new platforms'],
  },
];

// Comparison table rows: [label, starter, pro, fleet]. true/false render as yes/no.
export const COMPARE = [
  ['Fitment Pack downloads', '2 / month', '8 / month', 'Unlimited'],
  ['Team seats', '1', '5', 'Unlimited'],
  ['Build configurator', true, true, true],
  ['Saved and shareable builds', true, true, true],
  ['Quote PDF export', 'RESTOVOLT branded', 'Your logo', 'Full white-label'],
  ['Shop directory listing', 'Standard', 'Featured', 'Featured + priority'],
  ['Lead routing', false, true, 'Priority'],
  ['Certified Installer badge', false, 'Eligible', 'Eligible'],
  ['Scan upload revenue share', true, true, true],
  ['Fabrication partner pricing', 'Standard', 'Preferred', 'Preferred'],
  ['Support', 'Email', 'Email + chat', 'Dedicated engineer'],
];

export const PER_PACK_NOTE = 'Not ready to subscribe? Buy individual Fitment Packs from $490 to $890 per platform, including future revisions of that pack version.';
