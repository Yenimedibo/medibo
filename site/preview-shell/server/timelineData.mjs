// Medibo Timeline Map — schema-aligned, read-only Sheets adapter.
// This module deliberately does not fabricate events, map geometry, or publication approvals.
const SPREADSHEET_ID = '1gSvwciQg_rz-5vBO_Ohih4jG773WBONgZpshgvNnKnc';
const REFRESH_MS = 60_000;
const ERROR_CACHE_MS = 15_000;
const READ_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';
export const SHEET_RANGES = Object.freeze({
  events: "'Map Events'!A1:AK2500",
  layers: "'Map Layers'!A1:Z200",
  context: "'Master Timeline'!A4:D1531",
  sources: "'Sources'!A1:D200",
  methodology: "'Methodology'!A1:B100",
});

let cachedWorkbook = null;
let cachedAt = 0;
let cachedError = false;
let errorCachedAt = 0;
let inFlight = null;
let authClient = null;

function key(value) { return String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function status(value) { return String(value ?? '').trim().toLowerCase(); }
function safeText(value, limit = 4000) { return String(value ?? '').trim().slice(0, limit); }
function safeUrl(value) {
  try {
    const url = new URL(safeText(value, 2000));
    return (url.protocol === 'https:' || url.protocol === 'http:') ? url.href : undefined;
  } catch { return undefined; }
}
function field(record, names) {
  for (const name of names) {
    const v = record[key(name)];
    if (v !== undefined && v !== null && String(v).trim() !== '') return v;
  }
  return '';
}
function parseYear(value) {
  if (typeof value === 'number') return Number.isSafeInteger(value) ? value : null;
  const s = String(value ?? '').trim();
  if (!s) return null;
  const m = /^(\d{1,4})(?:\s*(?:CE|AD))?$/i.exec(s);
  if (!m) return null; // Broad periods must use explicit numeric start/end year columns.
  const n = Number(m[1]);
  return Number.isSafeInteger(n) ? n : null;
}
function validYear(start, end) {
  return Number.isInteger(start) && start >= 500 && start <= 2026 &&
    (end === null || (Number.isInteger(end) && end >= start && end <= 2026));
}
export function rowsToRecords(rows) {
  if (!Array.isArray(rows) || rows.length < 2 || !Array.isArray(rows[0])) return [];
  const headers = rows[0].map(key);
  return rows.slice(1).map((row, index) => {
    const record = { __rowNumber: index + 2 };
    for (let col = 0; col < headers.length; col++) {
      if (headers[col]) record[headers[col]] = Array.isArray(row) ? (row[col] ?? '') : '';
    }
    return record;
  });
}
function records(input) {
  if (!Array.isArray(input) || input.length === 0) return [];
  return Array.isArray(input[0]) ? rowsToRecords(input) : input;
}

const FALLBACK_LAYER_DEFAULTS = Object.freeze({
  historical_events: true,
  climate_disasters: false,
  trade_resources: false,
});
function booleanValue(value) {
  const normalized = status(value);
  if (['yes', 'true', 'on', '1', 'visible', 'enabled'].includes(normalized)) return true;
  if (['no', 'false', 'off', '0', 'hidden', 'disabled'].includes(normalized)) return false;
  return undefined;
}
function isLayerPublic(record) {
  if (status(field(record, ['Layer Status'])) !== 'active') return false;
  if (isRejected(record)) return false;
  const review = status(field(record, ['Layer Review Status', 'Review Status']));
  if (review && !['approved', 'reviewed', 'verified'].includes(review)) return false;
  const publication = status(field(record, ['Layer Publication Status', 'Publication Status']));
  if (publication && !['approved', 'published', 'public', 'live'].includes(publication)) return false;
  const enabled = field(record, ['Layer Enabled', 'Enabled', 'Active']);
  if (String(enabled).trim() && booleanValue(enabled) !== true) return false;
  const publicReady = field(record, ['Public Layer Ready', 'Layer Ready']);
  if (String(publicReady).trim() && booleanValue(publicReady) !== true) return false;
  return true;
}
export function parseMapLayers(values, { preview = false } = {}) {
  const layers = [];
  const seen = new Set();
  for (const [index, record] of records(values).entries()) {
    if (status(field(record, ['Layer Status'])) === 'retired') continue;
    if (preview ? isRejected(record) : !isLayerPublic(record)) continue;
    const id = safeText(field(record, ['Map Layer ID', 'Layer ID', 'ID']), 100);
    const name = safeText(field(record, ['Visitor Label', 'Layer Name', 'Display Name', 'Name', 'Label', 'Title']), 200);
    if (!id || !name || seen.has(status(id))) continue;
    seen.add(status(id));
    const explicitDefault = booleanValue(field(record, [
      'Default Visible', 'Default Visibility', 'Default On', 'Default Enabled', 'Default State',
    ]));
    const sortValue = Number(field(record, ['Sort Order', 'Display Order', 'Order', 'Position']));
    layers.push({
      id,
      name,
      defaultVisible: explicitDefault ?? FALLBACK_LAYER_DEFAULTS[status(id)] ?? false,
      sortOrder: Number.isFinite(sortValue) ? sortValue : index,
      ...(safeText(field(record, ['Description', 'Layer Description']), 500)
        ? { description: safeText(field(record, ['Description', 'Layer Description']), 500) }
        : {}),
    });
  }
  return layers.sort((a, b) => a.sortOrder - b.sortOrder);
}

function buildSourceIndex(sourceRecords) {
  const out = new Map();
  for (const source of records(sourceRecords)) {
    const id = safeText(field(source, ['ID', 'source ID']), 100);
    if (!id) continue;
    const label = safeText(field(source, ['Source / institution', 'source', 'title', 'name']), 500);
    const url = safeUrl(field(source, ['URL', 'link']));
    if (label) out.set(key(id), { label: `${id} — ${label}`, ...(url ? { url } : {}) });
  }
  return out;
}
function resolveSources(record, sourceIndex) {
  const raw = safeText(field(record, ['Sources', 'references', 'citations']), 8000);
  if (!raw) return { sources: [], allResolved: false };
  const groups = raw.split(/[;\n|]/).map(value => value.trim()).filter(Boolean);
  const items = groups.flatMap((value) => {
    if (sourceIndex.has(key(value)) || safeUrl(value)) return [value];
    const commaSeparatedIds = value.split(',').map(part => part.trim()).filter(Boolean);
    return commaSeparatedIds.length > 1 && commaSeparatedIds.every(id => sourceIndex.has(key(id)))
      ? commaSeparatedIds
      : [value];
  }).slice(0, 30);
  const result = [];
  let allResolved = items.length > 0;
  for (const value of items) {
    const source = sourceIndex.get(key(value));
    if (source) result.push(source);
    else {
      const url = safeUrl(value);
      if (url) result.push({ label: value, url });
      else { result.push({ label: safeText(value, 500) }); allResolved = false; }
    }
  }
  return { sources: result, allResolved };
}

function isRejected(record) {
  return ['Review Status', 'Publication Status'].some(name =>
    /\b(?:rejected|withdrawn|archived|deleted)\b/.test(status(field(record, [name]))));
}
function isPublicCandidate(record) {
  return !isRejected(record) &&
    status(field(record, ['Evidence Status'])) === 'fully checked' &&
    status(field(record, ['Review Status'])) === 'reviewed' &&
    status(field(record, ['Publication Status'])) === 'approved' &&
    status(field(record, ['Public Event Ready'])) === 'yes';
}
function isPreviewCandidate(record) {
  return !isRejected(record) && Boolean(field(record, ['Map Event ID', 'Original Event ID', 'Start Year', 'Event / Development']));
}
function confidenceFor(record) {
  if (status(field(record, ['Date Precision'])) === 'disputed') return 'disputed';
  const value = status(field(record, ['Confidence']));
  if (/disputed|contested/.test(value)) return 'disputed';
  if (/approximate|medium|estimated|circa|uncertain/.test(value)) return 'approximate';
  if (/high|verified|confirmed|corroborated/.test(value)) return 'verified';
  return 'incomplete';
}
function validPoint(coords) {
  return Array.isArray(coords) && coords.length === 2 &&
    coords.every(n => typeof n === 'number' && Number.isFinite(n)) &&
    coords[0] >= -180 && coords[0] <= 180 && coords[1] >= -90 && coords[1] <= 90;
}
function validLine(value) {
  return Array.isArray(value) && value.length >= 2 && value.every(validPoint);
}
function validRing(value) {
  if (!Array.isArray(value) || value.length < 4 || !value.every(validPoint)) return false;
  const first = value[0];
  const last = value[value.length - 1];
  return first[0] === last[0] && first[1] === last[1];
}
function validPolygon(value) {
  return Array.isArray(value) && value.length > 0 && value.every(validRing);
}
function parseGeometry(value) {
  if (!value || typeof value !== 'string' || value.length > 200_000) return null;
  // Geometry ID/URL is metadata; no arbitrary remote URL fetching or unverified GeoJSON.
  let geo;
  try { geo = JSON.parse(value); } catch { return null; }
  if (geo?.type === 'Feature') geo = geo.geometry;
  const valid = {
    Point: validPoint(geo?.coordinates),
    MultiPoint: Array.isArray(geo?.coordinates) && geo.coordinates.length > 0 && geo.coordinates.every(validPoint),
    LineString: validLine(geo?.coordinates),
    MultiLineString: Array.isArray(geo?.coordinates) && geo.coordinates.length > 0 && geo.coordinates.every(validLine),
    Polygon: validPolygon(geo?.coordinates),
    MultiPolygon: Array.isArray(geo?.coordinates) && geo.coordinates.length > 0 && geo.coordinates.every(validPolygon),
  };
  if (!geo || !Object.hasOwn(valid, geo.type) || !valid[geo.type]) return null;
  return { type: geo.type, coordinates: geo.coordinates };
}
function verifiedGeography(record, startYear) {
  if (startYear === null || status(field(record, ['Map Feature Ready'])) !== 'yes' ||
      status(field(record, ['Map Placement Status'])) !== 'ready' ||
      status(field(record, ['Location Accuracy'])) !== 'exact') return {};
  const type = status(field(record, ['Feature Type']));
  if (type === 'point') {
    const latitudeValue = field(record, ['Latitude']);
    const longitudeValue = field(record, ['Longitude']);
    if (String(latitudeValue).trim() === '' || String(longitudeValue).trim() === '') return {};
    const latitude = Number(latitudeValue);
    const longitude = Number(longitudeValue);
    if (!validPoint([longitude, latitude])) return {};
    return { latitude, longitude, locationPrecision: 'verified' };
  }
  if (['territory', 'route', 'area'].includes(type)) {
    const geometry = parseGeometry(field(record, ['Geometry ID / URL']));
    if (!geometry) return {}; // URL/ID backed geometry needs a separately verified loader.
    if (geometry.type === 'Point' || geometry.type === 'MultiPoint') return {};
    return { geometry, locationPrecision: 'verified' };
  }
  return {};
}
function datePrecisionValid(record) {
  return ['exact year', 'approximate year', 'year range', 'century', 'disputed'].includes(
    status(field(record, ['Date Precision'])));
}
function toEvent(record, index, preview, sourceIndex, layerIndex) {
  const originalId = safeText(field(record, ['Original Event ID']), 160);
  const id = safeText(field(record, ['Map Event ID', 'Event ID', 'ID']) ||
    (preview ? `draft-row-${record.__rowNumber ?? index + 2}` : ''), 200);
  const layerId = safeText(field(record, ['Map Layer ID', 'Layer ID']), 100);
  const layer = layerIndex.get(status(layerId));
  if (!layer) return null;
  const start = parseYear(field(record, ['Start Year']));
  const endRaw = field(record, ['End Year']);
  const end = String(endRaw).trim() === '' ? null : parseYear(endRaw);
  const datesValid = validYear(start, end) && !(String(endRaw).trim() !== '' && end === null);
  const explicitTitle = safeText(field(record, ['Event Title']), 400);
  const description = safeText(field(record, ['Event / Development']), 8000);
  const resolved = resolveSources(record, sourceIndex);
  const title = explicitTitle || (preview ? `Unreviewed record ${id || originalId}` : '');
  if (!id || !title) return null;
  if (!preview && (!datesValid || !datePrecisionValid(record) || !description || !resolved.allResolved || !resolved.sources.length)) return null;
  const validStart = datesValid ? start : null;
  const confidence = confidenceFor(record);
  const where = verifiedGeography(record, validStart);
  const rawLatitude = field(record, ['Latitude']);
  const rawLongitude = field(record, ['Longitude']);
  const hasApproximatePoint = String(rawLatitude).trim() !== '' && String(rawLongitude).trim() !== '' &&
    validPoint([Number(rawLongitude), Number(rawLatitude)]);
  const approximateLocation = status(field(record, ['Location Accuracy'])) === 'approximate' &&
    (hasApproximatePoint || Boolean(field(record, ['Geometry ID / URL'])));
  return {
    id, ...(originalId ? { originalEventId: originalId } : {}),
    layerId: layer.id,
    layerName: layer.name,
    layerSubtype: safeText(field(record, ['Layer Subtype']), 200),
    ...(safeText(field(record, ['Linked Map Feature ID']), 160)
      ? { linkedMapFeatureId: safeText(field(record, ['Linked Map Feature ID']), 160) }
      : {}),
    title, startYear: validStart,
    ...(datesValid && end !== null ? { endYear: end } : {}),
    region: safeText(field(record, ['Region']) || 'Unclassified', 200),
    eventType: safeText(field(record, ['Event Type']) || 'Unclassified', 200),
    period: safeText(field(record, ['Historical Period']) || 'Unclassified', 200),
    description,
    sources: resolved.sources,
    confidence,
    verificationStatus: safeText(`${field(record, ['Evidence Status']) || 'Unassessed'} / ${field(record, ['Review Status']) || 'Needs review'}`, 200),
    publicationStatus: safeText(field(record, ['Publication Status']) || 'Draft', 200),
    datePrecision: safeText(field(record, ['Date Precision']) || 'Unassessed', 100),
    locationName: safeText(field(record, ['Location Name']), 300),
    locationPrecision: where.locationPrecision || (approximateLocation ? 'approximate' : 'none'),
    ...(where.latitude !== undefined ? { latitude: where.latitude, longitude: where.longitude } : {}),
    ...(where.geometry ? { geometry: where.geometry } : {}),
  };
}
export function parseTimelineRows(values, { preview = false, sources = [], layers = [] } = {}) {
  const sourceIndex = buildSourceIndex(sources);
  const layerIndex = new Map(layers.map(layer => [status(layer.id), layer]));
  const seenIds = new Set();
  const out = [];
  for (const [index, rec] of records(values).entries()) {
    if (preview ? !isPreviewCandidate(rec) : !isPublicCandidate(rec)) continue;
    const event = toEvent(rec, index, preview, sourceIndex, layerIndex);
    if (!event || seenIds.has(event.id)) continue; // Reject duplicate Map Event IDs rather than merge claims.
    seenIds.add(event.id);
    out.push(event);
  }
  return out;
}
function previewContext(contextRecords, preview, from, to) {
  if (!preview) return []; // The annual Master Timeline has no per-row public approval metadata.
  return records(contextRecords).map(rec => ({
    year: parseYear(field(rec, ['Year'])),
    title: 'Morocco — unreviewed annual context',
    summary: safeText(field(rec, ['Morocco — Events']), 4000),
  })).filter(x => x.year !== null && x.year >= from && x.year <= to && x.summary).slice(0, 1500);
}
function previewMethodology(methodologyRecords, preview) {
  if (!preview) return []; // Unpublished methodology is not automatically public.
  return records(methodologyRecords).map(rec => ({
    label: safeText(field(rec, ['Field']), 100),
    detail: safeText(field(rec, ['Rule']), 2000),
  })).filter(x => x.label).slice(0, 100);
}
function accountFromEnvironment() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return { status: 'missing' };
  try {
    const credentials = JSON.parse(raw);
    if (!credentials.client_email || !credentials.private_key) return { status: 'invalid' };
    return { status: 'ready', credentials };
  } catch { return { status: 'invalid' }; }
}
async function googleValues(range) {
  const account = accountFromEnvironment();
  if (account.status !== 'ready') throw new Error('Google Sheets service account not configured.');
  if (!authClient) {
    const { GoogleAuth } = await import('google-auth-library');
    authClient = new GoogleAuth({ credentials: account.credentials, scopes: [READ_SCOPE] });
  }
  const client = await authClient.getClient();
  const token = await client.getAccessToken();
  if (!token?.token) throw new Error('Google Sheets authorization failed.');
  const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`);
  url.searchParams.set('majorDimension', 'ROWS');
  url.searchParams.set('valueRenderOption', 'UNFORMATTED_VALUE');
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token.token}` }, signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new Error(`Google Sheets read failed (${response.status}).`);
  const payload = await response.json();
  return rowsToRecords(payload.values || []);
}
async function loadWorkbook() {
  const account = accountFromEnvironment();
  if (account.status === 'missing') return { status: 'disconnected' };
  if (account.status === 'invalid') return { status: 'error' };
  const now = Date.now();
  if (cachedWorkbook && now - cachedAt < REFRESH_MS) return { status: 'ready', workbook: cachedWorkbook };
  if (cachedError && now - errorCachedAt < ERROR_CACHE_MS) return { status: 'error' };
  if (inFlight) return inFlight;
  inFlight = Promise.all([
    googleValues(SHEET_RANGES.events),
    googleValues(SHEET_RANGES.layers),
    googleValues(SHEET_RANGES.context),
    googleValues(SHEET_RANGES.sources),
    googleValues(SHEET_RANGES.methodology),
  ]).then(([events, layers, context, sources, methodology]) => {
    cachedWorkbook = { events, layers, context, sources, methodology, lastSyncedAt: new Date().toISOString() };
    cachedAt = Date.now();
    cachedError = false;
    return { status: 'ready', workbook: cachedWorkbook };
  }).catch(() => {
    cachedError = true;
    errorCachedAt = Date.now();
    return { status: 'error' };
  }).finally(() => { inFlight = null; });
  return inFlight;
}
function rangeYear(value, fallback) {
  const n = Number(value);
  return Number.isSafeInteger(n) && n >= 500 && n <= 2026 ? n : fallback;
}
function matches(event, { from, to, region, topic, period }) {
  if (event.startYear === null) return from === 500 && to === 2026; // No misleading year-specific draft placement.
  if (event.startYear > to || (event.endYear ?? event.startYear) < from) return false;
  if (region && status(event.region) !== region) return false;
  if (topic && status(event.eventType) !== topic) return false;
  if (period && status(event.period) !== period) return false;
  return true;
}
function selectedLayersFor(query, layers) {
  const layerIds = new Set(layers.map(layer => status(layer.id)));
  const hasExplicitSelection = Object.hasOwn(query, 'layers');
  const requested = hasExplicitSelection
    ? Array.isArray(query.layers)
      ? query.layers
      : String(query.layers ?? '').split(',')
    : layers.filter(layer => layer.defaultVisible).map(layer => layer.id);
  const requestedIds = new Set(requested.map(status).filter(Boolean));
  return layers.filter(layer => layerIds.has(status(layer.id)) && requestedIds.has(status(layer.id)));
}
export function buildTimelineResponse({ workbook, query = {}, preview = false, canPreviewDrafts = false }) {
  const from = rangeYear(query.from, 500);
  const to = rangeYear(query.to, 2026);
  const layers = parseMapLayers(workbook.layers, { preview });
  const selectedLayers = selectedLayersFor(query, layers);
  const selectedLayerIds = new Set(selectedLayers.map(layer => status(layer.id)));
  const filters = {
    from, to,
    region: status(query.region), topic: status(query.topic), period: status(query.period),
  };
  const eventsAll = parseTimelineRows(workbook.events, { preview, sources: workbook.sources, layers });
  const events = from <= to
    ? eventsAll.filter(event => selectedLayerIds.has(status(event.layerId)) && matches(event, filters))
    : [];
  return {
    status: eventsAll.length ? 'ready' : 'no-approved-data',
    lastSyncedAt: workbook.lastSyncedAt ?? null,
    refreshSeconds: REFRESH_MS / 1000,
    layers,
    selectedLayerIds: selectedLayers.map(layer => layer.id),
    events,
    context: previewContext(workbook.context, preview, from, to),
    methodology: previewMethodology(workbook.methodology, preview),
    canPreviewDrafts,
    message: eventsAll.length === 0
      ? (preview ? 'No research records are available in the editor preview.' : 'No approved and fully reviewed events are published yet.')
      : events.length === 0 ? 'No records match the selected year range and filters.' : '',
  };
}
export function resetTimelineCacheForTests() {
  cachedWorkbook = null;
  cachedAt = 0;
  cachedError = false;
  errorCachedAt = 0;
  inFlight = null;
  authClient = null;
}
export async function getTimelineResponse({ userId, query = {} }) {
  const editorIds = new Set(String(process.env.MEDIBO_EDITOR_USER_IDS ?? '').split(',').map(x => x.trim()).filter(Boolean));
  const canPreviewDrafts = Boolean(userId && editorIds.has(userId));
  const preview = query.mode === 'preview';
  if (preview && !canPreviewDrafts) return { status: 403 };
  const loaded = await loadWorkbook();
  if (loaded.status === 'disconnected' || loaded.status === 'error') return {
    status: loaded.status, lastSyncedAt: null, refreshSeconds: REFRESH_MS / 1000,
    layers: [], selectedLayerIds: [], events: [], context: [], methodology: [], canPreviewDrafts,
    message: loaded.status === 'disconnected'
      ? 'The private spreadsheet connection is not configured for this staging server.'
      : 'The spreadsheet could not be read. Check the service-account credential and Viewer sharing.',
  };
  return buildTimelineResponse({ workbook: loaded.workbook, query, preview, canPreviewDrafts });
}
