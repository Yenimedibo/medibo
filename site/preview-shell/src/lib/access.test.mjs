import assert from 'node:assert/strict';
import test from 'node:test';
import { safeReturnTarget, signInPath } from './accessTargets.mjs';

const origin = 'https://preview.invalid';

test('return destinations preserve only approved project routes and course hashes', () => {
  assert.equal(safeReturnTarget('/timeline-map', origin), '/timeline-map');
  assert.equal(safeReturnTarget('/reality-101#episode-2', origin), '/reality-101#episode-2');
  assert.equal(safeReturnTarget('/reality-101', origin, '#episode-1'), '/reality-101#episode-1');
  assert.equal(
    safeReturnTarget('https://bourkia.com/talk-to-ai#dar/12', origin),
    'https://bourkia.com/talk-to-ai#dar/12',
  );
  assert.equal(
    safeReturnTarget('https://bourkia.com/talk-to-ai#en/lab-research', origin),
    'https://bourkia.com/talk-to-ai#en/lab-research',
  );
  assert.equal(
    safeReturnTarget('https://bourkia.com/talk-to-ai', origin, '#dar/24'),
    'https://bourkia.com/talk-to-ai#dar/24',
  );
  assert.equal(
    safeReturnTarget('https://bourkia.com/talk-to-ai#dar/not-a-route', origin),
    'https://bourkia.com/talk-to-ai',
  );
  assert.equal(
    safeReturnTarget('https://bourkia.com/workbench#dar/01', origin),
    'https://bourkia.com/workbench',
  );
  assert.equal(safeReturnTarget('https://example.org/anything', origin), '/');
  assert.equal(safeReturnTarget('//example.org/anything', origin), '/');
  assert.equal(
    signInPath('https://bourkia.com/talk-to-ai#en/01', origin),
    '/sign-in?returnTo=https%3A%2F%2Fbourkia.com%2Ftalk-to-ai%23en%2F01',
  );
});
