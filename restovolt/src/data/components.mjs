// Drivetrain component catalog used by the configurator and marketplace previews.
// SAMPLE DATA: specs and prices are representative placeholders, not partner listings.
export const COMPONENTS = [
  // Motors. `controllers` lists the controller/inverter ids each motor is validated with.
  // driveMode: 'transmission' keeps the gearbox via an adapter plate; 'driveunit' replaces the rear axle.
  {
    id: 'mot-ac90', category: 'motor', name: 'Kit AC induction motor, 90 kW peak',
    condition: 'new', voltageMin: 96, voltageMax: 175, peakKw: 90, weightLb: 115,
    priceUsd: 5800, size: 'compact', driveMode: 'transmission', controllers: ['inv-lv650'],
  },
  {
    id: 'mot-pm150', category: 'motor', name: 'Kit permanent-magnet motor, 150 kW peak',
    condition: 'new', voltageMin: 250, voltageMax: 420, peakKw: 150, weightLb: 130,
    priceUsd: 9400, size: 'mid', driveMode: 'transmission', controllers: ['inv-hv400'],
  },
  {
    id: 'mot-du-small', category: 'motor', name: 'OEM rear drive unit, compact (salvage, tested)',
    condition: 'salvage-tested', voltageMin: 280, voltageMax: 410, peakKw: 200, weightLb: 200,
    priceUsd: 4200, size: 'mid', driveMode: 'driveunit', controllers: ['ctl-oem'],
  },
  {
    id: 'mot-du-large', category: 'motor', name: 'OEM rear drive unit, large (salvage, tested)',
    condition: 'salvage-tested', voltageMin: 300, voltageMax: 410, peakKw: 300, weightLb: 290,
    priceUsd: 5600, size: 'large', driveMode: 'driveunit', controllers: ['ctl-oem'],
  },

  // Controllers and inverters.
  { id: 'inv-lv650', category: 'inverter', name: 'Low-voltage AC controller, 650 A', condition: 'new', voltageMin: 96, voltageMax: 175, weightLb: 22, priceUsd: 4900 },
  { id: 'inv-hv400', category: 'inverter', name: 'HV inverter, 400 V class', condition: 'new', voltageMin: 250, voltageMax: 450, weightLb: 26, priceUsd: 6200 },
  { id: 'ctl-oem', category: 'inverter', name: 'OEM drive-unit control board (third-party)', condition: 'new', voltageMin: 250, voltageMax: 420, weightLb: 3, priceUsd: 1850 },

  // Battery packs, assembled from modules into Fitment Pack battery boxes.
  { id: 'bat-lv32', category: 'battery', name: '32 kWh · 137 V pack (salvage OEM modules, 36S)', condition: 'salvage-tested', kwh: 32, nominalV: 137, maxV: 151, cellsSeries: 36, weightLb: 420, priceUsd: 7600 },
  { id: 'bat-hv24', category: 'battery', name: '24 kWh · 355 V pack (salvage pouch modules, 96S)', condition: 'salvage-tested', kwh: 24, nominalV: 355, maxV: 403, cellsSeries: 96, weightLb: 420, priceUsd: 7900 },
  { id: 'bat-hv40', category: 'battery', name: '40 kWh · 355 V pack (salvage pouch modules, 96S)', condition: 'salvage-tested', kwh: 40, nominalV: 355, maxV: 403, cellsSeries: 96, weightLb: 640, priceUsd: 9800 },
  { id: 'bat-hv58', category: 'battery', name: '58 kWh · 355 V pack (salvage OEM modules, 96S)', condition: 'salvage-tested', kwh: 58, nominalV: 355, maxV: 403, cellsSeries: 96, weightLb: 840, priceUsd: 13500 },
  { id: 'bat-hv85', category: 'battery', name: '85 kWh · 350 V pack (16 salvage OEM modules, 96S)', condition: 'salvage-tested', kwh: 85, nominalV: 350, maxV: 403, cellsSeries: 96, weightLb: 1180, priceUsd: 17900 },

  // Battery management.
  { id: 'bms-lv', category: 'bms', name: 'Modular BMS, up to 48S / 200 V', condition: 'new', maxSeries: 48, maxV: 200, weightLb: 6, priceUsd: 1150 },
  { id: 'bms-hv', category: 'bms', name: 'Modular BMS, up to 112S / 470 V', condition: 'new', maxSeries: 112, maxV: 470, weightLb: 9, priceUsd: 2400 },

  // Onboard chargers.
  { id: 'chg-lv66', category: 'charger', name: '6.6 kW onboard charger, 100–200 V output', condition: 'new', voltageMin: 100, voltageMax: 200, weightLb: 18, priceUsd: 1600 },
  { id: 'chg-hv66', category: 'charger', name: '6.6 kW onboard charger, 250–450 V output', condition: 'new', voltageMin: 250, voltageMax: 450, weightLb: 18, priceUsd: 2100 },
];

export const CATEGORY_LABELS = {
  motor: 'Motor / drive unit',
  inverter: 'Inverter / controller',
  battery: 'Battery pack',
  bms: 'Battery management (BMS)',
  charger: 'Onboard charger',
};
