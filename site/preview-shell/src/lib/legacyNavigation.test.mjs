import assert from 'node:assert/strict';
import test from 'node:test';
import { legacyNavigationDecision } from './legacyNavigation.mjs';

test('staging redirect preserves course hash and query', () => {
  const result = legacyNavigationDecision('https://bourkia.com/talk-to-ai', 'https://staging.example.com/talk-to-ai?lang=en#en/12');
  assert.deepEqual(result, { kind: 'redirect', target: 'https://bourkia.com/talk-to-ai?lang=en#en/12' });
});
test('target-specific course hash wins over page hash', () => {
  const result = legacyNavigationDecision('https://bourkia.com/talk-to-ai#dar/24', 'https://staging.example.com/other#en/04');
  assert.equal(result.target, 'https://bourkia.com/talk-to-ai#dar/24');
});
test('same-origin handoff is blocked even when path or hash differs', () => {
  for (const path of ['/workbench', '/privacy', '/talk-to-ai#en/20']) {
    assert.equal(legacyNavigationDecision(`https://bourkia.com${path}`, 'https://bourkia.com/').kind, 'unavailable');
  }
});
test('unsafe or invalid schemes cannot produce a browser redirect', () => {
  for (const value of ['javascript:alert(1)', 'http://bourkia.com/privacy', 'not a url', 'data:text/plain,unsafe']) {
    const decision = legacyNavigationDecision(value, 'https://staging.example.com/');
    assert.equal(decision.kind, 'unavailable', value);
  }
});
test('external resource links remain redirectable in staging', () => {
  const r = legacyNavigationDecision('https://bourkia.com/media/reality-101-ep2.mp4', 'https://staging.example.com/reality-101');
  assert.equal(r.kind, 'redirect');
});
