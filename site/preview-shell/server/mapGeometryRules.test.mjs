import test from 'node:test';
import assert from 'node:assert/strict';
import { geometryMatchesFeatureType as match } from './mapGeometryRules.mjs';

const line = { type: 'LineString', coordinates: [[-8, 32], [-6, 35]] };
const polygon = { type: 'Polygon', coordinates: [[[-8, 32], [-6, 32], [-6, 35], [-8, 32]]] };

test('documented routes require usable lines, never areas or points', () => {
  assert.equal(match('Route', line), true);
  assert.equal(match('route', {type: 'MultiLineString', coordinates: [line.coordinates, [[-6, 35], [-3, 36]]]}), true);
  assert.equal(match('Route', polygon), false);
  assert.equal(match('Route', {type: 'Point', coordinates: [-8, 32]}), false);
  assert.equal(match('Route', {type: 'LineString', coordinates: [[-8, 32], [-8, 32]]}), false);
  assert.equal(match('Route', {type: 'MultiLineString', coordinates: [line.coordinates, [[1, 1], [1, 1]]]}), false);
});

test('historical territories and climate impact areas require real polygons', () => {
  assert.equal(match('Territory', polygon), true);
  assert.equal(match('Area', polygon), true);
  assert.equal(match('Area', {type:'MultiPolygon', coordinates:[polygon.coordinates]}), true);
  assert.equal(match('Area', line), false);
  assert.equal(match('Territory', {type:'Polygon', coordinates: [[[-8, 32], [-7, 32], [-6, 32], [-8, 32]]]}), false);
  assert.equal(match('Area', {type:'Polygon', coordinates: [[[1, 1], [1, 1], [1, 1], [1, 1]]]}), false);
});

test('malformed, out-of-range and non-finite coordinates are rejected', () => {
  for (const points of [
    [[181, 10], [-5, 35]],
    [[-8, 95], [-5, 35]],
    [[-8, NaN], [-5, 35]],
    [[-8, Infinity], [-5, 35]],
    [[-8, '32'], [-5, 35]],
    [[-8, 32, 2], [-5, 35]],
  ]) assert.equal(match('Route', {type:'LineString', coordinates:points}), false);
  assert.equal(match('Area', {type:'Polygon', coordinates: [[[-8,32],[-6,32],[-8,35]]]}), false);
  assert.equal(match('Area', {type:'MultiPolygon', coordinates: []}), false);
});

test('unknown and point feature types never acquire polygon/route geometry', () => {
  for (const name of ['Context only', 'Point', '', 'Mining', 'Diamond', 'Disaster']) {
    assert.equal(match(name, line), false);
    assert.equal(match(name, polygon), false);
  }
  assert.equal(match('Route', null), false);
  assert.equal(match('Route', 'untrusted text'), false);
});
