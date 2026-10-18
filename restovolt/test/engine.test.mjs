import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkCompat, estimate, recommend, packsNeeded, byId } from '../src/assets/engine.js';
import { COMPONENTS } from '../src/data/components.mjs';
import { VEHICLES, vehicleById } from '../src/data/vehicles.mjs';

const status = (checks, id) => checks.find((c) => c.id === id)?.status;
const GOALS = [
  { range: 3, performance: 1, budget: 1, reversibility: 'either' },
  { range: 1, performance: 3, budget: 1, reversibility: 'either' },
  { range: 1, performance: 1, budget: 3, reversibility: 'reversible' },
  { range: 2, performance: 2, budget: 2, reversibility: 'permanent' },
];

test('every vehicle gets a fully compatible recommendation for every goal preset', () => {
  for (const v of VEHICLES) {
    for (const g of GOALS) {
      const sel = recommend(v, g, COMPONENTS);
      assert.ok(sel, `${v.id} has a recommendation`);
      const fails = checkCompat(v, sel, COMPONENTS, g).filter((c) => c.status === 'fail');
      assert.deepEqual(fails, [], `${v.id} ${JSON.stringify(g)}`);
    }
  }
});

test('reversible builds never recommend a drive-unit swap', () => {
  const c10 = vehicleById('c10');
  for (const g of GOALS) {
    const sel = recommend(c10, { ...g, reversibility: 'reversible' }, COMPONENTS);
    assert.notEqual(byId(COMPONENTS, sel.motor).driveMode, 'driveunit');
  }
});

test('mismatched motor and controller fails pairing', () => {
  const sel = { motor: 'mot-ac90', inverter: 'inv-hv400', battery: 'bat-lv32', bms: 'bms-lv', charger: 'chg-lv66' };
  assert.equal(status(checkCompat(vehicleById('c10'), sel, COMPONENTS), 'pair'), 'fail');
});

test('low-voltage motor on a 355 V pack fails the voltage window', () => {
  const sel = { motor: 'mot-ac90', inverter: 'inv-lv650', battery: 'bat-hv40', bms: 'bms-hv', charger: 'chg-hv66' };
  assert.equal(status(checkCompat(vehicleById('c10'), sel, COMPONENTS), 'voltage'), 'fail');
});

test('BMS without enough series channels fails', () => {
  const sel = { motor: 'mot-pm150', inverter: 'inv-hv400', battery: 'bat-hv40', bms: 'bms-lv', charger: 'chg-hv66' };
  assert.equal(status(checkCompat(vehicleById('c10'), sel, COMPONENTS), 'bms'), 'fail');
});

test('oversized pack fails packaging on small platforms', () => {
  const sel = { motor: 'mot-pm150', inverter: 'inv-hv400', battery: 'bat-hv85', bms: 'bms-hv', charger: 'chg-hv66' };
  const checks = checkCompat(vehicleById('beetle'), sel, COMPONENTS);
  assert.equal(status(checks, 'packaging'), 'fail');
  assert.equal(status(checks, 'weight'), 'fail');
});

test('drive units are rejected where the platform does not support them', () => {
  const sel = { motor: 'mot-du-small', inverter: 'ctl-oem', battery: 'bat-hv40', bms: 'bms-hv', charger: 'chg-hv66' };
  assert.equal(status(checkCompat(vehicleById('bronco'), sel, COMPONENTS), 'motor-fit'), 'fail');
  assert.equal(status(checkCompat(vehicleById('c10'), sel, COMPONENTS), 'motor-fit'), 'pass');
});

test('estimates are ordered bands and add-on packs follow their rules', () => {
  const c10 = vehicleById('c10');
  const sel = { motor: 'mot-du-large', inverter: 'ctl-oem', battery: 'bat-hv85', bms: 'bms-hv', charger: 'chg-hv66' };
  const est = estimate(c10, sel, COMPONENTS, {});
  assert.ok(est.partsLow < est.partsHigh && est.laborLow < est.laborHigh && est.rangeLow < est.rangeHigh);
  const ids = packsNeeded(c10, byId(COMPONENTS, sel.motor), byId(COMPONENTS, sel.battery)).map((p) => p.id);
  assert.deepEqual(ids, ['core', 'c10-du', 'c10-ext']);
});
