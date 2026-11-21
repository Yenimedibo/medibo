import assert from 'node:assert/strict';
import test from 'node:test';
import { getTimelineResponse, parseTimelineRows, resetTimelineCacheForTests } from './timelineData.mjs';

const HEADERS = [
  'ID', 'Title', 'Start Year', 'End Year', 'Region', 'Event Type', 'Historical Period',
  'Description', 'Sources', 'Confidence', 'Review Status', 'Publication Status',
  'Latitude', 'Longitude', 'Coordinate Verification', 'Geometry', 'Geometry Verification',
];

function row(overrides = {}) {
  const defaults = {
    ID: 'synthetic-1',
    Title: 'Synthetic record',
    'Start Year': '1400 CE',
    'End Year': '',
    Region: 'Synthetic region',
    'Event Type': 'Trade',
    'Historical Period': 'Example period',
    Description: 'Synthetic fixture only.',
    Sources: 'A test reference; javascript:alert(1)',
    Confidence: 'verified',
    'Review Status': 'Approved',
    'Publication Status': 'Published',
    Latitude: '34.1',
    Longitude: '-6.8',
    'Coordinate Verification': 'Verified',
    Geometry: '',
    'Geometry Verification': '',
  };
  const value = { ...defaults, ...overrides };
  return HEADERS.map((header) => value[header] ?? '');
}

test('public records require both approved review and publication states', () => {
  const events = parseTimelineRows([
    HEADERS,
    row(),
    row({ ID: 'draft', 'Review Status': 'Draft' }),
    row({ ID: 'rejected', 'Publication Status': 'Rejected' }),
    row({ ID: 'unpublished', 'Publication Status': 'Internal' }),
    row({ ID: 'disputed-confidence', Confidence: 'Disputed' }),
  ]);
  assert.deepEqual(events.map((event) => event.id), ['synthetic-1']);
  assert.equal(events[0].startYear, 1400);
  assert.equal(events[0].latitude, 34.1);
  assert.equal(events[0].longitude, -6.8);
  assert.equal(events[0].locationPrecision, 'verified');
  assert.equal(events[0].sources[0].url, undefined);
});

test('approved synthetic sheet edits update the event year and verified location', () => {
  const original = parseTimelineRows([HEADERS, row()])[0];
  const edited = parseTimelineRows([
    HEADERS,
    row({ 'Start Year': '1412 CE', Latitude: '35.7', Longitude: '-6.1' }),
  ])[0];
  assert.equal(edited.id, original.id);
  assert.equal(edited.startYear, 1412);
  assert.equal(edited.latitude, 35.7);
  assert.equal(edited.longitude, -6.1);
  assert.equal(edited.locationPrecision, 'verified');
});

test('undated, invalid, approximate and disputed geography never creates a false point', () => {
  const events = parseTimelineRows([
    HEADERS,
    row({ ID: 'undated', 'Start Year': '', Latitude: '', Longitude: '', 'Coordinate Verification': '' }),
    row({ ID: 'invalid-coordinate', Latitude: '91', Longitude: '181' }),
    row({ ID: 'approximate', 'Coordinate Verification': 'Approximate' }),
    row({ ID: 'invalid-range', 'Start Year': '1400 CE', 'End Year': '1300 CE' }),
    row({
      ID: 'verified-line',
      'Start Year': '1200 CE',
      Geometry: JSON.stringify({ type: 'LineString', coordinates: [[-8, 30], [-7, 31]] }),
      'Geometry Verification': 'Verified',
      Latitude: '',
      Longitude: '',
      'Coordinate Verification': '',
    }),
    row({
      ID: 'disputed-shape',
      Confidence: 'disputed',
      Geometry: JSON.stringify({ type: 'Polygon', coordinates: [[[-8, 30], [-7, 30], [-7, 31], [-8, 30]]] }),
      'Geometry Verification': 'Disputed',
      Latitude: '',
      Longitude: '',
      'Coordinate Verification': '',
    }),
  ]);
  const byId = Object.fromEntries(events.map((event) => [event.id, event]));
  assert.equal(byId.undated.startYear, null);
  assert.equal(byId.undated.confidence, 'incomplete');
  assert.equal(byId.undated.locationPrecision, 'none');
  assert.equal(byId['invalid-coordinate'].locationPrecision, 'none');
  assert.equal(byId.approximate.locationPrecision, 'approximate');
  assert.equal(byId.approximate.latitude, undefined);
  assert.equal(byId['invalid-range'].startYear, null);
  assert.equal(byId['invalid-range'].endYear, undefined);
  assert.equal(byId['invalid-range'].confidence, 'incomplete');
  assert.equal(byId['verified-line'].locationPrecision, 'verified');
  assert.equal(byId['verified-line'].geometry.type, 'LineString');
  assert.equal(byId['disputed-shape'], undefined);

  const disputedPreview = parseTimelineRows([
    HEADERS,
    row({
      ID: 'disputed-preview-shape',
      Confidence: 'disputed',
      Geometry: JSON.stringify({ type: 'Polygon', coordinates: [[[-8, 30], [-7, 30], [-7, 31], [-8, 30]]] }),
      'Geometry Verification': 'Verified',
      Latitude: '',
      Longitude: '',
      'Coordinate Verification': '',
    }),
  ], { preview: true })[0];
  assert.equal(disputedPreview.confidence, 'disputed');
  assert.equal(disputedPreview.geometry, undefined);
  assert.equal(disputedPreview.locationPrecision, 'approximate');
});

test('editor preview retains drafts but excludes rejected records', () => {
  const events = parseTimelineRows([
    HEADERS,
    row({ ID: 'draft', 'Review Status': 'Draft', 'Publication Status': 'Internal' }),
    row({ ID: 'disputed', 'Review Status': 'Disputed', 'Publication Status': 'Internal', Confidence: 'disputed' }),
    row({ ID: 'approved-but-disputed', Confidence: 'disputed' }),
    row({ ID: 'rejected', 'Review Status': 'Rejected', 'Publication Status': 'Rejected' }),
  ], { preview: true });
  assert.deepEqual(events.map((event) => event.id), ['draft', 'disputed', 'approved-but-disputed']);
});

test('missing Sheets credential returns a truthful disconnected response', async () => {
  const previous = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  resetTimelineCacheForTests();
  try {
    const result = await getTimelineResponse({ userId: 'synthetic-editor-id', query: {} });
    assert.equal(result.status, 'disconnected');
    assert.deepEqual(result.events, []);
    assert.equal(result.lastSyncedAt, null);
    assert.match(result.message, /not configured/i);
  } finally {
    if (previous === undefined) delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    else process.env.GOOGLE_SERVICE_ACCOUNT_JSON = previous;
    resetTimelineCacheForTests();
  }
});

test('draft-preview data requires a server-side editor allowlist', async () => {
  const previousEditors = process.env.MEDIBO_EDITOR_USER_IDS;
  const previousCredential = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  try {
    process.env.MEDIBO_EDITOR_USER_IDS = 'medibo-editor-test-id';
    delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    resetTimelineCacheForTests();
    const denied = await getTimelineResponse({ userId: 'unlisted-test-id', query: { mode: 'preview' } });
    assert.deepEqual(denied, { status: 403 });
    const allowedButDisconnected = await getTimelineResponse({
      userId: 'medibo-editor-test-id',
      query: { mode: 'preview' },
    });
    assert.equal(allowedButDisconnected.status, 'disconnected');
    assert.equal(allowedButDisconnected.canPreviewDrafts, true);
    assert.deepEqual(allowedButDisconnected.events, []);
  } finally {
    if (previousEditors === undefined) delete process.env.MEDIBO_EDITOR_USER_IDS;
    else process.env.MEDIBO_EDITOR_USER_IDS = previousEditors;
    if (previousCredential === undefined) delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    else process.env.GOOGLE_SERVICE_ACCOUNT_JSON = previousCredential;
    resetTimelineCacheForTests();
  }
});
