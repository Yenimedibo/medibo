import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SHEET_RANGES, rowsToRecords, parseMapLayers, parseTimelineRows, buildTimelineResponse,
  getTimelineResponse, resetTimelineCacheForTests,
} from './timelineData.mjs';

// Header labels below are reported in the supplied schema handoff.
// All event and source records are synthetic and no workbook values are included.
const EVENT_HEADERS = [
  'Map Event ID', 'Original Event ID', 'Start Year', 'End Year', 'Region', 'Country / Polity',
  'Event Type', 'Record Type', 'Event Title', 'Event / Development', 'System / Context',
  'Causes / Drivers', 'Consequences / Transition', 'Key Actors / Entities', 'Location Name',
  'Latitude', 'Longitude', 'Geometry ID / URL', 'Date Precision', 'Location Accuracy',
  'Feature Type', 'Sources', 'Confidence', 'Evidence Status', 'Review Status',
  'Publication Status', 'Media References', 'Original Audit Status', 'Notes',
  'Master Timeline Link', 'Map Placement Status', 'Data QA Issues', 'Public Event Ready',
  'Map Feature Ready', 'Map Layer ID', 'Layer Subtype', 'Linked Map Feature ID',
];
const SOURCE_HEADERS = ['ID', 'Source / institution', 'Coverage / use', 'URL'];
const LAYER_HEADERS = ['Map Layer ID', 'Layer Name', 'Default Visible', 'Publication Status', 'Sort Order', 'Description'];
const sourceTable = [
  SOURCE_HEADERS,
  ['S1', 'Synthetic academic source', 'Location and date', 'https://example.org/source-1'],
  ['S2', 'Synthetic research book', 'Illustrative period', 'https://example.org/source-2'],
];
const layerTable = [
  LAYER_HEADERS,
  ['historical_events', 'Historical Events', 'ON', 'Approved', 1, 'Synthetic event layer.'],
  ['climate_disasters', 'Climate & Natural Disasters', 'OFF', 'Approved', 2, 'Synthetic climate layer.'],
  ['trade_resources', 'Trade Routes & Resources', 'OFF', 'Approved', 3, 'Synthetic trade and resources layer.'],
];
const mapHeaderIndex = Object.fromEntries(EVENT_HEADERS.map((name, index) => [name, index]));

function row(overrides = {}) {
  const values = {
    'Map Event ID': 'MAP-TEST-1400-001',
    'Original Event ID': 'TEST-1400-001',
    'Start Year': 1400,
    'End Year': '',
    Region: 'Morocco',
    'Event Type': 'Trade',
    'Record Type': 'Event',
    'Event Title': 'Synthetic event',
    'Event / Development': 'Synthetic research fixture.',
    'Location Name': 'Synthetic point',
    Latitude: 34.1,
    Longitude: -6.8,
    'Date Precision': 'Exact year',
    'Location Accuracy': 'Exact',
    'Feature Type': 'Point',
    Sources: 'S1; S2',
    Confidence: 'HIGH',
    'Evidence Status': 'Fully checked',
    'Review Status': 'Reviewed',
    'Publication Status': 'Approved',
    'Map Placement Status': 'Ready',
    'Public Event Ready': 'YES',
    'Map Feature Ready': 'YES',
    'Map Layer ID': 'historical_events',
    'Layer Subtype': 'Documented event',
    'Linked Map Feature ID': 'FEATURE-TEST-1',
    ...overrides,
  };
  const result = new Array(EVENT_HEADERS.length).fill('');
  for (const [name, value] of Object.entries(values)) {
    assert.ok(Object.hasOwn(mapHeaderIndex, name), `Unknown schema header in synthetic test: ${name}`);
    result[mapHeaderIndex[name]] = value;
  }
  return result;
}

const parse = (rows, preview = false, layerRows = layerTable) =>
  parseTimelineRows([EVENT_HEADERS, ...rows], {
    preview,
    sources: sourceTable,
    layers: parseMapLayers(layerRows, { preview }),
  });

test('adapter ranges are bounded and refer to the five documented workbook tabs', () => {
  assert.deepEqual(Object.keys(SHEET_RANGES).sort(), ['context', 'events', 'layers', 'methodology', 'sources']);
  assert.equal(SHEET_RANGES.events, "'Map Events'!A1:AK2500");
  assert.equal(SHEET_RANGES.layers, "'Map Layers'!A1:Z200");
  assert.equal(SHEET_RANGES.context, "'Master Timeline'!A4:D1531");
  assert.equal(SHEET_RANGES.sources, "'Sources'!A1:D200");
  assert.equal(SHEET_RANGES.methodology, "'Methodology'!A1:B100");
});

test('documented Map Events schema maps stable ID, content, date, location and resolved source IDs', () => {
  const event = parse([row()])[0];
  assert.equal(event.id, 'MAP-TEST-1400-001');
  assert.equal(event.originalEventId, 'TEST-1400-001');
  assert.equal(event.title, 'Synthetic event');
  assert.equal(event.description, 'Synthetic research fixture.');
  assert.equal(event.startYear, 1400);
  assert.equal(event.latitude, 34.1);
  assert.equal(event.longitude, -6.8);
  assert.equal(event.locationPrecision, 'verified');
  assert.equal(event.layerId, 'historical_events');
  assert.equal(event.layerName, 'Historical Events');
  assert.equal(event.layerSubtype, 'Documented event');
  assert.equal(event.linkedMapFeatureId, 'FEATURE-TEST-1');
  assert.equal(event.period, 'Unclassified');
  assert.deepEqual(event.sources.map(source => source.url), [
    'https://example.org/source-1',
    'https://example.org/source-2',
  ]);
  assert.match(event.sources[0].label, /S1/);
  const commaSeparated = parse([row({ Sources: 'S1, S2' })])[0];
  assert.deepEqual(commaSeparated.sources.map(source => source.url), [
    'https://example.org/source-1',
    'https://example.org/source-2',
  ]);
});

test('public records require all approval, evidence and readiness statuses', () => {
  const cases = [
    { 'Map Event ID': 'DRAFT', 'Publication Status': 'Draft' },
    { 'Map Event ID': 'PREVIEW', 'Publication Status': 'Preview' },
    { 'Map Event ID': 'REJECTED', 'Review Status': 'Rejected' },
    { 'Map Event ID': 'NOT-REVIEWED', 'Review Status': 'Needs review' },
    { 'Map Event ID': 'NOT-CHECKED', 'Evidence Status': 'Unassessed' },
    { 'Map Event ID': 'FORMULA-NO', 'Public Event Ready': 'NO' },
    { 'Map Event ID': 'NO-TITLE', 'Event Title': '' },
    { 'Map Event ID': 'NO-DESC', 'Event / Development': '' },
    { 'Map Event ID': 'NO-DATE', 'Start Year': '' },
    { 'Map Event ID': 'BAD-DATE', 'Date Precision': 'Unassessed' },
    { 'Map Event ID': 'NO-SOURCES', Sources: '' },
    { 'Map Event ID': 'UNKNOWN-SOURCE', Sources: 'S99' },
    { 'Map Event ID': 'UNKNOWN-LAYER', 'Map Layer ID': 'not-in-layer-sheet' },
    { 'Map Event ID': 'YEAR-OOB', 'Start Year': 2027 },
    { 'Map Event ID': 'YEAR-INVALID', 'Start Year': '14th century' },
    { 'Map Event ID': 'WRONG-RANGE', 'End Year': 1300 },
  ];
  const events = parse([row(), ...cases.map(value => row(value))]);
  assert.deepEqual(events.map(event => event.id), ['MAP-TEST-1400-001']);
  assert.equal(parse([row({ 'Date Precision': 'Disputed' })])[0].confidence, 'disputed');
});

test('editor preview includes untitled drafts with provisional labels but excludes rejected rows', () => {
  const events = parse([
    row({
      'Map Event ID': 'MAP-OLD-DRAFT-001',
      'Event Title': '',
      'Date Precision': '',
      'Evidence Status': 'Unassessed',
      'Review Status': 'Needs review',
      'Publication Status': 'Draft',
      'Public Event Ready': 'NO',
      'Map Feature Ready': 'NO',
      'Feature Type': 'Context only',
      Latitude: '',
      Longitude: '',
    }),
    row({ 'Map Event ID': 'MAP-REJECTED', 'Publication Status': 'Rejected' }),
  ], true);
  assert.equal(events.length, 1);
  assert.equal(events[0].id, 'MAP-OLD-DRAFT-001');
  assert.equal(events[0].title, 'Unreviewed record MAP-OLD-DRAFT-001');
  assert.equal(events[0].locationPrecision, 'none');
});

test('only ready, exact, valid geography creates a marker', () => {
  const events = parse([
    row({ 'Map Event ID': 'MAPPED' }),
    row({ 'Map Event ID': 'LOCATION-APPROXIMATE', 'Location Accuracy': 'Approximate' }),
    row({ 'Map Event ID': 'PLACEMENT-NOT-READY', 'Map Placement Status': 'Pending verification' }),
    row({ 'Map Event ID': 'GEO-FORMULA-NO', 'Map Feature Ready': 'NO' }),
    row({ 'Map Event ID': 'INVALID-COORDS', Latitude: 91 }),
    row({ 'Map Event ID': 'BLANK-COORDS', Latitude: '', Longitude: '' }),
    row({ 'Map Event ID': 'CONTEXT', 'Feature Type': 'Context only' }),
  ]);
  assert.equal(events.length, 7);
  assert.deepEqual(events.filter(event => event.latitude !== undefined).map(event => event.id), ['MAPPED']);
  assert.equal(events.find(event => event.id === 'LOCATION-APPROXIMATE').locationPrecision, 'approximate');
  assert.ok(events.filter(event => !['MAPPED', 'LOCATION-APPROXIMATE'].includes(event.id))
    .every(event => event.locationPrecision === 'none'));
});

test('inline GeoJSON is validated; remote geometry IDs and URLs are never fetched', () => {
  const geometry = JSON.stringify({
    type: 'Polygon',
    coordinates: [[[-8, 30], [-7, 30], [-7, 31], [-8, 30]]],
  });
  const events = parse([
    row({ 'Map Event ID': 'POLYGON', 'Feature Type': 'Territory', 'Geometry ID / URL': geometry, Latitude: '', Longitude: '' }),
    row({ 'Map Event ID': 'URL', 'Feature Type': 'Territory', 'Geometry ID / URL': 'https://example.org/shape.geojson', Latitude: '', Longitude: '' }),
    row({
      'Map Event ID': 'OPEN-RING',
      'Feature Type': 'Territory',
      'Geometry ID / URL': JSON.stringify({ type: 'Polygon', coordinates: [[[-8, 30], [-7, 30], [-7, 31], [-8, 31]]] }),
      Latitude: '',
      Longitude: '',
    }),
  ]);
  assert.equal(events[0].geometry.type, 'Polygon');
  assert.equal(events[1].geometry, undefined);
  assert.equal(events[2].geometry, undefined);
  assert.equal(events[2].locationPrecision, 'none');
});

test('source IDs resolve to safe catalog links and unsafe schemes are not linked', () => {
  const preview = parse([row({ Sources: 'S1; javascript:alert(1)' })], true)[0];
  assert.equal(preview.sources[0].url, 'https://example.org/source-1');
  assert.equal(preview.sources[1].url, undefined);
  assert.deepEqual(parse([row({ Sources: 'S1; javascript:alert(1)' })]), []);
});

test('synthetic year/location edits update the same event', () => {
  const before = parse([row()])[0];
  const after = parse([row({ 'Start Year': 1412, Latitude: 35.7, Longitude: -6.1 })])[0];
  assert.equal(before.id, after.id);
  assert.equal(after.startYear, 1412);
  assert.deepEqual([after.latitude, after.longitude], [35.7, -6.1]);
});

test('server filters events by year, region and event type using documented columns', () => {
  const eventRows = [
    EVENT_HEADERS,
    row({ 'Map Event ID': 'TRADE-MOROCCO', 'Start Year': 1200 }),
    row({ 'Map Event ID': 'POLITICS-MOROCCO', 'Start Year': 1500, 'Event Type': 'Politics' }),
    row({ 'Map Event ID': 'TRADE-EGYPT', 'Start Year': 1600, Region: 'Egypt' }),
  ];
  const workbook = {
    events: rowsToRecords(eventRows),
    layers: rowsToRecords(layerTable),
    sources: rowsToRecords(sourceTable),
    context: [],
    methodology: [],
  };
  const result = buildTimelineResponse({
    workbook,
    query: { from: '1100', to: '1300', region: 'morocco', topic: 'trade' },
  });
  assert.deepEqual(result.events.map(event => event.id), ['TRADE-MOROCCO']);
  const acrossLayers = buildTimelineResponse({
    workbook,
    query: {
      from: '1100',
      to: '1700',
      region: 'morocco',
      topic: 'trade',
      layers: 'historical_events,climate_disasters',
    },
  });
  assert.deepEqual(acrossLayers.events.map(event => event.id), ['TRADE-MOROCCO']);
});

test('period is not inferred from Record Type when the documented event sheet has no period column', () => {
  const event = parse([row({ 'Record Type': 'Continuity' })])[0];
  assert.equal(event.period, 'Unclassified');
});

test('unapproved annual context and methodology stay editor-only', () => {
  const workbook = {
    events: rowsToRecords([EVENT_HEADERS, row()]),
    layers: rowsToRecords(layerTable),
    sources: rowsToRecords(sourceTable),
    context: rowsToRecords([
      ['Year', 'Record Type', 'Selected region — events / developments', 'Morocco — Events'],
      [1400, 'Continuity', 'Private selected region', 'Unapproved draft historical analysis'],
    ]),
    methodology: rowsToRecords([['Field', 'Rule'], ['Research notes', 'Unapproved internal methodology']]),
    lastSyncedAt: '2026-11-21T00:00:00Z',
  };
  const publicData = buildTimelineResponse({ workbook });
  assert.equal(publicData.status, 'ready');
  assert.equal(publicData.events.length, 1);
  assert.deepEqual(publicData.context, []);
  assert.deepEqual(publicData.methodology, []);
  const previewData = buildTimelineResponse({ workbook, preview: true, canPreviewDrafts: true });
  assert.equal(previewData.context[0].year, 1400);
  assert.match(previewData.context[0].summary, /Unapproved/);
  assert.match(previewData.methodology[0].detail, /Unapproved/);
});

test('Map Layers tab supplies the three default switch states and filters unpublished definitions', () => {
  const layers = parseMapLayers([
    ...layerTable,
    ['research_drafts', 'Research drafts', 'ON', 'Draft', 4, 'Not public.'],
  ]);
  assert.deepEqual(layers.map(layer => [layer.id, layer.name, layer.defaultVisible]), [
    ['historical_events', 'Historical Events', true],
    ['climate_disasters', 'Climate & Natural Disasters', false],
    ['trade_resources', 'Trade Routes & Resources', false],
  ]);
  assert.equal(layers.some(layer => layer.id === 'research_drafts'), false);
  assert.equal(parseMapLayers([
    ...layerTable,
    ['research_drafts', 'Research drafts', 'ON', 'Draft', 4, 'Not public.'],
  ], { preview: true }).some(layer => layer.id === 'research_drafts'), true);
  const editedDefaults = parseMapLayers([
    LAYER_HEADERS,
    ['historical_events', 'Historical Events', 'OFF', 'Approved', 1, ''],
    ['climate_disasters', 'Climate & Natural Disasters', 'ON', 'Approved', 2, ''],
    ['trade_resources', 'Trade Routes & Resources', 'OFF', 'Approved', 3, ''],
  ]);
  assert.deepEqual(editedDefaults.map(layer => [layer.id, layer.defaultVisible]), [
    ['historical_events', false],
    ['climate_disasters', true],
    ['trade_resources', false],
  ]);
});

test('layer visibility filters chronology and map features for independent, combined, and all-off selections', () => {
  const rows = [
    EVENT_HEADERS,
    row({ 'Map Event ID': 'HISTORY-1', 'Map Layer ID': 'historical_events' }),
    row({
      'Map Event ID': 'CLIMATE-1',
      'Map Layer ID': 'climate_disasters',
      'Layer Subtype': 'Storm',
      'Linked Map Feature ID': 'FEATURE-STORM',
      'Event Type': 'Natural disaster',
    }),
    row({
      'Map Event ID': 'TRADE-1',
      'Map Layer ID': 'trade_resources',
      'Layer Subtype': 'Documented historical trade',
      'Linked Map Feature ID': 'FEATURE-TRADE-ROUTE',
      'Feature Type': 'Route',
      'Geometry ID / URL': JSON.stringify({ type: 'LineString', coordinates: [[-8, 30], [-7, 31]] }),
      Latitude: '',
      Longitude: '',
    }),
  ];
  const workbook = {
    events: rowsToRecords(rows),
    layers: rowsToRecords(layerTable),
    sources: rowsToRecords(sourceTable),
    context: [],
    methodology: [],
  };
  const defaults = buildTimelineResponse({ workbook });
  assert.deepEqual(defaults.selectedLayerIds, ['historical_events']);
  assert.deepEqual(defaults.events.map(event => event.id), ['HISTORY-1']);

  const climateOnly = buildTimelineResponse({ workbook, query: { layers: 'climate_disasters' } });
  assert.deepEqual(climateOnly.events.map(event => event.id), ['CLIMATE-1']);
  assert.equal(climateOnly.events[0].layerSubtype, 'Storm');

  const combined = buildTimelineResponse({ workbook, query: { layers: 'historical_events,trade_resources' } });
  assert.deepEqual(combined.events.map(event => event.id), ['HISTORY-1', 'TRADE-1']);
  assert.equal(combined.events[1].linkedMapFeatureId, 'FEATURE-TRADE-ROUTE');
  assert.equal(combined.events[1].geometry.type, 'LineString');

  const allOff = buildTimelineResponse({ workbook, query: { layers: '' } });
  assert.deepEqual(allOff.selectedLayerIds, []);
  assert.deepEqual(allOff.events, []);
  assert.match(allOff.message, /no records match/i);
});

test('draft layer definitions and research rows stay out of public mode but appear in editor preview', () => {
  const layers = [
    ...layerTable,
    ['research_drafts', 'Research drafts', 'ON', 'Draft', 4, 'Editor-only category.'],
  ];
  const workbook = {
    events: rowsToRecords([
      EVENT_HEADERS,
      row({
        'Map Event ID': 'DRAFT-ONLY',
        'Map Layer ID': 'research_drafts',
        'Evidence Status': 'Unassessed',
        'Review Status': 'Needs review',
        'Publication Status': 'Draft',
        'Public Event Ready': 'NO',
        'Map Feature Ready': 'NO',
      }),
    ]),
    layers: rowsToRecords(layers),
    sources: rowsToRecords(sourceTable),
    context: [],
    methodology: [],
  };
  const publicView = buildTimelineResponse({ workbook });
  assert.equal(publicView.layers.some(layer => layer.id === 'research_drafts'), false);
  assert.deepEqual(publicView.events, []);
  const editorView = buildTimelineResponse({
    workbook,
    query: { mode: 'preview', layers: 'research_drafts' },
    preview: true,
    canPreviewDrafts: true,
  });
  assert.equal(editorView.layers.some(layer => layer.id === 'research_drafts'), true);
  assert.deepEqual(editorView.events.map(event => event.id), ['DRAFT-ONLY']);
});

test('new approved layer definitions become selectable without adapter changes', () => {
  const expandedLayers = [
    ...layerTable,
    ['future_archives', 'Future archives', 'ON', 'Approved', 4, 'Synthetic future category.'],
    ['future_hidden', 'Future hidden category', '', 'Approved', 5, 'Synthetic blank default.'],
  ];
  const parsed = parseMapLayers(expandedLayers);
  assert.equal(parsed.find(layer => layer.id === 'future_archives')?.name, 'Future archives');
  assert.equal(parsed.find(layer => layer.id === 'future_archives').defaultVisible, true);
  assert.equal(parsed.find(layer => layer.id === 'future_hidden').defaultVisible, false);
  const workbook = {
    events: rowsToRecords([
      EVENT_HEADERS,
      row({ 'Map Event ID': 'FUTURE-1', 'Map Layer ID': 'future_archives' }),
      row({ 'Map Event ID': 'HIDDEN-FUTURE-1', 'Map Layer ID': 'future_hidden' }),
    ]),
    layers: rowsToRecords(expandedLayers),
    sources: rowsToRecords(sourceTable),
    context: [],
    methodology: [],
  };
  const defaults = buildTimelineResponse({ workbook });
  assert.deepEqual(defaults.selectedLayerIds, ['historical_events', 'future_archives']);
  assert.deepEqual(defaults.events.map(event => event.id), ['FUTURE-1']);
  const result = buildTimelineResponse({ workbook, query: { layers: 'future_archives' } });
  assert.deepEqual(result.events.map(event => event.id), ['FUTURE-1']);
});

test('missing Google credentials fail closed and draft preview requires the server allowlist', async () => {
  const previousCredential = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const previousEditors = process.env.MEDIBO_EDITOR_USER_IDS;
  delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  process.env.MEDIBO_EDITOR_USER_IDS = 'clerk-user-allowlisted';
  resetTimelineCacheForTests();
  try {
    const guest = await getTimelineResponse({ userId: 'other-user', query: { mode: 'preview' } });
    assert.deepEqual(guest, { status: 403 });
    const publicData = await getTimelineResponse({ userId: 'other-user' });
    assert.equal(publicData.status, 'disconnected');
    assert.deepEqual(publicData.layers, []);
    const editor = await getTimelineResponse({
      userId: 'clerk-user-allowlisted',
      query: { mode: 'preview' },
    });
    assert.equal(editor.status, 'disconnected');
    assert.equal(editor.canPreviewDrafts, true);
    assert.deepEqual(editor.events, []);
  } finally {
    if (previousCredential === undefined) delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    else process.env.GOOGLE_SERVICE_ACCOUNT_JSON = previousCredential;
    if (previousEditors === undefined) delete process.env.MEDIBO_EDITOR_USER_IDS;
    else process.env.MEDIBO_EDITOR_USER_IDS = previousEditors;
    resetTimelineCacheForTests();
  }
});
