// Configurator engine: compatibility checks, estimates and recommendations.
// Pure functions shared by the browser configurator and the Node test suite.

const MISC_PARTS_USD = 3500; // HV cabling, contactors, fusing, DC-DC, coolant loop
const AUX_WEIGHT_LB = 120; // boxes, cabling, charger, DC-DC, cooling

export const byId = (components, id) => components.find((c) => c.id === id);

// Individual electrical rules, shared by the checks and the auto-picker.
export const bmsFits = (pack, bms) => pack.cellsSeries <= bms.maxSeries && pack.maxV <= bms.maxV;
export const chargerFits = (pack, chg) => pack.maxV <= chg.voltageMax && pack.nominalV >= chg.voltageMin;
export const ofCategory = (components, cat) => components.filter((c) => c.category === cat);

/**
 * Run every compatibility rule for a selection.
 * @returns {{id:string,label:string,status:'pass'|'warn'|'fail',detail:string}[]}
 */
export function checkCompat(vehicle, sel, components, goals = {}) {
  const motor = byId(components, sel.motor);
  const ctl = byId(components, sel.inverter);
  const pack = byId(components, sel.battery);
  const bms = byId(components, sel.bms);
  const chg = byId(components, sel.charger);
  const cfg = vehicle.config;
  const out = [];
  const add = (id, label, status, detail) => out.push({ id, label, status, detail });

  if (!motor || !ctl || !pack || !bms || !chg) {
    add('complete', 'Selection complete', 'fail', 'Choose a component in every category.');
    return out;
  }

  add('pair', 'Motor ↔ controller pairing',
    motor.controllers.includes(ctl.id) ? 'pass' : 'fail',
    motor.controllers.includes(ctl.id)
      ? `${ctl.name} is validated with this motor.`
      : `This motor is only validated with: ${motor.controllers.map((id) => byId(components, id)?.name || id).join(', ')}.`);

  const inMotor = pack.nominalV >= motor.voltageMin && pack.maxV <= motor.voltageMax + 10;
  const inCtl = pack.nominalV >= ctl.voltageMin && pack.maxV <= ctl.voltageMax;
  add('voltage', 'Pack voltage ↔ motor and inverter window',
    inMotor && inCtl ? 'pass' : 'fail',
    `Pack ${pack.nominalV} V nominal / ${pack.maxV} V full. Motor window ${motor.voltageMin}–${motor.voltageMax} V, inverter ${ctl.voltageMin}–${ctl.voltageMax} V.`);

  const bmsOk = bmsFits(pack, bms);
  add('bms', 'BMS channel count and voltage',
    bmsOk ? 'pass' : 'fail',
    `Pack needs ${pack.cellsSeries} series channels at ${pack.maxV} V; BMS supports ${bms.maxSeries}S / ${bms.maxV} V.`);

  const chgOk = chargerFits(pack, chg);
  add('charger', 'Charger output ↔ pack voltage',
    chgOk ? 'pass' : 'fail',
    `Charger output ${chg.voltageMin}–${chg.voltageMax} V; pack ${pack.nominalV}–${pack.maxV} V.`);

  const kwhRatio = pack.kwh / cfg.maxKwh;
  add('packaging', 'Battery packaging volume',
    kwhRatio > 1 ? 'fail' : kwhRatio > 0.85 ? 'warn' : 'pass',
    kwhRatio > 1
      ? `${pack.kwh} kWh exceeds the ${cfg.maxKwh} kWh this chassis packages with current Fitment Pack boxes.`
      : kwhRatio > 0.85
        ? `Uses ${Math.round(kwhRatio * 100)}% of available box volume. Expect tight cable routing.`
        : `${pack.kwh} kWh fits within the ${cfg.maxKwh} kWh packaging envelope.`);

  const sizeOk = cfg.motorSizes.includes(motor.size);
  const modeOk = cfg.driveModes.includes(motor.driveMode);
  add('motor-fit', 'Motor fitment in chassis',
    sizeOk && modeOk ? 'pass' : 'fail',
    !modeOk
      ? `${motor.driveMode === 'driveunit' ? 'Rear drive-unit swaps are' : 'Transmission-retained layouts are'} not supported on this platform yet.`
      : !sizeOk
        ? `A ${motor.size} motor does not package in this chassis.`
        : 'Motor packages with the platform motor mount design.');

  if (goals.reversibility === 'reversible') {
    add('reversible', 'Reversible (bolt-in) build',
      motor.driveMode === 'driveunit' ? 'fail' : 'pass',
      motor.driveMode === 'driveunit'
        ? 'Drive-unit swaps require permanent frame modification. Choose a transmission-retained motor.'
        : 'All structural parts bolt to factory mounting points.');
  }

  const delta = weightDelta(vehicle, motor, pack);
  add('weight', 'Added weight vs. original drivetrain',
    delta > cfg.maxAddedLb ? 'fail' : delta > cfg.maxAddedLb * 0.75 ? 'warn' : 'pass',
    `${delta >= 0 ? '+' : ''}${delta} lb vs. original drivetrain (limit ${cfg.maxAddedLb} lb before spring, brake and axle re-rating).`);

  const powerRatio = motor.peakKw / cfg.ratedKw;
  add('power', 'Power vs. original chassis rating',
    powerRatio > 2.5 ? 'warn' : 'pass',
    powerRatio > 2.5
      ? `${motor.peakKw} kW is ${powerRatio.toFixed(1)}× original output. Upgrade brakes and driveline, and consider a torque limit map.`
      : `${motor.peakKw} kW peak is within a sensible margin of the original ${cfg.ratedKw} kW.`);

  return out;
}

export function weightDelta(vehicle, motor, pack) {
  return Math.round(pack.weightLb + motor.weightLb + AUX_WEIGHT_LB - vehicle.config.originalDrivetrainLb);
}

export function packsNeeded(vehicle, motor, pack) {
  const needed = [{ id: 'core', name: `${vehicle.shortName} Core Fitment Pack`, priceUsd: vehicle.pack.priceUsd }];
  for (const addon of vehicle.config.addons || []) {
    if (addon.when === 'driveunit' && motor.driveMode === 'driveunit') needed.push(addon);
    if (addon.when === 'kwhOver' && pack.kwh > addon.kwh) needed.push(addon);
  }
  return needed;
}

export function estimate(vehicle, sel, components, goals = {}) {
  const items = ['motor', 'inverter', 'battery', 'bms', 'charger'].map((k) => byId(components, sel[k]));
  if (items.some((i) => !i)) return null;
  const [motor, , pack] = items;
  const packs = packsNeeded(vehicle, motor, pack);
  const parts = items.reduce((s, i) => s + i.priceUsd, 0) + MISC_PARTS_USD;
  const packCost = packs.reduce((s, p) => s + p.priceUsd, 0);
  let hours = vehicle.config.baseLaborHours;
  if (motor.driveMode === 'driveunit') hours *= 1.25;
  if (goals.reversibility === 'reversible') hours *= 0.95;
  if (pack.kwh > vehicle.config.maxKwh * 0.85) hours *= 1.1;
  const usable = pack.kwh * 0.88 * 1000;
  return {
    partsLow: round(parts * 0.88, 100),
    partsHigh: round(parts * 1.15, 100),
    packCost,
    laborLow: Math.round(hours * 0.88),
    laborHigh: Math.round(hours * 1.15),
    rangeLow: Math.round((usable / vehicle.config.whPerMile) * 0.85),
    rangeHigh: Math.round((usable / vehicle.config.whPerMile) * 1.05),
    weightDelta: weightDelta(vehicle, motor, pack),
    peakKw: motor.peakKw,
    packs,
  };
}

const round = (n, step) => Math.round(n / step) * step;

/** Cheapest BMS or charger that suits a pack. */
function cheapestFor(components, cat, pack, fits) {
  return ofCategory(components, cat).sort((a, b) => a.priceUsd - b.priceUsd).find((c) => fits(pack, c))?.id;
}

/**
 * Recommend a full drivetrain for a vehicle and goals.
 * goals: { range: 1-3, performance: 1-3, budget: 1-3 (3 = most cost sensitive), reversibility }
 */
export function recommend(vehicle, goals, components) {
  let best = null;
  for (const motor of ofCategory(components, 'motor')) {
    for (const ctlId of motor.controllers) {
      for (const pack of ofCategory(components, 'battery')) {
        const sel = {
          motor: motor.id, inverter: ctlId, battery: pack.id,
          bms: cheapestFor(components, 'bms', pack, bmsFits),
          charger: cheapestFor(components, 'charger', pack, chargerFits),
        };
        if (!sel.bms || !sel.charger) continue;
        const checks = checkCompat(vehicle, sel, components, goals);
        if (checks.some((c) => c.status === 'fail')) continue;
        const est = estimate(vehicle, sel, components, goals);
        const warns = checks.filter((c) => c.status === 'warn').length;
        const cost = (est.partsLow + est.partsHigh) / 2 + est.packCost;
        const score =
          (goals.range || 2) * (pack.kwh / vehicle.config.maxKwh) +
          (goals.performance || 2) * Math.min(motor.peakKw / (vehicle.config.ratedKw * 2.5), 1) +
          (goals.budget || 2) * (1 - Math.min(cost / 50000, 1)) * 1.4 -
          warns * 0.35;
        if (!best || score > best.score) best = { sel, score };
      }
    }
  }
  return best ? best.sel : null;
}
