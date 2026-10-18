import { COMPONENTS } from './components.mjs';
import { recommend, estimate } from '../assets/engine.js';

// Vehicle platforms. Adding a platform = adding an object here; every page,
// sitemap entry, cost page and configurator option is generated from it.
// Cost, range, validation and torque figures are SAMPLE DATA for the prototype.

const commonChecklist = [
  'Confirm HV isolation: pack disconnected, service plug removed, verify 0 V at the inverter DC link.',
  'Dry-fit every structural part before final welding or torque. Check clearances to brake lines and fuel/vent remnants.',
  'Torque structural fasteners to spec in the pack sequence, then witness-mark them.',
  'Route HV cables through the supplied guides; maintain at least 25 mm from exhaust-heat or sharp edges.',
  'Install fusing and the manual service disconnect in the locations shown on the routing guide.',
  'Run insulation-resistance and pre-charge checks before first energize (HV Commissioning stage).',
  'Re-check torque after the first 50 road miles.',
];

export const VEHICLES = [
  {
    id: 'c10',
    make: 'Chevrolet', makeSlug: 'chevrolet', model: 'C10', modelSlug: 'c10',
    yearStart: 1967, yearEnd: 1972, shortName: 'C10',
    body: 'Pickup truck', bodyStyles: ['Fleetside', 'Stepside'], art: 'truck',
    layout: 'Front engine, rear-wheel drive', wheelbaseMm: 2921,
    curbWeight: '3,400–3,900 lb', difficulty: 2,
    difficultyNote: 'Generous engine bay and a ladder frame make this the friendliest platform in the library.',
    seo: {
      title: '1967–1972 Chevy C10 EV Conversion | RESTOVOLT',
      description: 'Plan a 1967–1972 Chevrolet C10 EV conversion: verified motor mounts, battery box layouts, range and cost bands, and certified shops.',
    },
    intro:
      'The 1967–1972 C10 is the most requested platform in the RESTOVOLT library, and for good reason. A long ladder frame, a cavernous engine bay and a bed that can hide a serious battery pack give builders room to engineer a clean, serviceable electric truck without fighting the chassis at every turn.',
    sections: [
      {
        h: 'Platform history',
        p: [
          'Chevrolet introduced its second-generation C/K light trucks for the 1967 model year, and the "Action Line" styling quickly became one of the most recognizable shapes in American pickups. The C prefix marked two-wheel-drive trucks; the 10 marked the half-ton series. Buyers could choose short or long wheelbases and Fleetside or Stepside beds, and many half-tons were built with coil-spring trailing-arm rear suspension rather than leaf springs.',
          'Six model years of production, a huge survivor population and an enormous reproduction-parts industry mean that almost every body panel, bushing and trim piece is still available. That supply depth is exactly why so many restomod shops treat the C10 as a house specialty, and why electrification has followed.',
        ],
      },
      {
        h: 'Conversion considerations',
        p: [
          'Most C10 conversions follow one of two architectures. The reversible route keeps the factory transmission and rear axle: an electric motor bolts to the gearbox through an adapter plate, and our Core Fitment Pack supplies a motor mount that lands on the original frame-mount bosses. The permanent route replaces the rear axle with a salvage OEM drive unit carried in a fabricated cradle, which frees the entire engine bay for batteries but commits the truck to frame modification.',
          'Early trucks carried their fuel tank inside the cab behind the seat. Removing it is one of the first jobs in any conversion and frees a useful volume for low-voltage components or a small battery module, which our cab-tank delete tray is designed around. Trucks built before front disc brakes became standard should get a disc conversion before they get more torque.',
        ],
      },
      {
        h: 'Weight and packaging notes',
        p: [
          'A dressed small-block V8, automatic transmission, radiator, exhaust and a full tank weigh in the region of 850 lb. A 58 kWh pack, motor and auxiliaries typically land a few hundred pounds heavier than that, and the Fitment Pack battery box layout splits mass between the engine bay and the space between the frame rails under the bed to keep front-rear balance close to stock.',
          'Above roughly 85 kWh the boxes start competing with spare-tire and exhaust-tunnel space, so the configurator treats 85 kWh as the packaging ceiling for current designs. Shops building tow-capable trucks should plan spring and brake upgrades alongside the drivetrain.',
        ],
      },
      {
        h: 'Choosing a donor truck',
        p: [
          'The best electric C10s start with a straight frame and a solid cab, not a perfect engine. Check the cab corners, floor pans and rear cab mounts for rust, and inspect the frame around the steering box and spring hangers. Because the drivetrain is coming out anyway, a truck with a tired engine is often the better buy.',
          'Short-bed Fleetside trucks are the most popular base because they balance well and leave the most under-bed space per pound. Long-bed trucks package larger packs but feel heavier on the road.',
        ],
      },
      {
        h: 'Range and cost bands',
        p: [
          'A full-size pickup is not aerodynamic, so plan on roughly 380–420 Wh per mile at highway speeds. That puts typical builds between {rangeLo} and {rangeHi} miles of real-world range depending on pack size. Parts budgets for complete drivetrains generally fall between {partsLo} and {partsHi}, with {laborLo} to {laborHi} shop hours for a turnkey conversion. These bands are sample planning figures; use the configurator for a build-specific estimate.',
        ],
      },
    ],
    faqs: [
      { q: 'Can a C10 EV conversion be reversed?', a: 'Yes, if you keep the factory transmission and rear axle. The Core Fitment Pack motor mount and adapter plate bolt to existing mounting points, so the original drivetrain can be reinstalled. Drive-unit swaps require frame modification and are not reversible.' },
      { q: 'How much range can an electric C10 get?', a: 'Most builds see {rangeLo}–{rangeHi} miles depending on pack size, tire choice and highway speed. A 58 kWh pack is the most common balance of range, weight and cost.' },
      { q: 'Where do the batteries go in a C10?', a: 'The Fitment Pack layout splits modules between the engine bay and a box mounted between the frame rails under the bed, with an optional tray in the old cab-tank location for low-voltage components.' },
      { q: 'Does the conversion affect towing?', a: 'Electric torque is excellent for towing, but added weight and reduced range under load matter. Re-rate springs and brakes and confirm your local rules on gross vehicle weight before towing.' },
    ],
    config: {
      maxKwh: 85, motorSizes: ['compact', 'mid', 'large'], driveModes: ['transmission', 'driveunit'],
      baseLaborHours: 260, whPerMile: 400, originalDrivetrainLb: 850, maxAddedLb: 900, ratedKw: 190,
      addons: [
        { id: 'c10-du', name: 'C10 Rear Drive-Unit Cradle Pack', priceUsd: 590, when: 'driveunit' },
        { id: 'c10-ext', name: 'C10 Under-Bed Extended Box Pack', priceUsd: 340, when: 'kwhOver', kwh: 60 },
      ],
    },
    electric: { motorAt: 'front', boxes: [[70, 166, 130, 34], [420, 192, 150, 30]] },
    pack: {
      name: 'C10 Core Fitment Pack', version: '1.4', priceUsd: 690,
      engineerReviewed: '2026-08-14', fieldProven: 9,
      parts: [
        { name: 'Motor mount, frame-boss pattern', type: 'structural', material: '6061-T6 aluminum, 12 mm', qty: 2 },
        { name: 'Transmission adapter plate (TH350 / 700R4 patterns)', type: 'structural', material: '6061-T6 aluminum, 16 mm', qty: 1 },
        { name: 'Engine-bay battery box frame', type: 'structural', material: 'Mild steel, 3 mm, welded', qty: 1 },
        { name: 'Under-bed battery box and crossmember brackets', type: 'structural', material: 'Mild steel, 4 mm', qty: 1 },
        { name: 'Cab-tank delete LV component tray', type: 'non_structural', material: 'PETG or ASA', qty: 1 },
        { name: 'HV harness guides and grommet rings', type: 'non_structural', material: 'ASA (heat resistant)', qty: 14 },
        { name: 'Charge-port bezel for fuel-filler location', type: 'non_structural', material: 'ASA', qty: 1 },
      ],
      torque: [
        ['Motor mount to frame boss', '3/8-16 Grade 8', '44 ft·lb (60 N·m)'],
        ['Adapter plate to motor face', 'M10 10.9', '45 N·m'],
        ['Adapter plate to bellhousing', '7/16-14 Grade 8', '55 ft·lb (75 N·m)'],
        ['Battery box to crossmember brackets', 'M12 10.9', '105 N·m'],
        ['HV busbar terminals', 'M8', '12 N·m'],
      ],
    },
    builds: [
      { title: '1969 C10 Fleetside "Copperline"', kwh: 58, range: 190, stage: 'Delivered' },
      { title: '1971 C10 Stepside shop truck', kwh: 40, range: 135, stage: 'Road Test' },
    ],
  },

  {
    id: 'bronco',
    make: 'Ford', makeSlug: 'ford', model: 'Bronco', modelSlug: 'bronco',
    yearStart: 1966, yearEnd: 1977, shortName: 'Bronco',
    body: 'Compact SUV', bodyStyles: ['Wagon', 'Half-cab', 'Roadster'], art: 'suv',
    layout: 'Front engine, four-wheel drive', wheelbaseMm: 2337,
    curbWeight: '3,000–3,400 lb', difficulty: 3,
    difficultyNote: 'Short wheelbase and a four-wheel-drive driveline leave less room for batteries than you would expect.',
    seo: {
      title: '1966–1977 Ford Bronco EV Conversion | RESTOVOLT',
      description: 'Electrify a 1966–1977 Ford Bronco while keeping 4x4: verified motor mounts, transfer-case adapters, battery layouts, cost bands and shops.',
    },
    intro:
      'The first-generation Bronco is a restomod icon that buyers want to keep using off-road. That changes the engineering brief: a good electric Bronco keeps a transfer case, protects its battery from trail damage and stays light enough to remain fun on a 92-inch wheelbase.',
    sections: [
      {
        h: 'Platform history',
        p: [
          'Ford launched the Bronco for 1966 as a compact four-wheel-drive utility vehicle, offered in wagon, half-cab and open roadster forms. Its short 92-inch wheelbase, solid axles and simple body panels made it a favorite for trail use, and the first generation ran largely unchanged in concept through 1977.',
          'Values for clean early Broncos have climbed steadily, and the reproduction-body industry now supplies complete tubs. That combination means many electric Broncos start as full frame-off builds, which is the ideal moment to design in battery protection rather than bolt it on later.',
        ],
      },
      {
        h: 'Conversion considerations',
        p: [
          'Our Bronco designs retain the factory-style transfer case so the truck keeps true four-wheel drive and low range. The Core Fitment Pack includes a motor mount, a motor-to-transmission adapter plate and an alignment collar that keep the output shaft on the original driveline angle, which matters more on a short-wheelbase vehicle where U-joint angles are already steep.',
          'Rear drive-unit swaps are not supported on this platform yet because they would remove the rear axle and with it the four-wheel-drive layout most owners are paying for. Shops planning an on-road-only build should talk to us about a scan submission for a dedicated two-wheel-drive design.',
        ],
      },
      {
        h: 'Weight and packaging notes',
        p: [
          'There is less space in an early Bronco than its boxy shape suggests. The engine bay takes a modest box above the motor, and the second box sits in the rear footwell and former fuel-tank area with a skid-plate floor rated for trail impacts. The configurator caps current designs at 58 kWh to protect ground clearance and keep added weight within what lifted suspension and upgraded brakes can manage.',
          'Every extra hundred pounds is felt on a 3,000 lb truck, so we recommend matching pack size to how the Bronco will really be used. A 40 kWh pack suits weekend trail rigs; 58 kWh suits owners who drive to the trailhead.',
        ],
      },
      {
        h: 'Choosing a donor Bronco',
        p: [
          'Frame condition matters more than anything else. Inspect the rear frame rails, the rocker and floor areas, and the quarter panels around the wheel openings, where early Broncos commonly rust. Confirm the transfer case shifts cleanly through all ranges, since our layouts depend on it.',
          'Reproduction-body Broncos make excellent conversion bases: the new tub is rust-free, and you can drill battery box mounting points into fresh metal instead of patching tired panels.',
        ],
      },
      {
        h: 'Range and cost bands',
        p: [
          'With an upright windshield and off-road tires, plan on about 360–400 Wh per mile. Typical builds land between {rangeLo} and {rangeHi} miles of range. Parts budgets usually fall between {partsLo} and {partsHi}, and {laborLo} to {laborHi} shop hours is a realistic labor band once skid protection and driveline angle work are included. Treat these as sample planning bands.',
        ],
      },
    ],
    faqs: [
      { q: 'Can an electric Bronco keep four-wheel drive?', a: 'Yes. RESTOVOLT Bronco designs keep a transfer case, so the truck retains 4WD and low range. The motor drives through an adapter plate and the original driveline geometry.' },
      { q: 'Is the battery protected for off-road use?', a: 'The rear battery box in the Fitment Pack uses a skid-plate floor and sits above the frame bottom line. Shops should still inspect it after hard trail use.' },
      { q: 'How far can an electric Bronco drive?', a: 'Most first-generation Bronco conversions see {rangeLo}–{rangeHi} miles depending on pack size, tire size and speed.' },
      { q: 'Should I convert a numbers-matching Bronco?', a: 'If originality matters, choose a reversible build that bolts to factory mounting points and store the original drivetrain. Many owners convert reproduction-body trucks instead.' },
    ],
    config: {
      maxKwh: 58, motorSizes: ['compact', 'mid'], driveModes: ['transmission'],
      baseLaborHours: 280, whPerMile: 380, originalDrivetrainLb: 780, maxAddedLb: 500, ratedKw: 150,
      addons: [{ id: 'bronco-skid', name: 'Bronco Battery Skid Armor Pack', priceUsd: 290, when: 'kwhOver', kwh: 30 }],
    },
    electric: { motorAt: 'front', boxes: [[88, 160, 120, 30], [360, 190, 130, 30]] },
    pack: {
      name: 'Bronco Core Fitment Pack', version: '1.2', priceUsd: 740,
      engineerReviewed: '2026-07-02', fieldProven: 5,
      parts: [
        { name: 'Motor mount with driveline-angle shims', type: 'structural', material: '6061-T6 aluminum, 12 mm', qty: 2 },
        { name: 'Motor-to-transmission adapter plate', type: 'structural', material: '6061-T6 aluminum, 16 mm', qty: 1 },
        { name: 'Output alignment collar', type: 'structural', material: '4140 steel, machined', qty: 1 },
        { name: 'Rear battery box with skid floor', type: 'structural', material: 'Mild steel, 4 mm', qty: 1 },
        { name: 'Engine-bay battery box frame', type: 'structural', material: 'Mild steel, 3 mm, welded', qty: 1 },
        { name: 'HV harness guides, frame-rail clips', type: 'non_structural', material: 'ASA', qty: 18 },
        { name: 'Dash gauge bezel for SOC display', type: 'non_structural', material: 'PETG', qty: 1 },
      ],
      torque: [
        ['Motor mount to frame', '7/16-14 Grade 8', '55 ft·lb (75 N·m)'],
        ['Adapter plate to motor face', 'M10 10.9', '45 N·m'],
        ['Alignment collar set screws', 'M8 12.9', '30 N·m'],
        ['Rear box to frame brackets', 'M12 10.9', '105 N·m'],
        ['HV busbar terminals', 'M8', '12 N·m'],
      ],
    },
    builds: [
      { title: '1974 Bronco wagon "Tidewater"', kwh: 40, range: 120, stage: 'Delivered' },
      { title: '1968 Bronco half-cab trail build', kwh: 58, range: 160, stage: 'Fabrication' },
    ],
  },

  {
    id: 'beetle',
    make: 'Volkswagen', makeSlug: 'volkswagen', model: 'Beetle', modelSlug: 'beetle',
    yearStart: 1958, yearEnd: 1979, shortName: 'Beetle',
    body: 'Two-door sedan', bodyStyles: ['Sedan', 'Convertible'], art: 'bug',
    layout: 'Rear engine, rear-wheel drive', wheelbaseMm: 2400,
    curbWeight: '1,700–1,900 lb', difficulty: 2,
    difficultyNote: 'Light, simple and well documented. The challenge is keeping it light.',
    seo: {
      title: 'Classic VW Beetle EV Conversion (Air-Cooled) | RESTOVOLT',
      description: 'Convert an air-cooled VW Beetle to electric: transaxle adapter plates, battery box layouts, brake and weight notes, cost bands and shops.',
    },
    intro:
      'The air-cooled Beetle has been converted to electric power for decades, but most of those builds were one-offs. RESTOVOLT focuses on the details that separate a good electric Beetle from a heavy one: a light pack, a precise transaxle adapter and brakes that match the new weight.',
    sections: [
      {
        h: 'Platform history',
        p: [
          'The Beetle was built in enormous numbers over a production run that spanned most of the twentieth century, and the air-cooled sedans and convertibles sold in North America through the 1970s are the cars most builders start with. Its separable floor pan, torsion-bar suspension and rear-mounted transaxle make it mechanically simple and easy to work on.',
          'Because so many were built, parts remain cheap and plentiful, and the platform has a deep enthusiast knowledge base. That also means owners have strong opinions about weight and handling, which is the right instinct for an electric build.',
        ],
      },
      {
        h: 'Conversion considerations',
        p: [
          'Every Beetle design in the library keeps the original transaxle. The motor bolts to it through a machined adapter plate and coupler, and a rear mount picks up the original engine-mount points. This keeps the conversion reversible and keeps the familiar shift feel; most drivers settle on using two gears.',
          'The front trunk and the space under the rear seat take the battery boxes. On sedans with the curved windshield (Super Beetle variants) the front volume differs, so check the body-style note on the pack before ordering. Drum brakes are adequate for the original car but we recommend a front disc conversion for any build over about 300 lb of added weight.',
        ],
      },
      {
        h: 'Weight and packaging notes',
        p: [
          'The original engine, cooling tin, exhaust and fuel weigh far less than any V8, so a Beetle has little weight budget to give. A 24 to 32 kWh pack is the sweet spot for most builds; a 40 kWh pack fits but uses almost all of the available volume and adds enough mass that springs and dampers should be revisited.',
          'Splitting modules front and rear keeps the weight distribution closer to the original rear bias than you might expect, and it keeps the front end from feeling light at speed.',
        ],
      },
      {
        h: 'Choosing a donor Beetle',
        p: [
          'Start with the floor pan and the heater channels, the structural members along the sills that carry much of the car’s strength. Rot there is common and must be repaired before any battery box is bolted in. Check the front torsion-beam mounts and the frame head for damage as well.',
          'Swing-axle cars and later IRS cars both work with our adapter plate, but IRS rear suspension handles the extra weight more gracefully. If you are choosing between two otherwise similar cars, the later rear suspension is worth having, and so is a front disc brake setup if the car already has one.',
        ],
      },
      {
        h: 'Range and cost bands',
        p: [
          'The Beetle is light but far from slippery: plan on roughly 210–250 Wh per mile, which gives {rangeLo} to {rangeHi} miles of range for typical 24 to 32 kWh packs. Complete parts budgets usually fall between {partsLo} and {partsHi}, with {laborLo} to {laborHi} shop hours. These are sample planning figures; the configurator will tailor them to your build.',
        ],
      },
    ],
    faqs: [
      { q: 'Do I keep the gearbox in an electric Beetle?', a: 'Yes. RESTOVOLT Beetle designs keep the original transaxle and connect the motor with a machined adapter plate and coupler.' },
      { q: 'How much range does an electric Beetle have?', a: 'Typical builds see {rangeLo}–{rangeHi} miles. A 24 to 32 kWh pack is the most common choice because it keeps weight close to stock.' },
      { q: 'Do I need to upgrade the brakes?', a: 'We recommend a front disc conversion for any Beetle build that adds more than about 300 lb over the original drivetrain.' },
      { q: 'Does the Fitment Pack fit Super Beetles?', a: 'The motor mount and adapter plate fit both. Front battery box dimensions differ, so choose the Super Beetle box variant included in the pack.' },
    ],
    config: {
      maxKwh: 40, motorSizes: ['compact', 'mid'], driveModes: ['transmission'],
      baseLaborHours: 170, whPerMile: 230, originalDrivetrainLb: 300, maxAddedLb: 450, ratedKw: 40,
      addons: [],
    },
    electric: { motorAt: 'rear', boxes: [[120, 172, 120, 34], [340, 180, 150, 26]] },
    pack: {
      name: 'Beetle Core Fitment Pack', version: '2.0', priceUsd: 490,
      engineerReviewed: '2026-06-20', fieldProven: 14,
      parts: [
        { name: 'Transaxle adapter plate', type: 'structural', material: '6061-T6 aluminum, 14 mm', qty: 1 },
        { name: 'Motor-to-input shaft coupler', type: 'structural', material: '4140 steel, machined, splined', qty: 1 },
        { name: 'Rear motor mount (original engine points)', type: 'structural', material: '6061-T6 aluminum, 10 mm', qty: 1 },
        { name: 'Front trunk battery box (sedan and Super variants)', type: 'structural', material: 'Mild steel, 2.5 mm', qty: 1 },
        { name: 'Under-seat battery box', type: 'structural', material: 'Mild steel, 2.5 mm', qty: 1 },
        { name: 'Tunnel HV cable guides', type: 'non_structural', material: 'ASA', qty: 10 },
        { name: 'Decklid vent insert and charge-port surround', type: 'non_structural', material: 'ASA', qty: 2 },
      ],
      torque: [
        ['Adapter plate to transaxle', 'M10 8.8', '40 N·m'],
        ['Coupler clamp bolt', 'M8 12.9', '35 N·m'],
        ['Rear mount to body', 'M10 8.8', '40 N·m'],
        ['Battery box to floor pan', 'M8 8.8', '24 N·m'],
        ['HV busbar terminals', 'M6', '8 N·m'],
      ],
    },
    builds: [
      { title: '1967 Beetle sedan "Pastel Volt"', kwh: 24, range: 95, stage: 'Delivered' },
      { title: '1973 Beetle convertible', kwh: 32, range: 110, stage: 'Install' },
    ],
  },

  {
    id: '911',
    make: 'Porsche', makeSlug: 'porsche', model: '911', modelSlug: '911',
    yearStart: 1974, yearEnd: 1989, shortName: '911',
    body: 'Coupe and Targa', bodyStyles: ['Coupe', 'Targa', 'Cabriolet'], art: 'coupe',
    layout: 'Rear engine, rear-wheel drive', wheelbaseMm: 2272,
    curbWeight: '2,600–2,800 lb', difficulty: 4,
    difficultyNote: 'Tight packaging and a sensitive rear weight bias make balance the whole job.',
    seo: {
      title: '1974–1989 Porsche 911 EV Conversion | RESTOVOLT',
      description: 'Engineer a 1974–1989 911 EV conversion: transaxle adapters, balanced battery layouts, brake and chassis notes, cost bands and specialist shops.',
    },
    intro:
      'An electric impact-bumper 911 has to drive like a 911. That means respecting the weight distribution that defines its handling, keeping the transaxle the car was developed around, and packaging batteries so the front end stays planted at speed.',
    sections: [
      {
        h: 'Platform history',
        p: [
          'The 1974–1989 cars are often called the impact-bumper or G-series generation, recognizable by the energy-absorbing bumpers introduced to meet US regulations. Over sixteen model years they evolved through several engine displacements and two main manual transaxle families, and were offered as coupe, Targa and, later, cabriolet.',
          'These cars sit at an interesting point in the market: valuable enough that owners care deeply about quality, but numerous enough that non-original and project cars are a realistic base for a modern, electric restomod. RESTOVOLT is independent and not affiliated with the manufacturer; we use the model name only to identify the platform.',
        ],
      },
      {
        h: 'Conversion considerations',
        p: [
          'Our designs keep the original transaxle. Separate adapter plates are drawn for the two common manual transaxle families of the era, and the pack documentation lists the identifying features for each so shops order the right one. The motor sits where the flat-six was, on a mount that uses the original rear engine-carrier points.',
          'The rear-engine layout is what makes a 911 a 911, so we do not move all the mass forward. Instead the front trunk takes one battery box where the fuel tank lived, and a smaller box sits in the rear-seat area. This keeps weight distribution close to the original rear bias while lowering the center of gravity.',
        ],
      },
      {
        h: 'Weight and packaging notes',
        p: [
          'There is very little spare volume in a 911. Current box designs package up to 58 kWh, but most owners choose 40 kWh to stay within about 400 lb of the original drivetrain weight. Above that, we strongly recommend re-valving dampers, uprating torsion bars or coilovers, and checking brake capacity.',
          'Cooling is the other packaging constraint. The pack includes a duct and radiator bracket design for the front valance so the inverter and battery coolant loops can use the airflow the original oil cooler used.',
        ],
      },
      {
        h: 'Choosing a donor 911',
        p: [
          'Corrosion in the floor pans, the front suspension pan, the kidney bowls beside the rear seats and the jacking points tells you far more than the engine does. A car with a tired or missing engine but a straight, solid body shell is the ideal conversion base and spares an original numbers-matching engine from being displaced.',
          'Have the transaxle identified and inspected before you order, because the adapter plate depends on it. A car that already has a later gearbox, upgraded brakes or coilovers will save money in the supporting-upgrades line of your budget.',
        ],
      },
      {
        h: 'Range and cost bands',
        p: [
          'A low, narrow coupe is efficient at road speeds; plan on 220–240 Wh per mile. Typical builds see {rangeLo} to {rangeHi} miles of range. Parts budgets generally fall between {partsLo} and {partsHi}, and {laborLo} to {laborHi} shop hours is a realistic labor band given the precision this platform demands. Treat these figures as sample planning bands.',
        ],
      },
    ],
    faqs: [
      { q: 'Does an electric 911 keep its original weight balance?', a: 'Close to it. RESTOVOLT layouts keep the motor in the rear and split batteries between the front trunk and the rear-seat area, preserving the rear weight bias the chassis was tuned around.' },
      { q: 'Which gearboxes are supported?', a: 'The pack includes adapter plates for the two common manual transaxle families of the 1974–1989 cars, with identification notes so you order the right one.' },
      { q: 'How much range does an electric 911 have?', a: 'Most builds see {rangeLo}–{rangeHi} miles, with 40 kWh being the most common pack size.' },
      { q: 'Is RESTOVOLT affiliated with the manufacturer?', a: 'No. RESTOVOLT is independent. Model names are used only to identify the vehicles our designs fit.' },
    ],
    config: {
      maxKwh: 58, motorSizes: ['compact', 'mid'], driveModes: ['transmission'],
      baseLaborHours: 300, whPerMile: 230, originalDrivetrainLb: 600, maxAddedLb: 400, ratedKw: 150,
      addons: [{ id: '911-cool', name: '911 Front Cooling Duct Pack', priceUsd: 260, when: 'kwhOver', kwh: 30 }],
    },
    electric: { motorAt: 'rear', boxes: [[96, 164, 120, 26], [350, 176, 110, 26]] },
    pack: {
      name: '911 Core Fitment Pack', version: '1.1', priceUsd: 890,
      engineerReviewed: '2026-09-03', fieldProven: 4,
      parts: [
        { name: 'Transaxle adapter plate (two transaxle variants)', type: 'structural', material: '7075-T6 aluminum, 14 mm', qty: 1 },
        { name: 'Motor carrier on original engine-carrier points', type: 'structural', material: '6061-T6 aluminum, 12 mm', qty: 1 },
        { name: 'Front trunk battery box', type: 'structural', material: 'Mild steel, 2.5 mm, welded', qty: 1 },
        { name: 'Rear-seat battery box', type: 'structural', material: 'Mild steel, 2.5 mm', qty: 1 },
        { name: 'Front valance radiator brackets', type: 'structural', material: '5052 aluminum, 3 mm', qty: 2 },
        { name: 'Tunnel HV cable guides', type: 'non_structural', material: 'ASA', qty: 12 },
        { name: 'Gauge-cluster SOC display bezel', type: 'non_structural', material: 'PETG', qty: 1 },
      ],
      torque: [
        ['Adapter plate to transaxle', 'M10 10.9', '50 N·m'],
        ['Motor carrier to body', 'M10 10.9', '65 N·m'],
        ['Battery box to body', 'M8 10.9', '30 N·m'],
        ['Radiator brackets', 'M6 8.8', '10 N·m'],
        ['HV busbar terminals', 'M8', '12 N·m'],
      ],
    },
    builds: [
      { title: '1984 911 Carrera coupe "Graphite"', kwh: 40, range: 135, stage: 'HV Commissioning' },
      { title: '1977 911 Targa', kwh: 40, range: 130, stage: 'Delivered' },
    ],
  },

  {
    id: 'miata',
    make: 'Mazda', makeSlug: 'mazda', model: 'MX-5 Miata', modelSlug: 'mx-5-miata',
    yearStart: 1990, yearEnd: 1997, shortName: 'Miata',
    body: 'Two-seat roadster', bodyStyles: ['Roadster'], art: 'roadster',
    layout: 'Front engine, rear-wheel drive', wheelbaseMm: 2265,
    curbWeight: '2,100–2,250 lb', difficulty: 3,
    difficultyNote: 'A modern, well-engineered chassis with very little spare space.',
    seo: {
      title: '1990–1997 Mazda Miata (NA) EV Conversion | RESTOVOLT',
      description: 'Electric NA Miata conversion planning: motor mounts, PPF-friendly adapter plates, battery box layouts, range and cost bands, and certified shops.',
    },
    intro:
      'The first-generation MX-5 is light, balanced and built around a rigid power-plant frame that ties the gearbox to the differential. Those same virtues leave little room for batteries, so a good electric NA Miata is an exercise in disciplined packaging.',
    sections: [
      {
        h: 'Platform history',
        p: [
          'Mazda launched the MX-5 Miata for the 1990 model year in North America, reviving the idea of a simple, light, front-engine, rear-drive roadster. The NA generation ran through 1997, with an early 1.6-liter engine and a later 1.8-liter. A signature engineering feature is the power-plant frame, a rigid aluminum member that connects the transmission to the differential housing.',
          'Huge production numbers and an active racing scene mean suspension, brake and chassis parts are abundant. Many NA cars that are mechanically tired but structurally sound are ideal conversion candidates.',
        ],
      },
      {
        h: 'Conversion considerations',
        p: [
          'RESTOVOLT keeps the original five-speed gearbox and power-plant frame. The motor bolts to the gearbox through an adapter plate and coupler, and the motor mounts use the original engine-mount locations. Retaining the power-plant frame preserves the drivetrain stiffness and shift quality the car is known for.',
          'Batteries split across a box in the engine bay ahead of and above the motor, and a box in the trunk and spare-tire well. Keeping the top of the front box below the hood line is the tightest constraint in the design; check hood-latch clearance during dry fit.',
        ],
      },
      {
        h: 'Weight and packaging notes',
        p: [
          'The original engine and fuel system are light, so the weight budget is small. Most builds use a 24 or 32 kWh pack; 40 kWh is the packaging ceiling for current box designs and will need spring and damper changes. Keeping mass low and between the axles protects the handling balance that makes the car worth converting.',
        ],
      },
      {
        h: 'Choosing a donor Miata',
        p: [
          'Rust on an NA Miata concentrates in the rear rocker panels just ahead of the rear wheels, where drain holes clog, and in the front frame rails. Check both carefully. Engine condition barely matters, which makes high-mileage cars with good bodies excellent value as conversion bases.',
          'Cars with the later 1.8-liter driveline have a stronger differential and slightly larger brakes, both welcome with electric torque. A sound five-speed that shifts cleanly is essential because the conversion keeps it. A hardtop is worth having too: it improves highway efficiency and quiets the cabin, which suddenly matters when there is no engine noise.',
          'Plan the cockpit while the car is apart. A small state-of-charge display in the gauge cluster and a clean switch panel for drive modes keep the interior looking original while giving the driver the information an electric car needs.',
        ],
      },
      {
        h: 'Range and cost bands',
        p: [
          'A small roadster is efficient with the top up, less so with it down at highway speed. Plan on about 200–220 Wh per mile, for {rangeLo} to {rangeHi} miles of range depending on pack size. Complete parts budgets usually fall between {partsLo} and {partsHi}, with {laborLo} to {laborHi} shop hours. These are sample planning bands; the configurator gives a build-specific estimate.',
        ],
      },
    ],
    faqs: [
      { q: 'Does the electric Miata keep its manual gearbox?', a: 'Yes. The Fitment Pack adapter plate mates the motor to the original five-speed, and the power-plant frame stays in place.' },
      { q: 'How much range does an electric NA Miata get?', a: 'Typical builds see {rangeLo}–{rangeHi} miles. A 32 kWh pack balances range and weight for most owners.' },
      { q: 'Will the conversion ruin the handling?', a: 'Not if weight is managed. Our layouts keep added mass low and between the axles; above 40 kWh we recommend suspension changes.' },
      { q: 'Does the pack fit both 1.6 and 1.8 cars?', a: 'Yes. Motor mounts use common engine-mount locations; the pack notes the minor bracket differences between early and late cars.' },
    ],
    config: {
      maxKwh: 40, motorSizes: ['compact', 'mid'], driveModes: ['transmission'],
      baseLaborHours: 220, whPerMile: 210, originalDrivetrainLb: 450, maxAddedLb: 350, ratedKw: 100,
      addons: [],
    },
    electric: { motorAt: 'front', boxes: [[74, 178, 100, 24], [470, 180, 100, 24]] },
    pack: {
      name: 'Miata Core Fitment Pack', version: '1.3', priceUsd: 590,
      engineerReviewed: '2026-05-28', fieldProven: 6,
      parts: [
        { name: 'Motor-to-gearbox adapter plate', type: 'structural', material: '6061-T6 aluminum, 14 mm', qty: 1 },
        { name: 'Motor coupler, splined', type: 'structural', material: '4140 steel, machined', qty: 1 },
        { name: 'Motor mounts (original mount locations)', type: 'structural', material: '6061-T6 aluminum, 10 mm', qty: 2 },
        { name: 'Engine-bay battery box', type: 'structural', material: 'Mild steel, 2.5 mm', qty: 1 },
        { name: 'Trunk battery box and spare-well bracket', type: 'structural', material: 'Mild steel, 2.5 mm', qty: 1 },
        { name: 'HV harness clips along tunnel', type: 'non_structural', material: 'ASA', qty: 12 },
        { name: 'Center console switch panel', type: 'non_structural', material: 'PETG', qty: 1 },
      ],
      torque: [
        ['Adapter plate to gearbox', 'M10 10.9', '45 N·m'],
        ['Coupler clamp bolt', 'M8 12.9', '35 N·m'],
        ['Motor mounts to crossmember', 'M12 10.9', '90 N·m'],
        ['Battery boxes to body', 'M8 8.8', '24 N·m'],
        ['HV busbar terminals', 'M6', '8 N·m'],
      ],
    },
    builds: [
      { title: '1991 Miata "Mariner Blue Volt"', kwh: 32, range: 125, stage: 'Delivered' },
      { title: '1996 Miata M-Edition', kwh: 24, range: 95, stage: 'Teardown' },
    ],
  },
];

// Goal presets used for hub-page recommendations and for the typical bands.
export const PRESETS = [
  { key: 'Range first', goals: { range: 3, performance: 1, budget: 1, reversibility: 'either' } },
  { key: 'Performance', goals: { range: 1, performance: 3, budget: 1, reversibility: 'either' } },
  { key: 'Balanced', goals: { range: 2, performance: 2, budget: 2, reversibility: 'either' } },
  { key: 'Budget, reversible', goals: { range: 1, performance: 1, budget: 3, reversibility: 'reversible' } },
];

const fmtUsd = (n) => '$' + n.toLocaleString('en-US');
const fill = (text, t) => text.replace(/\{(\w+)\}/g, (_, k) => t[k]);

for (const v of VEHICLES) {
  // Typical bands come from the configurator engine, so copy and estimates never disagree.
  const ests = PRESETS.map((p) => estimate(v, recommend(v, p.goals, COMPONENTS), COMPONENTS, p.goals));
  const lo = (k) => Math.min(...ests.map((e) => e[k]));
  const hi = (k) => Math.max(...ests.map((e) => e[k]));
  v.rangeBand = [Math.floor(lo('rangeLow') / 10) * 10, Math.ceil(hi('rangeHigh') / 10) * 10];
  v.partsBand = [Math.floor(lo('partsLow') / 1000) * 1000, Math.ceil(hi('partsHigh') / 1000) * 1000];
  v.laborBand = [Math.floor(lo('laborLow') / 10) * 10, Math.ceil(hi('laborHigh') / 10) * 10];
  const t = {
    rangeLo: v.rangeBand[0], rangeHi: v.rangeBand[1],
    partsLo: fmtUsd(v.partsBand[0]), partsHi: fmtUsd(v.partsBand[1]),
    laborLo: v.laborBand[0], laborHi: v.laborBand[1],
  };
  for (const sec of v.sections) sec.p = sec.p.map((x) => fill(x, t));
  for (const f of v.faqs) f.a = fill(f.a, t);
  v.name = `${v.yearStart}–${v.yearEnd} ${v.make} ${v.model}`;
  v.yearRange = `${v.yearStart}-${v.yearEnd}`;
  v.path = `/vehicles/${v.makeSlug}/${v.modelSlug}/${v.yearRange}`;
  v.packPath = `${v.path}/fitment-pack`;
  v.costPath = `/cost/${v.makeSlug}-${v.modelSlug}-ev-conversion-cost`;
  v.pack.checklist = commonChecklist;
}

export const vehicleById = (id) => VEHICLES.find((v) => v.id === id);
