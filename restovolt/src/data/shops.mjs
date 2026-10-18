// Shop directory. SAMPLE LISTINGS: these shops are fictional placeholders.
// Profiles with `sample: true` render with a visible "Sample listing" banner,
// are marked noindex and are excluded from the sitemap so placeholder
// businesses and reviews are never presented to search engines as real.
export const SHOPS = [
  {
    slug: 'peachtree-volt-works', name: 'Peachtree Volt Works', sample: true,
    city: 'Atlanta', citySlug: 'atlanta', state: 'Georgia', stateSlug: 'georgia', stateCode: 'GA',
    address: '1200 Example Industrial Blvd', zip: '30318', geo: [33.789, -84.43],
    phone: '+1-404-555-0142', founded: 2016, team: 9,
    certification: 'Certified Installer · Level 2 HV',
    platforms: ['c10', 'bronco', '911'],
    summary: 'Full frame-off restomod shop on Atlanta’s west side, adding EV conversions in 2022. Specialists in square-body and Action Line trucks.',
    about: 'Peachtree Volt Works builds turnkey trucks and early SUVs, from teardown to road test. Every high-voltage build is commissioned by a Level 2 certified technician and delivered with an insulation-resistance report, torque log and owner HV-safety briefing.',
    builds: 14,
    reviews: [
      { author: 'Sample reviewer', rating: 5, text: 'Sample review text: clear quote, weekly photo updates and the truck was delivered on the date they promised.' },
      { author: 'Sample reviewer', rating: 5, text: 'Sample review text: they talked me out of an oversized pack and the truck drives better for it.' },
    ],
  },
  {
    slug: 'chattahoochee-restomod', name: 'Chattahoochee Restomod Co.', sample: true,
    city: 'Marietta', citySlug: 'marietta', state: 'Georgia', stateSlug: 'georgia', stateCode: 'GA',
    address: '88 Example Mill Rd', zip: '30060', geo: [33.952, -84.55],
    phone: '+1-770-555-0107', founded: 2011, team: 6,
    certification: 'Certified Installer · Level 1 HV',
    platforms: ['beetle', 'miata'],
    summary: 'Small-car specialists: air-cooled VWs and lightweight roadsters, built light and balanced.',
    about: 'A six-person team focused on cars where every pound matters. Chattahoochee Restomod pairs RESTOVOLT Fitment Packs with in-house suspension and brake tuning so converted cars keep their original character.',
    builds: 22,
    reviews: [
      { author: 'Sample reviewer', rating: 5, text: 'Sample review text: my Beetle still feels like a Beetle, just quieter and quicker.' },
    ],
  },
  {
    slug: 'music-city-electric-classics', name: 'Music City Electric Classics', sample: true,
    city: 'Nashville', citySlug: 'nashville', state: 'Tennessee', stateSlug: 'tennessee', stateCode: 'TN',
    address: '410 Example Ave', zip: '37203', geo: [36.15, -86.79],
    phone: '+1-615-555-0188', founded: 2019, team: 12,
    certification: 'Certified Installer · Level 2 HV',
    platforms: ['c10', 'bronco', 'miata'],
    summary: 'High-volume conversion shop running two build bays and a dedicated HV commissioning cell.',
    about: 'Music City Electric Classics runs a production-style workflow with separate fabrication, install and commissioning teams. They are a RESTOVOLT Fleet subscriber and typically have four builds in progress at once.',
    builds: 31,
    reviews: [
      { author: 'Sample reviewer', rating: 4, text: 'Sample review text: great communication and a tidy, well-labeled install.' },
    ],
  },
  {
    slug: 'queen-city-ev-garage', name: 'Queen City EV Garage', sample: true,
    city: 'Charlotte', citySlug: 'charlotte', state: 'North Carolina', stateSlug: 'north-carolina', stateCode: 'NC',
    address: '2200 Example Pkwy', zip: '28206', geo: [35.25, -80.82],
    phone: '+1-704-555-0163', founded: 2014, team: 5,
    certification: 'Certified Installer · Level 1 HV',
    platforms: ['911', 'beetle'],
    summary: 'European air-cooled specialists offering reversible electric conversions.',
    about: 'Queen City EV Garage focuses on reversible, bolt-in conversions for collectors who want to keep the option of returning to original. Original drivetrains are crated, labeled and stored on request.',
    builds: 11,
    reviews: [
      { author: 'Sample reviewer', rating: 5, text: 'Sample review text: they documented and crated my original engine. Exactly what I wanted.' },
    ],
  },
];

for (const s of SHOPS) s.path = `/shops/${s.slug}`;

export function cities() {
  const map = new Map();
  for (const s of SHOPS) {
    const key = `${s.stateSlug}/${s.citySlug}`;
    if (!map.has(key)) map.set(key, { city: s.city, citySlug: s.citySlug, state: s.state, stateSlug: s.stateSlug, shops: [] });
    map.get(key).shops.push(s);
  }
  return [...map.values()];
}

export function states() {
  const map = new Map();
  for (const c of cities()) {
    if (!map.has(c.stateSlug)) map.set(c.stateSlug, { state: c.state, stateSlug: c.stateSlug, cities: [] });
    map.get(c.stateSlug).cities.push(c);
  }
  return [...map.values()];
}
