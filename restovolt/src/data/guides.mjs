// Editorial guides. Authors are SAMPLE profiles: replace with real bylines and
// verifiable credentials before launch (E-E-A-T depends on them being genuine).
export const AUTHORS = {
  engineer: {
    name: 'Sample Author, P.E.',
    role: 'Lead Fitment Engineer (sample profile)',
    bio: 'Placeholder bio: replace with the real engineer’s name, licensure, years of high-voltage and chassis design experience, and the platforms they have personally reviewed.',
  },
  editor: {
    name: 'Sample Author',
    role: 'Editor, Builder Guides (sample profile)',
    bio: 'Placeholder bio: replace with the real editor’s experience restoring and converting classic vehicles and the builds they have documented.',
  },
};

export const GUIDES = [
  {
    slug: 'how-much-does-it-cost-to-convert-a-classic-car-to-electric',
    title: 'How Much Does It Cost to Convert a Classic Car to Electric?',
    seoTitle: 'Classic Car EV Conversion Cost: 2026 Guide | RESTOVOLT',
    description: 'What a classic car EV conversion really costs in 2026: parts, labor, batteries, fabrication and the hidden line items, with platform-by-platform bands.',
    author: 'engineer', reviewed: '2026-09-12', published: '2026-03-04', readMins: 8,
    vehicles: ['c10', 'bronco', 'beetle', '911', 'miata'],
    lede: 'Most professional classic car EV conversions in the US land between roughly $45,000 and $110,000 all-in. The spread is driven less by the car than by three decisions: how much battery you buy, whether you keep the gearbox, and how much of the car is restored at the same time.',
    blocks: [
      { h: 'The four cost buckets', p: ['Every conversion quote can be broken into four buckets. Understanding them is the fastest way to compare quotes from different shops and to see where your money actually goes.'],
        ul: ['Drivetrain parts: motor, inverter, battery modules, BMS, charger, DC-DC converter, contactors, fusing and cabling. Usually 45–60% of the total.', 'Fabrication: motor mounts, adapter plates, battery boxes and brackets, either designed from scratch or produced from a Fitment Pack. Usually 5–15%.', 'Labor: teardown, fabrication, install, high-voltage commissioning and road testing. Usually 30–45%.', 'Supporting upgrades: brakes, springs, dampers, cooling and gauges. Often forgotten, typically $2,000–$8,000.'] },
      { h: 'Batteries are the biggest single decision', p: ['Battery cost scales almost linearly with capacity, and so does weight. Salvage OEM modules that have been capacity- and isolation-tested are the most common choice for restomods, and a tested 40 kWh pack typically costs about half what the same capacity would cost in new, purpose-built modules.', 'The cheapest kilowatt-hour is the one you do not buy. Size the pack for how the car will be driven. A weekend roadster rarely needs more than 100 miles of range; a truck that tows or commutes may justify 60 kWh or more.'] },
      { h: 'Reversible vs. permanent builds', p: ['Keeping the original transmission with an adapter plate is usually the less expensive route, because it reuses the existing driveline and requires no frame modification. It also keeps the conversion reversible, which protects the value of collectible cars.', 'Replacing the rear axle with a salvage OEM drive unit can lower parts cost per kilowatt but adds fabrication hours and commits the car to permanent changes. On trucks it can be worth it; on collectible coupes it rarely is.'] },
      { h: 'Where Fitment Packs change the math', p: ['Designing mounts, adapter plates and battery boxes from scratch commonly consumes 40 to 80 hours of a shop’s time before the first part is cut. A verified, vehicle-specific design replaces that with a download and a dry fit, and because the same design has been fitted before, rework drops as well. That is the core reason RESTOVOLT exists.'] },
      { h: 'Typical bands by platform', p: ['The table below shows sample planning bands for complete drivetrain parts and shop hours on our launch platforms. Use the configurator or the cost page for each vehicle for a build-specific estimate.'], table: 'platforms' },
    ],
    faqs: [
      { q: 'What is the cheapest way to convert a classic car to electric?', a: 'Choose a light car, keep the original transmission, buy tested salvage battery modules sized for your real driving, and use a verified Fitment Pack instead of custom-designing mounts.' },
      { q: 'Does an EV conversion increase a classic car’s value?', a: 'It depends on the car and the market. Reversible, well-documented conversions of non-original cars tend to hold value best; converting rare, numbers-matching cars can reduce value to collectors.' },
      { q: 'How long does a professional conversion take?', a: 'Most shops quote 8 to 16 weeks of calendar time for 150 to 350 hours of labor, depending on platform, pack size and how much restoration is included.' },
    ],
  },
  {
    slug: 'is-converting-a-classic-car-to-electric-worth-it',
    title: 'Is Converting a Classic Car to Electric Worth It?',
    seoTitle: 'Is a Classic Car EV Conversion Worth It? | RESTOVOLT',
    description: 'An honest look at whether converting a classic car to electric is worth it: driving experience, reliability, value, range and who it suits best.',
    author: 'editor', reviewed: '2026-08-30', published: '2026-04-18', readMins: 7,
    vehicles: ['c10', 'beetle', 'miata'],
    lede: 'For the right car and the right owner, an electric conversion turns a classic you admire into one you drive every week. For others it is an expensive way to lose what they loved. Here is how to tell which side of that line you are on.',
    blocks: [
      { h: 'What you gain', ul: ['Reliability: no carburetor tuning, fuel-system leaks, vapor lock or cold-start rituals. Electric drivetrains have very few wear items.', 'Usability: instant torque, quiet cruising and the ability to charge at home make a classic practical for regular trips.', 'Lower running costs: electricity per mile is usually much cheaper than fuel for an older engine, and routine maintenance drops sharply.', 'Clean garage and clean air: no fuel smell, no oil drips, no exhaust.'] },
      { h: 'What you give up', ul: ['Sound and ritual: for many owners the engine is the car. Be honest with yourself about that.', 'Range: most classic conversions deliver roughly 60 to 200 miles. Road trips need planning around charging.', 'Originality: a permanent conversion of a rare car can reduce its value to collectors. Reversible builds limit this risk.', 'Upfront cost: professional conversions are a significant investment, as covered in our cost guide.'] },
      { h: 'The cars that suit conversion best', p: ['The best candidates are popular, well-supported platforms where non-original examples are common: classic pickups, early utility vehicles, air-cooled Volkswagens and later roadsters. Parts are plentiful, the cars are mechanically simple, and buyers already accept modification.', 'Rare, numbers-matching cars are better left original or converted reversibly, with the original drivetrain crated and documented.'] },
      { h: 'Owners who are happiest', p: ['Owners who are happiest with their conversions tend to share a few traits. They drive often, mostly locally. They value reliability over sound. They chose a pack size for real use rather than a spec-sheet number. And they used a shop that delivered documentation: torque logs, insulation-resistance results and a clear service plan.'] },
      { h: 'A simple decision test', p: ['If you would drive the car more if it always started, never smelled of fuel and could be charged in your garage, a conversion is probably worth it. If the engine note is the reason you own it, keep it original and enjoy it on weekends. Either answer is a good one.'] },
    ],
    faqs: [
      { q: 'Are electric classic cars reliable?', a: 'A well-engineered conversion with tested components, correct fusing and proper commissioning is typically more reliable day to day than the original drivetrain. Quality of installation matters most.' },
      { q: 'Can a conversion be undone?', a: 'Yes, if it was designed to be reversible: bolt-in mounts on factory points, original transmission retained, and the original engine stored.' },
    ],
  },
  {
    slug: 'how-to-register-a-converted-electric-car',
    title: 'How to Register and Insure a Converted Electric Car',
    seoTitle: 'How to Register a Converted Electric Car | RESTOVOLT',
    description: 'Step-by-step guide to titling, registering and insuring a classic car converted to electric, with the documents to prepare. Confirm local rules.',
    author: 'editor', reviewed: '2026-09-20', published: '2026-05-09', readMins: 6,
    vehicles: ['c10', 'bronco', 'beetle', '911', 'miata'],
    howTo: true,
    lede: 'Rules for converted vehicles vary by state and country, and they change. This guide covers the steps that apply in most US jurisdictions and the documents that make the process smoother. It is general information, not legal advice. Always confirm requirements with your local motor-vehicle agency and your insurer.',
    steps: [
      { name: 'Check your jurisdiction’s rules before you start', text: 'Contact your motor-vehicle agency to ask whether a fuel-type change must be reported, whether an inspection is required, and whether emissions testing still applies to the vehicle once converted.' },
      { name: 'Keep a complete build file', text: 'Save receipts for major components, the Fitment Pack documentation, your torque log, insulation-resistance test results and photos from each build stage. Shops on RESTOVOLT can export this from the dashboard.' },
      { name: 'Update the title or registration fuel type', text: 'Where required, submit the agency’s form to change the fuel or power type to electric. Some jurisdictions ask for a signed statement from the installer.' },
      { name: 'Complete any required inspection', text: 'Some jurisdictions require a safety inspection after a major modification. Bring the build file and make sure the vehicle’s lighting, brakes and horn work.' },
      { name: 'Tell your insurer and agree a valuation', text: 'Notify your insurer before driving the converted vehicle. For classic policies, agree a valuation that reflects the conversion cost, and keep the build file available for the underwriter.' },
      { name: 'Label the vehicle for first responders', text: 'Fit high-voltage warning labels on battery boxes and note the service disconnect location in the glovebox documentation so responders and technicians can work safely.' },
    ],
    blocks: [
      { h: 'Why documentation matters', p: ['A professional build file makes every later step easier: registration, insurance, resale and service. Buyers of converted vehicles increasingly ask for it, and insurers value it when setting agreed values.'] },
      { h: 'Emissions and inspection', p: ['In many places a vehicle that no longer burns fuel is no longer subject to tailpipe emissions testing, but the process for recording that change differs. Do not assume; ask your agency and keep their answer in writing.'] },
    ],
    faqs: [
      { q: 'Do I need to tell the DMV I converted my car to electric?', a: 'In many jurisdictions you must update the fuel type on the title or registration. Requirements vary, so confirm with your local agency.' },
      { q: 'Will my classic car insurance cover an EV conversion?', a: 'Many classic insurers will, but you must notify them and usually agree a new valuation. Provide the build file and installer details.' },
    ],
  },
];

for (const g of GUIDES) g.path = `/guides/${g.slug}`;
