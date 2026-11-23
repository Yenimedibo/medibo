import assert from 'node:assert/strict';
import test from 'node:test';
import { centuryPeriod } from './centuryPeriod.mjs';

test('uses exact historical century boundaries, including 500 CE', () => {
  assert.equal(centuryPeriod(500), '5th century CE');
  assert.equal(centuryPeriod(501), '6th century CE');
  assert.equal(centuryPeriod(600), '6th century CE');
  assert.equal(centuryPeriod(601), '7th century CE');
  assert.equal(centuryPeriod(1000), '10th century CE');
  assert.equal(centuryPeriod(1001), '11th century CE');
  assert.equal(centuryPeriod(1200), '12th century CE');
  assert.equal(centuryPeriod(1201), '13th century CE');
  assert.equal(centuryPeriod(1900), '19th century CE');
  assert.equal(centuryPeriod(2000), '20th century CE');
  assert.equal(centuryPeriod(2001), '21st century CE');
  assert.equal(centuryPeriod(2026), '21st century CE');
});

test('does not invent periods for invalid, incomplete or out-of-scope dates', () => {
  for (const year of [null, undefined, NaN, Infinity, -1, 0, 499, 2027, 505.3, '1500']) {
    assert.equal(centuryPeriod(year), 'Unclassified');
  }
});
