import { GoogleAuth } from 'google-auth-library';

const SPREADSHEET_ID = '1gSvwciQg_rz-5vBO_Ohih4jG773WBONgZpshgvNnKnc';
const REFRESH_MS = 60_000;
const ERROR_CACHE_MS = 15_000;
const READ_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';
const RANGES = {
  events: "'Map Events'!A:ZZ",
  context: "'Master Timeline'!A:ZZ",
  methodology: "'Sources and Methodology'!A:ZZ",
};

let cachedWorkbook = null;
let cachedAt = 0;
let cachedError = null;
let errorCachedAt = 0;
let inFlight = null;
let authClient;

function normalizeKey(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizeStatus(value) {
  return String(value ?? '').trim().toLowerCase();
}

function recordValue(record, aliases) {
  for (const alias of aliases) {
    const value = record[normalizeKey(alias)];
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return '';
}

function parseYear(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Number.isInteger(value) ? value : null;
  }
  const text = String(value ?? '').trim();
  if (!text) return null;
  const match = text.match(/(-?\d[\d,]*)/);
  if (!match) return null;
  const year = Number(match[1].replaceAll(',', ''));
  if (!Number.isSafeInteger(year)) return null;
  return /\b(?:BCE|BC)\b/i.test(text) ? -Math.abs(year) : year;
}

function rowsToRecords(values) {
  if (!Array.isArray(values) || values.length < 2 || !Array.isArray(values[0])) return [];
  const headers = values[0].map(normalizeKey);
  return values.slice(1).map((row, index) => {
    const record = {};
    headers.forEach((header, index) => {
      if (header) record[header] = Array.isArray(row) ? row[index] ?? '' : '';
    });
    record.__rowNumber = index + 2;
    return record;
  });
}

function containsStatus(status, expression) {
  return expression.test(normalizeStatus(status));
}

function isRejected(record) {
  const statuses = [
    recordValue(record, ['review status']),
    recordValue(record, ['research status']),
    recordValue(record, ['publication status']),
    recordValue(record, ['status']),
  ];
  return statuses.some((value) => containsStatus(value, /\b(rejected|removed|deleted|withdrawn)\b/));
}

function isPublicRecord(record) {
  if (isRejected(record)) return false;
  const review = recordValue(record, ['review status', 'research review status']);
  const publication = recordValue(record, ['publication status', 'publish status']);
  const confidence = recordValue(record, ['confidence', 'confidence level', 'historical confidence']);
  return (
    containsStatus(review, /\b(approved|verified|fact checked|fact-checked)\b/) &&
    containsStatus(publication, /\b(approved|published|public|live)\b/) &&
    ![review, publication].some((value) => containsStatus(value, /\b(draft|pending|private|disputed)\b/)) &&
    !containsStatus(confidence, /\b(disputed|contested)\b/)
  );
}

function isEditorPreviewRecord(record) {
  if (isRejected(record)) return false;
  return Object.values(record).some((value) => String(value ?? '').trim() !== '');
}

function safeText(value, max = 4000) {
  return String(value ?? '').trim().slice(0, max);
}

function safeUrl(value) {
  try {
    const url = new URL(String(value ?? '').trim());
    return ['https:', 'http:'].includes(url.protocol) ? url.href.slice(0, 2000) : undefined;
  } catch {
    return undefined;
  }
}

function parseSources(record) {
  const raw = recordValue(record, ['sources', 'source', 'references', 'citations']);
  if (!raw) return [];
  let entries;
  if (Array.isArray(raw)) entries = raw;
  else {
    const text = String(raw).trim();
    try {
      const parsed = JSON.parse(text);
      entries = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      entries = text.split(/\n|;|\s*\|\s*/);
    }
  }
  return entries
    .map((entry) => {
      if (typeof entry === 'string') {
        const url = safeUrl(entry);
        return { label: safeText(entry, 500), ...(url ? { url } : {}) };
      }
      if (!entry || typeof entry !== 'object') return null;
      const label = safeText(entry.label ?? entry.title ?? entry.name ?? entry.source, 500);
      const url = safeUrl(entry.url ?? entry.href ?? entry.link);
      return label ? { label, ...(url ? { url } : {}) } : null;
    })
    .filter(Boolean)
    .slice(0, 30);
}

function validCoordinatePair(value) {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    Number.isFinite(Number(value[0])) &&
    Number.isFinite(Number(value[1])) &&
    Number(value[0]) >= -180 &&
    Number(value[0]) <= 180 &&
    Number(value[1]) >= -90 &&
    Number(value[1]) <= 90
  );
}

function validCoordinates(value, depth = 0) {
  if (depth > 5 || !Array.isArray(value) || value.length === 0) return false;
  if (validCoordinatePair(value)) return true;
  return value.every((child) => validCoordinates(child, depth + 1));
}

function parseGeometry(value) {
  let geometry = value;
  if (typeof value === 'string') {
    try {
      geometry = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (geometry?.type === 'Feature') geometry = geometry.geometry;
  const allowed = new Set(['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon']);
  if (!geometry || !allowed.has(geometry.type) || !validCoordinates(geometry.coordinates)) return null;
  return { type: geometry.type, coordinates: geometry.coordinates };
}

function confidenceFor(record) {
  const value = normalizeStatus(recordValue(record, ['confidence', 'confidence level', 'historical confidence']));
  if (/\b(disputed|contested)\b/.test(value)) return 'disputed';
  if (/\b(approximate|estimated|circa|uncertain)\b/.test(value)) return 'approximate';
  if (/\b(verified|confirmed|corroborated)\b/.test(value)) return 'verified';
  return 'incomplete';
}

function toTimelineEvent(record, index, editorPreview) {
  let startYear = parseYear(recordValue(record, ['start year', 'start date', 'year', 'date']));
  let endYear = parseYear(recordValue(record, ['end year', 'end date']));
  let confidence = confidenceFor(record);
  const verificationStatus = safeText(recordValue(record, ['review status', 'research status', 'verification status', 'status']) || 'Not specified', 200);
  const publicationStatus = safeText(recordValue(record, ['publication status', 'publish status']) || 'Not specified', 200);
  if (startYear === null || (endYear !== null && startYear !== null && endYear < startYear)) {
    confidence = 'incomplete';
    if (startYear !== null && endYear !== null && endYear < startYear) {
      startYear = null;
      endYear = null;
    }
  }

  const latitudeValue = recordValue(record, ['latitude', 'lat']);
  const longitudeValue = recordValue(record, ['longitude', 'lon', 'lng']);
  const rawLatitude = String(latitudeValue).trim() ? Number(latitudeValue) : Number.NaN;
  const rawLongitude = String(longitudeValue).trim() ? Number(longitudeValue) : Number.NaN;
  const hasValidPair =
    Number.isFinite(rawLatitude) && rawLatitude >= -90 && rawLatitude <= 90 &&
    Number.isFinite(rawLongitude) && rawLongitude >= -180 && rawLongitude <= 180;
  const coordinateStatus = normalizeStatus(recordValue(record, ['coordinate verification', 'coordinate status', 'location precision']));
  const shapeStatus = normalizeStatus(recordValue(record, ['geometry verification', 'shape status', 'boundary status']));
  const candidateGeometry = parseGeometry(recordValue(record, ['geometry', 'geojson', 'geographic shape', 'shape']));
  const verifiedCoordinates = hasValidPair && /\b(verified|confirmed|exact)\b/.test(coordinateStatus);
  const disputedBoundary = confidence === 'disputed' && ['Polygon', 'MultiPolygon'].includes(candidateGeometry?.type);
  const verifiedGeometry = candidateGeometry && !disputedBoundary && /\b(verified|confirmed|exact)\b/.test(shapeStatus);
  const hasApproximateLocation = hasValidPair || candidateGeometry;
  const locationPrecision = verifiedCoordinates || verifiedGeometry
    ? 'verified'
    : hasApproximateLocation
      ? 'approximate'
      : 'none';

  const latitude = verifiedCoordinates ? rawLatitude : undefined;
  const longitude = verifiedCoordinates ? rawLongitude : undefined;
  const geometry = verifiedGeometry ? candidateGeometry : undefined;
  const id = safeText(recordValue(record, ['id', 'event id', 'record id']) || `sheet-row-${record.__rowNumber ?? index + 2}`, 200);
  const title = safeText(recordValue(record, ['title', 'event', 'event title', 'name']), 400);
  const description = safeText(recordValue(record, ['description', 'summary', 'details', 'event description']), 8000);
  if (!title) return null;
  if (editorPreview && startYear === null) confidence = 'incomplete';

  return {
    id,
    title,
    startYear,
    ...(endYear !== null ? { endYear } : {}),
    region: safeText(recordValue(record, ['region', 'area', 'geographic region']) || 'Unclassified', 200),
    eventType: safeText(recordValue(record, ['event type', 'category', 'type']) || 'Unclassified', 200),
    period: safeText(recordValue(record, ['historical period', 'period', 'era']) || 'Unclassified', 200),
    description,
    sources: parseSources(record),
    confidence,
    verificationStatus,
    publicationStatus,
    locationPrecision,
    ...(latitude !== undefined && longitude !== undefined ? { latitude, longitude } : {}),
    ...(geometry ? { geometry } : {}),
  };
}

function toContext(records, editorPreview) {
  return records
    .filter((record) => editorPreview ? isEditorPreviewRecord(record) : isPublicRecord(record))
    .map((record) => ({
      year: parseYear(recordValue(record, ['year', 'start year', 'date'])),
      title: safeText(recordValue(record, ['title', 'period', 'topic', 'event']), 400),
      summary: safeText(recordValue(record, ['summary', 'context', 'description', 'notes']), 4000),
    }))
    .filter((item) => item.title || item.summary)
    .slice(0, 2000);
}

function toMethodology(records, editorPreview) {
  return records
    .filter((record) => editorPreview ? isEditorPreviewRecord(record) : isPublicRecord(record))
    .map((record) => {
      const label = safeText(recordValue(record, ['title', 'name', 'source', 'methodology']), 500);
      if (!label) return null;
      const url = safeUrl(recordValue(record, ['url', 'link', 'source url']));
      return { label, ...(url ? { url } : {}) };
    })
    .filter(Boolean)
    .slice(0, 1000);
}

function accountFromEnvironment() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return { status: 'missing' };
  try {
    const credentials = JSON.parse(raw);
    if (!credentials.client_email || !credentials.private_key) return { status: 'invalid' };
    return { status: 'ready', credentials };
  } catch {
    return { status: 'invalid' };
  }
}

async function googleValues(range) {
  const account = accountFromEnvironment();
  if (account.status !== 'ready') throw new Error('Google Sheets credentials are not configured correctly.');
  if (!authClient) {
    authClient = new GoogleAuth({ credentials: account.credentials, scopes: [READ_SCOPE] });
  }
  const client = await authClient.getClient();
  const token = await client.getAccessToken();
  if (!token?.token) throw new Error('Google Sheets authorization is unavailable.');
  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(SPREADSHEET_ID)}/values/${encodeURIComponent(range)}`,
  );
  url.searchParams.set('majorDimension', 'ROWS');
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token.token}` },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error('Google Sheets returned an unsuccessful response.');
  const data = await response.json();
  return rowsToRecords(data.values);
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
    googleValues(RANGES.events),
    googleValues(RANGES.context),
    googleValues(RANGES.methodology),
  ])
    .then(([events, context, methodology]) => {
      cachedWorkbook = { events, context, methodology, lastSyncedAt: new Date().toISOString() };
      cachedAt = Date.now();
      cachedError = null;
      return { status: 'ready', workbook: cachedWorkbook };
    })
    .catch(() => {
      cachedError = true;
      errorCachedAt = Date.now();
      return { status: 'error' };
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

function queryYear(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 500 && parsed <= 2026 ? parsed : fallback;
}

function matchesFilters(event, filters) {
  const { from, to, region, topic, period } = filters;
  if (event.startYear !== null && (event.startYear > to || (event.endYear ?? event.startYear) < from)) return false;
  if (region && event.region.toLowerCase() !== region) return false;
  if (topic && event.eventType.toLowerCase() !== topic) return false;
  if (period && event.period.toLowerCase() !== period) return false;
  return true;
}

export function parseTimelineRows(values, { preview = false } = {}) {
  return rowsToRecords(values)
    .filter((record) => preview ? isEditorPreviewRecord(record) : isPublicRecord(record))
    .map((record, index) => toTimelineEvent(record, index, preview))
    .filter(Boolean);
}

export function resetTimelineCacheForTests() {
  cachedWorkbook = null;
  cachedAt = 0;
  cachedError = null;
  errorCachedAt = 0;
  inFlight = null;
  authClient = null;
}

export async function getTimelineResponse({ userId, query = {} }) {
  const editorIds = new Set(
    String(process.env.MEDIBO_EDITOR_USER_IDS ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
  );
  const canPreviewDrafts = Boolean(userId && editorIds.has(userId));
  const mode = query.mode === 'preview' ? 'preview' : 'public';
  if (mode === 'preview' && !canPreviewDrafts) return { status: 403 };

  const loaded = await loadWorkbook();
  const base = {
    lastSyncedAt: loaded.workbook?.lastSyncedAt ?? null,
    refreshSeconds: REFRESH_MS / 1000,
    events: [],
    context: [],
    methodology: [],
    canPreviewDrafts,
  };
  if (loaded.status === 'disconnected') {
    return {
      ...base,
      status: 'disconnected',
      message: 'The private spreadsheet connection is not configured for this staging server.',
    };
  }
  if (loaded.status !== 'ready') {
    return {
      ...base,
      status: 'error',
      message: 'The spreadsheet could not be read. Check the server-side credential and read access.',
    };
  }

  const preview = mode === 'preview';
  const allEvents = parseTimelineRows(loaded.workbook.events, { preview });
  const filters = {
    from: queryYear(query.from, 500),
    to: queryYear(query.to, 2026),
    region: String(query.region ?? '').trim().toLowerCase(),
    topic: String(query.topic ?? '').trim().toLowerCase(),
    period: String(query.period ?? '').trim().toLowerCase(),
  };
  const events = allEvents.filter((event) => matchesFilters(event, filters));
  return {
    ...base,
    status: allEvents.length === 0 ? 'no-approved-data' : 'ready',
    events,
    context: toContext(loaded.workbook.context, preview),
    methodology: toMethodology(loaded.workbook.methodology, preview),
    message: allEvents.length === 0
      ? preview
        ? 'No research records are available in this editor preview.'
        : 'No approved and published historical records are available yet.'
      : events.length === 0
        ? 'No records match the selected year range and filters.'
        : '',
  };
}
