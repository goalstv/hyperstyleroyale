// Site-wide constants. SITE_URL is used for canonical, OG and sitemap URLs.
export const SITE = {
  name: 'RESTOVOLT',
  url: (process.env.SITE_URL || 'https://www.restovolt.example').replace(/\/$/, ''),
  tagline: 'Classic soul. Electric heart. Engineered to fit.',
  description:
    'Verified 3D scan data, engineered mount and bracket designs, and curated drivetrain parts for classic car EV conversions.',
  locale: 'en_US',
  twitter: '@restovolt',
  email: 'hello@restovolt.example',
};

export const NAV = [
  { href: '/vehicles', label: 'Fitment Library' },
  { href: '/configurator', label: 'Configurator' },
  { href: '/shops', label: 'Find a Shop' },
  { href: '/guides', label: 'Guides' },
  { href: '/pricing', label: 'Pricing' },
];

export const FOOTER = [
  {
    title: 'Platform',
    links: [
      ['/vehicles', 'Fitment Library'],
      ['/configurator', 'Build Configurator'],
      ['/parts', 'Parts Marketplace'],
      ['/builds', 'Build Journals'],
      ['/scan-upload', 'Scan Upload'],
    ],
  },
  {
    title: 'For Shops',
    links: [
      ['/for-shops', 'Why RESTOVOLT'],
      ['/pricing', 'Pricing'],
      ['/dashboard', 'Shop Dashboard'],
      ['/login', 'Sign in'],
    ],
  },
  {
    title: 'Owners',
    links: [
      ['/shops', 'Find a certified shop'],
      ['/shops/georgia/atlanta', 'EV conversion shops in Atlanta'],
      ['/guides', 'Conversion guides'],
      ['/safety', 'Safety & compliance'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['/about', 'About'],
      ['/contact', 'Contact'],
      ['/safety', 'Engineering standards'],
      ['/sitemap.xml', 'XML sitemap'],
    ],
  },
];
